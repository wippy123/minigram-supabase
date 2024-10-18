"use client";
import { useState, useEffect, useRef } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/types/supabase";
import { Search } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

type Minigraph = Database["public"]["Tables"]["minigraphs"]["Row"];

export function MinigraphSearch() {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<Minigraph[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const searchMinigraphs = async () => {
      if (debouncedSearchTerm) {
        setIsLoading(true);
        const { data, error } = await supabase
          .from("minigraphs")
          .select("id, name, purpose, url")
          .or(
            `name.ilike.%${debouncedSearchTerm}%,purpose.ilike.%${debouncedSearchTerm}%,url.ilike.%${debouncedSearchTerm}%`
          )
          .limit(5);

        if (error) {
          console.error("Error searching minigraphs:", error);
        } else {
          setResults(data);
        }
        setIsLoading(false);
        setShowDropdown(true);
      } else {
        setResults([]);
        setShowDropdown(false);
      }
    };

    searchMinigraphs();
  }, [debouncedSearchTerm, supabase]);

  const handleMinigraphClick = (minigraphId: string) => {
    router.push(`/minigraphs/${minigraphId}`);
    setShowDropdown(false);
  };

  return (
    <div className="relative w-64">
      <div className="flex items-center bg-white dark:bg-gray-800 rounded-full shadow-sm border border-gray-300 dark:border-gray-700 focus-within:ring-2 focus-within:ring-blue-500 dark:focus-within:ring-blue-400 transition-all duration-300">
        <Search className="w-5 h-5 text-gray-400 ml-3" />
        <input
          type="text"
          placeholder="Search minigraphs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full py-2 px-4 rounded-full focus:outline-none bg-transparent dark:text-white text-sm"
        />
      </div>
      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 w-full mt-2 bg-white dark:bg-gray-800 rounded-md shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
        >
          {isLoading ? (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              <div
                className="animate-spin inline-block w-6 h-6 border-2 border-current border-t-transparent rounded-full"
                aria-hidden="true"
              ></div>
              <span className="ml-2">Searching...</span>
            </div>
          ) : results.length > 0 ? (
            <ul className="max-h-64 overflow-y-auto">
              {results.map((minigraph) => (
                <li key={minigraph.id}>
                  <button
                    onClick={() => handleMinigraphClick(minigraph.id)}
                    className="w-full text-left p-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition duration-150 ease-in-out"
                  >
                    <div className="font-semibold text-gray-800 dark:text-gray-200">
                      {minigraph.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 truncate">
                      {minigraph.purpose}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-3 text-center text-gray-500 dark:text-gray-400">
              No results found
            </div>
          )}
        </div>
      )}
    </div>
  );
}
