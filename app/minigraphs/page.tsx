"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import Image from "next/image";

type Minigraph = {
  id: string;
  name: string;
  screenshot_url: string;
};

export default function MinigraphsGallery() {
  const [minigraphs, setMinigraphs] = useState<Minigraph[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    async function fetchMinigraphs() {
      const { data, error } = await supabase
        .from("minigraphs")
        .select("id, name, screenshot_url")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching minigraphs:", error);
      } else {
        setMinigraphs(data || []);
      }
      setLoading(false);
    }

    fetchMinigraphs();
  }, [supabase]);

  if (loading) {
    return <div className="text-center mt-8">Loading minigraphs...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Minigraph Gallery</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {minigraphs.map((minigraph) => (
          <Link
            href={`/minigraph/${minigraph.id}`}
            key={minigraph.id}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="relative aspect-square">
                <Image
                  src={minigraph.screenshot_url || "/placeholder-image.jpg"}
                  alt={minigraph.name}
                  layout="fill"
                  objectFit="cover"
                />
              </div>
              <div className="p-4">
                <h2 className="text-lg font-semibold truncate">
                  {minigraph.name}
                </h2>
              </div>
            </div>
          </Link>
        ))}
      </div>
      {minigraphs.length === 0 && (
        <p className="text-center mt-8">
          No minigraphs found. Create your first one!
        </p>
      )}
      <div className="mt-8 text-center">
        <Link
          href="/minigraph"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
        >
          Create New Minigraph
        </Link>
      </div>
    </div>
  );
}
