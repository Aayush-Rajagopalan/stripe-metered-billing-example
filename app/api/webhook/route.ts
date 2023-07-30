import prismadb from "@/lib/prisma";
import { stripe } from "@/lib/stripe";
import { generateAPIKey } from "@/lib/utils";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get("Stripe-Signature") as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WHSEC!
    );
  } catch (error: any) {
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 });
  }
  const session = event.data.object as Stripe.Checkout.Session;

    if (event.type === "checkout.session.completed") {
        console.log(session);
        // Data included in the event object:
        const customerId = session.customer;
        const subscriptionId = session.subscription ;
  
        console.log(
          `💰 Customer ${customerId} subscribed to plan ${subscriptionId}`
        );
  
        // Get the subscription. The first item is the plan the user subscribed to.
        const subscription = await stripe.subscriptions.retrieve(`${subscriptionId}`);
        const itemId = subscription.items.data[0].id;
  
        // Generate API key
        const { apiKey, hashedAPIKey } = await generateAPIKey();
        console.log(`User's API Key: ${apiKey}`);
        window.localStorage.setItem("apiKey", apiKey);
        console.log(`Hashed API Key: ${hashedAPIKey}`);
        const user = await prismadb.user.create({
            data: {
                name: session?.customer_details?.name || "Unknown",
                apiKey: hashedAPIKey,
                itemId: itemId,
                stripeId:`${customerId}` ,
                active: true,
            },
        })
    } else if (event.type === "customer.subscription.deleted") {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = subscription.customer;
        const user = await prismadb.user.findFirst({
            where: { stripeId: `${subscription.id}` },
        });
        if (user) {
            await prismadb.user.update({
                where: { id: user.id },
                data: { active: false },
            });
        }
    }
}
