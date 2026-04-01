"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageGenerator from "@/components/ImageGenerator";
import ImageUploader from "@/components/ImageUploader";
import CanvasEditor from "@/components/CanvasEditor";
import PostPreview from "@/components/PostPreview";

export default function StoriesPage() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [tab, setTab] = useState<"template" | "generate" | "upload">("template");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleAction(publish: boolean) {
    if (!imageUrl) {
      setMessage({ type: "error", text: "画像を選択してください" });
      return;
    }

    if (publish) setPublishing(true);
    else setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Save post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          caption: "",
          type: "STORY",
          status: "DRAFT",
        }),
      });
      const post = await res.json();

      if (publish) {
        const pubRes = await fetch("/api/instagram/stories", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });
        const pubData = await pubRes.json();

        if (pubData.error) {
          setMessage({ type: "error", text: pubData.error });
          return;
        }
        setMessage({ type: "success", text: "ストーリーズを投稿しました!" });
      } else {
        setMessage({ type: "success", text: "下書きを保存しました" });
      }

      setTimeout(() => router.push("/"), 1500);
    } catch {
      setMessage({ type: "error", text: "エラーが発生しました" });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ストーリーズ作成</h1>
        <p className="text-gray-500 mt-1">Instagramストーリーズ用の画像を作成・投稿</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Editor */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab("template")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "template"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                テンプレート
              </button>
              <button
                onClick={() => setTab("generate")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "generate"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                AI生成
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "upload"
                    ? "bg-orange-100 text-orange-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                アップロード
              </button>
            </div>

            {tab === "template" ? (
              <CanvasEditor onImageGenerated={setImageUrl} aspectRatio="9:16" />
            ) : tab === "generate" ? (
              <ImageGenerator
                onImageGenerated={setImageUrl}
                defaultSize="1024x1792"
              />
            ) : (
              <ImageUploader onImageUploaded={setImageUrl} />
            )}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-sm text-amber-800">
              <strong>ヒント:</strong> ストーリーズは9:16の縦長比率が最適です。
              AI生成では「9:16 (ストーリーズ向け)」サイズを選択してください。
            </p>
          </div>

          {message.text && (
            <div
              className={`px-4 py-3 rounded-lg text-sm ${
                message.type === "error"
                  ? "bg-red-50 text-red-700"
                  : "bg-green-50 text-green-700"
              }`}
            >
              {message.text}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => handleAction(false)}
              disabled={saving || publishing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "保存中..." : "下書き保存"}
            </button>
            <button
              onClick={() => handleAction(true)}
              disabled={saving || publishing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg font-medium hover:from-orange-600 hover:to-pink-600 disabled:opacity-50"
            >
              {publishing ? "投稿中..." : "ストーリーズに投稿"}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">プレビュー</h3>
          <PostPreview
            imageUrl={imageUrl}
            caption=""
            hashtags=""
            type="STORY"
          />
        </div>
      </div>
    </div>
  );
}
