"use client";

import { useEffect, useState } from "react";
import { getStripe } from "@/utils/stripe";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

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

interface Subscription {
  id: string;
  status: string;
  plan: {
    id: string;
    nickname: string;
    amount: number;
    currency: string;
    interval: string;
  };
}

export default function SubscriptionSection() {
  const [products, setProducts] = useState<Product[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
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

    const fetchSubscription = async () => {
      try {
        const response = await fetch("/api/stripe/subscription");
        const data = await response.json();
        setSubscription(data);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      }
    };

    fetchProducts();
    fetchSubscription();
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

  if (subscription && subscription.plan && subscription.status !== "canceled") {
    return (
      <Card className="bg-white dark:bg-gray-800 shadow-lg">
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
            Your Subscription
          </h2>
          <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 p-4 rounded-lg">
            <h3 className="text-xl font-semibold text-blue-700 dark:text-blue-300">
              {subscription.plan.nickname}
            </h3>
            <p className="mb-2 text-blue-600 dark:text-blue-400">
              {new Intl.NumberFormat("en-US", {
                style: "currency",
                currency: subscription.plan.currency,
              }).format(subscription.plan.amount / 100)}{" "}
              / {subscription.plan.interval}
            </p>
            <p className="text-sm text-blue-500 dark:text-blue-300">
              Status:{" "}
              <span className="font-semibold">{subscription.status}</span>
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-gray-800 shadow-lg w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
          Choose a Plan
        </h2>
        <div className="w-full">
          {products.map((product) => (
            <div
              key={product.id}
              className="border border-gray-200 dark:border-gray-700 p-6 rounded-lg hover:shadow-md transition-shadow duration-300"
            >
              <h3 className="text-xl font-semibold mb-2 text-gray-800 dark:text-gray-200">
                {product.name}
              </h3>
              <p className="mb-4 text-gray-600 dark:text-gray-400">
                {product.description}
              </p>
              {product.prices.map((price) => (
                <div key={price.id} className="mb-4">
                  <p className="text-2xl font-bold text-gray-700 dark:text-gray-300 mb-2">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: price.currency,
                    }).format(price.unit_amount / 100)}{" "}
                    <span className="text-base font-normal">
                      / {price.interval}
                    </span>
                  </p>
                  <ul className="mb-4 space-y-2">
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Unlimited Teams
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-400">
                      <Check className="h-5 w-5 text-green-500 mr-2" />{" "}
                      Unlimited Messages
                    </li>
                    {/* Add more features as needed */}
                  </ul>
                  <Button
                    onClick={() => handleSubscribe(price.id)}
                    disabled={loading}
                    className="w-full"
                  >
                    {loading ? "Processing..." : "Subscribe"}
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
