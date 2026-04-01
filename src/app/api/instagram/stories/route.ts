import { NextRequest, NextResponse } from "next/server";
import { publishStory } from "@/lib/instagram";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { postId } = await req.json();

    if (!postId) {
      return NextResponse.json({ error: "Post ID is required" }, { status: 400 });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicImageUrl = `${appUrl}${post.imageUrl}`;

    const result = await publishStory(publicImageUrl);

    await prisma.post.update({
      where: { id: postId },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
        igMediaId: result.id,
      },
    });

    return NextResponse.json({ success: true, mediaId: result.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
