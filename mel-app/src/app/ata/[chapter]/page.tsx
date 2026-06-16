import { melData, getItemsByAta } from "@/lib/data";
import AtaClient from "./AtaClient";

export function generateStaticParams() {
  return Object.keys(melData.ata_chapters).map((chapter) => ({ chapter }));
}

export default async function AtaPage({
  params,
}: {
  params: Promise<{ chapter: string }>;
}) {
  const { chapter } = await params;
  const items = getItemsByAta(chapter);
  const ataTitle = melData.ata_chapters[chapter] || `ATA ${chapter}`;

  return <AtaClient chapter={chapter} ataTitle={ataTitle} items={items} />;
}
