import { LEGAL_TEXTS, WarrantyMonths } from "@/constants/legalTexts";
import { AIAnalysisResult, CRFOutput } from "@/types/analysis";

// AIの解析結果からCRF出力を生成するルールエンジン
export function generateCRFOutput(analysis: AIAnalysisResult): CRFOutput {
  const { flags, product, iconPoints, creative, salesPoints, specs, annotations, others } = analysis;

  // 商標文言の構築
  const trademarkParts: string[] = [LEGAL_TEXTS.trademark.base];
  
  if (flags.targets.includes("Apple")) {
    trademarkParts.push(LEGAL_TEXTS.trademark.apple);
  }
  if (flags.targets.includes("Android")) {
    trademarkParts.push(LEGAL_TEXTS.trademark.android);
  }
  if (flags.targets.includes("Windows")) {
    trademarkParts.push(LEGAL_TEXTS.trademark.windows);
  }
  if (flags.has_active_shield) {
    trademarkParts.push(LEGAL_TEXTS.trademark.activeShield);
  }
  if (flags.has_bluetooth) {
    trademarkParts.push(LEGAL_TEXTS.trademark.bluetooth);
  }
  trademarkParts.push(LEGAL_TEXTS.trademark.footer);

  // 認証文言の構築
  const certificationTexts = flags.certification
    .map((cert) => LEGAL_TEXTS.certification[cert])
    .filter(Boolean);

  // 注釈の構築
  const annotationParts = [
    LEGAL_TEXTS.no1Annotation,
    ...annotations.otherAnnotations,
  ];

  // 保証月数の決定（デフォルトは24ヶ月）
  const warrantyMonths: WarrantyMonths = (others.warrantyMonths === 18 ? 18 : 24);

  return {
    // 0. ロゴ＋タグライン
    logoTagline: LEGAL_TEXTS.logoTagline,

    // 1-3. アイコン付きセールスポイント
    iconPoint1: iconPoints.point1,
    iconPoint2: iconPoints.point2,
    iconPoint3: iconPoints.point3,

    // 4. カテゴリ
    category: product.category,

    // 5. 製品名
    productName: product.name,

    // 6. キャッチコピー（3案）
    catchCopy: creative.catchCopy,

    // 7. サブコピー（3案）
    subCopy: creative.subCopy,

    // 8. 使用上の注意
    usageNotes: flags.is_cable_included
      ? LEGAL_TEXTS.usageNotes.cable_included
      : LEGAL_TEXTS.usageNotes.cable_excluded,

    // 9. 製品コピー（3案）
    productCopy: creative.productCopy,

    // 10-12. セールスポイント詳細（各3案）
    salesPoint1: {
      title: salesPoints.point1.title,
      description: salesPoints.point1.description,
    },
    salesPoint2: {
      title: salesPoints.point2.title,
      description: salesPoints.point2.description,
    },
    salesPoint3: {
      title: salesPoints.point3.title,
      description: salesPoints.point3.description,
    },

    // 13. 安全設計
    safetyDesign: LEGAL_TEXTS.safetyDesign,

    // 14. 製品保証（簡易版）
    warrantyShort: LEGAL_TEXTS.warrantyShort[warrantyMonths],

    // 15. その他
    others: "",

    // 16. 入力
    input: specs.input,

    // 17. 出力
    output: specs.output,

    // 18. サイズ
    size: specs.size,

    // 18-2. 重量
    weight: specs.weight || "不明",

    // 19. パッケージ内容
    packageContents: specs.packageContents,

    // 20. 注釈
    annotations: annotationParts.join("\n\n"),

    // 21. 紙プラマーク
    paperPlasticMark: others.paperPlasticMark,

    // 22. 認証
    certification: certificationTexts.join("\n"),

    // 23. カスタマーサポート
    customerSupport: LEGAL_TEXTS.customerSupport,

    // 24. 製品保証（詳細版）
    warrantyFull: LEGAL_TEXTS.warrantyFull[warrantyMonths],

    // 25. モデル
    model: product.model,

    // 26. 商標
    trademark: trademarkParts.join("\n"),
  };
}

// 後方互換性のための関数（旧API用）
export function selectLegalTexts(flags: AIAnalysisResult["flags"]) {
  const warningText = flags.is_cable_included
    ? LEGAL_TEXTS.usageNotes.cable_included
    : LEGAL_TEXTS.usageNotes.cable_excluded;

  const trademarkParts: string[] = [LEGAL_TEXTS.trademark.base];
  if (flags.targets.includes("Apple")) {
    trademarkParts.push(LEGAL_TEXTS.trademark.apple);
  }
  if (flags.targets.includes("Android")) {
    trademarkParts.push(LEGAL_TEXTS.trademark.android);
  }
  trademarkParts.push(LEGAL_TEXTS.trademark.footer);

  return {
    warningText,
    trademarkText: trademarkParts.join("\n"),
    targetDeviceText: "",
  };
}
