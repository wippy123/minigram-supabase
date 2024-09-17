import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const sig = req.headers.get('stripe-signature')!;

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, sig, webhookSecret);
  } catch (err) {
    return NextResponse.json({ error: 'Webhook signature verification failed' }, { status: 400 });
  }

  const supabase = createRouteHandlerClient({ cookies });

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      const subscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('account_settings')
        .update({
          stripe_customer_id: subscription.customer as string,
          subscription_status: subscription.status,
          subscription_plan: (subscription.items.data[0].price as Stripe.Price).nickname,
        })
        .eq('stripe_customer_id', subscription.customer);
      break;
    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      await supabase
        .from('account_settings')
        .update({
          subscription_status: 'canceled',
          subscription_plan: null,
        })
        .eq('stripe_customer_id', deletedSubscription.customer);
      break;
  }

  return NextResponse.json({ received: true });
}