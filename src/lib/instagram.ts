import { prisma } from "./db";

const GRAPH_API_BASE = "https://graph.facebook.com/v21.0";

async function getSettings() {
  let settings = await prisma.settings.findUnique({ where: { id: "default" } });
  if (!settings) {
    settings = await prisma.settings.create({ data: { id: "default" } });
  }
  return settings;
}

export async function getInstagramConfig() {
  const settings = await getSettings();
  return {
    accessToken: settings.igAccessToken,
    userId: settings.igUserId,
    businessAccountId: settings.igBusinessAccountId,
    fbAppId: settings.fbAppId,
    fbAppSecret: settings.fbAppSecret,
  };
}

export async function exchangeCodeForToken(code: string, redirectUri: string) {
  const settings = await getSettings();

  // Exchange code for short-lived token
  const tokenRes = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?` +
      new URLSearchParams({
        client_id: settings.fbAppId,
        client_secret: settings.fbAppSecret,
        redirect_uri: redirectUri,
        code,
      })
  );
  const tokenData = await tokenRes.json();

  if (tokenData.error) {
    throw new Error(tokenData.error.message);
  }

  // Exchange for long-lived token
  const longLivedRes = await fetch(
    `${GRAPH_API_BASE}/oauth/access_token?` +
      new URLSearchParams({
        grant_type: "fb_exchange_token",
        client_id: settings.fbAppId,
        client_secret: settings.fbAppSecret,
        fb_exchange_token: tokenData.access_token,
      })
  );
  const longLivedData = await longLivedRes.json();

  if (longLivedData.error) {
    throw new Error(longLivedData.error.message);
  }

  // Get Instagram Business Account ID
  const pagesRes = await fetch(
    `${GRAPH_API_BASE}/me/accounts?access_token=${longLivedData.access_token}`
  );
  const pagesData = await pagesRes.json();

  let igBusinessAccountId = "";
  if (pagesData.data && pagesData.data.length > 0) {
    const pageId = pagesData.data[0].id;
    const igRes = await fetch(
      `${GRAPH_API_BASE}/${pageId}?fields=instagram_business_account&access_token=${longLivedData.access_token}`
    );
    const igData = await igRes.json();
    if (igData.instagram_business_account) {
      igBusinessAccountId = igData.instagram_business_account.id;
    }
  }

  // Save tokens
  await prisma.settings.update({
    where: { id: "default" },
    data: {
      igAccessToken: longLivedData.access_token,
      igBusinessAccountId,
    },
  });

  return {
    accessToken: longLivedData.access_token,
    businessAccountId: igBusinessAccountId,
  };
}

export async function publishFeedPost(imageUrl: string, caption: string) {
  const config = await getInstagramConfig();

  if (!config.accessToken || !config.businessAccountId) {
    throw new Error("Instagram is not connected. Please configure in Settings.");
  }

  // Step 1: Create media container
  const createRes = await fetch(
    `${GRAPH_API_BASE}/${config.businessAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: config.accessToken,
      }),
    }
  );
  const createData = await createRes.json();

  if (createData.error) {
    throw new Error(createData.error.message);
  }

  // Step 2: Publish media
  const publishRes = await fetch(
    `${GRAPH_API_BASE}/${config.businessAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: config.accessToken,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message);
  }

  return publishData;
}

export async function publishStory(imageUrl: string) {
  const config = await getInstagramConfig();

  if (!config.accessToken || !config.businessAccountId) {
    throw new Error("Instagram is not connected. Please configure in Settings.");
  }

  // Create story media container
  const createRes = await fetch(
    `${GRAPH_API_BASE}/${config.businessAccountId}/media`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image_url: imageUrl,
        media_type: "STORIES",
        access_token: config.accessToken,
      }),
    }
  );
  const createData = await createRes.json();

  if (createData.error) {
    throw new Error(createData.error.message);
  }

  // Publish story
  const publishRes = await fetch(
    `${GRAPH_API_BASE}/${config.businessAccountId}/media_publish`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        creation_id: createData.id,
        access_token: config.accessToken,
      }),
    }
  );
  const publishData = await publishRes.json();

  if (publishData.error) {
    throw new Error(publishData.error.message);
  }

  return publishData;
}
