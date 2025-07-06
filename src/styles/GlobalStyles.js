import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
:root {

  --color-brand-0: var(--color-cyan-0);
  --color-brand-50: var(--color-cyan-50);
  --color-brand-100: var(--color-cyan-100);
  --color-brand-200: var(--color-cyan-200);
  --color-brand-300: var(--color-cyan-300);
  --color-brand-400: var(--color-cyan-400);
  --color-brand-500: var(--color-cyan-500);
  --color-brand-600: var(--color-cyan-600);
  --color-brand-700: var(--color-cyan-700);
  --color-brand-800: var(--color-cyan-800);
  --color-brand-900: var(--color-cyan-900);
  --color-brand-950: var(--color-cyan-950);

  /* Grey */
  --color-grey-0: #fff;
  --color-grey-50: #f9fafb;
  --color-grey-100: #f3f4f6;
  --color-grey-200: #e5e7eb;
  --color-grey-300: #d1d5db;
  --color-grey-400: #9ca3af;
  --color-grey-500: #6b7280;
  --color-grey-600: #4b5563;
  --color-grey-700: #374151;
  --color-grey-800: #1f2937;
  --color-grey-900: #111827;
  --color-grey-950: #030712;

  --color-cyan-0: #fff;
  --color-cyan-50: #ecfeff;
  --color-cyan-100: #cffafe;
  --color-cyan-200: #a5f3fc;
  --color-cyan-300: #67e8f9;
  --color-cyan-400: #22d3ee;
  --color-cyan-500: #06b6d4;
  --color-cyan-600: #0891b2;
  --color-cyan-700: #0e7490;
  --color-cyan-800: #155e75;
  --color-cyan-900: #164e63;
  --color-cyan-950: #083344;

 --color-yellow-0:  #fff;
--color-yellow-50: #fefce8;
--color-yellow-100:#fef9c3;
--color-yellow-200:#fef08a;
--color-yellow-300:#fde047;
--color-yellow-400:#facc15;
--color-yellow-500:#eab308;
--color-yellow-600:#ca8a04;
--color-yellow-700:#a16207;
--color-yellow-800:#854d0e;
--color-yellow-900:#713f12;
--color-yellow-950:#422006;
--color-blue-0:    #fff;
--color-blue-50:   #eff6ff;
--color-blue-100:  #dbeafe;
--color-blue-200:  #bfdbfe;
--color-blue-300:  #93c5fd;
--color-blue-400:  #60a5fa;
--color-blue-500:  #3b82f6;
--color-blue-600:  #2563eb;
--color-blue-700:  #1d4ed8;
--color-blue-800:  #1e40af;
--color-blue-900:  #1e3a8a;
--color-blue-950:  #172554;
--color-red-0:     #fff;
--color-red-50:    #fef2f2;
--color-red-100:   #fee2e2;
--color-red-200:   #fecaca;
--color-red-300:   #fca5a5;
--color-red-400:   #f87171;
--color-red-500:   #ef4444;
--color-red-600:   #dc2626;
--color-red-700:   #b91c1c;
--color-red-800:   #991b1b;
--color-red-900:   #7f1d1d;
--color-red-950:   #450a0a;
--color-green-0:    #fff;
--color-green-50:   #f0fdf4;
--color-green-100:  #dcfce7;
--color-green-200:  #bbf7d0;
--color-green-300:  #86efac;
--color-green-400:  #4ade80;
--color-green-500:  #22c55e;
--color-green-600:  #16a34a;
--color-green-700:  #15803d;
--color-green-800:  #166534;
--color-green-900:  #14532d;
--color-green-950:  #052e16;




  --color-red-100: #fee2e2;
  --color-red-700: #b91c1c;
  --color-red-800: #991b1b;

  --backdrop-color: rgba(255, 255, 255, 0.1);

  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.04);
  --shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.06);
  --shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.12);

  --border-radius-tiny: 3px;
  --border-radius-sm: 5px;
  --border-radius-md: 7px;
  --border-radius-lg: 9px;

  /* For dark mode */
  --image-grayscale: 0;
  --image-opacity: 100%;


  --nav-height: 5rem;
  
}

*,
*::before,
*::after {
  box-sizing: border-box;
  padding: 0;
  margin: 0;

  /* Creating animations for dark mode */
  /* transition: background-color 0.3s, border 0.3s; */
}

html {
  font-size: 62.5%;
}

body {
  font-family: "Open Sans", sans-serif;
  color: var(--color-grey-700);

  transition: color 0.3s, background-color 0.3s;
  min-height: 100vh;
  line-height: 1.5;
  font-size: 1.6rem;
}

input,
button,
textarea,
select {
  font: inherit;
  color: inherit;
}

button {
  cursor: pointer;
}

*:disabled {
  cursor: not-allowed;
}

select:disabled,
input:disabled {
  background-color: var(--color-grey-200);
  color: var(--color-grey-500);
}

input:focus,
button:focus,
textarea:focus,
select:focus {
  outline: 2px solid var(--color-brand-600);
  outline-offset: -1px;
}

/* Parent selector, finally 😃 */
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
  hyphens: auto;
}

img {
  max-width: 100%;

  /* For dark mode */
  filter: grayscale(var(--image-grayscale)) opacity(var(--image-opacity));
}

/*
FOR DARK MODE

--color-grey-0: #18212f;
--color-grey-50: #111827;
--color-grey-100: #1f2937;
--color-grey-200: #374151;
--color-grey-300: #4b5563;
--color-grey-400: #6b7280;
--color-grey-500: #9ca3af;
--color-grey-600: #d1d5db;
--color-grey-700: #e5e7eb;
--color-grey-800: #f3f4f6;
--color-grey-900: #f9fafb;

--color-blue-100: #075985;
--color-blue-700: #e0f2fe;
--color-green-100: #166534;
--color-green-700: #dcfce7;
--color-yellow-100: #854d0e;
--color-yellow-700: #fef9c3;
--color-silver-100: #374151;
--color-silver-700: #f3f4f6;
--color-indigo-100: #3730a3;
--color-indigo-700: #e0e7ff;

--color-red-100: #fee2e2;
--color-red-700: #b91c1c;
--color-red-800: #991b1b;

--backdrop-color: rgba(0, 0, 0, 0.3);

--shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.4);
--shadow-md: 0px 0.6rem 2.4rem rgba(0, 0, 0, 0.3);
--shadow-lg: 0 2.4rem 3.2rem rgba(0, 0, 0, 0.4);

--image-grayscale: 10%;
--image-opacity: 90%;
*/

`;

export default GlobalStyles;
