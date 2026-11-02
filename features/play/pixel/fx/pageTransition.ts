import { markIntroSeen } from "../intro/introSeen";
import { prefersReducedMotion } from "./dom";
import { pixelWipe } from "./pixelWipe";

/*
 * Landing <-> playground transition. The cover is a fixed element on <body>,
 * so it survives the client-side navigation and the new page clears it.
 */

const ID = "page-transition";
const WIPE = {
    color: "--bg",
    block: 24,
    duration: 300,
    frames: 5,
    pattern: "bayer",
} as const;
/** If the new page never calls arrive(), don't leave the screen covered. */
const SAFETY_MS = 4000;

export function leaveTo(href: string, navigate: (href: string) => void): void {
    if (prefersReducedMotion() || document.getElementById(ID)) {
        navigate(href);
        return;
    }
    // the playground intro right after this would be a second effect
    if (href.startsWith("/play")) markIntroSeen();
    const cover = document.createElement("div");
    cover.id = ID;
    Object.assign(cover.style, {
        position: "fixed",
        inset: "0",
        zIndex: "10000",
    });
    document.body.appendChild(cover);
    pixelWipe(cover, { ...WIPE, mode: "cover", keep: true }).done.then(() => {
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
    pixelWipe(cover, { ...WIPE, mode: "reveal" }).done.then(() =>
        cover.remove()
    );
}
