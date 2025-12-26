// AIが抽出・生成すべきデータ構造
export interface AIAnalysisResult {
  // フラグ（ルールベース判定用）
  flags: {
    is_cable_included: boolean;
    has_active_shield: boolean;
    has_bluetooth: boolean;
    has_display: boolean;
    has_pps: boolean; // PPS対応
    has_gan: boolean; // GaN搭載
    targets: ("Apple" | "Android" | "Windows")[];
    certification: ("PSE" | "MFi" | "Qi")[];
  };

  // 製品基本情報（AI抽出）
  product: {
    category: string; // カテゴリ（例: USB急速充電器）
    name: string; // 製品名
    model: string; // モデル番号
  };

  // アイコン付きセールスポイント（AI抽出）
  iconPoints: {
    point1: string; // 例: 最大45W
    point2: string; // 例: PC・タブレット・スマホ
    point3: string; // 例: USB-C × 1
  };

  // クリエイティブ（AI生成 - 各3案）
  creative: {
    catchCopy: string[]; // キャッチコピー3案
    subCopy: string[]; // サブコピー3案
    productCopy: string[]; // 製品コピー3案
  };

  // セールスポイント詳細（AI生成 - 各3案）
  salesPoints: {
    point1: {
      title: string[];
      description: string[];
    };
    point2: {
      title: string[];
      description?: string[];
    };
    point3: {
      title: string[];
      description?: string[];
    };
  };

  // スペック（AI抽出）
  specs: {
    input: string; // 入力（不明な場合は「不明」）
    output: string; // 出力（不明な場合は「不明」）
    size: string; // サイズ（不明な場合は「不明」）
    weight?: string; // 重量（不明な場合は「不明」）
    packageContents: string; // パッケージ内容
  };

  // 注釈（AI生成）
  annotations: {
    no1Annotation: string; // No.1注釈
    otherAnnotations: string[]; // その他注釈（複数）
  };

  // その他（AI抽出）
  others: {
    paperPlasticMark: string; // 紙プラマーク
    warrantyMonths: number; // 保証月数（18 or 24）
  };
}

// CRFフォームの出力構造（27項目）
export interface CRFOutput {
  // 0. ロゴ＋タグライン（固定）
  logoTagline: string;
  
  // 1-3. アイコン付きセールスポイント
  iconPoint1: string;
  iconPoint2: string;
  iconPoint3: string;
  
  // 4. カテゴリ
  category: string;
  
  // 5. 製品名
  productName: string;
  
  // 6. キャッチコピー（3案）
  catchCopy: string[];
  
  // 7. サブコピー（3案）
  subCopy: string[];
  
  // 8. 使用上の注意（固定 - フラグで分岐）
  usageNotes: string;
  
  // 9. 製品コピー（3案）
  productCopy: string[];
  
  // 10-12. セールスポイント詳細（各3案）
  salesPoint1: { title: string[]; description: string[] };
  salesPoint2: { title: string[]; description?: string[] };
  salesPoint3: { title: string[]; description?: string[] };
  
  // 13. 安全設計（固定）
  safetyDesign: string;
  
  // 14. 製品保証（簡易版）
  warrantyShort: string;
  
  // 15. その他
  others: string;
  
  // 16. 入力
  input: string;
  
  // 17. 出力
  output: string;
  
  // 18. サイズ
  size: string;
  
  // 18-2. 重量
  weight: string;
  
  // 19. パッケージ内容
  packageContents: string;
  
  // 20. No.1注釈 + その他注釈
  annotations: string;
  
  // 21. 紙プラマーク
  paperPlasticMark: string;
  
  // 22. 認証
  certification: string;
  
  // 23. カスタマーサポート（固定）
  customerSupport: string;
  
  // 24. 製品保証（詳細版・固定）
  warrantyFull: string;
  
  // 25. モデル
  model: string;
  
  // 26. 商標（固定 - フラグで分岐）
  trademark: string;
}

// 生成履歴のデータ構造
export interface Generation {
  id: string;
  user_id: string;
  product_model: string | null;
  input_image_url: string | null;
  analysis_result: AIAnalysisResult;
  created_at: string;
}
