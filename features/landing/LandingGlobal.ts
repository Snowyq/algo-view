import { createGlobalStyle } from "styled-components";

/*
 * The landing page scrolls the document itself (native scrollbar, find in
 * page, Lenis in native mode). The app shell pins <body> for /play, so
 * this route releases it while mounted.
 */
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
