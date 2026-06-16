import PyPDF2, re, json
from collections import defaultdict

ATA_CHAPTERS = {
    "21": "AIR CONDITIONING", "22": "AUTOMATIC FLIGHT CONTROL SYSTEM",
    "23": "COMMUNICATIONS", "24": "ELECTRICAL POWER",
    "25": "EQUIPMENT AND FURNISHINGS", "26": "FIRE PROTECTION",
    "27": "FLIGHT CONTROLS", "28": "FUEL", "29": "HYDRAULIC POWER",
    "30": "ICE AND RAIN PROTECTION", "31": "INSTRUMENTS",
    "32": "LANDING GEAR", "33": "LIGHTS", "34": "NAVIGATION",
    "35": "OXYGEN", "36": "PNEUMATIC SYSTEM", "38": "WATER/WASTE",
    "46": "INFORMATION SYSTEMS", "47": "INERT GAS SYSTEM",
    "49": "AIRBORNE AUXILIARY POWER", "52": "DOORS",
    "73": "ENGINE FUEL AND CONTROL", "74": "IGNITION",
    "75": "BLEED AIR", "77": "ENGINE INDICATING",
    "78": "ENGINE EXHAUST", "79": "OIL", "80": "STARTING",
}

ITEM_NUM_PAT = re.compile(
    r'^((?:2[1-9]|3\d|4\d|5\d|6\d|7\d|8\d)-\d{2,3}[A-Z]?(?:-\d{2,3}[A-Z]?(?:-\d{2,3}[A-Z]?)?)?)$'
)
CAT_PAT = re.compile(r'^([A-D])$')
NUM_PAT = re.compile(r'^(\d{1,3})$')
NOISE = re.compile(r'^(?:MEL|B737|ATA\.\d+|PAGE N|REV \d|Section \d)', re.IGNORECASE)


def extract_page_rows(reader, pg_idx, y_tol=8):
    parts = []

    def visitor(text, cm, tm, fontDict, fontSize):
        t = text.strip()
        if t:
            parts.append((round(tm[5]), round(tm[4]), t))

    reader.pages[pg_idx].extract_text(visitor_text=visitor)

    rows = []
    current_y = None
    current_row = []
    for y, x, t in sorted(parts, key=lambda p: (-p[0], p[1])):
        if current_y is None or abs(y - current_y) > y_tol:
            if current_row:
                rows.append((current_y, current_row))
            current_y = y
            current_row = [(x, t)]
        else:
            current_row.append((x, t))
    if current_row:
        rows.append((current_y, current_row))
    return rows


def depth_score(num):
    return len(re.findall(r'\d+', num)) * 10 + (1 if re.search(r'[A-Z]$', num) else 0)


