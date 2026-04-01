"use client";

import { useState } from "react";

interface ImageGeneratorProps {
  onImageGenerated: (imageUrl: string) => void;
  defaultSize?: "1024x1024" | "1024x1792" | "1792x1024";
}

export default function ImageGenerator({
  onImageGenerated,
  defaultSize = "1024x1024",
}: ImageGeneratorProps) {
  const [prompt, setPrompt] = useState("");
  const [size, setSize] = useState(defaultSize);
  const [model, setModel] = useState<"dall-e-2" | "dall-e-3">("dall-e-2");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleGenerate() {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "image", prompt, size, model }),
      });
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        onImageGenerated(data.imageUrl);
      }
    } catch {
      setError("画像生成に失敗しました");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          AI画像生成
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="生成したい画像の説明を入力してください...&#10;例: ミニマルなカフェの写真、暖かい光、アート風"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
          rows={3}
        />
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">モデル:</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value as typeof model)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900"
          >
            <option value="dall-e-2">DALL-E 2（低コスト）</option>
            <option value="dall-e-3">DALL-E 3（高品質）</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">サイズ:</label>
          <select
            value={size}
            onChange={(e) => setSize(e.target.value as typeof size)}
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 text-gray-900"
            disabled={model === "dall-e-2"}
          >
            <option value="1024x1024">1:1 (フィード向け)</option>
            <option value="1024x1792">9:16 (ストーリーズ向け)</option>
            <option value="1792x1024">16:9 (横長)</option>
          </select>
        </div>
      </div>

      {model === "dall-e-2" && (
        <p className="text-xs text-gray-400">
          DALL-E 2: ~¥3/枚 | DALL-E 3: ~¥12/枚。DALL-E 2は1024x1024固定です。
        </p>
      )}

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-4 py-2 rounded-lg">
          {error}
        </p>
      )}

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-spin">⏳</span>
            生成中...
          </span>
        ) : (
          "画像を生成"
        )}
      </button>
    </div>
  );
}
