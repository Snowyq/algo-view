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

/* One animal per playback speed, each with its own rig and gait. */

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
    /** Verb for labels, e.g. sprints. */
    gait: string;
    rig: Rig;
    /** Run cycles per second. */
    runCps: number;
    /** Kicks up dust while running. */
    dusty: boolean;
    /** Click trick: hide in the shell or do a somersault. */
    trick: "hide" | "flip";
};

export const ANIMALS: Record<AnimalId, Animal> = {
    cheetah: {
        id: "cheetah",
        name: "Cheetah",
        gait: "sprints",
        rig: cheetahRig,
        runCps: 3.6,
        dusty: true,
        trick: "flip",
    },
    hare: {
        id: "hare",
        name: "Hare",
        gait: "hops",
        rig: hareRig,
        runCps: 2.2,
        dusty: true,
        trick: "flip",
    },
    fox: {
        id: "fox",
        name: "Fox",
        gait: "trots",
        rig: foxRig,
        runCps: 2.6,
        dusty: true,
        trick: "flip",
    },
    dog: {
        id: "dog",
        name: "Dog",
        gait: "runs",
        rig: dogRig,
        runCps: 2.4,
        dusty: false,
        trick: "flip",
    },
    cat: {
        id: "cat",
        name: "Cat",
        gait: "walks",
        rig: catRig,
        runCps: 1.6,
        dusty: false,
        trick: "flip",
    },
    duck: {
        id: "duck",
        name: "Duck",
        gait: "waddles",
        rig: duckRig,
        runCps: 2,
        dusty: false,
        trick: "flip",
    },
    turtle: {
        id: "turtle",
        name: "Turtle",
        gait: "plods",
        rig: turtleRig,
        runCps: 1,
        dusty: false,
        trick: "hide",
    },
    snail: {
        id: "snail",
        name: "Snail",
        gait: "creeps",
        rig: snailRig,
        runCps: 0.75,
        dusty: false,
        trick: "hide",
    },
    sloth: {
        id: "sloth",
        name: "Sloth",
        gait: "shuffles",
        rig: slothRig,
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
