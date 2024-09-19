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
  return (
    <div>
      {/* Subscription details */}
      <button className="bg-black text-white py-2 px-4 rounded-md">
        Update Subscription
      </button>
    </div>
  );
}
