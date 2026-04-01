"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import ImageGenerator from "@/components/ImageGenerator";
import ImageUploader from "@/components/ImageUploader";
import CanvasEditor from "@/components/CanvasEditor";
import CaptionGenerator from "@/components/CaptionGenerator";
import PostPreview from "@/components/PostPreview";

export default function CreatePost() {
  const router = useRouter();
  const [imageUrl, setImageUrl] = useState("");
  const [caption, setCaption] = useState("");
  const [hashtags, setHashtags] = useState("");
  const [tab, setTab] = useState<"template" | "generate" | "upload">("template");
  const [saving, setSaving] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  async function handleSave(status: "DRAFT" | "PUBLISHED") {
    if (!imageUrl) {
      setMessage({ type: "error", text: "画像を選択してください" });
      return;
    }

    const isPublish = status === "PUBLISHED";
    if (isPublish) setPublishing(true);
    else setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      // Save post
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl,
          caption,
          hashtags,
          type: "FEED",
          status: isPublish ? "DRAFT" : "DRAFT",
        }),
      });
      const post = await res.json();

      if (isPublish) {
        // Publish to Instagram
        const pubRes = await fetch("/api/instagram/publish", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: post.id }),
        });
        const pubData = await pubRes.json();

        if (pubData.error) {
          setMessage({ type: "error", text: pubData.error });
          return;
        }
        setMessage({ type: "success", text: "Instagramに投稿しました!" });
      } else {
        setMessage({ type: "success", text: "下書きを保存しました" });
      }

      setTimeout(() => router.push("/"), 1500);
    } catch (error) {
      setMessage({ type: "error", text: "エラーが発生しました" });
    } finally {
      setSaving(false);
      setPublishing(false);
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">フィード投稿作成</h1>
        <p className="text-gray-500 mt-1">画像を生成・アップロードして投稿を作成</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Editor */}
        <div className="space-y-6">
          {/* Image Source Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => setTab("template")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "template"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                テンプレート
              </button>
              <button
                onClick={() => setTab("generate")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "generate"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                AI生成
              </button>
              <button
                onClick={() => setTab("upload")}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  tab === "upload"
                    ? "bg-purple-100 text-purple-700"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                アップロード
              </button>
            </div>

            {tab === "template" ? (
              <CanvasEditor onImageGenerated={setImageUrl} aspectRatio="1:1" />
            ) : tab === "generate" ? (
              <ImageGenerator
                onImageGenerated={setImageUrl}
                defaultSize="1024x1024"
              />
            ) : (
              <ImageUploader onImageUploaded={setImageUrl} />
            )}
          </div>

          {/* Caption */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-4">
            <h3 className="font-semibold text-gray-900">キャプション</h3>

            <CaptionGenerator
              onCaptionGenerated={(c, h) => {
                setCaption(c);
                setHashtags(h);
              }}
            />

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="キャプションを入力...&#10;&#10;改行を入れて読みやすく整えましょう"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              rows={6}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ハッシュタグ
              </label>
              <textarea
                value={hashtags}
                onChange={(e) => setHashtags(e.target.value)}
                placeholder="#example #instagram #post"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
                rows={2}
              />
            </div>
          </div>

          {/* Actions */}
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
              onClick={() => handleSave("DRAFT")}
              disabled={saving || publishing}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              {saving ? "保存中..." : "下書き保存"}
            </button>
            <button
              onClick={() => handleSave("PUBLISHED")}
              disabled={saving || publishing}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 disabled:opacity-50"
            >
              {publishing ? "投稿中..." : "Instagramに投稿"}
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="space-y-4">
          <h3 className="font-semibold text-gray-900">プレビュー</h3>
          <PostPreview
            imageUrl={imageUrl}
            caption={caption}
            hashtags={hashtags}
            type="FEED"
          />
        </div>
      </div>
    </div>
  );
}
