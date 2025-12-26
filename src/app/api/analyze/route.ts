import { createClient } from "@/lib/supabase/server";
import { analyzeProductImage, analyzeProductWithMultipleImages } from "@/lib/gemini";
import { generateCRFOutput } from "@/lib/ruleEngine";
import { NextRequest, NextResponse } from "next/server";
import JSZip from "jszip";

// PPTXから画像を抽出する関数
async function extractImagesFromPptx(buffer: Buffer): Promise<{ base64: string; mimeType: string }[]> {
  const zip = await JSZip.loadAsync(buffer);
  const images: { base64: string; mimeType: string }[] = [];

  // ppt/media/ フォルダ内の画像を抽出
  const mediaFiles = Object.keys(zip.files).filter(
    (name) => name.startsWith("ppt/media/") && !zip.files[name].dir
  );

  for (const fileName of mediaFiles) {
    const file = zip.files[fileName];
    const extension = fileName.split(".").pop()?.toLowerCase();
    
    // サポートされている画像形式のみ
    const mimeTypes: Record<string, string> = {
      png: "image/png",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      gif: "image/gif",
      webp: "image/webp",
    };

    if (extension && mimeTypes[extension]) {
      const content = await file.async("base64");
      images.push({
        base64: content,
        mimeType: mimeTypes[extension],
      });
    }
  }

  return images;
}

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

    // リクエストボディの取得
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const productModel = formData.get("productModel") as string | null;
    const mainSellingPoint = formData.get("mainSellingPoint") as string | null;

    if (!file) {
      return NextResponse.json(
        { error: "ファイルが必要です" },
        { status: 400 }
      );
    }

    // ファイルをBase64に変換
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const mimeType = file.type;

    let analysisResult;

    // PPTXファイルの場合は画像を抽出
    if (mimeType === "application/vnd.openxmlformats-officedocument.presentationml.presentation") {
      const images = await extractImagesFromPptx(buffer);
      
      if (images.length === 0) {
        return NextResponse.json(
          { error: "PPTXファイル内に画像が見つかりませんでした" },
          { status: 400 }
        );
      }

      // 複数画像を解析（最大5枚）
      const imagesToAnalyze = images.slice(0, 5);
      analysisResult = await analyzeProductWithMultipleImages(
        imagesToAnalyze,
        mainSellingPoint || undefined
      );
    } else {
      // 通常の画像/PDFの場合
      const base64 = buffer.toString("base64");
      analysisResult = await analyzeProductImage(
        base64,
        mimeType,
        mainSellingPoint || undefined
      );
    }

    // ルールエンジンでCRF出力を生成
    const crfOutput = generateCRFOutput(analysisResult);

    // 履歴をデータベースに保存
    const { error: insertError } = await supabase
      .from("generations")
      .insert({
        user_id: user.id,
        product_model: productModel || analysisResult.product.model,
        analysis_result: analysisResult,
      });

    if (insertError) {
      console.error("履歴保存エラー:", insertError);
      // 履歴保存に失敗しても結果は返す
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      crfOutput,
    });
  } catch (error) {
    console.error("解析エラー:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "解析に失敗しました" },
      { status: 500 }
    );
  }
}