class Parser:
    def __init__(self):
        self.all_items = {}
        self.current = None
        self.current_field = None
        self.pending_table = False

    def save(self):
        if not self.current:
            return
        num = self.current['number']
        score = (
            bool(self.current['condition']) * 10 +
            bool(self.current['category']) * 5 +
            bool(self.current['operations']) * 4 +
            bool(self.current['maintenance']) * 4 +
            len(self.current.get('condition', '')) // 50
        )
        if num not in self.all_items or score > self.all_items[num]['_score']:
            self.current['_score'] = score
            self.all_items[num] = dict(self.current)

    def new_item(self, number, title):
        self.save()
        ata = number.split('-')[0]
        self.current = {
            'number': number, 'ata': ata,
            'ata_title': ATA_CHAPTERS.get(ata, f'ATA {ata}'),
            'title': title[:100], 'category': '', 'installed': '', 'required': '',
            'procedures': [], 'condition': '', 'operations': '', 'maintenance': '',
            'notes': []
        }
        self.current_field = 'condition'
        self.pending_table = False

    def append_content(self, text):
        if not self.current or not self.current_field or len(text) <= 4:
            return
        sep = '\n' if self.current_field in ('operations', 'maintenance') else ' '
        limit = 2500 if self.current_field != 'condition' else 800
        self.current[self.current_field] = (
            self.current[self.current_field] + sep + text
        ).strip()[:limit]

    def process_row(self, row_y, row_items):
        if row_y > 720 or row_y < 18:
            return

        row_sorted = sorted(row_items, key=lambda r: r[0])
        combined = ' '.join(t for _, t in row_sorted)

        if NOISE.match(combined.strip()) and len(combined) < 80:
            return

        # Detect item numbers
        item_nums = [
            (x, t.strip()) for x, t in row_sorted
            if ITEM_NUM_PAT.match(t.strip())
        ]

        if item_nums:
            item_nums.sort(key=lambda it: depth_score(it[1]), reverse=True)
            dx, dnum = item_nums[0]
            ata = dnum.split('-')[0]
            if ata not in ATA_CHAPTERS:
                return

            right_texts = [
                (x, t) for x, t in row_sorted
                if x > dx - 20
                and not ITEM_NUM_PAT.match(t.strip())
                and re.match(r'[A-Z]', t.strip())
                and len(t.strip()) > 3
            ]
            title = right_texts[-1][1].strip() if right_texts else ''
            self.new_item(dnum, title)
            return

        if not self.current:
            return

        # Interval/Installed/Required header
        if 'Interval' in combined and 'Installed' in combined:
            self.pending_table = True
            return

        # Category/values row
        if self.pending_table:
            self.pending_table = False
            cats = [t.strip() for _, t in row_sorted if CAT_PAT.match(t.strip())]
            nums_found = [t.strip() for _, t in row_sorted if NUM_PAT.match(t.strip())]
            if cats:
                self.current['category'] = cats[0]
            if len(nums_found) >= 2:
                self.current['installed'] = nums_found[0]
                self.current['required'] = nums_found[1]
            elif len(nums_found) == 1:
                self.current['installed'] = nums_found[0]
            return

        if 'OPERATIONS (O)' in combined:
            self.current_field = 'operations'
            if 'O' not in self.current['procedures']:
                self.current['procedures'].append('O')
            return

        if 'MAINTENANCE (M)' in combined:
            self.current_field = 'maintenance'
            if 'M' not in self.current['procedures']:
                self.current['procedures'].append('M')
            return

        nm = re.match(r'NOTE\s*\d*:?\s*(.+)', combined, re.IGNORECASE)
        if nm and len(nm.group(1)) > 10:
            self.current['notes'].append(nm.group(1).strip()[:300])
            return

        self.append_content(combined.strip())


print("Loading and parsing PDF with coordinate-based parser...")

parser = Parser()

with open('/home/user/MEL-QUICK-CHECK/MEL B737 NG REV 62d 2.pdf', 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    num_pages = len(reader.pages)
    print(f"Pages: {num_pages}")

    for pg_idx in range(22, num_pages):
        rows = extract_page_rows(reader, pg_idx)
        for row_y, row_items in rows:
            parser.process_row(row_y, row_items)

parser.save()

items = list(parser.all_items.values())
for item in items:
    item.pop('_score', None)


def sort_key(item):
    return [int(p) for p in re.findall(r'\d+', item['number'])]


items.sort(key=sort_key)

from collections import Counter
cats = Counter(i['category'] for i in items if i['category'])
with_cond  = sum(1 for i in items if i['condition'])
with_ops   = sum(1 for i in items if i['operations'])
with_maint = sum(1 for i in items if i['maintenance'])
print(f"Unique items: {len(items)}")
print(f"With condition: {with_cond}")
print(f"With operations: {with_ops}")
print(f"With maintenance: {with_maint}")
print(f"Categories: {dict(cats)}")

for num in ['23-03', '23-03-01-02B', '23-09B', '24-01', '21-01']:
    item = parser.all_items.get(num)
    if item:
        print(f"\n--- {num} ---")
        print(f"Title: {item['title']}")
        print(f"Cat:{item['category']} Inst:{item['installed']} Req:{item['required']}")
        print(f"Cond: {item['condition'][:200]}")
        print(f"Procs: {item['procedures']}")

output = {
    'aircraft': 'B737-600/700C/800/800BCF', 'operator': 'Air Algérie',
    'revision': 'REV 62d', 'revision_date': '23 SEP 2025',
    'ata_chapters': ATA_CHAPTERS, 'items': items
}
with open('/home/user/MEL-QUICK-CHECK/mel-app/public/mel_data.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)
print(f"\nSaved {len(items)} items")
