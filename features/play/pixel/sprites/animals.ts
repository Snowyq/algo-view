import {
    catRig,
    cheetahRig,
    dogRig,
    duckRig,
    foxRig,
    hareRig,
    slothRig,
    snailRig,
    turtleRig,
    type Rig,
} from "./rigs";

/*
 * Speed animals, in a classic pixel-mascot style: flat terracotta
 * bodies, square eyes, no outlines. Character comes from motion: each
 * animal has a procedural rig (see rigs.ts) and its own gait.
 */

export type AnimalId =
    | "cheetah"
    | "hare"
    | "fox"
    | "dog"
    | "cat"
    | "duck"
    | "turtle"
    | "snail"
    | "sloth";

export type Animal = {
    id: AnimalId;
    name: string;
    /** What it does on the track, for labels. */
    gait: string;
    rig: Rig;
    /** Frames per run cycle and cycles per second. */
    runFrames: number;
    runCps: number;
    /** Kicks up dust while running. */
    dusty: boolean;
    /** Tricks: "hide" pulls into the shell, "flip" does a somersault. */
    trick: "hide" | "flip";
};

export const ANIMALS: Record<AnimalId, Animal> = {
    cheetah: {
        id: "cheetah",
        name: "Cheetah",
        gait: "sprints",
        rig: cheetahRig,
        runFrames: 4,
        runCps: 3.6,
        dusty: true,
        trick: "flip",
    },
    hare: {
        id: "hare",
        name: "Hare",
        gait: "hops",
        rig: hareRig,
        runFrames: 4,
        runCps: 2.2,
        dusty: true,
        trick: "flip",
    },
    fox: {
        id: "fox",
        name: "Fox",
        gait: "trots",
        rig: foxRig,
        runFrames: 4,
        runCps: 2.6,
        dusty: true,
        trick: "flip",
    },
    dog: {
        id: "dog",
        name: "Dog",
        gait: "runs",
        rig: dogRig,
        runFrames: 4,
        runCps: 2.4,
        dusty: false,
        trick: "flip",
    },
    cat: {
        id: "cat",
        name: "Cat",
        gait: "walks",
        rig: catRig,
        runFrames: 4,
        runCps: 1.6,
        dusty: false,
        trick: "flip",
    },
    duck: {
        id: "duck",
        name: "Duck",
        gait: "waddles",
        rig: duckRig,
        runFrames: 4,
        runCps: 2,
        dusty: false,
        trick: "flip",
    },
    turtle: {
        id: "turtle",
        name: "Turtle",
        gait: "plods",
        rig: turtleRig,
        runFrames: 4,
        runCps: 1,
        dusty: false,
        trick: "hide",
    },
    snail: {
        id: "snail",
        name: "Snail",
        gait: "creeps",
        rig: snailRig,
        runFrames: 4,
        runCps: 0.75,
        dusty: false,
        trick: "hide",
    },
    sloth: {
        id: "sloth",
        name: "Sloth",
        gait: "shuffles",
        rig: slothRig,
        runFrames: 4,
        runCps: 0.5,
        dusty: false,
        trick: "flip",
    },
};

export const PALETTE: Record<string, string> = {
    o: "#d97757",
    l: "#f4c2a6",
    d: "#8a3f26",
    e: "#1d110b",
    p: "#f08a9b",
};
