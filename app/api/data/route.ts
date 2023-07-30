import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { hashAPIKey } from "@/lib/utils";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const apikey = req.headers.get("x-api-key");

  if (!apikey) {
    return NextResponse.json({ error: "No API key provided" }, { status: 401 });
  }

  const hashedAPIKey = hashAPIKey(apikey);
  const user = await prismadb.user.findUnique({
    where: { apiKey: hashedAPIKey },
  });

  if (!user || !user.active) {
    return NextResponse.json(
      { error: "Invalid API Key / Inactive" },
      { status: 401 }
    );
  }

  const record = await stripe.subscriptionItems.createUsageRecord(user.itemId, {
    quantity: 1,
    timestamp: "now",
    action: "increment",
  });
  
  return NextResponse.json({ data: "🔥🔥🔥🔥🔥" });
}
