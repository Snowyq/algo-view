import { ANIMALS, type AnimalId } from "./animals";
import { H, W, type Mode, type Pose } from "./rigs";

/*
 * Clips are rendered once per animal and state from the rig, then cached.
 * Timing lives here: anticipation and squash on the hop, a slow breath
 * with an occasional blink at rest.
 */

export type SpriteState =
    | "run"
    | "idle"
    | "sit"
    | "sleep"
    | "done"
    | "dragged"
    | "hide";

export type SpriteFrame = { grid: string[]; dy: number };

export type SpriteClip = {
    frames: SpriteFrame[];
    fps: number;
    loop: boolean;
};

export const SPRITE_W = W;
export const SPRITE_H = H;
/* Headroom for jumps; feet always land on the bottom row. */
export const SPRITE_TOP = 5;
export const CANVAS_W = SPRITE_W + 2;
export const CANVAS_H = SPRITE_H + SPRITE_TOP;

const pose = (patch: Partial<Pose> & { mode: Mode }): Pose => ({
    frame: 0,
    eyes: "open",
    breath: 0,
    squash: 0,
    ...patch,
});

/* Two-key breath: in for half the loop, out for the other half. */
const breathKey = (i: number, n: number): number => (i < n / 2 ? 0 : 1);

function buildClip(id: AnimalId, state: SpriteState): SpriteClip {
    const animal = ANIMALS[id];
    const draw = (p: Pose, dy = 0): SpriteFrame => ({
        grid: animal.rig(p),
        dy,
    });

    switch (state) {
        case "run": {
            const n = animal.runFrames;
            return {
                frames: Array.from({ length: n }, (_, i) =>
                    draw(pose({ mode: "run", frame: i }))
                ),
                fps: n * animal.runCps,
                loop: true,
            };
        }
        case "idle":
        case "sit": {
            const n = 16;
            const blinkAt = state === "idle" ? 13 : 10;
            return {
                frames: Array.from({ length: n }, (_, i) =>
                    draw(
                        pose({
                            mode: state === "idle" ? "stand" : "sit",
                            frame: i,
                            breath: breathKey(i, n),
                            eyes: i === blinkAt ? "closed" : "open",
                        })
                    )
                ),
                fps: 5,
                loop: true,
            };
        }
        case "sleep": {
            const n = 8;
            return {
                frames: Array.from({ length: n }, (_, i) =>
                    draw(
                        pose({
                            mode: "lie",
                            eyes: "sleep",
                            breath: breathKey(i, n),
                        })
                    )
                ),
                fps: 2,
                loop: true,
            };
        }
        case "done": {
            // Anticipate, leap, hang, land with a squash, settle.
            const seq: Array<[Mode, number, number]> = [
                ["stand", 0, 1],
                ["tuck", -2, 0],
                ["tuck", -4, 0],
                ["tuck", -4, 0],
                ["tuck", -2, 0],
                ["stand", 0, 1],
                ["stand", 0, 0],
            ];
            return {
                frames: seq.map(([mode, dy, squash]) =>
                    draw(pose({ mode, squash }), dy)
                ),
                fps: 10,
                loop: false,
            };
        }
        case "dragged": {
            const n = 4;
            return {
                frames: Array.from({ length: n }, (_, i) =>
                    draw(pose({ mode: "dangle", frame: i }), -2)
                ),
                fps: 6,
                loop: true,
            };
        }
        case "hide":
            return {
                frames: [draw(pose({ mode: "hide" }))],
                fps: 1,
                loop: false,
            };
    }
}

const cache = new Map<string, SpriteClip>();

export function getClip(id: AnimalId, state: SpriteState): SpriteClip {
    const key = `${id}:${state}`;
    let clip = cache.get(key);
    if (!clip) {
        clip = buildClip(id, state);
        cache.set(key, clip);
    }
    return clip;
}
