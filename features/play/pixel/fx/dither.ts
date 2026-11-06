/* Replays px-dither-in on a mounted element (needs one cleared style flush). */
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
