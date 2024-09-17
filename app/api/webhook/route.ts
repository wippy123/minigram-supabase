import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

console.log('in webhook');
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
    case 'checkout.session.completed':
      console.log('got request', event);
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('session', session);
      const userId = session.metadata?.userId;

      if (!userId) {
        console.error('User ID not found in the session metadata');
        return NextResponse.json({ error: 'User ID not found' }, { status: 400 });
      }

      // Update the account_settings for the user
      const { error: updateError } = await supabase
        .from('account_settings')
        .update({
          stripe_customer_id: session.customer as string,
          subscription_status: 'active', // Assuming the subscription is active upon creation
          subscription_plan: session.subscription as string,
        })
        .eq('id', userId);
;

      if (updateError) {
        console.error('Error updating account settings:', updateError);
        return NextResponse.json({ error: 'Failed to update account settings' }, { status: 500 });
      }

      break;

    case 'customer.subscription.deleted':
      const deletedSubscription = event.data.object as Stripe.Subscription;
      const deletedCustomerId = deletedSubscription.customer as string;

      // Fetch the user_id from account_settings using the stripe_customer_id
      const { data: userData, error: userError } = await supabase
        .from('account_settings')
        .select('user_id')
        .eq('stripe_customer_id', deletedCustomerId)
        .single();

      if (userError || !userData) {
        console.error('Error fetching user data for deleted subscription:', userError);
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      // Update the account_settings for the user with deleted subscription
      const { error: deleteUpdateError } = await supabase
        .from('account_settings')
        .update({
          subscription_status: 'canceled',
          subscription_plan: null,
        })
        .eq('user_id', userData.user_id);

      if (deleteUpdateError) {
        console.error('Error updating account settings for deleted subscription:', deleteUpdateError);
        return NextResponse.json({ error: 'Failed to update account settings' }, { status: 500 });
      }

      break;
  }

  return NextResponse.json({ received: true });
}