"use client";

import { getStatusLabel, getTypeLabel, formatDate } from "@/lib/utils";
import StatusBadge from "./StatusBadge";

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

interface PreviewModalProps {
  post: Post;
  onClose: () => void;
}

export default function PreviewModal({ post, onClose }: PreviewModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
            <div>
              <p className="text-sm font-semibold text-gray-900">your_account</p>
              <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={post.status} />
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
              {getTypeLabel(post.type)}
            </span>
          </div>
        </div>

        {/* Image */}
        <div
          className={`bg-gray-100 flex items-center justify-center ${
            post.type === "STORY" ? "aspect-[9/16] max-h-[60vh]" : "aspect-square"
          }`}
        >
          {post.imageUrl ? (
            <img
              src={post.imageUrl}
              alt="投稿画像"
              className="w-full h-full object-cover"
            />
          ) : (
            <p className="text-gray-400">画像なし</p>
          )}
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-4 px-4 pt-3">
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
        </div>

        {/* Caption & Hashtags */}
        {(post.caption || post.hashtags) && (
          <div className="px-4 py-3">
            {post.caption && (
              <div className="text-sm text-gray-900 whitespace-pre-wrap">
                <span className="font-semibold">your_account</span>{" "}
                {post.caption}
              </div>
            )}
            {post.hashtags && (
              <p className="text-sm text-blue-600 mt-3 whitespace-pre-wrap leading-relaxed">
                {post.hashtags}
              </p>
            )}
          </div>
        )}

        {/* Meta info */}
        <div className="px-4 pb-4 space-y-1">
          {post.scheduledAt && (
            <p className="text-xs text-blue-600">
              予約日時: {formatDate(post.scheduledAt)}
            </p>
          )}
          {post.publishedAt && (
            <p className="text-xs text-green-600">
              公開日時: {formatDate(post.publishedAt)}
            </p>
          )}
        </div>

        {/* Close button */}
        <div className="border-t border-gray-100 p-4">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
