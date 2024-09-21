import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { data: accountSettings, error } = await supabase
    .from('profile_settings')
    .select('stripe_customer_id')
    .eq('id', user.id)
    .single();

  let stripeCustomerId = accountSettings?.stripe_customer_id;

  if (!stripeCustomerId) {
    try {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      stripeCustomerId = customer.id;

      await supabase
        .from('profile_settings')
        .update({ stripe_customer_id: stripeCustomerId })
        .eq('id', user.id);
    } catch (err) {
      console.error('Error creating Stripe customer:', err);
      return NextResponse.json({ error: 'Error creating Stripe customer' }, { status: 500 });
    }
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: stripeCustomerId,
      status: 'all',
      expand: ['data.default_payment_method'],
    });


    if (subscriptions.data.length === 0) {
      return NextResponse.json({ message: 'No active subscription found' }, { status: 200 });
    }

    const subscription = subscriptions.data[0];

    return NextResponse.json({
      id: subscription.id,
      status: subscription.status,
      plan: {
        id: subscription.items.data[0].price.id,
        nickname: subscription.items.data[0].price.nickname,
        amount: subscription.items.data[0].price.unit_amount,
        currency: subscription.items.data[0].price.currency,
        interval: subscription.items.data[0].price.recurring?.interval,
      },
    });
  } catch (err) {
    console.error('Error fetching subscription from Stripe:', err);
    return NextResponse.json({ error: 'Error fetching subscription from Stripe' }, { status: 500 });
  }
}