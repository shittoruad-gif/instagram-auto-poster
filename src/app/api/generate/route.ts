import { NextRequest, NextResponse } from "next/server";
import { generateImage, generateCaption } from "@/lib/openai";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action } = body;

    if (action === "image") {
      const { prompt, size, model } = body;
      if (!prompt) {
        return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
      }
      const imageUrl = await generateImage(prompt, size || "1024x1024", model || "dall-e-2");
      return NextResponse.json({ imageUrl });
    }

    if (action === "caption") {
      const { topic, tone } = body;
      if (!topic) {
        return NextResponse.json({ error: "Topic is required" }, { status: 400 });
      }
      const result = await generateCaption(topic, tone || "engaging");
      return NextResponse.json(result);
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
