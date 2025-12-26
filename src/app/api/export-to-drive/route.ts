import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import * as XLSX from "xlsx";
import { Readable } from "stream";

export async function POST(request: NextRequest) {
  try {
    // 認証チェック
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "認証が必要です" },
        { status: 401 }
      );
    }

    const { spreadsheetData, fileName, accessToken } = await request.json();

    if (!spreadsheetData || !fileName) {
      return NextResponse.json(
        { error: "スプレッドシートデータとファイル名が必要です" },
        { status: 400 }
      );
    }

    if (!accessToken) {
      return NextResponse.json(
        { error: "Google認証トークンが必要です。Googleアカウントでログインしてください。" },
        { status: 401 }
      );
    }

    // Excelファイルを生成
    const worksheet = XLSX.utils.json_to_sheet(spreadsheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "CRF出力");

    // 列幅を調整
    worksheet["!cols"] = [
      { wch: 5 },  // No.
      { wch: 25 }, // パーツ名
      { wch: 50 }, // デフォルト
      { wch: 80 }  // 今回指示
    ];

    // Excelファイルをバッファに変換
    const excelBuffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // BufferをReadableストリームに変換
    const buffer = excelBuffer instanceof Buffer ? excelBuffer : Buffer.from(excelBuffer);
    const stream = Readable.from(buffer);

    // Google Drive APIを使用してファイルをアップロード
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const drive = google.drive({ version: "v3", auth: oauth2Client });

    // ファイルをアップロード
    const fileMetadata = {
      name: fileName,
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    };

    const media = {
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      body: stream,
    };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media: media,
      fields: "id, name, webViewLink",
    });

    return NextResponse.json({
      success: true,
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      message: "Googleドライブに正常にアップロードされました",
    });
  } catch (error) {
    console.error("Google Driveアップロードエラー:", error);
    
    if (error instanceof Error) {
      // OAuth認証エラーの場合
      if (error.message.includes("invalid_grant") || error.message.includes("invalid_token")) {
        return NextResponse.json(
          { error: "Google認証トークンが無効です。再度ログインしてください。" },
          { status: 401 }
        );
      }
      
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Googleドライブへのアップロードに失敗しました" },
      { status: 500 }
    );
  }
}

