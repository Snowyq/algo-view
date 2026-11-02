import { Raster } from "./raster";

/*
 * Animal rigs drawn from rectangles only, four keyed poses per run cycle.
 * Cells: o body, d dark (far limbs, marks), l light, e eye, p tongue.
 */

export const W = 22;
export const H = 14;
/** Keys per run cycle. */
export const CYCLE = 4;
const GROUND = H - 1;
const HIP = 10; // first leg row under a standing body

export type Mode = "run" | "stand" | "sit" | "lie" | "tuck" | "dangle" | "hide";
export type Eyes = "open" | "closed" | "sleep";

export type Pose = {
    /** Key index within the cycle. */
    frame: number;
    mode: Mode;
    eyes: Eyes;
    /** Idle breath key, 0 or 1. */
    breath: number;
    /** Landing squash, 0 or 1. */
    squash: number;
};

export type Rig = (pose: Pose) => string[];

/** [x, y, w, h, color = "o", notch = false] */
type Part = [number, number, number, number, string?, boolean?];

function draw(r: Raster, parts: Part[], dx = 0, dy = 0): void {
    parts.forEach(([x, y, w, h, c = "o", notch = false]) => {
        const x0 = x + dx;
        const y0 = y + dy;
        const corners: Array<[number, number]> = [
            [x0, y0],
            [x0 + w - 1, y0],
            [x0, y0 + h - 1],
            [x0 + w - 1, y0 + h - 1],
        ];
        const under = corners.map(([cx, cy]) => r.get(cx, cy));
        r.rect(x0, y0, w, h, c);
        if (notch && w > 2 && h > 2) {
            // notch the corners but keep what was under them, so parts stay joined
            corners.forEach(([cx, cy], i) => r.set(cx, cy, under[i]));
        }
    });
}

const cycleKey = (pose: Pose): number => ((pose.frame % CYCLE) + CYCLE) % CYCLE;

function eye(r: Raster, x: number, y: number, eyes: Eyes): void {
    if (eyes === "open") r.rect(x, y, 1, 2, "e");
    else if (eyes === "closed") r.rect(x, y + 1, 1, 1, "e");
    else r.rect(x - 1, y + 1, 2, 1, "d");
}

type LegKey = { dx: number; lift: 0 | 1 };
const k = (dx: number, lift: 0 | 1 = 0): LegKey => ({ dx, lift });

/* Planted legs step one pixel per row at most; lifted legs stop two rows up. */
function leg(
    r: Raster,
    x: number,
    top: number,
    key: LegKey,
    w: number,
    c: string
): void {
    const len = GROUND - top + 1;
    if (key.lift) {
        const shown = Math.max(2, len - 2);
        r.rect(x, top, w, 1, c);
        r.rect(x + (Math.sign(key.dx) || -1), top + 1, w, shown - 1, c);
        return;
    }
    const steps = Math.min(Math.abs(key.dx), len - 1);
    const dir = Math.sign(key.dx);
    const upper = len - steps;
    r.rect(x, top, w, upper, c);
    for (let s = 1; s <= steps; s += 1) {
        r.rect(x + dir * s, top + upper + s - 1, w, 1, c);
    }
}

type Gait = {
    /** Per key: [backNear, backFar, frontNear, frontFar]. */
    keys: LegKey[][];
    bob: number[];
    /** Head forward / tail back on these keys (spine stretch). */
    stretch?: number[];
};

/* Rotary gallop: reach, push, gather (airborne), land. */
const GALLOP: Gait = {
    keys: [
        [k(-2), k(-1), k(2), k(1)],
        [k(-1, 1), k(-2), k(0, 1), k(1, 1)],
        [k(1, 1), k(1, 1), k(-1, 1), k(-1, 1)],
        [k(0, 1), k(1, 1), k(1), k(0)],
    ],
    bob: [0, -1, -2, -1],
    stretch: [1, 0, -1, 0],
};

