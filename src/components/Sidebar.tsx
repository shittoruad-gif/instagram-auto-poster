"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import AuthHeader from "@/components/AuthHeader";

const navItems = [
  { href: "/", label: "ダッシュボード", icon: "📊" },
  { href: "/create", label: "投稿作成", icon: "✏️" },
  { href: "/stories", label: "ストーリーズ", icon: "📱" },
  { href: "/schedule", label: "スケジュール", icon: "📅" },
  { href: "/settings", label: "設定", icon: "⚙️" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-white border-r border-gray-200 flex flex-col">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
          InstaAutoPost
        </h1>
        <p className="text-xs text-gray-500 mt-1">Instagram Auto Poster</p>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              pathname === item.href
                ? "bg-purple-50 text-purple-700"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
          >
            <span className="text-lg">{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </nav>

      <div className="border-t border-gray-200">
        <AuthHeader />
        <div className="p-4">
          <div className="px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <p className="text-xs text-gray-500">Powered by</p>
            <p className="text-sm font-semibold text-gray-700">Instagram Graph API</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
