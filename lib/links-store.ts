import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export interface ShortLink {
  code: string;
  url: string;
  label: string;
  clicks: number;
  createdAt: string;
}

const dataDir = path.join(process.cwd(), "data");
const indexPath = path.join(dataDir, "links.json");

async function readLinks() {
  await mkdir(dataDir, { recursive: true });
  try {
    const raw = await readFile(indexPath, "utf8");
    return JSON.parse(raw) as ShortLink[];
  } catch {
    await writeFile(indexPath, "[]", "utf8");
    return [];
  }
}

async function writeLinks(links: ShortLink[]) {
  await mkdir(dataDir, { recursive: true });
  await writeFile(indexPath, JSON.stringify(links, null, 2), "utf8");
}

export async function listLinks() {
  const links = await readLinks();
  return links.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export async function findLink(code: string) {
  const links = await readLinks();
  return links.find((link) => link.code === code) ?? null;
}

export async function saveLink(link: ShortLink) {
  const links = await readLinks();
  links.unshift(link);
  await writeLinks(links);
}

export async function deleteLink(code: string) {
  const links = await readLinks();
  await writeLinks(links.filter((link) => link.code !== code));
}

export async function registerClick(code: string) {
  const links = await readLinks();
  const link = links.find((item) => item.code === code);
  if (!link) return null;
  link.clicks += 1;
  await writeLinks(links);
  return link.url;
}
