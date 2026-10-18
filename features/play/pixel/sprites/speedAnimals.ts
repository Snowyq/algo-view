import type { AnimalId } from "./animals";

/* One animal per playback interval, fastest to slowest. */
const BY_SPEED: Record<number, AnimalId> = {
    1: "cheetah",
    5: "hare",
    16: "fox",
    25: "dog",
    50: "cat",
    100: "duck",
    500: "turtle",
    1000: "snail",
    2000: "sloth",
};

const ORDER: AnimalId[] = [
    "cheetah",
    "hare",
    "fox",
    "dog",
    "cat",
    "duck",
    "turtle",
    "snail",
    "sloth",
];

/* Unknown intervals get the animal of the nearest known one. */
export function animalForSpeed(ms: number): AnimalId {
    if (BY_SPEED[ms]) return BY_SPEED[ms];
    const known = Object.keys(BY_SPEED).map(Number);
    const nearest = known.reduce((best, value) =>
        Math.abs(Math.log(value) - Math.log(ms)) <
        Math.abs(Math.log(best) - Math.log(ms))
            ? value
            : best
    );
    return BY_SPEED[nearest];
}

export const ANIMAL_ORDER = ORDER;

export function formatSpeed(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`;
}

/* 0–1 relative pace on a log scale, for the speed meters. */
export function paceOf(ms: number, speeds: number[]): number {
    const min = Math.log(Math.min(...speeds));
    const max = Math.log(Math.max(...speeds));
    if (max === min) return 1;
    return 1 - (Math.log(ms) - min) / (max - min);
}
