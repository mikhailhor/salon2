import { useEffect, type RefObject } from "react";

/**
 * Native, muted looping playback for the decorative hero clip in the standard
 * (non-cinematic) page. There is deliberately no scrubbing here: seeking a
 * video on every scroll frame is what used to stall weak devices. The clip is
 * only mounted on the `full` tier; on `lite` a still image is used instead.
 */
export function useNativeVideo(
  videoRef: RefObject<HTMLVideoElement | null>,
  { active, enabled }: { active: boolean; enabled: boolean },
) {
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !enabled) return;

    video.muted = true;
    video.setAttribute("playsinline", "");
    let alive = true;
    let onScreen = true;

    const sync = () => {
      if (!alive) return;
      if (active && onScreen && !document.hidden) {
        const playing = video.play();
        if (playing && typeof playing.catch === "function") playing.catch(() => {});
      } else {
        video.pause();
      }
    };

    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(([entry]) => {
            onScreen = entry.isIntersecting;
            sync();
          })
        : null;
    io?.observe(video);
    document.addEventListener("visibilitychange", sync);
    sync();

    return () => {
      alive = false;
      io?.disconnect();
      document.removeEventListener("visibilitychange", sync);
      video.pause();
    };
  }, [active, enabled, videoRef]);
}
