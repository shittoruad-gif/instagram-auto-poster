"use client";

import { useRef, useState, useEffect, useCallback } from "react";

interface Template {
  id: string;
  name: string;
  bgColor: string;
  bgGradient?: string;
  textColor: string;
  fontFamily: string;
}

const TEMPLATES: Template[] = [
  { id: "minimal-white", name: "ミニマル白", bgColor: "#ffffff", textColor: "#111111", fontFamily: "sans-serif" },
  { id: "minimal-black", name: "ミニマル黒", bgColor: "#111111", textColor: "#ffffff", fontFamily: "sans-serif" },
  { id: "warm-beige", name: "ウォームベージュ", bgColor: "#f5f0e8", textColor: "#5c4a3a", fontFamily: "serif" },
  { id: "ocean-blue", name: "オーシャンブルー", bgColor: "#1a365d", bgGradient: "linear-gradient(135deg, #1a365d, #2b6cb0)", textColor: "#ffffff", fontFamily: "sans-serif" },
  { id: "sunset-pink", name: "サンセットピンク", bgColor: "#ed64a6", bgGradient: "linear-gradient(135deg, #ed64a6, #f6ad55)", textColor: "#ffffff", fontFamily: "sans-serif" },
  { id: "forest-green", name: "フォレストグリーン", bgColor: "#22543d", bgGradient: "linear-gradient(135deg, #22543d, #48bb78)", textColor: "#ffffff", fontFamily: "sans-serif" },
  { id: "lavender", name: "ラベンダー", bgColor: "#b794f4", bgGradient: "linear-gradient(135deg, #9f7aea, #ed64a6)", textColor: "#ffffff", fontFamily: "sans-serif" },
  { id: "coral", name: "コーラル", bgColor: "#fc8181", bgGradient: "linear-gradient(135deg, #fc8181, #f6e05e)", textColor: "#ffffff", fontFamily: "sans-serif" },
];

type TextPosition = "top" | "center" | "bottom";
type TextAlign = "left" | "center" | "right";

interface CanvasEditorProps {
  onImageGenerated: (imageUrl: string) => void;
  aspectRatio?: "1:1" | "9:16";
}

