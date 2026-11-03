/**
 * Scroll-scrubbed "filmstrip" instead of a <video>.
 *
 * Seeking an H.264 clip on every scroll frame is the single most expensive
 * thing a weak device can be asked to do: every seek is a decode, and a finger
 * drag can queue dozens of them per second. These frames are extracted from
 * the original clip (30 frames, 720px wide) and decoded once, during the
 * loader. Scrolling afterwards only swaps two cached bitmaps — no decoder,
 * no seek, no repaint of the whole page.
 */
export const FILM_FRAME_COUNT = 30;

/** Progress of the cinematic track at which the film gives way to the stills. */
export const FILM_END_PROGRESS = 0.62;

export const FILMSTRIP: string[] = Array.from(
  { length: FILM_FRAME_COUNT },
  (_, i) => `/film/f-${String(i + 1).padStart(2, "0")}.jpg`,
);

/** Shown if a frame is missing (e.g. a partial deployment). */
export const FILM_FALLBACK = "/images/services/makeup.jpg";

export const LOGO_SRC = "/logo.webp";
