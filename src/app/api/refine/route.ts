import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

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

    const { originalText, refinementRequest, fieldType, productContext } = await request.json();

    if (!originalText || !refinementRequest) {
      return NextResponse.json(
        { error: "元のテキストと修正依頼が必要です" },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });

    const fieldTypeGuide: Record<string, string> = {
      catchCopy: `キャッチコピー（15〜25文字）
- 製品の最大の特徴を端的に表現
- 「世界最小クラス」「Anker初」など強力なフックを活用
- 数値（W数、ポート数）を効果的に使用`,
      subCopy: `サブコピー（20〜35文字）
- キャッチコピーを補完する情報
- 対応機器（MacBook Air、iPhoneなど）を具体的に記載
- ユーザーベネフィットを明確に`,
      productCopy: `製品コピー（20〜30文字）
- 製品カテゴリを含めて一言で説明
- 「○○な/○○対応の△△（製品カテゴリ）」の形式
- 最も差別化できるポイントを冒頭に`,
      salesPoint: `セールスポイント（3案生成）
- セールスポイント1: 見出し（15文字以内）と補足文章（80文字以内）の2つを必ず生成。3案すべてに補足文章を付ける
- セールスポイント2: 見出しのみ（15文字以内）。補足文章は不要。3案生成
- セールスポイント3: 見出しのみ（15文字以内）。補足文章は不要。3案生成
- 各セールスポイントは3案ずつ生成すること（A案、B案、C案）
- 技術的な特徴をユーザーメリットに変換`,
    };

    const prompt = `あなたはAnker製品のパッケージコピーを作成するエキスパートです。
以下の修正依頼に基づいて、テキストを改善してください。

## 対象フィールド
${fieldTypeGuide[fieldType] || "製品コピー"}

## 製品コンテキスト
${productContext || "USB急速充電器"}

## 元のテキスト
${originalText}

## 修正依頼
${refinementRequest}

## 参考事例（実際のAnkerパッケージより）
- キャッチコピー例: 「世界最小クラス※2の小型設計」「巻取り式のUSB-Cケーブル一体型で これ1台で充電可能」
- サブコピー例: 「最大45W出力でPD対応Windows PCまで充電可能」「アプリから充電モードを選択し出力を調整することで過充電を防止する機能を搭載」
- 製品コピー例: 「最大45W出力対応で世界最小クラス※2のUSB急速充電器」「iPhoneへの過充電を防止できるUSB急速充電器」

## 出力形式
修正後のテキストのみを出力してください。説明文は不要です。
セールスポイントの場合は、3案を改行で区切って出力してください。
セールスポイント1の場合は、各案について「キャッチ：見出し\n補足文章」の形式で出力し、3案を改行で区切ってください。
セールスポイント2,3の場合は、各案について「キャッチのみ：見出し」の形式で出力し、3案を改行で区切ってください。`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const refinedText = response.text().trim();

    return NextResponse.json({
      success: true,
      refinedText,
    });
  } catch (error) {
    console.error("修正エラー:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "修正に失敗しました" },
      { status: 500 }
    );
  }
}

