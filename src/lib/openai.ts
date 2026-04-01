import OpenAI from "openai";
import { prisma } from "./db";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

async function getOpenAIClient() {
  const settings = await prisma.settings.findUnique({
    where: { id: "default" },
  });

  if (!settings?.openaiApiKey) {
    throw new Error("OpenAI API key is not configured. Please set it in Settings.");
  }

  return new OpenAI({ apiKey: settings.openaiApiKey });
}

export async function generateImage(
  prompt: string,
  size: "1024x1024" | "1024x1792" | "1792x1024" = "1024x1024",
  model: "dall-e-3" | "dall-e-2" = "dall-e-2"
): Promise<string> {
  const client = await getOpenAIClient();

  // DALL-E 2 only supports 1024x1024, 512x512, 256x256
  const dalle2Size = "1024x1024" as const;

  const response = await client.images.generate({
    model,
    prompt,
    n: 1,
    size: model === "dall-e-2" ? dalle2Size : size,
    ...(model === "dall-e-3" ? { quality: "hd" } : {}),
  });

  const imageUrl = response.data?.[0]?.url;
  if (!imageUrl) {
    throw new Error("Failed to generate image");
  }

  // Download and save locally
  const imageRes = await fetch(imageUrl);
  const buffer = Buffer.from(await imageRes.arrayBuffer());

  const uploadsDir = path.join(process.cwd(), "public", "uploads");
  await mkdir(uploadsDir, { recursive: true });

  const filename = `generated-${Date.now()}.png`;
  const filepath = path.join(uploadsDir, filename);
  await writeFile(filepath, buffer);

  return `/uploads/${filename}`;
}

export async function generateCaption(
  topic: string,
  tone: string = "engaging"
): Promise<{ caption: string; hashtags: string }> {
  const client = await getOpenAIClient();

  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `You are an Instagram content expert. Generate a compelling caption and relevant hashtags.
Always respond in JSON format: {"caption": "...", "hashtags": "#tag1 #tag2 ..."}
Keep captions concise (under 200 characters) and generate 10-15 relevant hashtags.`,
      },
      {
        role: "user",
        content: `Topic: ${topic}\nTone: ${tone}`,
      },
    ],
    response_format: { type: "json_object" },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Failed to generate caption");
  }

  return JSON.parse(content);
}
