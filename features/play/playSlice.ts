import { createSlice } from "@reduxjs/toolkit";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type { SortStepType } from "../../algorithms/sort/SortAlgorithm";
import type { AlgorithmMeta, AlgorithmMetrics } from "../../algorithms/types";
import {
    SORT_ANIMATION_SPEEDS,
    SORT_DEFAULT_ANIMATION_SPEED,
    SORT_DEFAULT_INPUT_LENGTH,
    SORT_DEFAULT_INPUT_VALUE_RANGE,
    SORT_DEFAULT_STEP_TYPES,
    SORT_MAX_INPUT_LENGTH,
    SORT_MIN_INPUT_LENGTH,
} from "../../config/sort";
import type { RootState } from "../../store";
import { generateRandomArray } from "../../utils/randoms";
import { clamp } from "../../utils/values";

type AnimationStatus = "stopped" | "playing" | "freezed";

export type ActiveAlgorithm = {
    id: string;
    info: AlgorithmMeta;
    stepsLength: number;
    metrics?: AlgorithmMetrics;
};

export type RegistryAlgorithm = AlgorithmMeta & { id: string };

type PlayState = {
    active: {
        category: string;
        algorithms: ActiveAlgorithm[];
    };
    input: number[];
    allMetricsVisible: boolean;
    registry: {
        categories: string[];
        algorithms: RegistryAlgorithm[];
    };
    options: {
        defaultStepTypes: SortStepType[];
        maxSteps: number[];
    };
    ui: {
        sidebarOpen: boolean;
        stepWorkerReady: boolean;
        sortWorkerReady: boolean;
        sortWorkerLoadingCount: number;
    };
    animation: {
        status: AnimationStatus;
        speeds: number[];
        step: { value: number; trigger: string };
        maxStep: number;
        isPlaying: boolean;
        speed: number;
    };
};

function getInitialState(): PlayState {
    const defaultCategory = "sort";
    const defaultAlgorithmId = "selectionSort";
    const categories = registryApi.getCategoriesIds() || [];
    const speeds = SORT_ANIMATION_SPEEDS;
    const defaultSpeed = speeds.includes(SORT_DEFAULT_ANIMATION_SPEED)
        ? SORT_DEFAULT_ANIMATION_SPEED
        : speeds[0] || 100;
    const defaultStepTypes = SORT_DEFAULT_STEP_TYPES as SortStepType[];
    const initialInput = generateRandomArray(
        SORT_DEFAULT_INPUT_LENGTH,
        SORT_DEFAULT_INPUT_VALUE_RANGE[0],
        SORT_DEFAULT_INPUT_VALUE_RANGE[1]
    );
    const defaultRegistry = registryApi.getAlgorithmRegistry(
        defaultCategory,
        defaultAlgorithmId
    );
    const algorithmsInCategory =
        registryApi.getAlgorithmsInCategory(defaultCategory) ?? [];
    const initialAlgorithms = defaultRegistry
        ? [
              {
                  id: defaultAlgorithmId,
                  info: defaultRegistry.meta,
                  stepsLength: 0,
                  metrics: undefined,
              },
          ]
        : [];
    const initialMaxStep = findMaxStep(initialAlgorithms);

    return {
        active: {
            category: defaultCategory,
            algorithms: initialAlgorithms,
        },
        input: initialInput,
        allMetricsVisible: false,
        registry: {
            categories,
            algorithms: algorithmsInCategory.map((algo) => ({
                ...algo.meta,
                id: algo.id,
            })),
        },
        options: {
            defaultStepTypes,
            maxSteps: [],
        },
        ui: {
            sidebarOpen: true,
            stepWorkerReady: false,
            sortWorkerReady: false,
            sortWorkerLoadingCount: 0,
        },
        animation: {
            status: "stopped",
            speeds,
            step: { value: 0, trigger: "init" },
            maxStep: initialMaxStep,
            isPlaying: false,
            speed: defaultSpeed,
        },
    };
}

