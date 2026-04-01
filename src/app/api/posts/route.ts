import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const posts = await prisma.post.findMany({
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json(posts);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const post = await prisma.post.create({
    data: {
      imageUrl: body.imageUrl,
      caption: body.caption,
      hashtags: body.hashtags || "",
      type: body.type || "FEED",
      status: body.status || "DRAFT",
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
    },
  });
  return NextResponse.json(post);
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "ID is required" }, { status: 400 });
  }
  await prisma.post.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
