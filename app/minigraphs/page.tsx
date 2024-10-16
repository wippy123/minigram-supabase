"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateMinigraphModal from "@/components/CreateMinigraphModal";
import Link from "next/link";

type Minigraph = {
  id: string;
  name: string;
  screenshot_url: string;
  created_at: string;
  views?: number;
};

export default function MinigraphsContent() {
  const [minigraphs, setMinigraphs] = useState<Minigraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const supabase = createClientComponentClient();

  const fetchMinigraphs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("minigraphs")
      .select("id, name, screenshot_url, created_at")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching minigraphs:", error);
    } else {
      setMinigraphs(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMinigraphs();
  }, [supabase]);

  const handleCreateSuccess = () => {
    console.log("here");
    setIsDialogOpen(false);
    fetchMinigraphs();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Minigraphs</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Minigraph</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] overflow-y-auto">
            <CreateMinigraphModal onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <MinigraphsSkeleton />
      ) : minigraphs.length > 0 ? (
        <div className="space-y-4">
          {minigraphs.map((minigraph) => (
            <MinigraphItem key={minigraph.id} minigraph={minigraph} />
          ))}
        </div>
      ) : (
        <p className="text-center mt-8">
          No minigraphs found. Create your first one!
        </p>
      )}
    </div>
  );
}

function MinigraphItem({ minigraph }: { minigraph: Minigraph }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex space-x-4">
          <div className="relative w-40 h-24 flex-shrink-0">
            <Image
              src={minigraph.screenshot_url || "/placeholder-image.jpg"}
              alt={minigraph.name}
              layout="fill"
              objectFit="cover"
              className="rounded-md"
            />
          </div>
          <div className="flex-grow">
            <h2 className="text-lg font-semibold mb-1">{minigraph.name}</h2>
            <p className="text-sm text-gray-500 mb-2">
              Created on {new Date(minigraph.created_at).toLocaleDateString()}
            </p>
            <p className="text-sm text-gray-500">
              {minigraph.views || Math.floor(Math.random() * 1000)} views
            </p>
          </div>
          <div className="flex items-center">
            <Button variant="outline" asChild>
              <Link href={`/minigraph/${minigraph.id}`}>Edit</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MinigraphsSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <Card key={index}>
          <CardContent className="p-4">
            <div className="flex space-x-4">
              <Skeleton className="w-40 h-24 rounded-md" />
              <div className="flex-grow space-y-2">
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
              <div className="flex items-center">
                <Skeleton className="h-10 w-20" />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
