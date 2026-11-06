/* Staggered px-dither-in reveals (keyframes in styles/dither.ts). */

type Options = {
    /** Seconds between elements. */
    stagger?: number;
    /** Seconds before the first. */
    delay?: number;
    /** Milliseconds per element. */
    duration?: number;
};

export function hideForReveal(elements: Iterable<Element>): void {
    for (const el of elements) (el as HTMLElement).style.visibility = "hidden";
}

export function ditherReveal(
    elements: Iterable<Element>,
    { stagger = 0.05, delay = 0, duration = 260 }: Options = {}
): void {
    let index = 0;
    for (const el of elements) {
        const host = el as HTMLElement;
        host.style.visibility = "";
        host.style.animation = `px-dither-in ${duration}ms ${delay + index * stagger}s both`;
        index += 1;
    }
}
