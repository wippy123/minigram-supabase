import React from "react";
import Image from "next/image";
import Link from "next/link";

interface MinigraphCardProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export function MinigraphCard({
  id,
  title,
  description,
  imageUrl,
}: MinigraphCardProps) {
  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt={title}
        width={300}
        height={200}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={`/minigraphs/${id}`}
          className="text-blue-500 hover:text-blue-600 transition-colors"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
