import { createGlobalStyle } from "styled-components";
import { ditherKeyframes } from "./dither";

/* Pixel theme for the landing and /play. `:root:root` outranks GlobalStyles. */
const PlayTheme = createGlobalStyle`
${ditherKeyframes}

:root:root {
  color-scheme: dark;

  --b: 2px;                 /* pixel border width */

  --bg: #15120f;
  --bg-2: #1b1713;
  --surface: #221d18;
  --surface-2: #2b251f;
  --surface-3: #352e26;
  --line: #3e362d;
  --line-2: #5a4f42;

  --fg: #f4ede0;            /* 16.5:1 on --bg */
  --fg-2: #d4cab9;          /* 12.2:1 */
  --fg-3: #a99d8a;          /*  7.0:1 */
  --fg-4: #8a7f6e;          /*  4.7:1 on --surface */

  --accent: #e8825c;
  --accent-2: #f3a37f;
  --accent-ink: #1d110b;
  --danger: #ff7a68;

  /* Step palette, read by the canvas workers. */
  --color-step-default: #7a6c5a;
  --color-step-label: #a99d8a;
  --color-step-swap: #7fb0ff;
  --color-step-select: #ee8fd0;
  --color-step-check: #f5cd4e;
  --color-step-check-true: #8fdc8a;
  --color-step-check-false: #ff7a68;
  --color-step-check-value: #f5cd4e;
  --color-step-check-value-true: #8fdc8a;
  --color-step-check-value-false: #ff7a68;
  --color-step-assign: #f4ede0;
  --color-step-copy: #cbbfa9;
  --color-step-copy-to: #95886f;
  --color-step-finish: #5fd6c6;

  /* Path finding: legend colors plus grid materials. */
  --color-step-frontier: var(--color-step-check);
  --color-step-visit: var(--color-step-swap);
  --color-step-current: var(--color-step-select);
  --color-step-path: var(--color-step-finish);
  --color-path-empty: #2b251f;
  --color-path-wall: #6b5f50;
  --color-path-mud: #4f3524;
  --color-path-mud-dot: #8a5a3a;
  --color-path-start: #e8825c;
  --color-path-end: #f4ede0;

  /* Searching */
  --color-find-target: #e8825c;
  --color-step-probe: var(--color-step-check);
  --color-step-narrow: var(--color-step-select);
  --color-step-found: var(--color-step-finish);
  --color-step-miss: var(--color-step-check-false);

  /* Names the GlobalStyles rules still read. */
  --swap: var(--color-step-swap);
  --finish: var(--color-step-finish);
  --text: var(--fg);
  --text-soft: var(--fg-2);
  --text-muted: var(--fg-3);
  --text-faint: var(--fg-4);

  /* Faces are loaded in the root layout. */
  --f-display: var(--font-jersey), var(--font-silk), monospace;
  --f-label: var(--font-silk), monospace;
  --f-body: var(--font-pixelify), system-ui, sans-serif;
  --f-mono: var(--font-mono), ui-monospace, monospace;

  --toolbar-h: 5.6rem;
  --library-w: 23.2rem;
  --inspector-w: 38.4rem;
}

html {
  background-color: var(--bg);
}

body {
  color: var(--fg-2);
  background-color: var(--bg);
  caret-color: var(--accent);
}

::selection {
  background-color: var(--accent);
  color: var(--accent-ink);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--line-2) transparent;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--line-2);
  border: 3px solid var(--bg);
  border-radius: 0;
}

h1, h2, h3, h4 {
  color: var(--fg);
  font-weight: 400;
}

canvas, svg[data-pixel] {
  image-rendering: pixelated;
  shape-rendering: crispEdges;
}

/* Square pixel focus ring. */
:focus-visible {
  outline: var(--b) solid var(--accent);
  outline-offset: 2px;
  border-radius: 0;
}

@keyframes px-blink {
  50% { opacity: 0; }
}

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}

/* Short windows (landscape phones): thinner toolbar. */
@media (max-height: 520px) {
  :root:root {
    --toolbar-h: 4.4rem;
  }
}
`;

export default PlayTheme;
