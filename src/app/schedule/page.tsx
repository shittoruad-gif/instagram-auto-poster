"use client";

import { useEffect, useState } from "react";
import StatusBadge from "@/components/StatusBadge";
import PreviewModal from "@/components/PreviewModal";
import { formatDate, getTypeLabel } from "@/lib/utils";

interface Post {
  id: string;
  imageUrl: string;
  caption: string;
  hashtags: string;
  type: string;
  status: string;
  scheduledAt: string | null;
  publishedAt: string | null;
  createdAt: string;
}

export default function SchedulePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(data.filter((p: Post) => p.status === "SCHEDULED" || p.status === "DRAFT"));
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSchedule(postId: string, date: string) {
    await fetch("/api/posts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: postId,
        scheduledAt: date,
        status: "SCHEDULED",
      }),
    });

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? { ...p, scheduledAt: date, status: "SCHEDULED" }
          : p
      )
    );
  }

  async function handlePublishNow(postId: string, type: string) {
    const endpoint =
      type === "STORY" ? "/api/instagram/stories" : "/api/instagram/publish";

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId }),
    });
    const data = await res.json();

    if (data.success) {
      setPosts((prev) => prev.filter((p) => p.id !== postId));
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">スケジュール管理</h1>
        <p className="text-gray-500 mt-1">予約投稿と下書きの管理</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        {loading ? (
          <div className="p-12 text-center text-gray-500">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📅</p>
            <p className="text-gray-500">予約投稿や下書きはありません</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.map((post) => (
              <div key={post.id} className="p-6">
                <div className="flex items-start gap-4">
                  <div
                    className="w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => setPreviewPost(post)}
                  >
                    {post.imageUrl && (
                      <img
                        src={post.imageUrl}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <StatusBadge status={post.status} />
                      <span className="text-xs text-gray-500">
                        {getTypeLabel(post.type)}
                      </span>
                      <button
                        onClick={() => setPreviewPost(post)}
                        className="text-xs text-purple-600 hover:text-purple-800 font-medium"
                      >
                        プレビュー
                      </button>
                    </div>
                    <p className="text-sm text-gray-900 truncate mb-2">
                      {post.caption || "(キャプションなし)"}
                    </p>

                    {post.scheduledAt && (
                      <p className="text-sm text-blue-600">
                        予約日時: {formatDate(post.scheduledAt)}
                      </p>
                    )}

                    <div className="flex items-center gap-3 mt-3">
                      <input
                        type="datetime-local"
                        className="px-3 py-2 border border-gray-300 rounded-lg text-sm text-gray-900"
                        onChange={(e) =>
                          handleSchedule(post.id, e.target.value)
                        }
                        defaultValue={
                          post.scheduledAt
                            ? new Date(post.scheduledAt)
                                .toISOString()
                                .slice(0, 16)
                            : ""
                        }
                      />

                      <button
                        onClick={() => handlePublishNow(post.id, post.type)}
                        className="px-4 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
                      >
                        今すぐ投稿
                      </button>

                      <button
                        onClick={async () => {
                          await fetch(`/api/posts?id=${post.id}`, {
                            method: "DELETE",
                          });
                          setPosts((prev) =>
                            prev.filter((p) => p.id !== post.id)
                          );
                        }}
                        className="px-4 py-2 text-red-600 border border-red-200 rounded-lg text-sm font-medium hover:bg-red-50"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-sm text-blue-800">
          <strong>注意:</strong>{" "}
          自動予約投稿機能は、アプリをサーバーとして常時起動している場合に動作します。
          現在のバージョンでは手動で「今すぐ投稿」ボタンから投稿できます。
        </p>
      </div>

      {previewPost && (
        <PreviewModal
          post={previewPost}
          onClose={() => setPreviewPost(null)}
        />
      )}
    </div>
  );
}
