"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import CreateMinigraphModal from "@/components/CreateMinigraphModal";
import EditMinigraphModal from "@/components/EditMinigraphModal";
import { Minigraph } from "@/types/minigraph";

export default function MinigraphsContent() {
  const [minigraphs, setMinigraphs] = useState<Minigraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedMinigraph, setSelectedMinigraph] = useState<Minigraph | null>(
    null
  );
  const supabase = createClientComponentClient();

  const fetchMinigraphs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("minigraphs")
      .select("*")
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
    setIsCreateDialogOpen(false);
    fetchMinigraphs();
  };

  const handleEditClick = (minigraph: Minigraph) => {
    setSelectedMinigraph(minigraph);
    setIsEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchMinigraphs();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Minigraphs</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
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
            <MinigraphItem
              key={minigraph.id}
              minigraph={minigraph}
              onEditClick={handleEditClick}
            />
          ))}
        </div>
      ) : (
        <p className="text-center mt-8">
          No minigraphs found. Create your first one!
        </p>
      )}

      {selectedMinigraph && (
        <EditMinigraphModal
          minigraph={selectedMinigraph}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}

function MinigraphItem({
  minigraph,
  onEditClick,
}: {
  minigraph: Minigraph;
  onEditClick: (minigraph: Minigraph) => void;
}) {
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
              {minigraph.views || 0} views
            </p>
          </div>
          <div className="flex items-center">
            <Button variant="outline" onClick={() => onEditClick(minigraph)}>
              Edit
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