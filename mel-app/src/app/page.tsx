"use client";

import { useState, useMemo, useCallback } from "react";
import melDataRaw from "../../public/mel_data.json";
import type { MelData, MelItem } from "@/types/mel";

const melData = melDataRaw as MelData;

const CATEGORY_COLORS: Record<string, string> = {
  A: "bg-red-900/80 text-red-200 border border-red-700",
  B: "bg-orange-900/80 text-orange-200 border border-orange-700",
  C: "bg-yellow-900/60 text-yellow-200 border border-yellow-700",
  D: "bg-green-900/60 text-green-200 border border-green-700",
};

const CATEGORY_LABELS: Record<string, string> = {
  A: "CAT A – Immédiat",
  B: "CAT B – 3 jours",
  C: "CAT C – 10 jours",
  D: "CAT D – 120 jours",
};

function highlight(text: string, query: string): string {
  if (!query || query.length < 2) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(
    new RegExp(`(${escaped})`, "gi"),
    '<mark class="highlight">$1</mark>'
  );
}

function ProcedureBadge({ type }: { type: string }) {
  const style =
    type === "O"
      ? "bg-blue-900/70 text-blue-200 border border-blue-700"
      : "bg-purple-900/70 text-purple-200 border border-purple-700";
  const label = type === "O" ? "Opérations (O)" : "Maintenance (M)";
  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded ${style}`}>
      {label}
    </span>
  );
}

function ItemCard({
  item,
  query,
  isExpanded,
  onToggle,
}: {
  item: MelItem;
  query: string;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const catColor = CATEGORY_COLORS[item.category] || "bg-slate-700 text-slate-300 border border-slate-600";
  const catLabel = CATEGORY_LABELS[item.category] || item.category;

  return (
    <div
      className={`rounded-xl border transition-all duration-200 cursor-pointer select-none
        ${isExpanded
          ? "border-blue-600/60 bg-[#111c2e]"
          : "border-slate-700/50 bg-[#0f1629] hover:border-slate-600 hover:bg-[#111c2e]"
        }`}
      onClick={onToggle}
    >
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono font-bold text-blue-300 text-base tracking-wide">
              {item.number}
            </span>
            {item.category && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${catColor}`}>
                {catLabel}
              </span>
            )}
            {item.procedures.map((p) => (
              <ProcedureBadge key={p} type={p} />
            ))}
          </div>
          <p
            className="text-slate-200 font-semibold text-sm leading-snug"
            dangerouslySetInnerHTML={{
              __html: highlight(item.title, query),
            }}
          />
          <p className="text-slate-500 text-xs mt-0.5">
            ATA {item.ata} – {item.ata_title}
            {item.installed && item.required && (
              <span className="ml-2 text-slate-600">
                Installé: {item.installed} / Requis: {item.required}
              </span>
            )}
          </p>
        </div>
        <span className="text-slate-600 text-sm mt-0.5 flex-shrink-0">
          {isExpanded ? "▲" : "▼"}
        </span>
      </div>

      {/* Condition preview (always visible) */}
      {item.condition && !isExpanded && (
        <div className="px-4 pb-3">
          <p
            className="text-slate-400 text-xs leading-relaxed line-clamp-2"
            dangerouslySetInnerHTML={{
              __html: highlight(item.condition, query),
            }}
          />
        </div>
      )}

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-slate-700/50 px-4 pb-4 pt-3 space-y-4">
          {item.condition && (
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1.5">
                Condition de dispatch
              </h4>
              <p
                className="text-slate-300 text-sm leading-relaxed"
                dangerouslySetInnerHTML={{
                  __html: highlight(item.condition, query),
                }}
              />
            </div>
          )}

          {item.operations && (
            <div>
              <h4 className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-500 inline-block" />
                Procédure Opérations (O)
              </h4>
              <pre
                className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0a0e1a] rounded-lg p-3 border border-slate-800 overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: highlight(item.operations, query),
                }}
              />
            </div>
          )}

          {item.maintenance && (
            <div>
              <h4 className="text-xs font-bold text-purple-500 uppercase tracking-widest mb-1.5 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 inline-block" />
                Procédure Maintenance (M)
              </h4>
              <pre
                className="text-slate-300 text-xs leading-relaxed whitespace-pre-wrap font-mono bg-[#0a0e1a] rounded-lg p-3 border border-slate-800 overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: highlight(item.maintenance, query),
                }}
              />
            </div>
          )}

          {item.notes.length > 0 && (
            <div>
              <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest mb-1.5">
                Notes
              </h4>
              <ul className="space-y-1">
                {item.notes.map((note, i) => (
                  <li key={i} className="text-amber-200/80 text-xs leading-relaxed flex gap-2">
                    <span className="text-amber-600 flex-shrink-0">▸</span>
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [selectedAta, setSelectedAta] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const ataChapters = useMemo(() => {
    return Object.entries(melData.ata_chapters).sort((a, b) =>
      Number(a[0]) - Number(b[0])
    );
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return melData.items.filter((item) => {
      if (selectedAta && item.ata !== selectedAta) return false;
      if (!q) return true;
      return (
        item.number.toLowerCase().includes(q) ||
        item.title.toLowerCase().includes(q) ||
        item.condition.toLowerCase().includes(q) ||
        item.operations.toLowerCase().includes(q) ||
        item.maintenance.toLowerCase().includes(q)
      );
    });
  }, [query, selectedAta]);

  const handleToggle = useCallback(
    (id: string) => {
      setExpandedId((prev) => (prev === id ? null : id));
    },
    []
  );

  const clearSearch = () => {
    setQuery("");
    setSelectedAta("");
    setExpandedId(null);
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-[#0a0e1a]/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                ✈ MEL Quick Check
              </h1>
              <p className="text-xs text-slate-500">
                B737 NG · {melData.operator} · {melData.revision} · {melData.revision_date}
              </p>
            </div>
            <div className="text-right">
              <span className="text-xs text-slate-600">
                {filteredItems.length} item{filteredItems.length !== 1 ? "s" : ""}
              </span>
            </div>
          </div>

          {/* Search bar */}
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-base">
              🔍
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un item MEL (ex: 21-01, pack, pressurisation...)"
              className="w-full bg-[#111827] border border-slate-700 rounded-xl pl-9 pr-10 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600/50 transition-colors"
              autoComplete="off"
              autoCorrect="off"
              autoCapitalize="off"
              spellCheck={false}
            />
            {(query || selectedAta) && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-lg leading-none"
              >
                ×
              </button>
            )}
          </div>

          {/* ATA filter */}
          <div className="flex gap-2 mt-2 overflow-x-auto pb-1 scrollbar-hide">
            <button
              onClick={() => setSelectedAta("")}
              className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                !selectedAta
                  ? "bg-blue-700 border-blue-600 text-white"
                  : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500"
              }`}
            >
              Tous
            </button>
            {ataChapters.map(([ch, name]) => (
              <button
                key={ch}
                onClick={() => setSelectedAta(ch === selectedAta ? "" : ch)}
                className={`flex-shrink-0 text-xs px-3 py-1 rounded-full border transition-colors ${
                  selectedAta === ch
                    ? "bg-blue-700 border-blue-600 text-white"
                    : "bg-transparent border-slate-700 text-slate-500 hover:border-slate-500"
                }`}
              >
                ATA {ch}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Results */}
      <main className="flex-1 px-4 py-4 max-w-2xl mx-auto w-full">
        {filteredItems.length === 0 ? (
          <div className="text-center py-16 text-slate-600">
            <p className="text-4xl mb-3">🔎</p>
            <p className="font-semibold text-slate-400">Aucun item trouvé</p>
            <p className="text-sm mt-1">
              Essayez un numéro ATA (ex: 21-01) ou un mot-clé
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredItems.slice(0, 100).map((item) => {
              const id = item.number;
              return (
                <ItemCard
                  key={id}
                  item={item}
                  query={query}
                  isExpanded={expandedId === id}
                  onToggle={() => handleToggle(id)}
                />
              );
            })}
            {filteredItems.length > 100 && (
              <p className="text-center text-slate-600 text-xs py-4">
                Affichage des 100 premiers résultats – affinez votre recherche
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
