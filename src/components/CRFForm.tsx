"use client";

import { CRFOutput } from "@/types/analysis";
import CopyButton from "./CopyButton";
// import AIRefineButton from "./AIRefineButton"; // 一時的に非表示
import { useState, useEffect } from "react";
import * as XLSX from "xlsx";

// Google Identity Servicesの型定義
declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initTokenClient: (config: {
            client_id: string;
            scope: string;
            callback: (response: { access_token: string }) => void;
          }) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

interface CRFFormProps {
  crfOutput: CRFOutput;
}

interface FormSection {
  id: string;
  number: string;
  label: string;
  value: string | string[];
  editable: boolean;
  multiline?: boolean;
  isMultiOption?: boolean;
  aiRefineType?: "catchCopy" | "subCopy" | "productCopy" | "salesPoint";
}

export default function CRFForm({ crfOutput }: CRFFormProps) {
  // 各案ごとに独立した値を管理: "catchCopy-0", "catchCopy-1", "catchCopy-2" など
  const [editedValues, setEditedValues] = useState<Record<string, string>>({});
  const [selectedOptions, setSelectedOptions] = useState<Record<string, number>>({});
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // 複数案の場合はインデックス付きのキーを使用
  const getValueKey = (id: string, index?: number) => {
    return index !== undefined ? `${id}-${index}` : id;
  };

  const getValue = (id: string, defaultValue: string, index?: number) => {
    const key = getValueKey(id, index);
    return editedValues[key] ?? defaultValue;
  };

  const handleChange = (id: string, value: string, index?: number) => {
    const key = getValueKey(id, index);
    setEditedValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleOptionSelect = (id: string, index: number) => {
    setSelectedOptions((prev) => ({ ...prev, [id]: index }));
  };

  const getSelectedOption = (id: string) => selectedOptions[id] ?? 0;

  const handleAIRefine = (id: string, refinedText: string, index?: number) => {
    handleChange(id, refinedText, index);
  };

  const formSections: FormSection[] = [
    { id: "logoTagline", number: "0", label: "ロゴ＋タグライン", value: crfOutput.logoTagline, editable: false },
    { id: "iconPoint1", number: "1", label: "アイコン付きセールスポイント①", value: crfOutput.iconPoint1, editable: true },
    { id: "iconPoint2", number: "2", label: "アイコン付きセールスポイント②", value: crfOutput.iconPoint2, editable: true },
    { id: "iconPoint3", number: "3", label: "アイコン付きセールスポイント③", value: crfOutput.iconPoint3, editable: true },
    { id: "category", number: "4", label: "カテゴリ", value: crfOutput.category, editable: true },
    { id: "productName", number: "5", label: "製品名", value: crfOutput.productName, editable: true },
    { id: "catchCopy", number: "6", label: "キャッチコピー", value: crfOutput.catchCopy, editable: true, isMultiOption: true, aiRefineType: "catchCopy" },
    { id: "subCopy", number: "7", label: "サブコピー", value: crfOutput.subCopy, editable: true, isMultiOption: true, aiRefineType: "subCopy" },
    { id: "usageNotes", number: "8", label: "使用上の注意", value: crfOutput.usageNotes, editable: false, multiline: true },
    { id: "productCopy", number: "9", label: "製品コピー", value: crfOutput.productCopy, editable: true, isMultiOption: true, aiRefineType: "productCopy" },
    { 
      id: "salesPoint1", 
      number: "10", 
      label: "セールスポイント1", 
      value: crfOutput.salesPoint1.title.map((title, idx) => 
        `キャッチ：${title}\n${crfOutput.salesPoint1.description[idx]}`
      ), 
      editable: true, 
      multiline: true, 
      isMultiOption: true,
      aiRefineType: "salesPoint" 
    },
    { 
      id: "salesPoint2", 
      number: "11", 
      label: "セールスポイント2", 
      value: crfOutput.salesPoint2.title.map((title, idx) => 
        `キャッチのみ：${title}`
      ), 
      editable: true, 
      multiline: true, 
      isMultiOption: true,
      aiRefineType: "salesPoint" 
    },
    { 
      id: "salesPoint3", 
      number: "12", 
      label: "セールスポイント3", 
      value: crfOutput.salesPoint3.title.map((title, idx) => 
        `キャッチのみ：${title}`
      ), 
      editable: true, 
      multiline: true, 
      isMultiOption: true,
      aiRefineType: "salesPoint" 
    },
    { id: "safetyDesign", number: "13", label: "安全設計", value: crfOutput.safetyDesign, editable: false, multiline: true },
    { id: "warrantyShort", number: "14", label: "製品保証", value: crfOutput.warrantyShort, editable: false, multiline: true },
    { id: "others", number: "15", label: "その他", value: crfOutput.others || "（なし）", editable: true },
    { id: "input", number: "16", label: "入力", value: crfOutput.input, editable: true },
    { id: "output", number: "17", label: "出力", value: crfOutput.output, editable: true, multiline: true },
    { id: "size", number: "18", label: "サイズ", value: crfOutput.size, editable: true },
    { id: "weight", number: "18-2", label: "重量", value: crfOutput.weight, editable: true },
    { id: "packageContents", number: "19", label: "パッケージ内容", value: crfOutput.packageContents, editable: true },
    { id: "annotations", number: "20", label: "No.1注釈 + その他注釈", value: crfOutput.annotations, editable: false, multiline: true },
    { id: "paperPlasticMark", number: "21", label: "紙プラマーク", value: crfOutput.paperPlasticMark, editable: true },
    { id: "certification", number: "22", label: "認証", value: crfOutput.certification || "（なし）", editable: false },
    { id: "customerSupport", number: "23", label: "カスタマーサポート", value: crfOutput.customerSupport, editable: false, multiline: true },
    { id: "warrantyFull", number: "24", label: "製品保証（詳細）", value: crfOutput.warrantyFull, editable: false, multiline: true },
    { id: "model", number: "25", label: "モデル", value: crfOutput.model, editable: false },
    { id: "trademark", number: "26", label: "商標", value: crfOutput.trademark, editable: false, multiline: true },
  ];

  const copyAllText = () => {
    const allText = formSections
      .map((section) => {
        let value: string;
        if (section.isMultiOption && Array.isArray(section.value)) {
          const selected = getSelectedOption(section.id);
          value = getValue(section.id, section.value[selected], selected);
        } else {
          value = getValue(section.id, section.value as string);
        }
        return `${section.number}. ${section.label}\n${value}`;
      })
      .join("\n\n---\n\n");
    navigator.clipboard.writeText(allText);
  };

  const exportToSpreadsheet = async () => {
    // 画像の項目構造に合わせた表形式でデータを準備
    const rows: Array<{ No: string; パーツ名: string; デフォルト: string; 今回指示: string }> = [];

    // セールスポイント1の値を取得（選択された案）
    const salesPoint1Selected = getSelectedOption("salesPoint1");
    const salesPoint1Value = getValue(
      "salesPoint1",
      crfOutput.salesPoint1.title.map((title, idx) => 
        `キャッチ：${title}\n${crfOutput.salesPoint1.description[idx]}`
      )[salesPoint1Selected],
      salesPoint1Selected
    );
    const salesPoint1Match = salesPoint1Value.match(/キャッチ：(.*?)\n(.*)/s);
    const salesPoint1Catch = salesPoint1Match ? salesPoint1Match[1] : "";
    const salesPoint1Desc = salesPoint1Match ? salesPoint1Match[2] : "";

    // セールスポイント2の値を取得（選択された案）
    const salesPoint2Selected = getSelectedOption("salesPoint2");
    const salesPoint2Value = getValue(
      "salesPoint2",
      crfOutput.salesPoint2.title.map((title) => `キャッチのみ：${title}`)[salesPoint2Selected],
      salesPoint2Selected
    );
    const salesPoint2Catch = salesPoint2Value.replace("キャッチのみ：", "");

    // セールスポイント3の値を取得（選択された案）
    const salesPoint3Selected = getSelectedOption("salesPoint3");
    const salesPoint3Value = getValue(
      "salesPoint3",
      crfOutput.salesPoint3.title.map((title) => `キャッチのみ：${title}`)[salesPoint3Selected],
      salesPoint3Selected
    );
    const salesPoint3Catch = salesPoint3Value.replace("キャッチのみ：", "");

    // キャッチコピーとサブコピーの値を取得（選択された案）
    const catchCopySelected = getSelectedOption("catchCopy");
    const catchCopyValue = getValue("catchCopy", crfOutput.catchCopy[catchCopySelected], catchCopySelected);
    const subCopySelected = getSelectedOption("subCopy");
    const subCopyValue = getValue("subCopy", crfOutput.subCopy[subCopySelected], subCopySelected);
    const productCopySelected = getSelectedOption("productCopy");
    const productCopyValue = getValue("productCopy", crfOutput.productCopy[productCopySelected], productCopySelected);

    // No.1: ロゴ+タグライン
    rows.push({
      No: "1",
      パーツ名: "ロゴ+タグライン",
      デフォルト: "Ankerロゴ+ No.1 Claim",
      今回指示: getValue("logoTagline", crfOutput.logoTagline)
    });

    // No.2: アイコン付きセールスポイント
    rows.push({
      No: "2",
      パーツ名: "アイコン付きセールスポイント",
      デフォルト: "-",
      今回指示: `※優先順位が高いものから記載(文字のみ)\n1. ${getValue("iconPoint1", crfOutput.iconPoint1)}\n2. ${getValue("iconPoint2", crfOutput.iconPoint2)}\n3. ${getValue("iconPoint3", crfOutput.iconPoint3)}`
    });

    // No.3: カテゴリ & 製品名
    rows.push({
      No: "3",
      パーツ名: "カテゴリ & 製品名",
      デフォルト: "-",
      今回指示: `カテゴリ: ${getValue("category", crfOutput.category)}\n製品名: ${getValue("productName", crfOutput.productName)}`
    });

    // No.4: キャッチコピー
    rows.push({
      No: "4",
      パーツ名: "キャッチコピー",
      デフォルト: "-",
      今回指示: `※表記ルールを確認した上で記載\n太字コピー: ${catchCopyValue}\n細文字コピー: ${subCopyValue}`
    });

    // No.5: 使用上の注意
    rows.push({
      No: "5",
      パーツ名: "使用上の注意",
      デフォルト: "最適なご使用のために:\n・Anker製のケーブル、お使いの機器の純正ケーブル、または第三者の認証を受けたケーブル (MFiなど)をご使用ください。\n・Apple / Android™ スマートフォンやタブレット端末、その他の機器に対応しています。",
      今回指示: getValue("usageNotes", crfOutput.usageNotes)
    });

    // No.6: その他
    rows.push({
      No: "6",
      パーツ名: "その他",
      デフォルト: "-",
      今回指示: getValue("others", crfOutput.others || "（なし）")
    });

    // No.7: 製品コピー
    rows.push({
      No: "7",
      パーツ名: "製品コピー",
      デフォルト: "-",
      今回指示: `コピー: ${productCopyValue}`
    });

    // No.8: セールスポイント
    rows.push({
      No: "",
      パーツ名: "セールスポイント (1つ目)",
      デフォルト: "-",
      今回指示: `キャッチ: ${salesPoint1Catch}\n補足説明: ${salesPoint1Desc}\nアイコン: 左図のイメージ(スマホのバッテリーの劣化を防いでいる様子を伝えたい)`
    });

    rows.push({
      No: "8",
      パーツ名: "セールスポイント (2つ目)",
      デフォルト: "-",
      今回指示: `キャッチのみ: ${salesPoint2Catch}\nアイコン: ${getValue("iconPoint1", crfOutput.iconPoint1)}`
    });

    rows.push({
      No: "",
      パーツ名: "セールスポイント (3つ目)",
      デフォルト: "-",
      今回指示: `キャッチのみ: ${salesPoint3Catch}\nアイコン: GaN搭載`
    });

    // No.9: 安全設計
    rows.push({
      No: "9",
      パーツ名: "安全設計",
      デフォルト: "-",
      今回指示: getValue("safetyDesign", crfOutput.safetyDesign)
    });

    // No.10: 製品保証
    rows.push({
      No: "10",
      パーツ名: "製品保証",
      デフォルト: "-",
      今回指示: getValue("warrantyShort", crfOutput.warrantyShort)
    });

    // No.11: 入力/出力/サイズ/パッケージ内容
    rows.push({
      No: "11",
      パーツ名: "入力/出力/サイズ/パッケージ内容",
      デフォルト: "-",
      今回指示: `入力: ${getValue("input", crfOutput.input)}\n出力: ${getValue("output", crfOutput.output)}\nサイズ: ${getValue("size", crfOutput.size)}\n重量: ${getValue("weight", crfOutput.weight)}\nパッケージ内容: ${getValue("packageContents", crfOutput.packageContents)}`
    });

    // No.12: No.1注釈
    rows.push({
      No: "12",
      パーツ名: "No.1注釈",
      デフォルト: "-",
      今回指示: getValue("annotations", crfOutput.annotations)
    });

    // No.13: 紙プラマーク
    rows.push({
      No: "13",
      パーツ名: "紙プラマーク",
      デフォルト: "-",
      今回指示: getValue("paperPlasticMark", crfOutput.paperPlasticMark)
    });

    // No.14: 認証
    rows.push({
      No: "14",
      パーツ名: "認証",
      デフォルト: "-",
      今回指示: getValue("certification", crfOutput.certification || "（なし）")
    });

    // No.15: カスタマーサポート
    rows.push({
      No: "15",
      パーツ名: "カスタマーサポート",
      デフォルト: "※デザインは固定です。\nCorporateロゴ+会社名\n万が一製品に不具合等がございましたら、弊社カスタマーサポートまでお問い合わせください。\n03-4455-7823 | 平日9:00-17:00 / 年末年始を除く\nsupport@anker.com\nAnker Japan 公式オンラインストア: https://www.ankerjapan.com",
      今回指示: getValue("customerSupport", crfOutput.customerSupport)
    });

    // No.16: モデル
    rows.push({
      No: "16",
      パーツ名: "Model",
      デフォルト: "Axxxx",
      今回指示: getValue("model", crfOutput.model)
    });

    // No.17: 商標
    rows.push({
      No: "17",
      パーツ名: "商標",
      デフォルト: "※1行目と最後行は固定です。\n※2行目は必ず自社商標が入ります。\n© Anker Japan Co., Limited. All rights reserved.\n- 自社商標<右欄に記入>\n- 特別に記載すべき他社商標<右欄に記入>\n- その他会社名、各製品名は、一般に各社の商標または登録商標です。",
      今回指示: getValue("trademark", crfOutput.trademark)
    });

    // ファイル名を生成
    const fileName = `CRF出力_${crfOutput.model || "製品"}_${new Date().toISOString().split("T")[0]}.xlsx`;

    // Google認証トークンがある場合はGoogle Driveにアップロード、ない場合はローカルにダウンロード
    if (googleAccessToken) {
      await exportToGoogleDrive(rows, fileName, googleAccessToken);
    } else {
      // ローカルにダウンロード
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "CRF出力");

      // 列幅を調整
      worksheet["!cols"] = [
        { wch: 5 },  // No.
        { wch: 25 }, // パーツ名
        { wch: 50 }, // デフォルト
        { wch: 80 }  // 今回指示
      ];

      XLSX.writeFile(workbook, fileName);
    }
  };

  const exportToGoogleDrive = async (
    rows: Array<{ No: string; パーツ名: string; デフォルト: string; 今回指示: string }>,
    fileName: string,
    accessToken: string
  ) => {
    setIsExporting(true);
    try {
      const response = await fetch("/api/export-to-drive", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          spreadsheetData: rows,
          fileName,
          accessToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Googleドライブへのアップロードに失敗しました");
      }

      // 成功メッセージを表示
      alert(`Googleドライブに正常にアップロードされました！\nファイル名: ${result.fileName}\n\nファイルを開く: ${result.webViewLink}`);
      
      // ファイルを新しいタブで開く
      if (result.webViewLink) {
        window.open(result.webViewLink, "_blank");
      }
    } catch (error) {
      console.error("エクスポートエラー:", error);
      alert(error instanceof Error ? error.message : "Googleドライブへのアップロードに失敗しました");
    } finally {
      setIsExporting(false);
    }
  };

  useEffect(() => {
    // Google Identity Servicesスクリプトを読み込む
    if (typeof window !== "undefined" && !window.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);
    }
  }, []);

  const handleGoogleSignIn = () => {
    if (typeof window === "undefined") {
      alert("ブラウザ環境で実行してください。");
      return;
    }

    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId) {
      alert("Google Client IDが設定されていません。環境変数NEXT_PUBLIC_GOOGLE_CLIENT_IDを設定してください。");
      return;
    }

    // Google Identity Servicesを使用して認証
    if (!window.google) {
      alert("Google認証サービスを読み込めませんでした。ページを再読み込みしてください。");
      return;
    }

    try {
      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: (response: { access_token: string }) => {
          if (response.access_token) {
            setGoogleAccessToken(response.access_token);
            alert("Google認証が完了しました。エクスポートボタンをクリックしてください。");
          }
        },
      });
      tokenClient.requestAccessToken();
    } catch (error) {
      console.error("Google認証エラー:", error);
      alert("Google認証に失敗しました。");
    }
  };

  const productContext = `${crfOutput.category}: ${crfOutput.productName}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold gradient-text">CRF出力フォーム（27項目）</h2>
        <div className="flex gap-2">
          {!googleAccessToken && (
            <button
              onClick={handleGoogleSignIn}
              className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Googleでログイン
            </button>
          )}
          {googleAccessToken && (
            <div className="flex items-center gap-2 px-3 py-2 bg-green-100 text-green-800 rounded-lg text-sm">
              <span>✓ Google認証済み</span>
              <button
                onClick={() => setGoogleAccessToken(null)}
                className="text-green-600 hover:text-green-800 underline text-xs"
              >
                ログアウト
              </button>
            </div>
          )}
          <button
            onClick={exportToSpreadsheet}
            disabled={isExporting}
            className={`px-4 py-2 text-white font-medium rounded-lg transition-colors ${
              googleAccessToken
                ? "bg-green-600 hover:bg-green-700"
                : "bg-gray-400 hover:bg-gray-500"
            } ${isExporting ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {isExporting
              ? "エクスポート中..."
              : googleAccessToken
              ? "Googleドライブにエクスポート"
              : "ローカルにダウンロード"}
          </button>
          <button
            onClick={copyAllText}
            className="px-4 py-2 bg-[var(--accent)] text-white font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors"
          >
            すべてコピー
          </button>
        </div>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        {formSections.map((section, index) => {
          const selectedIdx = getSelectedOption(section.id);
          
          return (
            <div
              key={section.id}
              className="glass rounded-xl p-4 animate-fade-in"
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-start justify-between gap-2 mb-2">
                <label className="text-sm font-medium text-[var(--foreground)] flex-1">
                  <span className="text-[var(--accent)] mr-2">{section.number}.</span>
                  {section.label}
                  {!section.editable && (
                    <span className="ml-2 text-xs text-amber-500/80 bg-amber-500/10 px-2 py-0.5 rounded">
                      固定
                    </span>
                  )}
                  {section.isMultiOption && (
                    <span className="ml-2 text-xs text-blue-400/80 bg-blue-400/10 px-2 py-0.5 rounded">
                      3案
                    </span>
                  )}
                </label>
                <div className="flex items-center gap-2">
                  {/* AI修正依頼ボタン - 一時的に非表示
                  {section.aiRefineType && (
                    <AIRefineButton
                      fieldId={section.isMultiOption ? `${section.id}-${selectedIdx}` : section.id}
                      fieldType={section.aiRefineType}
                      currentText={
                        section.isMultiOption && Array.isArray(section.value)
                          ? getValue(section.id, section.value[selectedIdx], selectedIdx)
                          : getValue(section.id, section.value as string)
                      }
                      productContext={productContext}
                      onRefine={(text) => 
                        section.isMultiOption 
                          ? handleAIRefine(section.id, text, selectedIdx)
                          : handleAIRefine(section.id, text)
                      }
                    />
                  )}
                  */}
                  <CopyButton
                    text={
                      section.isMultiOption && Array.isArray(section.value)
                        ? getValue(section.id, section.value[selectedIdx], selectedIdx)
                        : getValue(section.id, section.value as string)
                    }
                  />
                </div>
              </div>

              {section.isMultiOption && Array.isArray(section.value) ? (
                <div className="space-y-3">
                  {/* Option Tabs */}
                  <div className="flex gap-2">
                    {["A案", "B案", "C案"].map((label, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleOptionSelect(section.id, idx)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                          selectedIdx === idx
                            ? "bg-[var(--accent)] text-white"
                            : "bg-[var(--input-bg)] text-[var(--text-muted)] hover:text-[var(--foreground)]"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {/* Selected Option Input */}
                  <input
                    type="text"
                    value={getValue(section.id, section.value[selectedIdx], selectedIdx)}
                    onChange={(e) => handleChange(section.id, e.target.value, selectedIdx)}
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  {/* All Options Preview */}
                  <div className="text-xs text-[var(--text-muted)] space-y-1">
                    {section.value.map((opt, idx) => (
                      <div key={idx} className={idx === selectedIdx ? "text-[var(--accent)]" : ""}>
                        {["A", "B", "C"][idx]}案: {getValue(section.id, opt, idx)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : section.editable ? (
                section.multiline ? (
                  <textarea
                    value={getValue(section.id, section.value as string)}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                    rows={4}
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                  />
                ) : (
                  <input
                    type="text"
                    value={getValue(section.id, section.value as string)}
                    onChange={(e) => handleChange(section.id, e.target.value)}
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                )
              ) : (
                <div className="px-4 py-3 bg-[var(--input-bg)]/50 border border-[var(--input-border)] rounded-lg text-[var(--text-muted)] whitespace-pre-wrap text-sm">
                  {section.value as string}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
