// Pure helpers — no DOM or localStorage access, so they are unit-testable.

export const STORAGE_KEY = 'mona-bookmarks';
export const SEPARATOR = ' :: ';
const BASE62 = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';

export interface Bookmark {
  url: string;
  slug: string;
}

/** Normalise user input to a canonical http(s) URL, or return null if invalid. */
export function normalizeUrl(input: unknown): string | null {
  if (typeof input !== 'string') return null;
  const trimmed = input.trim();
  if (!trimmed || /\s/.test(trimmed)) return null;
  const withScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const parsed = new URL(withScheme);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') return null;
    if (!parsed.hostname) return null;
    let out = parsed.href;
    if (parsed.pathname === '/' && !parsed.search && !parsed.hash) out = out.replace(/\/$/, '');
    return out;
  } catch {
    return null;
  }
}

/** Build a slug like "mona-7fk2" from a random source returning 0–1 values. */
export function generateSlug(random: () => number = Math.random, length = 4): string {
  let id = '';
  for (let i = 0; i < length; i++) {
    id += BASE62[Math.min(BASE62.length - 1, Math.floor(random() * BASE62.length))];
  }
  return `mona-${id}`;
}

export function uniqueSlug(existing: Bookmark[], random: () => number = Math.random): string {
  const taken = new Set(existing.map((b) => b.slug));
  for (let attempt = 0; attempt < 50; attempt++) {
    const slug = generateSlug(random, attempt < 25 ? 4 : 6);
    if (!taken.has(slug)) return slug;
  }
  return generateSlug(random, 12);
}

function isBookmark(value: unknown): value is Bookmark {
  if (typeof value !== 'object' || value === null) return false;
  const { url, slug } = value as Record<string, unknown>;
  return typeof url === 'string' && typeof slug === 'string' && url !== '' && /^mona-[0-9a-zA-Z]+$/.test(slug);
}

/** Parse a raw stored value defensively; never throws, drops malformed entries. */
export function parseStored(raw: unknown): Bookmark[] {
  if (typeof raw !== 'string' || !raw) return [];
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    return [];
  }
  if (!Array.isArray(data)) return [];
  const seen = new Set<string>();
  const result: Bookmark[] = [];
  for (const item of data) {
    if (!isBookmark(item) || seen.has(item.slug)) continue;
    const url = normalizeUrl(item.url);
    if (!url) continue;
    seen.add(item.slug);
    result.push({ url, slug: item.slug });
  }
  return result;
}

export function serialize(bookmarks: Bookmark[]): string {
  return JSON.stringify(bookmarks.map(({ url, slug }) => ({ url, slug })));
}

export function formatBookmark(b: Bookmark): string {
  return `${b.url}${SEPARATOR}${b.slug}`;
}
