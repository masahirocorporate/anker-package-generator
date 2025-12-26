import { GoogleGenerativeAI } from "@google/generative-ai";
import { AIAnalysisResult } from "@/types/analysis";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// プロンプト生成関数（訴求ポイントを変数として受け取る）
function generateAnalysisPrompt(mainSellingPoint?: string): string {
  const sellingPointInstruction = mainSellingPoint
    ? `
## 最優先訴求ポイント
ユーザーが指定した最も訴求したいポイント: 「${mainSellingPoint}」
このポイントを最大限に活かしたキャッチコピー、サブコピー、セールスポイントを生成すること。
`
    : "";

  return `あなたはAnker製品のパッケージコピーを作成するエキスパートです。
提供された製品情報の画像を分析し、以下のJSON形式で情報を抽出・生成してください。

${sellingPointInstruction}

## 参考事例（実際のAnkerパッケージから抽出）

### 充電器の事例

【Anker Nano Charger (45W) with USB-C & USB-C ケーブル】
- キャッチコピー: 世界最小クラス※2の小型設計
- サブコピー: 最大45W出力でPD対応Windows PCまで充電可能
- 製品コピー: 最大45W出力対応で世界最小クラス※2のUSB急速充電器
- セールスポイント1: 世界最小クラス※2の小型設計 → GaN II採用かつ折りたたみ式プラグ搭載で、世界最小クラス※2の小型設計を実現
- セールスポイント2: PPSに対応し、最新のGalaxyシリーズを含むスマートフォンに急速充電可能
- セールスポイント3: Active Shield™ 3.0により1秒間に約80回の温度検知が可能。安全性の向上を実現しました。

【Anker Nano Charger (45W, Smart Display)】
- キャッチコピー: コンパクトながら最大45W出力 iPhoneに急速充電が可能
- サブコピー: アプリから充電モードを選択し出力を調整することで過充電を防止する機能を搭載
- 製品コピー: iPhoneへの過充電を防止できるUSB急速充電器
- セールスポイント1: アプリ連携により過充電を防止 → アプリから充電モードを選択して出力を調整することで過充電を防止する機能を搭載
- セールスポイント2: 最大45W出力でスマホもMacBook Airも充電可能
- セールスポイント3: GaN搭載のコンパクト設計

【Anker Nano Charger (35W, 巻取り式 USB-Cケーブル)】
- キャッチコピー: 巻取り式のUSB-Cケーブル一体型で これ1台で充電可能
- サブコピー: 最大35W出力でMacBook Airにも充電可能
- 製品コピー: Anker初、巻取り式ケーブル一体型のUSB急速充電器
- セールスポイント1: 巻取り式ケーブル搭載 → 巻き取り式ケーブル一体型のため、これ1台で充電が可能。コードが製品本体に収納できるため、持ち運びの際も荷物がかさばりません。
- セールスポイント2: USB PD対応 最大35W出力
- セールスポイント3: GaN搭載かつ折りたたみプラグ採用のコンパクト設計

【Anker Zolo Charger (70W, 4 Ports)】
- キャッチコピー: 出力などの充電状況を確認可能なディスプレイを搭載
- サブコピー: ディスプレイで出力などの充電状況を確認可能
- 製品コピー: ディスプレイで出力状況や本体温度を確認可能
- セールスポイント1: iPhoneのモデル※を識別し充電状況を確認可能
- セールスポイント2: ディスプレイで出力状況や本体温度を確認可能
- セールスポイント3: （複数ポート利用時の出力配分を訴求）

## キャッチコピー作成の鉄則
1. 製品の最大の特徴を端的に表現（15〜25文字）
2. 「世界最小クラス」「Anker初」など強力なフックを活用
3. 数値（W数、ポート数）を効果的に使用
4. 動詞で終わる場合は「可能」「実現」「搭載」など
5. 技術用語（GaN, PPS）は必要最低限に

## サブコピー作成の鉄則
1. キャッチコピーを補完する情報（20〜35文字）
2. 対応機器（MacBook Air、iPhoneなど）を具体的に記載
3. ユーザーベネフィットを明確に

## 製品コピー作成の鉄則
1. 製品カテゴリを含めて一言で説明（20〜30文字）
2. 「○○な/○○対応の△△（製品カテゴリ）」の形式
3. 最も差別化できるポイントを冒頭に

## セールスポイント作成の鉄則
1. **セールスポイント1**: 最も訴求したい機能 → 見出し（15文字以内）と補足文章（80文字以内）の2つを必ず生成。3案すべてに補足文章を付ける
2. **セールスポイント2**: 出力/充電能力に関する情報 → 見出しのみ（15文字以内）。補足文章は不要。3案生成
3. **セールスポイント3**: デザイン/コンパクトさ/安全性に関する情報 → 見出しのみ（15文字以内）。補足文章は不要。3案生成
4. 各セールスポイントは3案ずつ生成すること（A案、B案、C案）

## アイコン付きセールスポイントの固定フォーマット（必須）
- **アイコン付きセールスポイント1**: 必ず「最大○○W」の形式で最大出力W数を記載（例：「最大75W」「最大45W」「最大100W」）
- **アイコン付きセールスポイント2**: 対応デバイスを記載（例：「PC・タブレット・スマホに充電可能」「スマホ・タブレット対応」「PC・スマホ対応」）
- **アイコン付きセールスポイント3**: 必ず「USB-C × ○, USB-A × ○」の形式でポート構成を記載（例：「USB-C × 2, USB-A × 1」「USB-C × 1」「USB-C × 3, USB-A × 2」）

## 出力形式 (JSON)
{
  "flags": {
    "is_cable_included": boolean,
    "has_active_shield": boolean,
    "has_bluetooth": boolean,
    "has_display": boolean,
    "has_pps": boolean,
    "has_gan": boolean,
    "targets": ["Apple", "Android", "Windows"],
    "certification": ["PSE", "MFi", "Qi"]
  },
  "product": {
    "category": "USB急速充電器",
    "name": "Anker Nano Charger (45W, Display)",
    "model": "A2693"
  },
  "iconPoints": {
    "point1": "最大45W（必ず「最大○○W」の形式で記載。例：最大75W、最大45W）",
    "point2": "PC・タブレット・スマホ（対応デバイスを記載。例：PC・タブレット・スマホに充電可能、スマホ・タブレット対応）",
    "point3": "USB-C × 2, USB-A × 1（ポート構成を必ずこの形式で記載。例：USB-C × 2, USB-A × 1、USB-C × 1）"
  },
  "creative": {
    "catchCopy": [
      "A案（機能訴求）: 具体的な機能を強調したコピー",
      "B案（ベネフィット訴求）: ユーザーメリットを強調したコピー",
      "C案（差別化訴求）: 競合との違いを強調したコピー"
    ],
    "subCopy": [
      "A案: キャッチコピーA案を補完する説明",
      "B案: キャッチコピーB案を補完する説明",
      "C案: キャッチコピーC案を補完する説明"
    ],
    "productCopy": [
      "A案: 機能重視の製品説明",
      "B案: ターゲット重視の製品説明",
      "C案: 競合差別化重視の製品説明"
    ]
  },
  "salesPoints": {
    "point1": {
      "title": [
        "A案: 最も訴求したい機能のキャッチ（15文字以内）",
        "B案: 最も訴求したい機能のキャッチ（15文字以内）",
        "C案: 最も訴求したい機能のキャッチ（15文字以内）"
      ],
      "description": [
        "A案: 詳細な補足説明（80文字以内）。製品の差別化ポイントを具体的に記載。",
        "B案: 詳細な補足説明（80文字以内）。製品の差別化ポイントを具体的に記載。",
        "C案: 詳細な補足説明（80文字以内）。製品の差別化ポイントを具体的に記載。"
      ]
    },
    "point2": {
      "title": [
        "A案: 出力/充電能力に関するキャッチ（15文字以内）",
        "B案: 出力/充電能力に関するキャッチ（15文字以内）",
        "C案: 出力/充電能力に関するキャッチ（15文字以内）"
      ]
    },
    "point3": {
      "title": [
        "A案: デザイン/安全性に関するキャッチ（15文字以内）",
        "B案: デザイン/安全性に関するキャッチ（15文字以内）",
        "C案: デザイン/安全性に関するキャッチ（15文字以内）"
      ]
    }
  },
  "specs": {
    "input": "100-240V~, 1.2A, 50/60Hz（画像から読み取れない場合は「不明」）",
    "output": "5V⎓3A / 9V⎓3A / 15V⎓3A / 20V⎓2.25A (最大45W)（画像から読み取れない場合は「不明」）",
    "size": "約43 × 36 × 35mm（画像から読み取れない場合は「不明」）",
    "weight": "約○○g（画像から読み取れない場合は「不明」）",
    "packageContents": "製品本体、取扱説明書、保証書、カスタマーサポート（画像から読み取れる内容）"
  },
  "annotations": {
    "no1Annotation": "",
    "otherAnnotations": [
      "※2：最大45W以上の出力に対応かつ、USB-Cポートを1つ以上搭載している充電器において。2024年12月時点 / Anker調べ"
    ]
  },
  "others": {
    "paperPlasticMark": "紙：外箱・トレー・包み紙",
    "warrantyMonths": 18
  }
}

## スペック情報の抽出ルール
入力(input)、出力(output)、サイズ(size)は製品仕様の重要項目です。

【入力(input)の例】
- "100-240V~, 1.2A, 50/60Hz"
- "AC 100-240V 50/60Hz"
- "5V=2A / 9V=2A"（モバイルバッテリーの場合）

【出力(output)の例】
- "5V⎓3A / 9V⎓3A / 15V⎓3A / 20V⎓2.25A (最大45W)"
- "USB-C1: 5V=3A / 9V=3A / 15V=3A / 20V=5A (100W Max)"
- 複数ポートがある場合は各ポートの出力を記載

【サイズ(size)の例】
- "約43 × 36 × 35mm (プラグ部を除く)"
- "約80 × 75 × 30mm"
- "約○○ × ○○ × ○○mm"の形式で記載

【重量(weight)の例】
- "約187g"
- "約○○g"の形式で記載

## 注意事項
- **画像から読み取れない情報は「不明」と記載すること**（推測しない）
- 入力・出力・サイズ・重量が画像に記載されていない場合は「不明」と出力
- 数値は必ず単位付きで記載
- 日本語として自然な表現を使用
- warrantyMonthsは18または24のいずれか
- キャッチコピーは各案で明確に異なるアプローチを取ること
- 参考事例のクオリティを参考に、同等以上の品質を目指すこと

JSONのみを出力してください。説明文は不要です。`;
}

