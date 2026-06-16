"""
Parse MEL B737 NG PDF into structured JSON for the MEL Quick Check app.
Usage: python3 scripts/parse_mel.py
Output: mel-app/public/mel_data.json
"""
import re
import json
import sys
from pathlib import Path

try:
    import PyPDF2
except ImportError:
    print("Install PyPDF2 first: pip install pypdf2")
    sys.exit(1)

PDF_PATH = Path(__file__).parent.parent / "MEL B737 NG REV 62d 2.pdf"
OUTPUT_PATH = Path(__file__).parent.parent / "mel-app" / "public" / "mel_data.json"

ATA_CHAPTERS = {
    "21": "AIR CONDITIONING",
    "22": "AUTOMATIC FLIGHT CONTROL SYSTEM",
    "23": "COMMUNICATIONS",
    "24": "ELECTRICAL POWER",
    "25": "EQUIPMENT AND FURNISHINGS",
    "26": "FIRE PROTECTION",
    "27": "FLIGHT CONTROLS",
    "28": "FUEL",
    "29": "HYDRAULIC POWER",
    "30": "ICE AND RAIN PROTECTION",
    "31": "INSTRUMENTS",
    "32": "LANDING GEAR",
    "33": "LIGHTS",
    "34": "NAVIGATION",
    "35": "OXYGEN",
    "36": "PNEUMATIC SYSTEM",
    "38": "WATER/WASTE",
    "46": "INFORMATION SYSTEMS",
    "47": "INERT GAS SYSTEM",
    "49": "AIRBORNE AUXILIARY POWER",
    "52": "DOORS",
    "73": "ENGINE FUEL AND CONTROL",
    "74": "IGNITION",
    "75": "BLEED AIR",
    "77": "ENGINE INDICATING",
    "78": "ENGINE EXHAUST",
    "79": "OIL",
    "80": "STARTING",
}


def load_pdf(path: Path) -> list[str]:
    with open(path, "rb") as f:
        reader = PyPDF2.PdfReader(f)
        return [page.extract_text() or "" for page in reader.pages]


def clean(text: str) -> str:
    text = re.sub(r"MEL\s+B737[^\n]+MEL\s*\n", "", text)
    text = re.sub(r"ATA\.?\d+\s+PAGE N°?:\s*\d+.*\n", "", text)
    text = re.sub(
        r"ATA \d+ [A-Z/ \-&]+\s+(?:REV|JUL|SEP|NOV|MAR|JAN|FEB|APR|MAY|JUN|AUG|OCT|DEC)\s+\S+\s*\n",
        "",
        text,
    )
    text = re.sub(r"REV \d+\w*\s*\n", "", text)
    text = re.sub(r"PAGE\s+INTENTIONALL?Y\s+LEFT BLANK\s*\n?", "", text)
    text = re.sub(r"Section \d+", "", text)
    text = re.sub(r" {3,}", "  ", text)
    text = re.sub(r"\n{4,}", "\n\n\n", text)
    return text


def find_mel_section_start(pages: list[str]) -> int:
    for i, txt in enumerate(pages):
        if "ATA 21 AIR CONDITIONING" in txt and "TABLE OF CONTENTS" not in txt:
            return i
    return 20


def parse_item_text(number: str, raw_text: str) -> dict:
    item: dict = {
        "number": number,
        "ata": number.split("-")[0],
        "ata_title": ATA_CHAPTERS.get(number.split("-")[0], f"ATA {number.split('-')[0]}"),
        "title": "",
        "category": "",
        "installed": "",
        "required": "",
        "procedures": [],
        "condition": "",
        "operations": "",
        "maintenance": "",
        "notes": [],
    }

    # Category/interval table
    cat_m = re.search(r"\b([A-D])\s+(\d+)\s+(\d+|-)\s+\(([OM])\)", raw_text)
    if cat_m:
        item["category"] = cat_m.group(1)
        item["installed"] = cat_m.group(2)
        item["required"] = cat_m.group(3)
        if cat_m.group(4) not in item["procedures"]:
            item["procedures"].append(cat_m.group(4))

    if "OPERATIONS (O)" in raw_text and "O" not in item["procedures"]:
        item["procedures"].append("O")
    if "MAINTENANCE (M)" in raw_text and "M" not in item["procedures"]:
        item["procedures"].append("M")

    # Condition
    cond_m = re.search(
        r"((?:May be|One may be|Both may be|(?:\w+ )?may be)"
        r"(?: inoperative)?[^\n]+(?:\n(?!OPERATIONS|MAINTENANCE|NOTE)[^\n]*)*)",
        raw_text,
    )
    if cond_m:
        item["condition"] = cond_m.group(1).strip()[:500]

    # Operations
    ops_m = re.search(
        r"OPERATIONS \(O\)\s*(.*?)(?=MAINTENANCE \(M\)|NOTE\s*\d*:|$)",
        raw_text,
        re.DOTALL,
    )
    if ops_m:
        item["operations"] = ops_m.group(1).strip()[:2000]

    # Maintenance
    maint_m = re.search(
        r"MAINTENANCE \(M\)\s*(.*?)(?=OPERATIONS \(O\)|NOTE\s*\d*:|$)",
        raw_text,
        re.DOTALL,
    )
    if maint_m:
        item["maintenance"] = maint_m.group(1).strip()[:2000]

    # Notes
    notes = re.findall(
        r"NOTE\s*\d*:?\s*(.*?)(?=NOTE\s*\d*:|OPERATIONS|MAINTENANCE|$)",
        raw_text,
        re.DOTALL,
    )
    item["notes"] = [n.strip()[:300] for n in notes if n.strip()][:5]

    return item


def main():
    print(f"Loading {PDF_PATH.name}...")
    pages = load_pdf(PDF_PATH)
    print(f"Loaded {len(pages)} pages")

    start = find_mel_section_start(pages)
    print(f"MEL section starts at page {start + 1}")

    combined = clean("\n".join(pages[start:]))

    # Find ATA chapters
    ata_chapters: dict[str, str] = {}
    for m in re.finditer(r"\bATA (\d{2,3})\s+([A-Z][A-Z/ \-&]+)\s*\n", combined):
        ch = m.group(1)
        if ch not in ata_chapters:
            ata_chapters[ch] = m.group(2).strip()
    ata_chapters.update({k: v for k, v in ATA_CHAPTERS.items() if k not in ata_chapters})

    # Find all item positions
    ITEM_RE = re.compile(
        r"(?:^|\n)((?:2[1-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9])"
        r"-\d{2,3}(?:-\d{2,3}(?:-\d{2,3})?)?)\s+([A-Z][^\n]{2,80})",
        re.MULTILINE,
    )

    positions = []
    for m in ITEM_RE.finditer(combined):
        num = m.group(1)
        title_raw = m.group(2).strip()
        positions.append({"start": m.start(), "end": m.end(), "number": num, "title": title_raw})

    print(f"Found {len(positions)} item positions")

    items = []
    for i, pos in enumerate(positions):
        next_start = positions[i + 1]["start"] if i + 1 < len(positions) else len(combined)
        section_text = combined[pos["start"]:next_start]
        parsed = parse_item_text(pos["number"], section_text)
        parsed["title"] = pos["title"][:100]
        items.append(parsed)

    output = {
        "aircraft": "B737-600/700C/800/800BCF",
        "operator": "Air Algérie",
        "revision": "REV 62d",
        "revision_date": "23 SEP 2025",
        "ata_chapters": ata_chapters,
        "items": items,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(output, f, ensure_ascii=False, indent=2)

    print(f"Saved {len(items)} items → {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
