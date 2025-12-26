"use client";

import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  isLoading?: boolean;
}

export default function FileUpload({ onFileSelect, isLoading }: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (file) {
        // プレビュー用URL作成
        const objectUrl = URL.createObjectURL(file);
        setPreview(objectUrl);
        onFileSelect(file);
      }
    },
    [onFileSelect]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpg", ".jpeg", ".gif", ".webp"],
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.presentationml.presentation": [".pptx"],
    },
    maxFiles: 1,
    disabled: isLoading,
  });

  const clearPreview = () => {
    if (preview) {
      URL.revokeObjectURL(preview);
    }
    setPreview(null);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-[var(--accent)] bg-[var(--accent)]/5"
            : "border-[var(--card-border)] hover:border-[var(--accent)]/50"
        } ${isLoading ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <input {...getInputProps()} />
        
        {preview ? (
          <div className="relative">
            <img
              src={preview}
              alt="プレビュー"
              className="max-h-64 mx-auto rounded-lg object-contain"
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearPreview();
              }}
              className="absolute top-2 right-2 p-1 bg-red-500/80 rounded-full hover:bg-red-500 transition-colors"
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center">
              <svg className="w-8 h-8 text-[var(--accent)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="text-[var(--foreground)] font-medium">
                {isDragActive ? "ここにドロップ" : "製品情報スライドをアップロード"}
              </p>
              <p className="text-[var(--text-muted)] text-sm mt-1">
                PNG, JPG, PDF, PPTX形式に対応
              </p>
            </div>
          </div>
        )}

        {isLoading && (
          <div className="absolute inset-0 bg-[var(--background)]/80 flex items-center justify-center rounded-xl">
            <div className="flex flex-col items-center gap-3">
              <div className="w-8 h-8 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
              <p className="text-[var(--accent)] text-sm">解析中...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

