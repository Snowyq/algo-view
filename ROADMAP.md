# Roadmap

Features worth adding to the playground (`/play`), ranked by how much
they help someone understand the algorithms versus the effort. Effort is
a rough guess: S (a day or less), M (a few days), L (a week or more).

## Next up

| #   | Feature                                                                                                                                                                                                           | Why                                                                                                                                                                                                                    | Effort |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| 1   | **Step captions.** One line under each panel says what is happening now: "comparing 23 and 9 → swap", "relaxing edge D–H: 7 < 12".                                                                                | Turns the animation into an explanation. Every step already records its type and the cells it touches, so this is mostly text templates per category. The same text can feed an `aria-live` region for screen readers. | M      |
| 2   | **Results summary at the end.** A small table ranks the algorithms by steps, compares and swaps, with a takeaway such as "Bubble needed 5× more compares than Merge".                                             | Today the end of a run only shows badges.                                                                                                                                                                              | S      |
| 3   | **Edit the input in every category.** Drag bars (Sort), type your own text and pattern (Strings), place points (Hull), paint walls and cells (Fill, Life), add and remove edges (Graphs). Path already does this. | Lets people test "what happens if I change this".                                                                                                                                                                      | L      |
| 4   | **Breakpoints in the code.** Click a line number in focus mode; playback pauses every time that line runs.                                                                                                        | Each step already knows the line that produced it (`instructionId`), so this is cheap.                                                                                                                                 | S      |
| 5   | **Measured growth curves.** In About, run the algorithm in the background for n = 8…512 and plot its counters against n as a pixel chart.                                                                         | Shows O(n²) next to O(n log n) on real numbers, not just as notation.                                                                                                                                                  | M      |

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
