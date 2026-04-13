# Sort Algorithm Visualizer

Interactive sorting visualizer focused on performance and clarity. Rendering
runs in Canvas + Web Workers while React handles UI and controls.

## Live Demo

TODO: add link

## Features

- Multiple algorithm panels with shared playback controls
- Smooth timeline playback with step-by-step control
- Speed selector and metrics view
- Responsive layout for desktop and mobile

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Redux Toolkit
- styled-components
- Web Workers + OffscreenCanvas

## Setup

Install and run:

```
pnpm install
pnpm run dev
```

## Notes

- Animation work is offloaded to workers to keep the main thread responsive.
- Timeline and transport controls are centralized for consistent UX.

## License

MIT