const playSlice = createSlice({
    name: "play",
    initialState: getInitialState(),
    reducers: {
        changeInput(
            state,
            action: {
                payload: { length: number; min: number; max: number };
            }
        ) {
            const { length, min, max } = action.payload;
            const safeLength = clamp(
                length,
                SORT_MIN_INPUT_LENGTH,
                SORT_MAX_INPUT_LENGTH
            );

            const newInput = generateRandomArray(safeLength, min, max);

            state.input = newInput;
            state.animation.step = { value: 0, trigger: "changeInput" };
            state.animation.maxStep = 0;
            state.animation.status = "stopped";
            state.animation.isPlaying = false;
        },

        // Handle active algorithms

        passAlgorithmInfo(
            state,
            action: {
                payload: {
                    stepsLength: number;
                    metrics?: AlgorithmMetrics;
                    id: string;
                };
            }
        ) {
            const { stepsLength, metrics, id: algoId } = action.payload;
            if (!algoId) return;
            const algoIndex = state.active.algorithms.findIndex(
                (algo) => algo.id === algoId
            );
            if (algoIndex === -1) return;

            state.active.algorithms[algoIndex] = {
                ...state.active.algorithms[algoIndex],
                stepsLength,
                metrics,
            };
            state.animation.maxStep = findMaxStep(state.active.algorithms);
            const { maxStep, step } = state.animation;
            state.animation.step = {
                value: clamp(step.value, 0, maxStep),
                trigger: "passAlgorithmInfo",
            };
        },

        openAlgorithm(state, action: { payload: string }) {
            const algoId = action.payload;
            if (!algoId) return;

            const isAdded = state.active.algorithms.find(
                (algo) => algo.id === algoId
            );
            if (isAdded) return;

            const registry = registryApi.getAlgorithmRegistry(
                state.active.category,
                algoId
            );
            if (!registry) return;

            const algo = {
                id: algoId,
                info: registry.meta,
                stepsLength: 0,
                metrics: undefined,
            };
            state.active.algorithms = [...state.active.algorithms, algo];
        },

        closeAlgorithm(state, action: { payload: string }) {
            const algoId = action.payload;
            if (!algoId) return;

            state.active.algorithms = state.active.algorithms.filter(
                (algo) => algo.id !== algoId
            );

            state.animation.maxStep = findMaxStep(state.active.algorithms);
            const { step, maxStep } = state.animation;
            state.animation.step = {
                value: clamp(step.value, 0, maxStep),
                trigger: "closeAlgorithm",
            };
        },

        // Handle category

        changeCategory(state, action: { payload: string }) {
            // if (!state.registry.logs.includes(action.payload)) return;
            state.active.category = action.payload;
            state.active.algorithms = [];
            state.options.maxSteps = [];
            state.animation.maxStep = -1;
            state.animation.step.value = 0;
            state.animation.step.trigger = "changeCategory";
            state.animation.isPlaying = false;
        },

        // Handle step value

        decreaseStep(
            state,
            action: { payload: { value: number; trigger?: string } }
        ) {
            const { step } = state.animation;
            const { value, trigger = "action" } = action.payload;
            const newStep = step.value - value;
            state.animation.step = {
                value: newStep <= 0 ? 0 : newStep,
                trigger,
            };
        },

        increaseStep(
            state,
            action: { payload: { value: number; trigger?: string } }
        ) {
            const { step, maxStep } = state.animation;
            const { value, trigger = "action" } = action.payload;
            const newStep = step.value + value;
            state.animation.step = state.animation.step = {
                value: newStep >= maxStep ? maxStep : newStep,
                trigger,
            };
        },

        changeStep(
            state,
            action: { payload: { value: number; trigger?: string } }
        ) {
            const { value, trigger = "action" } = action.payload;
            state.animation.step = {
                value: clamp(value, 0, state.animation.maxStep),
                trigger,
            };
        },

        // Handle all metrics state

        toggleMetrics(state) {
            state.allMetricsVisible = !state.allMetricsVisible;
        },

        // UI state

        toggleSidebar(state) {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
        },

        setSidebarOpen(state, action: { payload: boolean }) {
            state.ui.sidebarOpen = Boolean(action.payload);
        },

        setStepWorkerReady(state, action: { payload: boolean }) {
            state.ui.stepWorkerReady = Boolean(action.payload);
        },

        setSortWorkerReady(state, action: { payload: boolean }) {
            state.ui.sortWorkerReady = Boolean(action.payload);
        },

        incrementSortWorkerLoading(state) {
            state.ui.sortWorkerLoadingCount += 1;
        },

        decrementSortWorkerLoading(state) {
            state.ui.sortWorkerLoadingCount = Math.max(
                0,
                state.ui.sortWorkerLoadingCount - 1
            );
        },

        // Animation

        toggleAnimation(state) {
            state.animation.isPlaying = !state.animation.isPlaying;
        },

        changeAnimationStatus(state, action: { payload: AnimationStatus }) {
            const status = action.payload;
            state.animation.status = status;
        },

        freezeAnimation(state) {
            console.log("freeze");
            state.animation.status = "freezed";
        },

        startAnimation(state) {
            console.log("start");
            state.animation.status = "playing";
        },

        stopAnimation(state) {
            console.log("stop");
            state.animation.status = "stopped";
        },

        changeSpeed(state, action: { payload: number }) {
            const speed = action.payload;
            if (!state.animation.speeds.includes(speed)) return;
            state.animation.speed = speed;
        },
    },
});

