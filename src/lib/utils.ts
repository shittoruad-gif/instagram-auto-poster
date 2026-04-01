import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "bg-green-100 text-green-800";
    case "SCHEDULED":
      return "bg-blue-100 text-blue-800";
    case "DRAFT":
      return "bg-gray-100 text-gray-800";
    case "FAILED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case "PUBLISHED":
      return "公開済み";
    case "SCHEDULED":
      return "予約済み";
    case "DRAFT":
      return "下書き";
    case "FAILED":
      return "失敗";
    default:
      return status;
  }
}

export function getTypeLabel(type: string): string {
  switch (type) {
    case "FEED":
      return "フィード";
    case "STORY":
      return "ストーリーズ";
    default:
      return type;
  }
}
