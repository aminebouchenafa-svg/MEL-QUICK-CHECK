"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { MelItem } from "@/types/mel";
import { ATA_NEON, searchItems } from "@/lib/data";
import ItemCard from "@/components/ItemCard";

export default function AtaClient({
  chapter,
  ataTitle,
  items,
}: {
  chapter: string;
  ataTitle: string;
  items: MelItem[];
}) {
  const [query, setQuery] = useState("");

  const color = ATA_NEON[chapter] || "#aaa";

  const displayed = useMemo(() => {
    return searchItems(items, query);
  }, [items, query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return displayed.find((item) => item.number.toLowerCase() === q) ?? null;
  }, [displayed, query]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 pt-4 pb-3"
        style={{
          background: "#1a1a1aee",
          backdropFilter: "blur(10px)",
          borderBottom: `1px solid ${color}33`,
        }}
      >
        <div className="max-w-2xl mx-auto">
          {/* Back + title */}
          <div className="flex items-center gap-3 mb-3">
            <Link
              href="/"
              className="text-sm font-medium flex items-center gap-1 transition-colors"
              style={{ color: "#888" }}
            >
              ← Retour
            </Link>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span
                  className="font-black font-mono text-lg"
                  style={{
                    color: color,
                    textShadow: `0 0 10px ${color}aa, 0 0 20px ${color}55`,
                  }}
                >
                  ATA {chapter}
                </span>
                <span
                  className="text-sm font-semibold truncate"
                  style={{ color: "#c0c0c0" }}
                >
                  {ataTitle}
                </span>
              </div>
              <p className="text-xs" style={{ color: "#555" }}>
                {displayed.length} / {items.length} items
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative">
            <span
              className="absolute left-3 top-1/2 -translate-y-1/2 text-base"
              style={{ color: "#555" }}
            >
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={`Rechercher dans ATA ${chapter}...`}
              className="w-full rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none transition-all"
              style={{
                background: "#2a2a2a",
                border: `1px solid ${query ? color + "66" : "#333"}`,
                color: "#f0f0f0",
                boxShadow: query ? `0 0 8px ${color}22` : "none",
              }}
              autoComplete="off"
              spellCheck={false}
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xl leading-none"
                style={{ color: "#555" }}
              >
                ×
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Items list */}
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {displayed.length === 0 ? (
          <div className="text-center py-16" style={{ color: "#555" }}>
            <p className="text-3xl mb-2">🔎</p>
            <p style={{ color: "#888" }}>Aucun item trouvé</p>
          </div>
        ) : (
          <div className="space-y-2">
            {displayed.map((item) => (
              <ItemCard
                key={item.number + item.title}
                item={item}
                query={query}
                autoOpen={exactMatch?.number === item.number}
              />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
