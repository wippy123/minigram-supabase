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

  if (error || !accountSettings?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
  }

  try {
    const subscriptions = await stripe.subscriptions.list({
      customer: accountSettings.stripe_customer_id,
      status: 'all',
      expand: ['data.default_payment_method'],
    });

    if (subscriptions.data.length === 0) {
      return NextResponse.json({ error: 'No subscription found' }, { status: 404 });
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