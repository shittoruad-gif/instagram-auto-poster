"use client";

import { useRef, useState } from "react";

interface ImageUploaderProps {
  onImageUploaded: (imageUrl: string) => void;
}

export default function ImageUploader({ onImageUploaded }: ImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        onImageUploaded(data.imageUrl);
      }
    } catch {
      // silent fail
    } finally {
      setUploading(false);
    }
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
        dragOver
          ? "border-purple-500 bg-purple-50"
          : "border-gray-300 hover:border-gray-400"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFile(file);
        }}
      />
      {uploading ? (
        <p className="text-gray-500">アップロード中...</p>
      ) : (
        <>
          <p className="text-2xl mb-2">📤</p>
          <p className="text-sm text-gray-600">
            クリックまたはドラッグ&ドロップで画像をアップロード
          </p>
          <p className="text-xs text-gray-400 mt-1">
            JPG, PNG, WebP 対応
          </p>
        </>
      )}
    </div>
  );
}
