"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { useParams } from "next/navigation";
import Link from "next/link";

type Minigraph = Database["public"]["Tables"]["minigraphs"]["Row"];

export default function MinigraphDetail() {
  const [minigraph, setMinigraph] = useState<Minigraph | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const params = useParams();
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    async function fetchMinigraph() {
      if (typeof params.id !== "string") {
        setError("Invalid minigraph ID");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("minigraphs")
        .select("*")
        .eq("id", params.id)
        .single();

      if (error) {
        setError("Failed to fetch minigraph");
        console.error("Error fetching minigraph:", error);
      } else {
        setMinigraph(data);
      }
      setIsLoading(false);
    }

    fetchMinigraph();
  }, [params.id, supabase]);

  if (isLoading) {
    return <div className="text-center mt-8">Loading...</div>;
  }

  if (error || !minigraph) {
    return (
      <div className="text-center mt-8 text-red-500">
        {error || "Minigraph not found"}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto mt-8 p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4 text-gray-900 dark:text-white">
        {minigraph.name}
      </h1>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          Purpose
        </h2>
        <p className="text-gray-600 dark:text-gray-400">{minigraph.purpose}</p>
      </div>
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
          URL
        </h2>
        <a
          href={minigraph.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-500 hover:underline"
        >
          {minigraph.url}
        </a>
      </div>
      {minigraph.screenshot_url && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2 text-gray-700 dark:text-gray-300">
            Screenshot
          </h2>
          <img
            src={minigraph.screenshot_url}
            alt="Minigraph Screenshot"
            className="max-w-full h-auto rounded-lg shadow-sm"
          />
        </div>
      )}
      <Link
        href="/minigraphs"
        className="inline-block mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Back to Minigraphs
      </Link>
    </div>
  );
}
