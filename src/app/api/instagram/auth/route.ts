import { NextRequest, NextResponse } from "next/server";
import { exchangeCodeForToken, getInstagramConfig } from "@/lib/instagram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (code) {
    try {
      const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/instagram/auth`;
      const result = await exchangeCodeForToken(code, redirectUri);
      // Redirect back to settings with success
      return NextResponse.redirect(
        new URL("/settings?auth=success", req.url)
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      return NextResponse.redirect(
        new URL(`/settings?auth=error&message=${encodeURIComponent(message)}`, req.url)
      );
    }
  }

  // Return current auth status
  const config = await getInstagramConfig();
  return NextResponse.json({
    connected: !!config.accessToken && !!config.businessAccountId,
    businessAccountId: config.businessAccountId || null,
  });
}