export async function analyzeProductImage(
  imageBase64: string,
  mimeType: string,
  mainSellingPoint?: string
): Promise<AIAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const prompt = generateAnalysisPrompt(mainSellingPoint);

  const result = await model.generateContent([
    {
      inlineData: {
        mimeType: mimeType,
        data: imageBase64,
      },
    },
    { text: prompt },
  ]);

  const response = result.response;
  const text = response.text();
  
  // JSONを抽出（```json ... ``` で囲まれている場合も対応）
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error("AIからの応答をパースできませんでした");
  }
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  const parsed = JSON.parse(jsonStr) as AIAnalysisResult;
  
  return parsed;
}

// 複数画像を解析する関数（PPTX用）
export async function analyzeProductWithMultipleImages(
  images: { base64: string; mimeType: string }[],
  mainSellingPoint?: string
): Promise<AIAnalysisResult> {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" });
  const prompt = generateAnalysisPrompt(mainSellingPoint);

  // 複数画像をコンテンツとして構築
  const contentParts: Array<{ inlineData: { mimeType: string; data: string } } | { text: string }> = [];
  
  for (const image of images) {
    contentParts.push({
      inlineData: {
        mimeType: image.mimeType,
        data: image.base64,
      },
    });
  }
  
  contentParts.push({
    text: `以下は製品情報のPowerPointスライドから抽出された${images.length}枚の画像です。
これらの画像すべてを分析して、製品情報を総合的に把握してください。

${prompt}`,
  });

  const result = await model.generateContent(contentParts);

  const response = result.response;
  const text = response.text();
  
  // JSONを抽出（```json ... ``` で囲まれている場合も対応）
  const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
  
  if (!jsonMatch) {
    throw new Error("AIからの応答をパースできませんでした");
  }
  
  const jsonStr = jsonMatch[1] || jsonMatch[0];
  const parsed = JSON.parse(jsonStr) as AIAnalysisResult;
  
  return parsed;
}
