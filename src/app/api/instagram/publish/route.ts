import { NextRequest, NextResponse } from "next/server";
import { publishFeedPost } from "@/lib/instagram";
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

    // Image must be publicly accessible for Instagram API
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const publicImageUrl = `${appUrl}${post.imageUrl}`;

    const fullCaption = post.hashtags
      ? `${post.caption}\n\n${post.hashtags}`
      : post.caption;

    const result = await publishFeedPost(publicImageUrl, fullCaption);

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

    if (req.body) {
      try {
        const { postId } = await req.json().catch(() => ({ postId: null }));
        if (postId) {
          await prisma.post.update({
            where: { id: postId },
            data: { status: "FAILED" },
          });
        }
      } catch {}
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
