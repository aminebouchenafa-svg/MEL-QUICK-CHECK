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
    autoOpen ? (item.procedures.includes("O") || item.operations ? "O" : item.procedures.includes("M") || item.maintenance ? "M" : null) : null
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
      style={{ background: "#242424", borderColor: open ? "#444" : "#333" }}
      className="rounded-xl border transition-all duration-200"
    >
      {/* Header row */}
      <button
        onClick={handleToggle}
        className="w-full text-left p-4 flex items-start gap-3"
      >
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="font-mono font-bold text-sm tracking-wider text-[#d0d0d0]">
              {item.number}
            </span>
            {cat && (
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{
                  color: cat.color,
                  background: `${cat.color}18`,
                  border: `1px solid ${cat.color}55`,
                }}
              >
                {cat.label} · {cat.days}
              </span>
            )}
          </div>
          <p
            className="text-[#c8c8c8] text-sm leading-snug font-medium"
            dangerouslySetInnerHTML={{ __html: hl(item.title, query) }}
          />
          {item.condition && !open && (
            <p
              className="text-[#777] text-xs mt-1 leading-relaxed line-clamp-1"
              dangerouslySetInnerHTML={{ __html: hl(item.condition, query) }}
            />
          )}
        </div>
        {/* O/M badges */}
        <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
          {hasO && (
            <span className="text-xs font-bold px-2 py-0.5 rounded border border-blue-500/50 text-blue-400 bg-blue-500/10">
              O
            </span>
          )}
          {hasM && (
            <span className="text-xs font-bold px-2 py-0.5 rounded border border-purple-500/50 text-purple-400 bg-purple-500/10">
              M
            </span>
          )}
          <span className="text-[#555] ml-1 text-xs">{open ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* Expanded content */}
      {open && (
        <div className="border-t border-[#333] px-4 pb-4 pt-3">
          {/* Condition */}
          {item.condition && (
            <div className="mb-3 p-3 rounded-lg bg-[#1e1e1e] border border-[#333]">
              <p className="text-xs font-semibold text-[#888] uppercase tracking-widest mb-1">
                Condition de dispatch
              </p>
              <p
                className="text-[#c0c0c0] text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: hl(item.condition, query) }}
              />
            </div>
          )}

          {/* O / M Tab buttons */}
          {(hasO || hasM) && (
            <div className="flex gap-2 mb-3">
              {hasO && (
                <button
                  onClick={() => setActiveTab(activeTab === "O" ? null : "O")}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-all"
                  style={
                    activeTab === "O"
                      ? {
                          background: "rgba(59,130,246,0.2)",
                          border: "1px solid rgba(59,130,246,0.6)",
                          color: "#93c5fd",
                          boxShadow: "0 0 12px rgba(59,130,246,0.3)",
                        }
                      : {
                          background: "#1e1e1e",
                          border: "1px solid #3a3a3a",
                          color: "#606060",
                        }
                  }
                >
                  O – Opérations
                </button>
              )}
              {hasM && (
                <button
                  onClick={() => setActiveTab(activeTab === "M" ? null : "M")}
                  className="flex-1 py-2.5 rounded-lg font-bold text-sm transition-all"
                  style={
                    activeTab === "M"
                      ? {
                          background: "rgba(168,85,247,0.2)",
                          border: "1px solid rgba(168,85,247,0.6)",
                          color: "#d8b4fe",
                          boxShadow: "0 0 12px rgba(168,85,247,0.3)",
                        }
                      : {
                          background: "#1e1e1e",
                          border: "1px solid #3a3a3a",
                          color: "#606060",
                        }
                  }
                >
                  M – Maintenance
                </button>
              )}
            </div>
          )}

          {/* Procedure content */}
          {activeTab === "O" && item.operations && (
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-3 rounded-lg"
              style={{ background: "#141414", color: "#93c5fd", border: "1px solid #1e3a5f" }}
              dangerouslySetInnerHTML={{ __html: hl(item.operations, query) }}
            />
          )}
          {activeTab === "M" && item.maintenance && (
            <pre
              className="text-xs leading-relaxed whitespace-pre-wrap font-mono p-3 rounded-lg"
              style={{ background: "#141414", color: "#d8b4fe", border: "1px solid #3b1f5e" }}
              dangerouslySetInnerHTML={{ __html: hl(item.maintenance, query) }}
            />
          )}

          {/* Notes */}
          {item.notes.length > 0 && (
            <div className="mt-3 space-y-1">
              {item.notes.map((note, i) => (
                <p key={i} className="text-xs text-[#888] flex gap-2">
                  <span className="text-[#ffd700] flex-shrink-0">▸</span>
                  <span>{note}</span>
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