export const {
    increaseStep,
    decreaseStep,
    changeStep,
    passAlgorithmInfo,
    openAlgorithm,
    changeCategory,
    closeAlgorithm,
    toggleMetrics,
    toggleSidebar,
    setSidebarOpen,
    setStepWorkerReady,
    setSortWorkerReady,
    incrementSortWorkerLoading,
    decrementSortWorkerLoading,
    stopAnimation,
    changeSpeed,
    startAnimation,
    freezeAnimation,
    changeInput,
} = playSlice.actions;

export default playSlice.reducer;

export const getAnimationStatus = (state: RootState): AnimationStatus =>
    state.play.animation.status;
export const getAlgorithms = (state: RootState): RegistryAlgorithm[] =>
    state.play.registry.algorithms;
export const getIsPlaying = (state: RootState): boolean =>
    state.play.animation.isPlaying;
export const getStep = (state: RootState): { value: number; trigger: string } =>
    state.play.animation.step;
export const getMaxStep = (state: RootState): number =>
    state.play.animation.maxStep;
export const getSpeeds = (state: RootState): number[] =>
    state.play.animation.speeds;
export const getCurrentSpeed = (state: RootState): number =>
    state.play.animation.speed;
export const getDefaultStepTypes = (state: RootState) =>
    state.play.options.defaultStepTypes;
export const getActiveCategory = (state: RootState): string =>
    state.play.active.category;
export const getActiveAlgorithms = (state: RootState): ActiveAlgorithm[] =>
    state.play.active.algorithms;
export const getInput = (state: RootState): number[] => state.play.input;
export const getAllMetricsVisible = (state: RootState): boolean =>
    state.play.allMetricsVisible;
export const getSidebarOpen = (state: RootState): boolean =>
    state.play.ui.sidebarOpen;
export const getStepWorkerReady = (state: RootState): boolean =>
    state.play.ui.stepWorkerReady;
export const getSortWorkerReady = (state: RootState): boolean =>
    state.play.ui.sortWorkerReady;
export const getSortWorkerLoading = (state: RootState): boolean =>
    state.play.ui.sortWorkerLoadingCount > 0;

// Helpers

function findMaxStep(algorithms: ActiveAlgorithm[]): number {
    const values = algorithms.map((algo) => {
        const length =
            typeof algo.stepsLength === "number" ? algo.stepsLength : 0;
        return length > 0 ? length - 1 : 0;
    });
    const max = values.length > 0 ? Math.max(...values) : -1;
    return max;
}