/* Trot: diagonal pairs move together. */
const TROT: Gait = {
    keys: [
        [k(-1), k(1, 1), k(1, 1), k(-1)],
        [k(0), k(0, 1), k(0, 1), k(0)],
        [k(1, 1), k(-1), k(-1), k(1, 1)],
        [k(0, 1), k(0), k(0), k(0, 1)],
    ],
    bob: [0, -1, 0, -1],
};

/* Walk: one paw lifts at a time. */
const WALK: Gait = {
    keys: [
        [k(0, 1), k(-1), k(1), k(0)],
        [k(1), k(0), k(0, 1), k(-1)],
        [k(0), k(0, 1), k(-1), k(1)],
        [k(-1), k(1), k(0), k(0, 1)],
    ],
    bob: [0, 0, 0, 0],
};

type QuadDef = {
    gait: Gait;
    legW: number;
    hips: { back: number; front: number };
    body: Part[];
    marks?: Part[];
    head: Part[];
    eye: [number, number];
    /** Tail variants, cycled by key (sway / wag). */
    tails: Part[][];
    /** Extra head parts per pose (ear flop, tongue). */
    headFlair?: (pose: Pose) => Part[];
};

function quadruped(def: QuadDef): Rig {
    return (pose) => {
        const r = new Raster(W, H);
        const f = cycleKey(pose);
        const running = pose.mode === "run";
        let dy = 0;
        let stretch = 0;
        if (running) {
            dy = def.gait.bob[f];
            stretch = def.gait.stretch?.[f] ?? 0;
        }
        if (pose.mode === "tuck") dy = -1;
        if (pose.mode === "lie") dy = 3;
        if (pose.mode === "sit") dy = 1;
        if (pose.squash) dy += 1;
        const top = HIP + dy;
        const { back, front } = def.hips;

        // far legs (dark, one pixel behind), then tail, body, near legs
        const legs = (far: boolean): void => {
            const c = far ? "d" : "o";
            const off = far ? -1 : 0;
            const [bi, fi] = far ? [1, 3] : [0, 2];
            const w = def.legW;
            switch (pose.mode) {
                case "lie":
                case "hide":
                    if (!far) r.rect(front + 1, GROUND, 2, 1, "o");
                    return;
                case "tuck":
                    leg(r, back + off, top, k(1, 1), w, c);
                    leg(r, front + off, top, k(-1, 1), w, c);
                    return;
                case "dangle": {
                    const sway = f % 2 === 0 ? 0 : far ? 1 : -1;
                    r.rect(back + off + sway, top, w, 3, c);
                    r.rect(front + off - sway, top, w, 3, c);
                    return;
                }
                case "sit":
                    if (!far) r.rect(back - 1, GROUND - 1, 4, 2, "o");
                    leg(r, front + off, top - 1, k(0), w, c);
                    return;
                case "run": {
                    const keys = def.gait.keys[f];
                    leg(r, back + off, top, keys[bi], w, c);
                    leg(r, front + off, top, keys[fi], w, c);
                    return;
                }
                default:
                    leg(r, back + off, top, k(0), w, c);
                    leg(r, front + off, top, k(0), w, c);
            }
        };

        legs(true);
        const tailKey = running ? f : pose.breath * 2;
        const tail = def.tails[tailKey % def.tails.length];
        draw(r, tail, -Math.max(0, stretch), dy);
        draw(r, def.body, 0, dy);
        if (def.marks) draw(r, def.marks, 0, dy);
        legs(false);
        const headDy = dy + (pose.mode === "sit" ? -1 : 0);
        draw(r, def.head, stretch, headDy);
        if (def.headFlair) draw(r, def.headFlair(pose), stretch, headDy);
        eye(r, def.eye[0] + stretch, def.eye[1] + headDy, pose.eyes);
        return r.toGrid();
    };
}

