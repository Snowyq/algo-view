import { pixelWipe } from "./pixelWipe";

/*
 * Page transitions between the landing page and the playground: the page
 * being left fills with a large pixel dither, the route changes under the
 * cover, and the arriving page clears it the same way. The cover is a
 * fixed element on <body>, so it survives the client-side navigation.
 */

const ID = "page-transition";
const BLOCK = 24;
const DURATION = 300;
/** If the new page never calls arrive(), don't leave the screen covered. */
const SAFETY_MS = 4000;

const reducedMotion = (): boolean =>
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function leaveTo(href: string, navigate: (href: string) => void): void {
    if (reducedMotion() || document.getElementById(ID)) {
        navigate(href);
        return;
    }
    // The playground's own intro would be a second effect right after
    // this one: arriving through the transition skips it.
    if (href.startsWith("/play")) {
        try {
            sessionStorage.setItem("algo-view:intro-seen", "1");
        } catch {
            // Storage blocked: the intro just plays.
        }
    }
    const cover = document.createElement("div");
    cover.id = ID;
    Object.assign(cover.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
    });
    document.body.appendChild(cover);
    pixelWipe(cover, {
        mode: "cover",
        color: "--bg",
        block: BLOCK,
        duration: DURATION,
        frames: 5,
        keep: true,
        pattern: "bayer",
    }).done.then(() => {
        navigate(href);
        window.setTimeout(() => cover.remove(), SAFETY_MS);
    });
}

/** Call once the new page has mounted: clears the cover, if any. */
export function arrive(): void {
    const cover = document.getElementById(ID);
    if (!cover) return;
    cover.replaceChildren();
    cover.style.pointerEvents = "none";
    pixelWipe(cover, {
        mode: "reveal",
        color: "--bg",
        block: BLOCK,
        duration: DURATION,
        frames: 5,
        pattern: "bayer",
    }).done.then(() => cover.remove());
}
