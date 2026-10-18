import { createGlobalStyle } from "styled-components";

/*
 * Design system: "Phosphor Trace"
 * The accent palette IS the sorting legend: every highlight on the page
 * uses the same color a step type gets on the canvas.
 */
const GlobalStyles = createGlobalStyle`
:root {
  color-scheme: dark;

  /* ---------- Core surfaces ---------- */
  --ink-950: #0a0c12;   /* app background */
  --ink-900: #10131b;   /* panels, canvas wells */
  --ink-850: #151924;   /* raised surfaces */
  --ink-800: #1b2030;   /* controls, hover surfaces */
  --ink-700: #262c3e;   /* hairlines */
  --ink-600: #353d54;   /* strong lines, idle data */

  --text: #e8ebf4;          /* 16.4:1 on ink-950 */
  --text-soft: #c2c8d8;     /* 11.6:1 */
  --text-muted: #949db4;    /* 7.0:1 */
  --text-faint: #7a839a;    /* 4.6:1 on ink-850, not for ink-800 */

  /* ---------- Signal colors (= step legend) ---------- */
  --swap: #6ea8fe;
  --swap-strong: #93bfff;
  --select: #f27fb8;
  --check: #f5c84c;
  --check-true: #5fe39a;
  --check-false: #ff7d7d;
  --finish: #3dd9d6;
  --danger: #ff8f8f;

  --swap-rgb: 110, 168, 254;
  --finish-rgb: 61, 217, 214;
  --ink-950-rgb: 10, 12, 18;

  /* ---------- Type ---------- */
  --font-display-stack: var(--font-display), "Arial Narrow", sans-serif;
  --font-body-stack: var(--font-sans), system-ui, sans-serif;
  --font-mono-stack: var(--font-mono), ui-monospace, monospace;

  --text-xs: 1.2rem;
  --text-sm: 1.4rem;
  --text-base: 1.6rem;
  --text-md: 1.8rem;
  --text-lg: 2.4rem;
  --text-xl: clamp(2.8rem, 2.2rem + 1.6vw, 4rem);
  --text-display: clamp(5.6rem, 2.4rem + 8vw, 12rem); /* condensed face reads ~20% smaller */

  --leading-tight: 0.92;
  --leading-snug: 1.2;
  --leading-body: 1.65;

  /* ---------- Space (4px base) ---------- */
  --space-1: 0.4rem;
  --space-2: 0.8rem;
  --space-3: 1.2rem;
  --space-4: 1.6rem;
  --space-5: 2.4rem;
  --space-6: 3.2rem;
  --space-7: 4.8rem;
  --space-8: 6.4rem;
  --space-9: 9.6rem;
  --space-10: 14.4rem;
  --gutter: clamp(1.6rem, 1rem + 2.4vw, 4.8rem);
  --content-max: 128rem;

  /* ---------- Radius ---------- */
  --radius-xs: 4px;
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 14px;
  --radius-pill: 999px;

  /* ---------- Elevation (offset + blur, never halos) ---------- */
  --shadow-1: 0 1px 2px rgba(0, 0, 0, 0.4);
  --shadow-2: 0 0.8rem 2.4rem -0.8rem rgba(0, 0, 0, 0.6);
  --shadow-3: 0 2.4rem 6.4rem -1.6rem rgba(0, 0, 0, 0.75);

  /* ---------- Motion ---------- */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out: cubic-bezier(0.65, 0, 0.35, 1);
  --dur-fast: 140ms;
  --dur-base: 240ms;
  --dur-slow: 520ms;

  --nav-height: 6rem;
  /* Sidebar toggle tab; the panel grid reserves this much on its right. */
  --sidebar-tab-width: 4rem;

  /* ---------- Legacy scale, remapped to the dark system ---------- */
  --color-grey-0: var(--ink-950);
  --color-grey-50: var(--ink-900);
  --color-grey-100: var(--ink-850);
  --color-grey-200: var(--ink-800);
  --color-grey-300: var(--ink-700);
  --color-grey-400: var(--ink-600);
  --color-grey-500: var(--text-faint);
  --color-grey-600: var(--text-muted);
  --color-grey-700: var(--text-soft);
  --color-grey-800: var(--text);
  --color-grey-900: var(--text);
  --color-grey-950: #ffffff;
  --color-grey-300-rgb: 38, 44, 62;

  --color-brand-50: var(--ink-950);
  --color-brand-600: var(--swap);
  --color-brand-700: var(--swap-strong);

  --color-red-100: rgba(255, 125, 125, 0.12);
  --color-red-200: rgba(255, 125, 125, 0.2);
  --color-red-400: rgba(255, 125, 125, 0.24);
  --color-red-500: var(--check-false);
  --color-red-600: var(--danger);
  --color-red-700: #e05a5a;
  --color-red-800: #c94848;

  --shadow-sm: var(--shadow-1);
  --shadow-md: var(--shadow-2);
  --shadow-lg: var(--shadow-3);
  --border-radius-sm: var(--radius-sm);

  /* ---------- Canvas step colors (read by useSortCanvas) ---------- */
  --color-step-default: #606b8a;       /* 3.5:1 on canvas well */
  --color-step-label: var(--text-muted);
  --color-step-swap: var(--swap);
  --color-step-select: var(--select);
  --color-step-check: var(--check);
  --color-step-check-true: var(--check-true);
  --color-step-check-false: var(--check-false);
  --color-step-check-value: var(--check);
  --color-step-check-value-true: var(--check-true);
  --color-step-check-value-false: var(--check-false);
  --color-step-assign: #f4f6fb;
  --color-step-copy: #b9c1d6;
  --color-step-copy-to: #7d89a8;
  --color-step-finish: var(--finish);
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;
}

html {
  font-size: 62.5%;
  background-color: var(--ink-950);
}

body {
  position: fixed;
  font-family: var(--font-body-stack);
  font-size: var(--text-base);
  line-height: 1.5;
  color: var(--text-soft);
  background-color: var(--ink-950);
  min-height: 100vh;
  font-feature-settings: "ss01";
  caret-color: var(--swap);
}

::selection {
  background-color: rgba(var(--finish-rgb), 0.28);
  color: var(--text);
}

* {
  scrollbar-width: thin;
  scrollbar-color: var(--ink-600) transparent;
}

*::-webkit-scrollbar {
  width: 10px;
  height: 10px;
}

*::-webkit-scrollbar-thumb {
  background-color: var(--ink-600);
  border: 3px solid var(--ink-950);
  border-radius: var(--radius-pill);
}

*::-webkit-scrollbar-track {
  background: transparent;
}

h1,
h2,
h3,
h4 {
  color: var(--text);
  font-weight: 600;
  line-height: var(--leading-snug);
  text-wrap: balance;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button,
a,
label {
  touch-action: manipulation;
}

button {
  cursor: pointer;
}

main:focus {
  outline: none;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--ink-850);
  color: var(--text-faint);
}

:focus {
  outline: none;
}

:focus-visible {
  outline: 2px solid var(--finish);
  outline-offset: 3px;
  border-radius: var(--radius-xs);
}

input:focus-visible,
select:focus-visible,
textarea:focus-visible {
  outline-offset: 1px;
}

button:has(svg) {
  line-height: 0;
}

a {
  color: inherit;
  text-decoration: none;
}

ul {
  list-style: none;
}

p,
h1,
h2,
h3,
h4,
h5,
h6 {
  overflow-wrap: break-word;
  hyphens: manual;
}

p {
  text-wrap: pretty;
}

img {
  max-width: 100%;
}

option {
  background-color: var(--ink-850);
  color: var(--text);
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    scroll-behavior: auto !important;
  }
}
`;

export default GlobalStyles;
