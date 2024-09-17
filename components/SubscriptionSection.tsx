"use client";

import { useEffect, useState } from "react";
import { getStripe } from "@/utils/stripe";

interface Product {
  id: string;
  name: string;
  description: string;
  prices: {
    id: string;
    currency: string;
    unit_amount: number;
    interval: string;
  }[];
}

export default function SubscriptionSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch("/api/stripe/products");
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchProducts();
  }, []);

  const handleSubscribe = async (priceId: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/create-checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ priceId }),
      });

      const { sessionId } = await response.json();
      const stripe = await getStripe();
      await stripe?.redirectToCheckout({ sessionId });
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold mb-4">Subscriptions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {products.map((product) => (
          <div key={product.id} className="border p-4 rounded">
            <h3 className="text-xl font-semibold">{product.name}</h3>
            <p className="mb-4">{product.description}</p>
            {product.prices.map((price) => (
              <div key={price.id} className="mb-4">
                <p>
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: price.currency,
                  }).format(price.unit_amount / 100)}{" "}
                  / {price.interval}
                </p>
                <button
                  onClick={() => handleSubscribe(price.id)}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? "Processing..." : "Subscribe"}
                </button>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