export default function CanvasEditor({
  onImageGenerated,
  aspectRatio = "1:1",
}: CanvasEditorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [template, setTemplate] = useState<Template>(TEMPLATES[0]);
  const [mainText, setMainText] = useState("");
  const [subText, setSubText] = useState("");
  const [mainFontSize, setMainFontSize] = useState(48);
  const [subFontSize, setSubFontSize] = useState(20);
  const [fontWeight, setFontWeight] = useState<"normal" | "bold">("bold");
  const [textPosition, setTextPosition] = useState<TextPosition>("center");
  const [textAlign, setTextAlign] = useState<TextAlign>("center");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight, setLineHeight] = useState(1.4);
  const [customBgColor, setCustomBgColor] = useState("#ffffff");
  const [customTextColor, setCustomTextColor] = useState("#111111");
  const [useCustomColors, setUseCustomColors] = useState(false);
  const [bgImage, setBgImage] = useState<HTMLImageElement | null>(null);
  const [saving, setSaving] = useState(false);

  const width = 1080;
  const height = aspectRatio === "9:16" ? 1920 : 1080;

  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    // Background
    if (bgImage) {
      const imgRatio = bgImage.width / bgImage.height;
      const canvasRatio = width / height;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = height;
        drawW = height * imgRatio;
        drawX = (width - drawW) / 2;
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgRatio;
        drawX = 0;
        drawY = (height - drawH) / 2;
      }

      ctx.drawImage(bgImage, drawX, drawY, drawW, drawH);
      ctx.fillStyle = "rgba(0,0,0,0.35)";
      ctx.fillRect(0, 0, width, height);
    } else if (template.bgGradient && !useCustomColors) {
      const colors = template.bgGradient.match(/#[a-fA-F0-9]{6}/g) || [template.bgColor, template.bgColor];
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, colors[0]);
      gradient.addColorStop(1, colors[1] || colors[0]);
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    } else {
      ctx.fillStyle = useCustomColors ? customBgColor : template.bgColor;
      ctx.fillRect(0, 0, width, height);
    }

    const textColor = useCustomColors ? customTextColor : (bgImage ? "#ffffff" : template.textColor);
    const fontFamily = template.fontFamily;
    const padding = 80;

    // Calculate text X position based on alignment
    let textX: number;
    if (textAlign === "left") {
      textX = padding;
    } else if (textAlign === "right") {
      textX = width - padding;
    } else {
      textX = width / 2;
    }

    // Draw text with letter spacing
    function drawTextWithSpacing(
      ctx: CanvasRenderingContext2D,
      text: string,
      x: number,
      y: number,
      spacing: number
    ) {
      if (spacing === 0) {
        ctx.fillText(text, x, y);
        return;
      }

      // For letter spacing, we need to draw character by character
      const chars = text.split("");
      const totalWidth = chars.reduce((w, ch) => w + ctx.measureText(ch).width + spacing, -spacing);

      let startX: number;
      if (textAlign === "center") {
        startX = x - totalWidth / 2;
      } else if (textAlign === "right") {
        startX = x - totalWidth;
      } else {
        startX = x;
      }

      const savedAlign = ctx.textAlign;
      ctx.textAlign = "left";
      let currentX = startX;
      for (const ch of chars) {
        ctx.fillText(ch, currentX, y);
        currentX += ctx.measureText(ch).width + spacing;
      }
      ctx.textAlign = savedAlign;
    }

    // Main text
    if (mainText) {
      ctx.fillStyle = textColor;
      ctx.font = `${fontWeight} ${mainFontSize}px ${fontFamily}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = "middle";

      const maxTextWidth = width - padding * 2;
      const lines = wrapText(ctx, mainText, maxTextWidth);
      const totalLineHeight = mainFontSize * lineHeight;
      const totalTextHeight = lines.length * totalLineHeight;
      const subTextSpace = subText ? subFontSize + 40 : 0;

      let startY: number;
      if (textPosition === "top") {
        startY = padding + mainFontSize / 2;
      } else if (textPosition === "bottom") {
        startY = height - padding - totalTextHeight - subTextSpace + mainFontSize / 2;
      } else {
        startY = (height - totalTextHeight - subTextSpace) / 2 + mainFontSize / 2;
      }

      lines.forEach((line, i) => {
        drawTextWithSpacing(ctx, line, textX, startY + i * totalLineHeight, letterSpacing);
      });

      // Sub text
      if (subText) {
        ctx.fillStyle = textColor;
        ctx.globalAlpha = 0.7;
        ctx.font = `${subFontSize}px ${fontFamily}`;

        const subY = startY + totalTextHeight + 20;
        drawTextWithSpacing(ctx, subText, textX, subY, letterSpacing * 0.5);
        ctx.globalAlpha = 1;
      }
    } else if (subText) {
      ctx.fillStyle = textColor;
      ctx.globalAlpha = 0.7;
      ctx.font = `${subFontSize}px ${fontFamily}`;
      ctx.textAlign = textAlign;
      ctx.textBaseline = "middle";

      drawTextWithSpacing(ctx, subText, textX, height / 2, letterSpacing * 0.5);
      ctx.globalAlpha = 1;
    }
  }, [template, mainText, subText, mainFontSize, subFontSize, fontWeight, textPosition, textAlign, letterSpacing, lineHeight, customBgColor, customTextColor, useCustomColors, bgImage, width, height]);

  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
    const lines: string[] = [];
    const paragraphs = text.split("\n");

    for (const paragraph of paragraphs) {
      const chars = paragraph.split("");
      let currentLine = "";

      for (const char of chars) {
        const testLine = currentLine + char;
        const metrics = ctx.measureText(testLine);
        const extraSpacing = (testLine.length - 1) * letterSpacing;

        if (metrics.width + extraSpacing > maxWidth && currentLine) {
          lines.push(currentLine);
          currentLine = char;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) lines.push(currentLine);
    }

    return lines.length ? lines : [""];
  }

  function handleBgImageUpload(file: File) {
    const img = new Image();
    img.onload = () => setBgImage(img);
    img.src = URL.createObjectURL(file);
  }

  async function handleSave() {
    const canvas = canvasRef.current;
    if (!canvas) return;

    setSaving(true);
    try {
      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const formData = new FormData();
      formData.append("file", blob, "canvas-image.png");

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.imageUrl) {
        onImageGenerated(data.imageUrl);
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-4">
      {/* Template Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          テンプレート
        </label>
        <div className="grid grid-cols-4 gap-2">
          {TEMPLATES.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setTemplate(t);
                setUseCustomColors(false);
              }}
              className={`h-12 rounded-lg border-2 transition-all ${
                template.id === t.id && !useCustomColors
                  ? "border-purple-500 ring-2 ring-purple-200"
                  : "border-gray-200"
              }`}
              style={{ background: t.bgGradient || t.bgColor }}
              title={t.name}
            />
          ))}
        </div>
      </div>

      {/* Custom Colors */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={useCustomColors}
            onChange={(e) => setUseCustomColors(e.target.checked)}
            className="rounded"
          />
          カスタムカラー
        </label>
        {useCustomColors && (
          <div className="flex gap-2">
            <label className="flex items-center gap-1 text-xs text-gray-500">
              背景
              <input type="color" value={customBgColor} onChange={(e) => setCustomBgColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </label>
            <label className="flex items-center gap-1 text-xs text-gray-500">
              文字
              <input type="color" value={customTextColor} onChange={(e) => setCustomTextColor(e.target.value)} className="w-8 h-8 rounded cursor-pointer" />
            </label>
          </div>
        )}
      </div>

      {/* Background Image */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">背景画像（任意）</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => { const file = e.target.files?.[0]; if (file) handleBgImageUpload(file); }}
          className="text-sm text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
        />
        {bgImage && (
          <button onClick={() => setBgImage(null)} className="text-xs text-red-500 mt-1">背景画像を削除</button>
        )}
      </div>

      {/* Text Input */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">メインテキスト</label>
        <textarea
          value={mainText}
          onChange={(e) => setMainText(e.target.value)}
          placeholder="タイトルやメッセージを入力..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-gray-900"
          rows={2}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">サブテキスト</label>
        <input
          type="text"
          value={subText}
          onChange={(e) => setSubText(e.target.value)}
          placeholder="サブタイトルや日付など"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900"
        />
      </div>

      {/* Text Style Controls */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        <p className="text-sm font-medium text-gray-700">テキストスタイル</p>

        {/* Font Sizes */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">メイン文字サイズ: {mainFontSize}px</label>
            <input type="range" min={20} max={120} value={mainFontSize} onChange={(e) => setMainFontSize(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">サブ文字サイズ: {subFontSize}px</label>
            <input type="range" min={12} max={60} value={subFontSize} onChange={(e) => setSubFontSize(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        {/* Letter Spacing & Line Height */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-gray-500 mb-1">文字間隔: {letterSpacing}px</label>
            <input type="range" min={-2} max={20} value={letterSpacing} onChange={(e) => setLetterSpacing(Number(e.target.value))} className="w-full" />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1">行間: {lineHeight.toFixed(1)}</label>
            <input type="range" min={10} max={30} value={lineHeight * 10} onChange={(e) => setLineHeight(Number(e.target.value) / 10)} className="w-full" />
          </div>
        </div>

        {/* Font Weight, Text Position, Text Align */}
        <div className="flex gap-2 flex-wrap">
          <select
            value={fontWeight}
            onChange={(e) => setFontWeight(e.target.value as "normal" | "bold")}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900"
          >
            <option value="bold">太字</option>
            <option value="normal">標準</option>
          </select>

          <select
            value={textPosition}
            onChange={(e) => setTextPosition(e.target.value as TextPosition)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900"
          >
            <option value="top">上寄せ</option>
            <option value="center">中央</option>
            <option value="bottom">下寄せ</option>
          </select>

          <select
            value={textAlign}
            onChange={(e) => setTextAlign(e.target.value as TextAlign)}
            className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs text-gray-900"
          >
            <option value="left">左揃え</option>
            <option value="center">中央揃え</option>
            <option value="right">右揃え</option>
          </select>
        </div>
      </div>

      {/* Preview Canvas */}
      <div className="border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
        <canvas
          ref={canvasRef}
          style={{ width: "100%", height: "auto", display: "block" }}
        />
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full px-6 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? "保存中..." : "この画像を使用"}
      </button>
    </div>
  );
}
