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
import DeleteMinigraphModal from "@/components/DeleteMinigraphModal";
import { Minigraph } from "@/types/minigraph";
import { toast } from "react-hot-toast";
import {
  Facebook,
  Instagram,
  Twitter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

export default function MinigraphsContent() {
  const [minigraphs, setMinigraphs] = useState<Minigraph[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedMinigraph, setSelectedMinigraph] = useState<Minigraph | null>(
    null
  );
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;
  const supabase = createClientComponentClient();

  const fetchMinigraphs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("minigraphs")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching minigrams:", error);
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

  const handleDeleteClick = (minigraph: Minigraph) => {
    setSelectedMinigraph(minigraph);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (selectedMinigraph) {
      const { error } = await supabase
        .from("minigraphs")
        .delete()
        .eq("id", selectedMinigraph.id);

      if (error) {
        console.error("Error deleting minigram:", error);
        toast.error("Failed to delete minigram");
      } else {
        toast.success("Minigram deleted successfully");
        fetchMinigraphs();
      }
      setIsDeleteModalOpen(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentMinigraphs = minigraphs.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(minigraphs.length / itemsPerPage);

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Minigrams</h1>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create New Minigram</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[800px] sm:max-h-[80vh] overflow-y-auto">
            <CreateMinigraphModal onSuccess={handleCreateSuccess} />
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <MinigraphsSkeleton />
      ) : minigraphs.length > 0 ? (
        <>
          <div className="space-y-4">
            {currentMinigraphs.map((minigraph) => (
              <MinigraphItem
                key={minigraph.id}
                minigraph={minigraph}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
              />
            ))}
          </div>
          <div className="flex justify-between items-center mt-4">
            <Button
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              variant="outline"
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <Button
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              variant="outline"
            >
              Next <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <p className="text-center mt-8">
          No minigrams found. Create your first one!
        </p>
      )}

      {selectedMinigraph && (
        <>
          <EditMinigraphModal
            minigraph={selectedMinigraph}
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedMinigraph(null);
            }}
            onSuccess={handleEditSuccess}
          />
          <DeleteMinigraphModal
            minigraph={selectedMinigraph}
            isOpen={isDeleteModalOpen}
            onClose={() => {
              setIsDeleteModalOpen(false);
              setSelectedMinigraph(null);
            }}
            onConfirm={handleDeleteConfirm}
          />
        </>
      )}
    </div>
  );
}

function MinigraphItem({
  minigraph,
  onEditClick,
  onDeleteClick,
}: {
  minigraph: Minigraph;
  onEditClick: (minigraph: Minigraph) => void;
  onDeleteClick: (minigraph: Minigraph) => void;
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
            <p className="text-sm text-gray-600 mb-2">{minigraph.purpose}</p>
            <p className="text-sm text-gray-500 mb-2">
              Created on {new Date(minigraph.created_at).toLocaleDateString()}
            </p>
            <div className="flex space-x-2 mb-2">
              {minigraph.facebook && <Facebook size={16} />}
              {minigraph.instagram && <Instagram size={16} />}
              {minigraph.twitter && <Twitter size={16} />}
            </div>
            <p className="text-sm text-gray-500">
              {minigraph.views || 0} views
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => onEditClick(minigraph)}>
              Edit
            </Button>
            <Button
              variant="destructive"
              onClick={() => onDeleteClick(minigraph)}
            >
              Delete
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
