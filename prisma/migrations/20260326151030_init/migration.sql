-- CreateTable
CREATE TABLE "Post" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "caption" TEXT NOT NULL,
    "hashtags" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'FEED',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "publishedAt" DATETIME,
    "scheduledAt" DATETIME,
    "igMediaId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
    "igAccessToken" TEXT NOT NULL DEFAULT '',
    "igUserId" TEXT NOT NULL DEFAULT '',
    "igBusinessAccountId" TEXT NOT NULL DEFAULT '',
    "openaiApiKey" TEXT NOT NULL DEFAULT '',
    "fbAppId" TEXT NOT NULL DEFAULT '',
    "fbAppSecret" TEXT NOT NULL DEFAULT ''
);
