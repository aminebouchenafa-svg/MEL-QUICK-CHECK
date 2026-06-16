"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { melData, ATA_NEON, searchItems } from "@/lib/data";
import ItemCard from "@/components/ItemCard";
import HelpModal from "@/components/HelpModal";
import { MelItem } from "@/types/mel";

const ataCounts: Record<string, number> = {};
for (const item of melData.items) {
  ataCounts[item.ata] = (ataCounts[item.ata] || 0) + 1;
}

const ataList = Object.entries(melData.ata_chapters).sort(
  (a, b) => Number(a[0]) - Number(b[0])
);

export default function HomePage() {
  const [query, setQuery] = useState("");

  const searchResults = useMemo<MelItem[]>(() => {
    if (!query.trim()) return [];
    return searchItems(melData.items, query).slice(0, 80);
  }, [query]);

  const exactMatch = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return null;
    return searchResults.find((item) => item.number.toLowerCase() === q) ?? null;
  }, [searchResults, query]);

  const isSearching = query.trim().length > 0;

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header
        className="sticky top-0 z-20 px-4 pt-4 pb-3"
        style={{ background: "#1a1a1aee", backdropFilter: "blur(10px)", borderBottom: "1px solid #2e2e2e" }}
      >
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-xl font-bold tracking-tight" style={{ color: "#f0f0f0" }}>
                ✈ MEL Quick Check
              </h1>
              <p className="text-xs" style={{ color: "#606060" }}>
                {melData.operator} · B737 NG · {melData.revision} · {melData.revision_date}
              </p>
            </div>
            <HelpModal />
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg" style={{ color: "#555" }}>
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un item MEL ou mot-clé..."
              className="w-full rounded-xl pl-10 pr-10 py-3 text-sm focus:outline-none transition-all"
              style={{
                background: "#2a2a2a",
                border: `1px solid ${isSearching ? "#555" : "#333"}`,
                color: "#f0f0f0",
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

      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {isSearching ? (
          /* Search results */
          <div>
            <p className="text-xs mb-3" style={{ color: "#666" }}>
              {searchResults.length} résultat{searchResults.length !== 1 ? "s" : ""}
              {searchResults.length === 80 ? " (limité à 80)" : ""}
            </p>
            {searchResults.length === 0 ? (
              <div className="text-center py-16" style={{ color: "#555" }}>
                <p className="text-3xl mb-2">🔎</p>
                <p className="font-semibold" style={{ color: "#888" }}>Aucun résultat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((item) => (
                  <ItemCard
                    key={item.number}
                    item={item}
                    query={query}
                    autoOpen={exactMatch?.number === item.number}
                  />
                ))}
              </div>
            )}
          </div>
        ) : (
          /* ATA Chapter Grid */
          <div>
            <p className="text-xs mb-4" style={{ color: "#606060" }}>
              {ataList.length} chapitres ATA · {melData.items.length} items au total
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {ataList.map(([ch, name]) => {
                const color = ATA_NEON[ch] || "#aaa";
                const count = ataCounts[ch] || 0;
                return (
                  <Link href={`/ata/${ch}`} key={ch}>
                    <div
                      className="rounded-xl p-4 cursor-pointer transition-all duration-200 active:scale-95 hover:scale-[1.02]"
                      style={{
                        background: "#222",
                        border: `1px solid ${color}44`,
                        boxShadow: `0 0 16px ${color}22, inset 0 0 20px ${color}08`,
                      }}
                    >
                      <div
                        className="text-2xl font-black font-mono tracking-tight mb-1"
                        style={{
                          color: color,
                          textShadow: `0 0 10px ${color}99, 0 0 20px ${color}55`,
                        }}
                      >
                        {ch}
                      </div>
                      <div className="text-xs font-semibold leading-tight mb-2" style={{ color: "#c0c0c0" }}>
                        {name.length > 22 ? name.substring(0, 20) + "…" : name}
                      </div>
                      <div
                        className="text-xs font-mono"
                        style={{ color: `${color}99` }}
                      >
                        {count} items
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
