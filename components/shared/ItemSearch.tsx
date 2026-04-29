"use client";

import { useState, useEffect, useRef } from "react";
import { getItems } from "@/app/(actions)/items";
import { ItemResponse } from "@/app/(actions)/types";
import { Input } from "@/components/ui/input";
import { Search, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export interface ItemSearchProps {
  onSelect: (item: ItemResponse) => void;
  disabled?: boolean;
  departmentId?: string;
}

export function ItemSearch({ onSelect, disabled, departmentId }: ItemSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ItemResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const fetchItems = async () => {
      if (!query.trim()) {
        setResults([]);
        setIsOpen(false);
        return;
      }

      setIsLoading(true);
      setIsOpen(true);
      try {
        const response = await getItems({
          search: query,
          departmentId,
          status: "ACTIVE", // Only search active items for borrowing
          pageSize: 5,
        });

        if (response.success) {
          setResults(response.data.items);
        }
      } catch (error) {
        console.error("Search failed:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const timer = setTimeout(() => {
      fetchItems();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, departmentId]);

  const handleSelect = (item: ItemResponse) => {
    setQuery("");
    setIsOpen(false);
    onSelect(item);
  };

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search items by name, category, or QR..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          disabled={disabled}
          className="pl-9"
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
        />
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      {isOpen && (query.trim() !== "") && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-950 border rounded-md shadow-lg max-h-60 overflow-auto">
          {results.length === 0 && !isLoading ? (
            <div className="p-4 text-sm text-center text-muted-foreground">
              No items found.
            </div>
          ) : (
            <ul className="py-1">
              {results.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelect(item)}
                  className="px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex flex-col gap-1"
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{item.name}</span>
                    <Badge variant={item.qtyAvailable > 0 ? "default" : "destructive"}>
                      {item.qtyAvailable} / {item.qtyTotal} {item.unit}
                    </Badge>
                  </div>
                  <div className="text-xs text-muted-foreground flex justify-between">
                    <span>{item.category}</span>
                    <span>{item.departmentName}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
