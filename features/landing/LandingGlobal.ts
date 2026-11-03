import { createGlobalStyle } from "styled-components";

/* The global styles pin <body> for /play; the landing scrolls the document,
   so it releases that while mounted. Dither keyframes come from PlayTheme. */
const LandingGlobal = createGlobalStyle`
html {
  height: auto;
  scroll-behavior: auto;
}

body {
  position: static;
  min-height: 100%;
  overflow-x: hidden;
  font-family: var(--f-body);
  font-size: 1.6rem;
  line-height: 1.5;
}

html.lenis, html.lenis body {
  height: auto;
}

.lenis.lenis-smooth {
  scroll-behavior: auto !important;
}

.lenis.lenis-stopped {
  overflow: hidden;
}

/* Without JS everything is visible and static. */
html:not(.js) [data-preloader] {
  display: none;
}
`;

export default LandingGlobal;
