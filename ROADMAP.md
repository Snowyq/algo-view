# Roadmap

Features worth adding to the playground (`/play`), ranked by how much
they help someone understand the algorithms versus the effort. Effort is
a rough guess: S (a day or less), M (a few days), L (a week or more).

## Done

- **Step captions.** A line under each panel says what the step does, in every category, with the real values ("Compare 23 and 9: yes."). Polite to screen readers while paused.
- **Results summary.** After a run with two or more panels: a ranking by steps and counters, plus one takeaway sentence.
- **Your own data.** "Edit data" (E) opens an editor over the stage: draw on Path, Fill and Life, click points for Hull, type values, text, keys, words or edges for the rest. Maze has nothing to edit: it is the output.
- **Breakpoints.** Click a line number in focus mode; playback stops exactly on every step that runs that line.
- **Measured growth.** A Growth tab in focus mode runs the algorithm on growing inputs in a worker and fits the exponent ("≈ n^1.19: n log n").

## Comparing and presenting

- **"Finish together" mode.** Play by percentage of progress instead of by global step, so you compare how each algorithm proceeds rather than how long it takes. (S)
- **Record a panel as GIF or MP4.** Canvas capture plus `MediaRecorder`, for sharing. (M)
- **Embed and presentation mode.** `/play?embed=1` without the chrome, for blogs and slides; a full-screen focus view with large type. (M)
- **A/B input.** Pin one data set as A, generate B, and switch between them with the same algorithms open. (S)

## Comfort

- **Continue where you left off.** Remember the last category, algorithms and speed, and offer a "Continue" card in the category overview. (S)
- **Filters in the category overview.** By property: stable, optimal, linear, just for fun. (S)
- **Phone gestures.** Swipe on the progress bar to scrub; swipe in focus mode to move between algorithms. (M)

## More content

- **New algorithms.**
    - Sort: Timsort, Introsort, Counting, Bitonic
    - Graphs: Floyd–Warshall, Tarjan SCC
    - Strings: Aho–Corasick
    - Trees: B-tree, trie
    - Geometry: Delaunay triangulation, closest pair
- **New categories.** Hashing (chaining vs open addressing), Huffman compression, sorting networks. (L each)

## Engineering, before going public

- **Tests in the repo.** The correctness checks for every category (sorted output, shortest distances, MST weight, hull convexity, tree invariants, fill regions) currently live outside the repo. Move them to Vitest and run them in CI. (M)
- **Production build and measurements.** `pnpm build` has not been run since the redesign, and the performance numbers so far are from dev mode. (S)
- **OffscreenCanvas fallback.** Older Safari has no OffscreenCanvas in workers; draw on the main thread there. (M)
