"use client";

import { useState } from "react";

interface CaptionGeneratorProps {
  onCaptionGenerated: (caption: string, hashtags: string) => void;
}

export default function CaptionGenerator({
  onCaptionGenerated,
}: CaptionGeneratorProps) {
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("engaging");
  const [loading, setLoading] = useState(false);

  async function handleGenerate() {
    if (!topic.trim()) return;
    setLoading(true);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "caption", topic, tone }),
      });
      const data = await res.json();

      if (!data.error) {
        onCaptionGenerated(data.caption, data.hashtags);
      }
    } catch {
      // silent fail
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="投稿のトピック（例: 朝のコーヒー）"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        />
        <select
          value={tone}
          onChange={(e) => setTone(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
        >
          <option value="engaging">エンゲージング</option>
          <option value="professional">プロフェッショナル</option>
          <option value="casual">カジュアル</option>
          <option value="humorous">ユーモラス</option>
          <option value="inspirational">インスピレーション</option>
        </select>
      </div>
      <button
        onClick={handleGenerate}
        disabled={loading || !topic.trim()}
        className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? "生成中..." : "AIでキャプション生成"}
      </button>
    </div>
  );
}