export const cheetahRig = quadruped({
    gait: GALLOP,
    legW: 1,
    hips: { back: 5, front: 14 },
    body: [[3, 6, 14, 4, "o", true]],
    marks: [
        [5, 7, 1, 1, "d"],
        [8, 8, 1, 1, "d"],
        [10, 7, 1, 1, "d"],
        [13, 8, 1, 1, "d"],
        [15, 7, 1, 1, "d"],
    ],
    head: [
        [15, 3, 5, 4, "o", true],
        [19, 5, 2, 2],
        [20, 5, 1, 1, "d"],
        [16, 2, 1, 1],
        [18, 2, 1, 1],
        [17, 6, 1, 1, "d"],
    ],
    eye: [17, 4],
    tails: [
        [
            [1, 6, 2, 1],
            [0, 4, 1, 2],
            [0, 3, 1, 1, "d"],
        ],
        [
            [1, 6, 2, 1],
            [0, 5, 1, 1],
            [0, 4, 1, 1, "d"],
        ],
        [
            [1, 7, 2, 1],
            [0, 6, 1, 1],
            [0, 5, 1, 1, "d"],
        ],
        [
            [1, 6, 2, 1],
            [0, 5, 1, 1],
            [0, 4, 1, 1, "d"],
        ],
    ],
});

export const foxRig = quadruped({
    gait: TROT,
    legW: 1,
    hips: { back: 6, front: 13 },
    body: [[4, 6, 12, 4, "o", true]],
    marks: [[7, 9, 6, 1, "l"]],
    head: [
        [14, 3, 4, 4, "o", true],
        [14, 1, 1, 2],
        [17, 1, 1, 2],
        [18, 5, 3, 1],
        [16, 6, 4, 1, "l"],
        [20, 5, 1, 1, "d"],
    ],
    eye: [16, 3],
    tails: [
        [
            [1, 6, 3, 3],
            [0, 6, 1, 2, "l"],
        ],
        [
            [1, 5, 3, 3],
            [0, 5, 1, 2, "l"],
        ],
    ],
});

export const dogRig = quadruped({
    gait: GALLOP,
    legW: 2,
    hips: { back: 5, front: 13 },
    body: [[4, 5, 12, 5, "o", true]],
    head: [
        [13, 2, 5, 5, "o", true],
        [17, 4, 3, 3, "o", true],
        [19, 4, 1, 1, "d"],
    ],
    eye: [16, 3],
    tails: [
        [
            [3, 4, 1, 2],
            [2, 2, 1, 2],
        ],
        [
            [3, 4, 1, 2],
            [3, 2, 1, 2],
        ],
        [
            [3, 4, 1, 2],
            [4, 2, 1, 2],
        ],
        [
            [3, 4, 1, 2],
            [3, 2, 1, 2],
        ],
    ],
    // ear flops on the stride, tongue out while running
    headFlair: (pose) => {
        const flop = pose.mode === "run" && pose.frame % 2 === 1 ? -1 : 0;
        const parts: Part[] = [[13 + flop, 3, 2, 4, "d"]];
        if (pose.mode === "run") {
            parts.push([18, 7, 1, pose.frame % 2 ? 2 : 1, "p"]);
        }
        return parts;
    },
});

export const catRig = quadruped({
    gait: WALK,
    legW: 1,
    hips: { back: 6, front: 14 },
    body: [[5, 6, 11, 4, "o", true]],
    head: [
        [14, 3, 5, 4, "o", true],
        [14, 2, 1, 1],
        [18, 2, 1, 1],
        [19, 5, 1, 1, "d"],
    ],
    eye: [16, 4],
    tails: [
        [
            [4, 5, 1, 2],
            [3, 2, 1, 3],
            [4, 1, 1, 1],
        ],
        [
            [4, 5, 1, 2],
            [3, 2, 1, 3],
            [2, 1, 2, 1],
        ],
    ],
});

