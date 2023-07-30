import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { hashAPIKey } from "@/lib/utils";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const apiKey = req.headers.get("x-api-key");
    const hashedAPIKey = hashAPIKey(`${apiKey}`);
    const customer = await prismadb.user.findUnique({
      where: { apiKey: `${hashedAPIKey}` },
    });
    if (!customer || !customer.active) {
      return NextResponse.json(
        { error: "Invalid API Key / Inactive" },
        { status: 401 }
      );
    }
    const session = await stripe.billingPortal.sessions.create({
      customer: `${customer.stripeId}`,
      return_url: `http://localhost:3000/`,
    });
  } catch (error: any) {
    console.log(error);
  }
}
