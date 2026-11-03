/**
 * One shared image cache for the whole site.
 *
 * The loader fills it before the curtain lifts and keeps the elements alive,
 * so the decoded bitmaps stay in the browser's image cache. Every <img> later
 * in the app uses one of these URLs and therefore never has to fetch or
 * decode again while the user is scrolling.
 */
const pool = new Map<string, HTMLImageElement>();

export function wait(ms: number) {
  return new Promise<void>((resolve) => window.setTimeout(resolve, ms));
}

/**
 * Fetch an image (and optionally force its decode) with a hard deadline so a
 * stalled asset can never trap the visitor behind the loading screen.
 */
export async function preloadImage(src: string, decode = false): Promise<void> {
  let img = pool.get(src);
  if (!img) {
    img = new Image();
    pool.set(src, img);
    img.src = src;
  }

  const work = (async () => {
    if (!img!.complete) {
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        img!.addEventListener("load", done, { once: true });
        img!.addEventListener("error", done, { once: true });
      });
    }
    if (decode && typeof img!.decode === "function") {
      try {
        await img!.decode();
      } catch {
        /* broken/partially-loaded frame — the fallback image covers it */
      }
    }
  })();

  await Promise.race([work, wait(9000)]);
}

export function isWarm(src: string) {
  return pool.has(src);
}

/** Run tasks with a small, fixed concurrency — weak CPUs choke on 40 at once. */
export async function mapLimit<T>(
  items: readonly T[],
  limit: number,
  task: (item: T) => Promise<void>,
): Promise<void> {
  let cursor = 0;
  const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
    while (cursor < items.length) {
      const index = cursor++;
      await task(items[index]);
    }
  });
  await Promise.all(workers);
}
