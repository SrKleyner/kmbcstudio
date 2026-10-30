import type { ImageMetadata } from 'astro';

/**
 * Local photo library. Every photo used by the demos lives in src/assets/photos
 * so Astro optimizes and serves it from our own origin (no third-party hotlinks).
 */
const files = import.meta.glob<{ default: ImageMetadata }>('../assets/photos/*.{jpg,jpeg,png,webp}', {
  eager: true,
});

const byId = new Map<string, ImageMetadata>();
for (const [path, mod] of Object.entries(files)) {
  const id = path.split('/').pop()!.replace(/\.[^.]+$/, '');
  byId.set(id, mod.default);
}

/** Returns the local image for a photo id; throws at build time if it is missing. */
export function photo(id: string): ImageMetadata {
  const meta = byId.get(id);
  if (!meta) throw new Error(`Missing local photo "${id}" in src/assets/photos`);
  return meta;
}

/** Absolute URL of a photo for og:image tags. */
export function ogImage(id: string, site: URL | undefined): string | undefined {
  return site ? new URL(photo(id).src, site).href : undefined;
}
