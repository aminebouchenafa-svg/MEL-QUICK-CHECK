import melDataRaw from "../../public/mel_data.json";
import type { MelData, MelItem } from "@/types/mel";

export const melData = melDataRaw as MelData;

export const CATEGORY_INFO: Record<string, { label: string; days: string; color: string }> = {
  A: { label: "CAT A", days: "Immédiat", color: "#ff4444" },
  B: { label: "CAT B", days: "3 jours", color: "#ff8c00" },
  C: { label: "CAT C", days: "10 jours", color: "#ffd700" },
  D: { label: "CAT D", days: "120 jours", color: "#44dd88" },
};

// Unique neon color per ATA chapter
export const ATA_NEON: Record<string, string> = {
  "21": "#00f5ff",
  "22": "#3d9eff",
  "23": "#ffdd00",
  "24": "#ff8c00",
  "25": "#ff69b4",
  "26": "#ff3333",
  "27": "#39ff14",
  "28": "#ffa040",
  "29": "#00bfff",
  "30": "#00ffcc",
  "31": "#bf7fff",
  "32": "#da70d6",
  "33": "#c8ff00",
  "34": "#9370db",
  "35": "#ff6b6b",
  "36": "#00e676",
  "38": "#80deea",
  "46": "#40e0d0",
  "47": "#fff176",
  "49": "#69f0ae",
  "52": "#ef9a9a",
  "73": "#ff6e40",
  "74": "#ff1744",
  "75": "#e040fb",
  "77": "#00e5ff",
  "78": "#76ff03",
  "79": "#ffab40",
  "80": "#40c4ff",
};

export function getItemsByAta(chapter: string): MelItem[] {
  return melData.items.filter((item) => item.ata === chapter);
}

export function searchItems(items: MelItem[], query: string): MelItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return items;
  return items.filter(
    (item) =>
      item.number.toLowerCase().includes(q) ||
      item.title.toLowerCase().includes(q) ||
      item.condition.toLowerCase().includes(q) ||
      item.operations.toLowerCase().includes(q) ||
      item.maintenance.toLowerCase().includes(q)
  );
}
