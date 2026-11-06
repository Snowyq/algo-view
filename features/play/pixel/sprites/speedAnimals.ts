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

export const ANIMAL_ORDER: AnimalId[] = Object.values(BY_SPEED);

const logDistance = (a: number, b: number): number =>
    Math.abs(Math.log(a) - Math.log(b));

/* Unknown intervals get the animal of the nearest known one. */
export function animalForSpeed(ms: number): AnimalId {
    if (BY_SPEED[ms]) return BY_SPEED[ms];
    const known = Object.keys(BY_SPEED).map(Number);
    const nearest = known.reduce((best, value) =>
        logDistance(value, ms) < logDistance(best, ms) ? value : best
    );
    return BY_SPEED[nearest];
}

export function formatSpeed(ms: number): string {
    if (ms < 1000) return `${ms}ms`;
    const seconds = ms / 1000;
    return `${Number.isInteger(seconds) ? seconds : seconds.toFixed(1)}s`;
}

/* 0..1 relative pace on a log scale, for the speed meters. */
export function paceOf(ms: number, speeds: number[]): number {
    const min = Math.log(Math.min(...speeds));
    const max = Math.log(Math.max(...speeds));
    if (max === min) return 1;
    return 1 - (Math.log(ms) - min) / (max - min);
}
