"use client";

import { Generation } from "@/types/analysis";
import { useState } from "react";

interface HistoryListProps {
  history: Generation[];
  onSelect: (generation: Generation) => void;
  onDelete: (id: string) => void;
}

export default function HistoryList({ history, onSelect, onDelete }: HistoryListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("この履歴を削除しますか？")) {
      setDeletingId(id);
      await onDelete(id);
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // 製品名を取得（新旧両方の形式に対応）
  const getProductName = (analysis: Generation["analysis_result"]) => {
    // 新形式
    if (analysis.product?.name) {
      return analysis.product.name;
    }
    // 旧形式（後方互換性）
    const anyAnalysis = analysis as unknown as Record<string, unknown>;
    if (anyAnalysis.creative && typeof anyAnalysis.creative === "object") {
      const creative = anyAnalysis.creative as Record<string, unknown>;
      if (creative.product_name_ja && typeof creative.product_name_ja === "string") {
        return creative.product_name_ja;
      }
    }
    return "製品名不明";
  };

  // スペック情報を取得
  const getSpecInfo = (analysis: Generation["analysis_result"]) => {
    if (analysis.iconPoints?.point1) {
      return analysis.iconPoints.point1;
    }
    if (analysis.specs?.output) {
      const match = analysis.specs.output.match(/最大(\d+W)/);
      return match ? match[1] : "";
    }
    return "";
  };

  if (history.length === 0) {
    return (
      <div className="text-center py-8 text-[var(--text-muted)]">
        <svg className="w-12 h-12 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p>生成履歴はまだありません</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-[var(--text-muted)] px-1">最近の生成履歴</h3>
      <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
        {history.map((gen) => (
          <div
            key={gen.id}
            onClick={() => onSelect(gen)}
            className={`glass rounded-xl p-4 cursor-pointer hover:border-[var(--accent)]/50 transition-all duration-200 ${
              deletingId === gen.id ? "opacity-50" : ""
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-[var(--foreground)] truncate">
                  {getProductName(gen.analysis_result)}
                </p>
                <p className="text-sm text-[var(--text-muted)] mt-1">
                  {gen.product_model && (
                    <span className="mr-2">{gen.product_model}</span>
                  )}
                  {getSpecInfo(gen.analysis_result)}
                </p>
                <p className="text-xs text-[var(--text-muted)] mt-1">
                  {formatDate(gen.created_at)}
                </p>
              </div>
              <button
                onClick={(e) => handleDelete(gen.id, e)}
                disabled={deletingId === gen.id}
                className="p-1.5 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
