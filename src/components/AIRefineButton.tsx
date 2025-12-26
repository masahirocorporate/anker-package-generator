"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface AIRefineButtonProps {
  fieldId: string;
  fieldType: "catchCopy" | "subCopy" | "productCopy" | "salesPoint";
  currentText: string;
  productContext?: string;
  onRefine: (refinedText: string) => void;
}

export default function AIRefineButton({
  fieldId,
  fieldType,
  currentText,
  productContext,
  onRefine,
}: AIRefineButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refinementRequest, setRefinementRequest] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleRefine = async () => {
    if (!refinementRequest.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          originalText: currentText,
          refinementRequest: refinementRequest.trim(),
          fieldType,
          productContext,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "修正に失敗しました");
      }

      onRefine(data.refinedText);
      setIsOpen(false);
      setRefinementRequest("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "修正に失敗しました");
    } finally {
      setIsLoading(false);
    }
  };

  const quickSuggestions = [
    "もっと短くして",
    "もっとインパクトを出して",
    "数値を強調して",
    "ベネフィットを強調して",
    "競合との差別化を強調して",
  ];

  const fieldLabels: Record<string, string> = {
    catchCopy: "キャッチコピー",
    subCopy: "サブコピー",
    productCopy: "製品コピー",
    salesPoint: "セールスポイント",
  };

  const modalContent = isOpen ? (
    <div 
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm" 
        onClick={() => setIsOpen(false)} 
      />
      
      {/* Modal */}
      <div 
        className="relative w-full max-w-md rounded-2xl p-6 shadow-2xl"
        style={{ 
          backgroundColor: "#1a1a2e",
          border: "1px solid rgba(255,255,255,0.1)",
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-white">AI修正依頼</h3>
            <p className="text-xs text-gray-400">{fieldLabels[fieldType]}</p>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Current text preview */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-2">現在のテキスト</label>
          <div className="p-3 bg-black/30 rounded-lg text-sm text-white max-h-24 overflow-y-auto border border-white/10">
            {currentText}
          </div>
        </div>

        {/* Quick suggestions */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-2">クイック修正</label>
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => setRefinementRequest(suggestion)}
                className={`px-3 py-1.5 text-xs rounded-full transition-colors ${
                  refinementRequest === suggestion
                    ? "bg-purple-500 text-white"
                    : "bg-white/10 text-gray-300 hover:text-white hover:bg-white/20"
                }`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Custom input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-400 mb-2">自由入力</label>
          <textarea
            value={refinementRequest}
            onChange={(e) => setRefinementRequest(e.target.value)}
            placeholder="修正の指示を入力..."
            rows={3}
            className="w-full px-4 py-3 bg-black/30 border border-white/10 rounded-lg text-sm text-white placeholder-gray-500 focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
          />
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={() => setIsOpen(false)}
            className="flex-1 px-4 py-3 bg-white/10 text-gray-300 text-sm font-medium rounded-lg hover:bg-white/20 hover:text-white transition-colors"
          >
            キャンセル
          </button>
          <button
            onClick={handleRefine}
            disabled={!refinementRequest.trim() || isLoading}
            className="flex-1 px-4 py-3 bg-purple-500 text-white text-sm font-medium rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                修正中...
              </span>
            ) : (
              "AIで修正する"
            )}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/30 hover:bg-purple-500/20 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
        AI修正
      </button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
