/*
 * Plain data about each category that the landing page needs too: a tiny
 * 11×6 pixel motif of what its canvas draws, the algorithms a first visit
 * starts with, and a one-line blurb. No components here, so importing it
 * does not pull the visualizers into the landing bundle.
 *
 * Motif keys: # block, a accent, b swap, t teal, y yellow, p pink,
 * w white, . empty.
 */

export type CategoryPreview = {
    motif: string[];
    starter: string[];
    blurb: string;
};

export const MOTIF_COLORS: Record<string, string> = {
    "#": "var(--color-step-default)",
    a: "var(--color-path-start)",
    b: "var(--color-step-swap)",
    t: "var(--color-step-finish)",
    y: "var(--color-step-check)",
    p: "var(--color-step-select)",
    w: "var(--color-path-end)",
};

export const CATEGORY_PREVIEW = {
    sort: {
        motif: [
            "....#......",
            "....#...#..",
            ".#..#...#..",
            ".#..#.b.#.#",
            ".#.b#.b.#.#",
            "##.b#.b##.#",
        ],
        starter: ["bubbleSort", "quickSort", "mergeSort"],
        blurb: "Bars that swap until they line up.",
    },
    path: {
        motif: [
            "....#......",
            "a...#..ttt.",
            "t...#..t.t.",
            "tttttttt.t.",
            "......#..w.",
            "......#....",
        ],
        starter: ["bfs", "dijkstra", "astar"],
        blurb: "Routes found through walls and mud.",
    },
    maze: {
        motif: [
            "###########",
            "#t..#.....#",
            "#t#.#.###.#",
            "#t#...#.#.#",
            "#ttt###.#a#",
            "###########",
        ],
        starter: ["backtracker", "prim", "wilson"],
        blurb: "Solid rock carved into corridors.",
    },
    dp: {
        motif: [
            "##.##.##.##",
            "##.##.##.##",
            "...........",
            "##.yy.##.##",
            "##.yy.pp...",
            "...........",
        ],
        starter: ["editDistance", "lcs", "knapsack"],
        blurb: "Tables filled cell by cell, then traced back.",
    },
    life: {
        motif: [
            ".#......##.",
            "..#....#..#",
            "###.....##.",
            "...........",
            "...yyy.....",
            "...........",
        ],
        starter: ["conwayLife", "highLife", "dayAndNight"],
        blurb: "Simple rules that grow, blink and glide.",
    },
    fill: {
        motif: [
            "###########",
            "#tttt#....#",
            "#tttt#....#",
            "#tttyy.##.#",
            "#tt.#..#..#",
            "###########",
        ],
        starter: ["queueFill", "stackFill", "scanlineFill"],
        blurb: "Paint poured into a bitmap.",
    },
    geometry: {
        motif: [
            "..tttttt...",
            ".t.......t.",
            "t..#..#...t",
            "t....#..#.t",
            ".t..#....t.",
            "..ttttttt..",
        ],
        starter: ["grahamScan", "jarvisMarch", "quickhull"],
        blurb: "A rubber band snapped around points.",
    },
    tree: {
        motif: [
            ".....a.....",
            "....#.#....",
            "...#...#...",
            "..t.....t..",
            ".#.#...#.#.",
            "t...t.p...t",
        ],
        starter: ["bst", "avl", "redBlack"],
        blurb: "Keys inserted; balanced trees rotate to stay short.",
    },
    graph: {
        motif: [
            "#ttt#......",
            "t...t......",
            "t....t...#.",
            "#.....tt#..",
            "......t....",
            ".....#.....",
        ],
        starter: ["kruskalMst", "primMst", "graphDijkstra"],
        blurb: "Spanning trees, shortest paths, visit orders.",
    },
    strings: {
        motif: [
            "##tttt##y##",
            "...........",
            "..aaaa.....",
            "...........",
            "..pppp.....",
            "...........",
        ],
        starter: ["kmp", "horspool", "naiveMatch"],
        blurb: "A word slid along a text, letter by letter.",
    },
    find: {
        motif: [
            "..........#",
            "........#.#",
            "......#.#.#",
            "....y.#.#.#",
            "..#.y.#.#.#",
            "#.#.y.#.#.#",
        ],
        starter: ["binarySearch", "interpolationSearch", "linearSearch"],
        blurb: "One value hunted down in a sorted array.",
    },
} satisfies Record<string, CategoryPreview>;
