import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "default" } });
  }
  // Mask sensitive values
  return NextResponse.json({
    ...settings,
    igAccessToken: settings.igAccessToken ? "••••••" + settings.igAccessToken.slice(-8) : "",
    fbAppSecret: settings.fbAppSecret ? "••••••" + settings.fbAppSecret.slice(-4) : "",
    openaiApiKey: settings.openaiApiKey ? "••••••" + settings.openaiApiKey.slice(-4) : "",
  });
}

export async function PUT(req: NextRequest) {
  const body = await req.json();

  // Only update fields that are provided and not masked
  const data: Record<string, string> = {};
  const fields = [
    "igAccessToken",
    "igUserId",
    "igBusinessAccountId",
    "openaiApiKey",
    "fbAppId",
    "fbAppSecret",
  ] as const;

  for (const field of fields) {
    if (body[field] !== undefined && !body[field].startsWith("••••••")) {
      data[field] = body[field];
    }
  }

  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "default", ...data } });
  } else {
    settings = await prisma.settings.update({ where: { id: "default" }, data });
  }

  return NextResponse.json({ success: true });
}
