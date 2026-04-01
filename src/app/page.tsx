"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [previewPost, setPreviewPost] = useState<Post | null>(null);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => setPosts(data))
      .finally(() => setLoading(false));
  }, []);

  const stats = {
    total: posts.length,
    published: posts.filter((p) => p.status === "PUBLISHED").length,
    scheduled: posts.filter((p) => p.status === "SCHEDULED").length,
    drafts: posts.filter((p) => p.status === "DRAFT").length,
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">ダッシュボード</h1>
        <p className="text-gray-500 mt-1">投稿の管理と概要</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "合計投稿数", value: stats.total, color: "from-purple-500 to-purple-600" },
          { label: "公開済み", value: stats.published, color: "from-green-500 to-green-600" },
          { label: "予約済み", value: stats.scheduled, color: "from-blue-500 to-blue-600" },
          { label: "下書き", value: stats.drafts, color: "from-gray-400 to-gray-500" },
        ].map((stat) => (
          <div
            key={stat.label}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <p className="text-sm text-gray-500">{stat.label}</p>
            <p className="text-3xl font-bold mt-1 text-gray-900">{stat.value}</p>
            <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${stat.color} mt-3`} />
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/create"
          className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl p-6 hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg"
        >
          <p className="text-lg font-bold">新規フィード投稿</p>
          <p className="text-purple-100 text-sm mt-1">
            AI画像生成 + 自動キャプション
          </p>
        </Link>
        <Link
          href="/stories"
          className="bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-xl p-6 hover:from-orange-600 hover:to-pink-600 transition-all shadow-lg"
        >
          <p className="text-lg font-bold">新規ストーリーズ</p>
          <p className="text-orange-100 text-sm mt-1">
            ストーリーズを作成・投稿
          </p>
        </Link>
      </div>

      {/* Recent Posts */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">最近の投稿</h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-gray-500">読み込み中...</div>
        ) : posts.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-4xl mb-3">📸</p>
            <p className="text-gray-500">まだ投稿がありません</p>
            <Link
              href="/create"
              className="inline-block mt-4 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700"
            >
              最初の投稿を作成
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {posts.slice(0, 10).map((post) => (
              <div
                key={post.id}
                className="px-6 py-4 flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => setPreviewPost(post)}
              >
                <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                  {post.imageUrl && (
                    <img
                      src={post.imageUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">
                    {post.caption || "(キャプションなし)"}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">
                      {getTypeLabel(post.type)}
                    </span>
                    <span className="text-gray-300">|</span>
                    <span className="text-xs text-gray-500">
                      {formatDate(post.createdAt)}
                    </span>
                  </div>
                </div>
                <StatusBadge status={post.status} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    fetch(`/api/posts?id=${post.id}`, { method: "DELETE" })
                      .then(() => setPosts((prev) => prev.filter((p) => p.id !== post.id)));
                  }}
                  className="text-gray-400 hover:text-red-500 transition-colors text-sm"
                >
                  削除
                </button>
              </div>
            ))}
          </div>
        )}
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
