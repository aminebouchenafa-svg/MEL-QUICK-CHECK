export interface MelItem {
  number: string;
  ata: string;
  ata_title: string;
  title: string;
  category: string;
  installed: string;
  required: string;
  procedures: string[];
  condition: string;
  operations: string;
  maintenance: string;
  notes: string[];
}

export interface MelData {
  aircraft: string;
  operator: string;
  revision: string;
  revision_date: string;
  ata_chapters: Record<string, string>;
  items: MelItem[];
}
