import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20',
});

export async function GET() {
  try {
    const products = await stripe.products.list({
      active: true,
    });

    const prices = await stripe.prices.list({
      active: true,
      expand: ['data.product'],
    });

    console.log('prices', {products: JSON.stringify(products.data), prices: JSON.stringify(prices.data)});

    const productData = products.data.map((product) => {
      const productPrices = prices.data.filter(
        (price) => (price.product as Stripe.Product).id === product.id
      );
      return {
        id: product.id,
        name: product.name,
        description: product.description,
        prices: productPrices.map((price) => ({
          id: price.id,
          currency: price.currency,
          unit_amount: price.unit_amount,
          interval: price.recurring?.interval,
        })),
      };
    });

    return NextResponse.json(productData);
  } catch (err) {
    console.error('Error fetching products from Stripe:', err);
    return NextResponse.json({ error: 'Error fetching products from Stripe' }, { status: 500 });
  }
}