/* Hare: crouch, push, flight, land; ears stream back in the air. */
export const hareRig: Rig = (pose) => {
    const r = new Raster(W, H);
    const f = cycleKey(pose);
    const run = pose.mode === "run";
    const lie = pose.mode === "lie";
    const key = run ? f : -1;
    const lift = key === 2 ? -3 : key === 1 || key === 3 ? -1 : 0;
    const y = (lie ? 2 : lift) + (key === 0 || pose.squash ? 1 : 0);

    if (!lie && pose.mode !== "hide") {
        if (key === 1) {
            // push-off: hind leg kicks out behind
            draw(
                r,
                [
                    [4, 10, 2, 1],
                    [3, 11, 2, 1],
                    [1, 12, 3, 1],
                ],
                0,
                y
            );
            r.rect(14, 10 + y, 1, 2, "o");
        } else if (key === 2) {
            draw(
                r,
                [
                    [3, 10, 3, 1],
                    [1, 11, 3, 1],
                ],
                0,
                y
            );
            draw(r, [[15, 9, 2, 1]], 0, y);
        } else if (key === 3) {
            draw(r, [[5, 10, 3, 1]], 0, y);
            r.rect(14, 10 + y, 1, GROUND - 9 - y, "o");
        } else {
            draw(r, [[4, 9, 4, 2]], 0, y);
            r.rect(3, GROUND, 5, 1, "o");
            r.rect(13, 10 + y, 1, GROUND - 9 - y, "o");
        }
    }
    draw(
        r,
        [
            [5, 6, 10, 4, "o", true],
            [3, 6, 2, 2, "l"],
        ],
        0,
        y
    );
    draw(
        r,
        [
            [13, 3, 5, 4, "o", true],
            [18, 5, 1, 1, "d"],
        ],
        0,
        y
    );
    if (lie || key === 1 || key === 2) {
        draw(
            r,
            [
                [9, 3, 4, 1],
                [10, 2, 4, 1],
            ],
            0,
            y
        );
    } else {
        draw(
            r,
            [
                [14, 0, 1, 3],
                [16, 0, 1, 3],
            ],
            0,
            y
        );
        r.set(16, 1 + y, "l");
    }
    eye(r, 16, 4 + y, pose.eyes);
    return r.toGrid();
};

/* Duck: alternating webbed steps, head bobbing forward on each step. */
export const duckRig: Rig = (pose) => {
    const r = new Raster(W, H);
    const f = cycleKey(pose);
    const run = pose.mode === "run";
    const lie = pose.mode === "lie";
    const y = lie ? 2 : pose.squash ? 1 : run && f % 2 === 1 ? -1 : 0;
    const bob = run && f % 2 === 1 ? 1 : 0;

    if (!lie && pose.mode !== "hide") {
        const footDown = (x: number): void => {
            r.rect(x, 11 + y, 1, GROUND - 11 - y, "l");
            r.rect(x, GROUND, 3, 1, "l");
        };
        const footUp = (x: number): void => {
            r.rect(x, 11 + y, 1, 1, "l");
            r.rect(x - 1, 12 + y, 3, 1, "l");
        };
        if (pose.mode === "tuck") {
            footUp(8);
            footUp(12);
        } else if (run && f === 0) {
            footDown(8);
            footUp(12);
        } else if (run && f === 2) {
            footUp(8);
            footDown(12);
        } else {
            footDown(8);
            footDown(12);
        }
    }
    draw(
        r,
        [
            [4, 7, 12, 4, "o", true],
            [2, 6, 3, 2],
        ],
        0,
        y
    );
    const wing: Part = run && f % 2 ? [6, 8, 6, 1, "d"] : [7, 9, 5, 1, "d"];
    draw(r, [wing], 0, y);
    draw(
        r,
        [
            [13, 4, 2, 4],
            [12, 1, 5, 4, "o", true],
            [17, 3, 3, 1, "l"],
        ],
        bob,
        y
    );
    eye(r, 15 + bob, 2 + y, pose.eyes);
    return r.toGrid();
};

