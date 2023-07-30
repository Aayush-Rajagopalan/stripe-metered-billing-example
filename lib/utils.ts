import prismadb from "./prisma";
interface APIKeyInfo {
  hashedAPIKey: string;
  apiKey: string;
}

export async function generateAPIKey(): Promise<APIKeyInfo> {
  const { randomBytes } = require("crypto");
  const apiKey = randomBytes(16).toString("hex");
  const hashedAPIKey = hashAPIKey(apiKey);
  const existingApiKey = await prismadb.user.findUnique({
    where: { apiKey: hashedAPIKey },
  });
  // Ensure API key is unique
  if (existingApiKey) {
    generateAPIKey();
  }
  return { hashedAPIKey, apiKey };
}

// Hash the API key
export function hashAPIKey(apiKey: string) {
  const { createHash } = require("crypto");

  const hashedAPIKey = createHash("sha256").update(apiKey).digest("hex");

  return hashedAPIKey;
}
