import { createSlice } from "@reduxjs/toolkit";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import {
    DEFAULT_SORT_ANIMATION_SPEED,
    DEFAULT_SORT_INPUT_LENGTH,
    DEFAULT_SORT_INPUT_VALUE_RANGE,
} from "../../config/sort";
import {
    ANIMATION_SPEEDS,
    DEFAULT_STEP_TYPES,
} from "../../constants/constants";
import { generateRandomArray } from "../../utils/randoms";
import { clamp } from "../../utils/values";

function getInitialState() {
    const defaultCategory = "sort";
    const defaultAlgorithmId = "selectionSort";
    const categories = registryApi.getCategoriesIds() || [];
    const speeds = ANIMATION_SPEEDS[defaultCategory] || [];
    const defaultSpeed = speeds.includes(DEFAULT_SORT_ANIMATION_SPEED)
        ? DEFAULT_SORT_ANIMATION_SPEED
        : speeds[0] || 100;
    const defaultStepTypes = DEFAULT_STEP_TYPES[defaultCategory] || [];
    const initialInput = generateRandomArray(
        DEFAULT_SORT_INPUT_LENGTH,
        DEFAULT_SORT_INPUT_VALUE_RANGE[0],
        DEFAULT_SORT_INPUT_VALUE_RANGE[1]
    );
    const defaultRegistry = registryApi.getAlgorithmRegistry(
        defaultCategory,
        defaultAlgorithmId
    );
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
            algorithms: registryApi
                .getAlgorithmsInCategory(defaultCategory)
                .map((algo) => ({ ...algo.meta, id: algo.id })),
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
        changeInput(state, action) {
            const { length, min, max } = action.payload;

            const newInput = generateRandomArray(length, min, max);

            state.input = newInput;
            state.animation.step = { value: 0, trigger: "changeInput" };
            state.animation.maxStep = 0;
            state.animation.status = "stopped";
            state.animation.isPlaying = false;
        },

        /* ------------------------ Handle Active Algorithms ------------------------ */

        passAlgorithmInfo(state, action) {
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

        openAlgorithm(state, action) {
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

            const algo = {
                id: algoId,
                info: registry.meta,
                stepsLength: 0,
                metrics: undefined,
            };
            state.active.algorithms = [...state.active.algorithms, algo];
        },

        closeAlgorithm(state, action) {
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

        /* ----------------------------- Handle Category ---------------------------- */

        changeCategory(state, action) {
            // if (!state.registry.logs.includes(action.payload)) return;
            state.active.category = action.payload;
            state.active.algorithms = [];
            state.options.maxSteps = [];
            state.animation.maxStep = -1;
            state.animation.step.value = 0;
            state.animation.step.trigger = "changeCategory";
            state.animation.isPlaying = false;
        },

        /* ---------------------------- Handle Step Value --------------------------- */

        decreaseStep(state, action) {
            const { step } = state.animation;
            const { value, trigger = "action" } = action.payload;
            const newStep = step.value - value;
            state.animation.step = {
                value: newStep <= 0 ? 0 : newStep,
                trigger,
            };
        },

        increaseStep(state, action) {
            const { step, maxStep } = state.animation;
            const { value, trigger = "action" } = action.payload;
            const newStep = step.value + value;
            state.animation.step = state.animation.step = {
                value: newStep >= maxStep ? maxStep : newStep,
                trigger,
            };
        },

        changeStep(state, action) {
            const { value, trigger = "action" } = action.payload;
            state.animation.step = {
                value: clamp(value, 0, state.animation.maxStep),
                trigger,
            };
        },

        /* ------------------------ Handle All Metrics State ------------------------ */

        toggleMetrics(state) {
            state.allMetricsVisible = !state.allMetricsVisible;
        },

        /* ------------------------------- UI State ------------------------------- */

        toggleSidebar(state) {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
        },

        setSidebarOpen(state, action) {
            state.ui.sidebarOpen = Boolean(action.payload);
        },

        setStepWorkerReady(state, action) {
            state.ui.stepWorkerReady = Boolean(action.payload);
        },

        setSortWorkerReady(state, action) {
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

        /* -------------------------------- Animation ------------------------------- */

        toggleAnimation(state) {
            state.animation.isPlaying = !state.animation.isPlaying;
        },

        changeAnimationStatus(state, action) {
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

        changeSpeed(state, action) {
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

export const getAnimationStatus = (state) => state.play.animation.status;
export const getAlgorithms = (state) => state.play.registry.algorithms;
export const getIsPlaying = (state) => state.play.animation.isPlaying;
export const getStep = (state) => state.play.animation.step;
export const getMaxStep = (state) => state.play.animation.maxStep;
export const getSpeeds = (state) => state.play.animation.speeds;
export const getCurrentSpeed = (state) => state.play.animation.speed;
export const getDefaultStepTypes = (state) =>
    state.play.options.defaultStepTypes;
export const getActiveCategory = (state) => state.play.active.category;
export const getActiveAlgorithms = (state) => state.play.active.algorithms;
export const getInput = (state) => state.play.input;
export const getAllMetricsVisible = (state) => state.play.allMetricsVisible;
export const getSidebarOpen = (state) => state.play.ui.sidebarOpen;
export const getStepWorkerReady = (state) => state.play.ui.stepWorkerReady;
export const getSortWorkerReady = (state) => state.play.ui.sortWorkerReady;
export const getSortWorkerLoading = (state) =>
    state.play.ui.sortWorkerLoadingCount > 0;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function findMaxStep(algorithms) {
    const values = algorithms.map((algo) => {
        const length =
            typeof algo.stepsLength === "number" ? algo.stepsLength : 0;
        return length > 0 ? length - 1 : 0;
    });
    const max = values.length > 0 ? Math.max(...values) : -1;
    return max;
}
