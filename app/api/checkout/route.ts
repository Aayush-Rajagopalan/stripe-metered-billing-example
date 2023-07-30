import { stripe } from "@/lib/stripe";
import { NextResponse } from "next/server";

export async function POST(){
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                // Go to Stripe Dashboard > Products > Price > and grab the Price ID
                price: 'price_1NZXEbGJCb5oDxx18sagh3pj',
            }
        ],
        mode: 'subscription',
        success_url: `http://localhost:3000/?success=1`,
        cancel_url: `http://localhost:3000/?cancel=1`,
    });
    return NextResponse.json({url: session.url})
}