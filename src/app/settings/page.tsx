"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface Settings {
  igAccessToken: string;
  igUserId: string;
  igBusinessAccountId: string;
  openaiApiKey: string;
  fbAppId: string;
  fbAppSecret: string;
}

export default function SettingsPage() {
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<Settings>({
    igAccessToken: "",
    igUserId: "",
    igBusinessAccountId: "",
    openaiApiKey: "",
    fbAppId: "",
    fbAppSecret: "",
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [authStatus, setAuthStatus] = useState<boolean | null>(null);

  useEffect(() => {
    // Load settings
    fetch("/api/settings")
      .then((res) => res.json())
      .then(setSettings);

    // Check auth status
    fetch("/api/instagram/auth")
      .then((res) => res.json())
      .then((data) => setAuthStatus(data.connected));

    // Check for auth callback
    const auth = searchParams.get("auth");
    if (auth === "success") {
      setMessage({ type: "success", text: "Instagram認証に成功しました!" });
      setAuthStatus(true);
    } else if (auth === "error") {
      setMessage({
        type: "error",
        text: `認証エラー: ${searchParams.get("message") || "不明なエラー"}`,
      });
    }
  }, [searchParams]);

  async function handleSave() {
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        setMessage({ type: "success", text: "設定を保存しました" });
        // Reload settings to get masked values
        const updated = await fetch("/api/settings").then((r) => r.json());
        setSettings(updated);
      } else {
        setMessage({ type: "error", text: "保存に失敗しました" });
      }
    } catch {
      setMessage({ type: "error", text: "エラーが発生しました" });
    } finally {
      setSaving(false);
    }
  }

  function handleConnectInstagram() {
    const redirectUri = `${window.location.origin}/api/instagram/auth`;
    const scope = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement";
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${settings.fbAppId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}&response_type=code`;
    window.location.href = authUrl;
  }

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">設定</h1>
        <p className="text-gray-500 mt-1">APIキーとInstagram接続の設定</p>
      </div>

      {message.text && (
        <div
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.type === "error"
              ? "bg-red-50 text-red-700"
              : "bg-green-50 text-green-700"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Instagram Connection Status */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Instagram接続状態
        </h2>
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`w-3 h-3 rounded-full ${
              authStatus ? "bg-green-500" : "bg-gray-300"
            }`}
          />
          <span className="text-sm text-gray-700">
            {authStatus === null
              ? "確認中..."
              : authStatus
              ? "接続済み"
              : "未接続"}
          </span>
        </div>

        {settings.fbAppId && !authStatus && (
          <button
            onClick={handleConnectInstagram}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:from-blue-700 hover:to-blue-800"
          >
            Instagramを接続
          </button>
        )}
      </div>

      {/* Facebook App Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Facebook App設定
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App ID
            </label>
            <input
              type="text"
              value={settings.fbAppId}
              onChange={(e) =>
                setSettings({ ...settings, fbAppId: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="Facebook App ID"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              App Secret
            </label>
            <input
              type="password"
              value={settings.fbAppSecret}
              onChange={(e) =>
                setSettings({ ...settings, fbAppSecret: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="Facebook App Secret"
            />
          </div>
        </div>
      </div>

      {/* Instagram Manual Token */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Instagram手動設定
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          OAuth認証の代わりにアクセストークンを直接入力することもできます
        </p>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              アクセストークン
            </label>
            <input
              type="password"
              value={settings.igAccessToken}
              onChange={(e) =>
                setSettings({ ...settings, igAccessToken: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="Instagram Access Token"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ビジネスアカウントID
            </label>
            <input
              type="text"
              value={settings.igBusinessAccountId}
              onChange={(e) =>
                setSettings({
                  ...settings,
                  igBusinessAccountId: e.target.value,
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
              placeholder="Instagram Business Account ID"
            />
          </div>
        </div>
      </div>

      {/* OpenAI Settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          OpenAI設定
        </h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            API Key
          </label>
          <input
            type="password"
            value={settings.openaiApiKey}
            onChange={(e) =>
              setSettings({ ...settings, openaiApiKey: e.target.value })
            }
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
            placeholder="sk-..."
          />
          <p className="text-xs text-gray-400 mt-1">
            DALL-E画像生成とAIキャプション生成に使用します
          </p>
        </div>
      </div>

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
      >
        {saving ? "保存中..." : "設定を保存"}
      </button>
    </div>
  );
}
