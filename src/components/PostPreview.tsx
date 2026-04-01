"use client";

interface PostPreviewProps {
  imageUrl: string;
  caption: string;
  hashtags: string;
  type: "FEED" | "STORY";
}

export default function PostPreview({
  imageUrl,
  caption,
  hashtags,
  type,
}: PostPreviewProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden max-w-sm mx-auto">
      <div className="p-3 flex items-center gap-2 border-b border-gray-100">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-pink-500" />
        <span className="text-sm font-semibold text-gray-900">your_account</span>
        {type === "STORY" && (
          <span className="ml-auto text-xs bg-pink-100 text-pink-700 px-2 py-0.5 rounded-full">
            ストーリーズ
          </span>
        )}
      </div>

      <div
        className={cn(
          "bg-gray-100 flex items-center justify-center overflow-hidden",
          type === "STORY" ? "aspect-[9/16]" : "aspect-square"
        )}
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-gray-400 text-center">
            <p className="text-4xl mb-2">🖼️</p>
            <p className="text-sm">画像をアップロードまたは生成してください</p>
          </div>
        )}
      </div>

      {type === "FEED" && (caption || hashtags) && (
        <div className="p-4">
          {caption && (
            <p className="text-sm text-gray-900 mb-2 whitespace-pre-wrap">
              {caption}
            </p>
          )}
          {hashtags && (
            <p className="text-sm text-blue-600 mt-2 whitespace-pre-wrap">{hashtags}</p>
          )}
        </div>
      )}
    </div>
  );
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