/* Turtle: stubby legs shuffle in pairs, head pushes out on each step. */
export const turtleRig: Rig = (pose) => {
    const r = new Raster(W, H);
    const f = cycleKey(pose);
    const run = pose.mode === "run";
    const hide = pose.mode === "hide";
    const y = pose.mode === "lie" ? 1 : 0;
    if (!hide) {
        const step = run ? [0, 1, 0, -1][f] : 0;
        const foot = (x: number, up: boolean, c: string): void =>
            r.rect(x, up ? 11 : 12, 2, 2, c);
        foot(7 - step, run && f === 1, "d");
        foot(14 + step, run && f === 3, "d");
        foot(5 + step, run && f === 3, "o");
        foot(12 - step, run && f === 1, "o");
        const reach = run ? [0, 1, 0, 1][f] : pose.breath;
        draw(
            r,
            [
                [15, 10, 2 + reach, 2],
                [16 + reach, 8, 4, 3, "o", true],
                [3, 11, 1, 1],
            ],
            0,
            y
        );
        eye(r, 18 + reach, 8 + y, pose.eyes);
    }
    // shell: light dome, dark pattern and rim
    draw(
        r,
        [
            [6, 6, 8, 1, "l"],
            [5, 7, 10, 4, "l"],
            [4, 11, 12, 1, "d"],
            [7, 7, 1, 1, "d"],
            [10, 7, 1, 1, "d"],
            [13, 8, 1, 1, "d"],
            [8, 9, 2, 1, "d"],
            [11, 9, 2, 1, "d"],
            [6, 9, 1, 1, "d"],
        ],
        0,
        y
    );
    return r.toGrid();
};

/* Snail: foot stretches, shell catches up; eye stalks sway. */
export const snailRig: Rig = (pose) => {
    const r = new Raster(W, H);
    const f = cycleKey(pose);
    const run = pose.mode === "run";
    const hide = pose.mode === "hide";
    const reach = run ? [0, 1, 2, 1][f] : 0;
    if (!hide) {
        draw(r, [
            [3, 12, 13 + reach, 2],
            [14 + reach, 9, 3, 4, "o", true],
        ]);
        const sway = run ? f % 2 : pose.breath;
        r.rect(14 + reach + sway, 6, 1, 3, "o");
        r.rect(16 + reach, 6 + sway, 1, 3 - sway, "o");
        if (pose.eyes === "open") {
            r.rect(14 + reach + sway, 5, 1, 1, "e");
            r.rect(16 + reach, 5 + sway, 1, 1, "e");
        }
    }
    // shell spiral
    draw(r, [
        [5, 5, 7, 7, "l", true],
        [6, 6, 5, 1, "d"],
        [10, 7, 1, 3, "d"],
        [7, 9, 3, 1, "d"],
        [7, 7, 1, 2, "d"],
        [8, 7, 1, 1, "d"],
    ]);
    return r.toGrid();
};

/* Sloth: one long arm reaches at a time, hooks the ground, drags. */
export const slothRig: Rig = (pose) => {
    const r = new Raster(W, H);
    const f = cycleKey(pose);
    const run = pose.mode === "run";
    const lie = pose.mode === "lie";
    const y = lie ? 2 : pose.squash ? 1 : 0;
    if (!lie && pose.mode !== "hide") {
        const arm = (reach: boolean, c: string, shift: number): void => {
            const x = 12 + shift;
            if (reach) {
                r.rect(x, 9 + y, 4, 1, c);
                r.rect(x + 3, 10 + y, 1, GROUND - 9 - y, c);
                r.rect(x + 4, GROUND, 1, 1, "d");
            } else {
                r.rect(x, 9 + y, 1, GROUND - 8 - y, c);
                r.rect(x + 1, GROUND, 1, 1, "d");
            }
        };
        arm(run && f === 2, "d", 1);
        r.rect(6, 10 + y, 2, GROUND - 9 - y, "d");
        r.rect(4, 10 + y, 2, GROUND - 9 - y, "o");
        arm(run && f === 0, "o", 0);
    }
    const sway = run && f % 2 ? 1 : 0;
    draw(r, [[3, 5 + sway, 11, 5, "o", true]], 0, y);
    draw(
        r,
        [
            [11, 2, 6, 5, "o", true],
            [12, 3, 4, 3, "l"],
            [12, 3, 4, 1, "d"],
            [16, 5, 1, 1, "d"],
        ],
        0,
        y
    );
    eye(r, 14, 3 + y, pose.eyes);
    return r.toGrid();
};
