"use client";

import { useState } from "react";
import { CATEGORY_INFO } from "@/lib/data";

const CATEGORIES = [
  {
    cat: "A",
    label: "CAT A",
    color: "#ff4444",
    days: "Pas de délai standard",
    desc: "Réparation immédiate ou selon les conditions spécifiées dans l'item. Le délai peut être précisé dans le MEL lui-même.",
  },
  {
    cat: "B",
    label: "CAT B",
    color: "#ff8c00",
    days: "3 jours calendaires",
    desc: "L'item doit être réparé dans les 3 jours calendaires suivant le jour de découverte (J+3).",
  },
  {
    cat: "C",
    label: "CAT C",
    color: "#ffd700",
    days: "10 jours calendaires",
    desc: "L'item doit être réparé dans les 10 jours calendaires suivant le jour de découverte (J+10).",
  },
  {
    cat: "D",
    label: "CAT D",
    color: "#44dd88",
    days: "120 jours calendaires",
    desc: "L'item doit être réparé dans les 120 jours calendaires suivant le jour de découverte (J+120).",
  },
];

export default function HelpModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Help button */}
      <button
        onClick={() => setOpen(true)}
        className="flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm transition-all"
        style={{
          background: "#2a2a2a",
          border: "1px solid #444",
          color: "#aaa",
        }}
        title="Guide d'utilisation"
      >
        ?
      </button>

      {/* Modal overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={(e) => e.target === e.currentTarget && setOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl overflow-y-auto max-h-[90vh]"
            style={{ background: "#1e1e1e", border: "1px solid #333" }}
          >
            {/* Modal header */}
            <div
              className="flex items-center justify-between p-4 sticky top-0"
              style={{ background: "#1e1e1e", borderBottom: "1px solid #2e2e2e" }}
            >
              <h2 className="font-bold text-base" style={{ color: "#f0f0f0" }}>
                Guide MEL
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-2xl leading-none"
                style={{ color: "#666" }}
              >
                ×
              </button>
            </div>

            <div className="p-4 space-y-5">
              {/* How to use */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#888" }}
                >
                  Comment utiliser l&apos;app
                </h3>
                <div className="space-y-2">
                  {[
                    ["1", "Identifiez le numéro MEL dans le Tech Log de l'avion (ex: 21-01, 34-23-01)"],
                    ["2", "Entrez ce numéro dans la barre de recherche — l'item s'ouvre automatiquement"],
                    ["3", "Vérifiez la catégorie (A/B/C/D) et les conditions de dispatch"],
                    ["4", "Appliquez la procédure O (équipage) et/ou M (maintenance) selon l'item"],
                  ].map(([n, text]) => (
                    <div key={n} className="flex gap-3">
                      <span
                        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                        style={{ background: "#2e2e2e", color: "#aaa" }}
                      >
                        {n}
                      </span>
                      <p className="text-sm leading-relaxed" style={{ color: "#c0c0c0" }}>
                        {text}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Categories */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#888" }}
                >
                  Catégories — Délais de rectification
                </h3>
                <div className="space-y-2">
                  {CATEGORIES.map(({ cat, label, color, days, desc }) => (
                    <div
                      key={cat}
                      className="rounded-xl p-3"
                      style={{
                        background: `${color}0d`,
                        border: `1px solid ${color}33`,
                      }}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className="text-sm font-black"
                          style={{ color, textShadow: `0 0 8px ${color}88` }}
                        >
                          {label}
                        </span>
                        <span className="text-xs font-semibold" style={{ color }}>
                          · {days}
                        </span>
                      </div>
                      <p className="text-xs leading-relaxed" style={{ color: "#999" }}>
                        {desc}
                      </p>
                    </div>
                  ))}
                </div>
              </section>

              {/* Procedures */}
              <section>
                <h3
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#888" }}
                >
                  Procédures
                </h3>
                <div className="grid grid-cols-2 gap-2">
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(59,130,246,0.08)", border: "1px solid rgba(59,130,246,0.3)" }}
                  >
                    <p className="text-sm font-bold mb-1" style={{ color: "#93c5fd" }}>
                      O — Opérations
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#999" }}>
                      Actions effectuées par l&apos;équipage de conduite avant ou pendant le vol.
                    </p>
                  </div>
                  <div
                    className="rounded-xl p-3"
                    style={{ background: "rgba(168,85,247,0.08)", border: "1px solid rgba(168,85,247,0.3)" }}
                  >
                    <p className="text-sm font-bold mb-1" style={{ color: "#d8b4fe" }}>
                      M — Maintenance
                    </p>
                    <p className="text-xs leading-relaxed" style={{ color: "#999" }}>
                      Actions effectuées par le personnel de maintenance agréé (mécanicien).
                    </p>
                  </div>
                </div>
              </section>

              {/* Doc info */}
              <div
                className="rounded-xl p-3 text-xs text-center"
                style={{ background: "#252525", color: "#666" }}
              >
                MEL B737-600/700C/800/800BCF · Air Algérie · REV 62d · 23 SEP 2025
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
