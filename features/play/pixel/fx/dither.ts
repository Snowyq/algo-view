/*
 * Re-run the CSS pixel dither (px-dither-in, see styles/dither.ts) on an
 * element that is already on screen, e.g. a panel that moved to a new
 * slot. Restarting a CSS animation needs it removed for one style flush.
 */
export function ditherIn(el: HTMLElement, duration = 220): void {
    el.style.animation = "none";
    void el.offsetWidth;
    el.style.animation = `px-dither-in ${duration}ms both`;
    el.addEventListener(
        "animationend",
        () => {
            el.style.animation = "";
        },
        { once: true }
    );
}
