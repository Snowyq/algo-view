import { createGlobalStyle } from "styled-components";

/* Site-wide base. Both routes also mount PlayTheme, which overrides most tokens. */
const GlobalStyles = createGlobalStyle`
:root {
  color-scheme: dark;

  --ink-950: #0a0c12;
  --ink-850: #151924;
  --ink-600: #353d54;

  --text: #e8ebf4;
  --text-soft: #c2c8d8;
  --text-muted: #949db4;
  --text-faint: #7a839a;

  /* Signal colors, same as the step legend. */
  --swap: #6ea8fe;
  --select: #f27fb8;
  --check: #f5c84c;
  --check-true: #5fe39a;
  --check-false: #ff7d7d;
  --finish: #3dd9d6;
  --danger: #ff8f8f;
  --finish-rgb: 61, 217, 214;

  --font-body-stack: var(--font-sans), system-ui, sans-serif;
  --text-base: 1.6rem;
  --leading-snug: 1.2;
  --radius-xs: 4px;
  --radius-pill: 999px;

  /* Canvas step colors, read by the canvas workers. */
  --color-step-default: #606b8a;
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
