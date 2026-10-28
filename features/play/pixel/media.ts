/*
 * Media queries shared by the /play chrome. "Compact" means a phone in
 * either orientation: narrow, or short (landscape), where the dock and
 * bars have to give the canvas every pixel they can.
 */
export const NARROW = "(max-width: 640px)";
export const TINY = "(max-width: 420px)";
export const SHORT = "(max-height: 520px)";
export const COMPACT = `${NARROW}, ${SHORT}`;
