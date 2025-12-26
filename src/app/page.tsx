"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { AIAnalysisResult, CRFOutput, Generation } from "@/types/analysis";
import { generateCRFOutput } from "@/lib/ruleEngine";
import Header from "@/components/Header";
import FileUpload from "@/components/FileUpload";
import CRFForm from "@/components/CRFForm";
import HistoryList from "@/components/HistoryList";

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [productModel, setProductModel] = useState("");
  const [mainSellingPoint, setMainSellingPoint] = useState("");
  const [crfOutput, setCrfOutput] = useState<CRFOutput | null>(null);
  const [history, setHistory] = useState<Generation[]>([]);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // ユーザー情報と履歴を取得
  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };
    getUser();
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/history");
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch {
      console.error("履歴取得エラー");
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setError(null);
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      if (productModel) {
        formData.append("productModel", productModel);
      }
      if (mainSellingPoint) {
        formData.append("mainSellingPoint", mainSellingPoint);
      }

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "解析に失敗しました");
      }

      setCrfOutput(data.crfOutput);
      fetchHistory(); // 履歴を更新
    } catch (err) {
      setError(err instanceof Error ? err.message : "解析に失敗しました");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleHistorySelect = (generation: Generation) => {
    // 履歴から選択した場合、CRF出力を再生成
    const output = generateCRFOutput(generation.analysis_result);
    setCrfOutput(output);
    setProductModel(generation.product_model || "");
  };

  const handleHistoryDelete = async (id: string) => {
    try {
      await fetch("/api/history", {
        method: "DELETE",
        body: JSON.stringify({ id }),
      });
      setHistory((prev) => prev.filter((h) => h.id !== id));
    } catch {
      console.error("削除エラー");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <Header user={user} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 左側：入力エリア */}
          <div className="lg:col-span-1 space-y-6">
            {/* ファイルアップロード */}
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">製品情報をアップロード</h2>
              <FileUpload onFileSelect={handleFileSelect} isLoading={isAnalyzing} />
              
              {/* 補助入力 */}
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    製品型番（オプション）
                  </label>
                  <input
                    type="text"
                    value={productModel}
                    onChange={(e) => setProductModel(e.target.value)}
                    placeholder="例: A2693"
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-[var(--text-muted)] mb-2">
                    一番訴求したいポイント
                    <span className="ml-2 text-xs text-[var(--accent)]">推奨</span>
                  </label>
                  <textarea
                    value={mainSellingPoint}
                    onChange={(e) => setMainSellingPoint(e.target.value)}
                    placeholder="例: 世界最小クラスのコンパクト設計&#10;例: アプリ連携による過充電防止機能&#10;例: GaN搭載で高出力ながら小型化を実現"
                    rows={3}
                    className="w-full px-4 py-3 bg-[var(--input-bg)] border border-[var(--input-border)] rounded-lg text-[var(--foreground)] placeholder-[var(--text-muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                  />
                  <p className="text-xs text-[var(--text-muted)] mt-1">
                    入力すると、このポイントを活かしたコピーを生成します
                  </p>
                </div>
              </div>

              {/* 解析ボタン */}
              <button
                onClick={handleAnalyze}
                disabled={!selectedFile || isAnalyzing}
                className="w-full mt-6 px-6 py-4 bg-gradient-to-r from-[var(--accent)] to-[#00b4d8] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed animate-pulse-glow"
              >
                {isAnalyzing ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    解析中...
                  </span>
                ) : (
                  "AIで解析する"
                )}
              </button>

              {/* エラー表示 */}
              {error && (
                <div className="mt-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}
            </div>

            {/* 履歴 */}
            <div className="glass rounded-2xl p-6">
              <HistoryList
                history={history}
                onSelect={handleHistorySelect}
                onDelete={handleHistoryDelete}
              />
            </div>
          </div>

          {/* 右側：出力エリア */}
          <div className="lg:col-span-2">
            {crfOutput ? (
              <div className="glass rounded-2xl p-6 animate-fade-in">
                <CRFForm crfOutput={crfOutput} />
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center">
                  <svg className="w-10 h-10 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)] mb-2">
                  製品情報をアップロードしてください
                </h3>
                <p className="text-[var(--text-muted)]">
                  AIが画像を解析し、CRF27項目を自動生成します
                </p>
                <p className="text-[var(--text-muted)] text-sm mt-2">
                  対応形式: PNG, JPG, PDF, PPTX
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
