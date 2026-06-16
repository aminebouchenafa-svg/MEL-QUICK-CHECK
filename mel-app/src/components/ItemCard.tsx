"use client";

import { useState } from "react";
import type { MelItem } from "@/types/mel";
import { CATEGORY_INFO } from "@/lib/data";

function hl(text: string, query: string): string {
  if (!query || query.length < 2) return text;
  const esc = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return text.replace(new RegExp(`(${esc})`, "gi"), "<mark>$1</mark>");
}

export default function ItemCard({
  item,
  query = "",
  autoOpen = false,
}: {
  item: MelItem;
  query?: string;
  autoOpen?: boolean;
}) {
  const [open, setOpen] = useState(autoOpen);
  const [activeTab, setActiveTab] = useState<"O" | "M" | null>(
    autoOpen
      ? item.procedures.includes("O") || item.operations
        ? "O"
        : item.procedures.includes("M") || item.maintenance
        ? "M"
        : null
      : null
  );

  const cat = CATEGORY_INFO[item.category];
  const hasO = item.procedures.includes("O") || !!item.operations;
  const hasM = item.procedures.includes("M") || !!item.maintenance;

  const handleToggle = () => {
    setOpen((v) => !v);
    if (!open && !activeTab) {
      setActiveTab(hasO ? "O" : hasM ? "M" : null);
    }
  };

  return (
    <div
      style={{ background: "#242424", borderColor: open ? "#555" : "#333" }}
      className="rounded-xl border transition-all duration-200"
    >
      {/* Header row — always visible */}
      <button onClick={handleToggle} className="w-full text-left p-4">
        {/* Line 1: number + category */}
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <span className="font-mono font-bold text-base tracking-wider" style={{ color: "#e0e0e0" }}>
            {item.number}
          </span>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {hasO && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded border border-blue-500/50 text-blue-400 bg-blue-500/10">
                O
              </span>
            )}
            {hasM && (
              <span className="text-xs font-bold px-1.5 py-0.5 rounded border border-purple-500/50 text-purple-400 bg-purple-500/10">
                M
              </span>
            )}
            <span className="text-[#555] text-xs ml-1">{open ? "▲" : "▼"}</span>
          </div>
        </div>

        {/* Line 2: defect title (prominent) */}
        <p
          className="text-sm font-semibold leading-snug mb-1.5"
          style={{ color: "#d0d0d0" }}
          dangerouslySetInnerHTML={{ __html: hl(item.title, query) }}
        />

        {/* Line 3: category + ATA */}
        <div className="flex items-center gap-2 flex-wrap">
          {cat && (
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{
                color: cat.color,
                background: `${cat.color}18`,
                border: `1px solid ${cat.color}44`,
              }}
            >
              {cat.label} · {cat.days}
            </span>
          )}
          <span className="text-xs" style={{ color: "#555" }}>
            ATA {item.ata} · {item.ata_title}
          </span>
        </div>

        {/* Line 4: condition preview (collapsed) */}
        {item.condition && !open && (
          <p
            className="text-xs mt-1.5 leading-relaxed line-clamp-2"
            style={{ color: "#707070" }}
            dangerouslySetInnerHTML={{ __html: hl(item.condition, query) }}
          />
        )}
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t px-4 pb-4 pt-3" style={{ borderColor: "#333" }}>

          {/* Installed / Required / Category table */}
          {(item.installed || item.required || item.category) && (
            <div
              className="grid grid-cols-3 gap-1 mb-3 rounded-xl overflow-hidden text-center"
              style={{ border: "1px solid #333" }}
            >
              {[
                { label: "Installé", value: item.installed || "—" },
                { label: "Requis", value: item.required || "—" },
                {
                  label: "Catégorie",
                  value: item.category || "—",
                  color: cat?.color,
                },
              ].map(({ label, value, color }) => (
                <div key={label} className="py-2 px-1" style={{ background: "#1e1e1e" }}>
                  <p className="text-xs mb-0.5" style={{ color: "#666" }}>
                    {label}
                  </p>
                  <p
                    className="text-base font-black font-mono"
                    style={{ color: color || "#c0c0c0" }}
                  >
                    {value}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* Condition */}
          {item.condition && (
            <div className="mb-3 p-3 rounded-xl" style={{ background: "#1e1e1e", border: "1px solid #2e2e2e" }}>
              <p className="text-xs font-bold uppercase tracking-widest mb-1.5" style={{ color: "#666" }}>
                ⚠ Défaut / Condition de dispatch
              </p>
              <p
                className="text-sm leading-relaxed"
                style={{ color: "#c8c8c8" }}
                dangerouslySetInnerHTML={{ __html: hl(item.condition, query) }}
              />
            </div>
          )}

          {/* O / M buttons */}
          {(hasO || hasM) && (
            <div className="flex gap-2 mb-3">
              {hasO && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === "O" ? null : "O"); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                  style={
                    activeTab === "O"
                      ? { background: "rgba(59,130,246,0.18)", border: "1px solid rgba(59,130,246,0.6)", color: "#93c5fd", boxShadow: "0 0 14px rgba(59,130,246,0.25)" }
                      : { background: "#1e1e1e", border: "1px solid #3a3a3a", color: "#555" }
                  }
                >
                  O — Opérations
                </button>
              )}
              {hasM && (
                <button
                  onClick={(e) => { e.stopPropagation(); setActiveTab(activeTab === "M" ? null : "M"); }}
                  className="flex-1 py-3 rounded-xl font-bold text-sm transition-all"
                  style={
                    activeTab === "M"
                      ? { background: "rgba(168,85,247,0.18)", border: "1px solid rgba(168,85,247,0.6)", color: "#d8b4fe", boxShadow: "0 0 14px rgba(168,85,247,0.25)" }
                      : { background: "#1e1e1e", border: "1px solid #3a3a3a", color: "#555" }
                  }
                >
                  M — Maintenance
                </button>
              )}
            </div>
          )}

          {/* Procedure text */}
          {activeTab === "O" && item.operations && (
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-3 rounded-xl overflow-x-auto"
              style={{ background: "#111", color: "#93c5fd", border: "1px solid #1e3a5f" }}
              dangerouslySetInnerHTML={{ __html: hl(item.operations, query) }}
            />
          )}
          {activeTab === "M" && item.maintenance && (
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-3 rounded-xl overflow-x-auto"
              style={{ background: "#111", color: "#d8b4fe", border: "1px solid #3b1f5e" }}
              dangerouslySetInnerHTML={{ __html: hl(item.maintenance, query) }}
            />
          )}

          {/* Notes */}
          {item.notes.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {item.notes.map((note, i) => (
                <div key={i} className="flex gap-2 text-xs" style={{ color: "#888" }}>
                  <span style={{ color: "#ffd700", flexShrink: 0 }}>▸</span>
                  <span>{note}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
