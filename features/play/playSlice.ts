import { createSelector, createSlice } from "@reduxjs/toolkit";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import {
    CATEGORY_DATA,
    generateFor,
    initialInputs,
    type CategoryId,
    type CategoryInputs,
    type ConfigOf,
    type ValueOf,
} from "../../algorithms/categoryData";
import type { SortStepType } from "../../algorithms/sort/SortAlgorithm";
import type { AlgorithmMeta, AlgorithmMetrics } from "../../algorithms/types";
import {
    SORT_ANIMATION_SPEEDS,
    SORT_DEFAULT_ANIMATION_SPEED,
    SORT_DEFAULT_STEP_TYPES,
} from "../../config/sort";
import type { RootState } from "../../store";
import type { InputConfig } from "../../utils/randoms";
import { clamp } from "../../utils/values";

type AnimationStatus = "stopped" | "playing" | "freezed";

export type ActiveAlgorithm = {
    id: string;
    info: AlgorithmMeta;
    stepsLength: number;
    metrics?: AlgorithmMetrics;
};

export type RegistryAlgorithm = AlgorithmMeta & { id: string };

type SidebarTab = "input" | "selection" | "code" | "info";

/** What a drag on the path grid paints. */
export type GridBrush = "wall" | "mud" | "erase";

/** Tabs that show one algorithm (and outline its panel). */
const PER_ALGORITHM_TABS: SidebarTab[] = ["code", "info"];

/** No measured limit yet (before the stage has a size). */
const UNLIMITED = 99;

/** maxStep while no algorithm has a run. */
const NO_RUN = -1;

type PlayState = {
    active: {
        category: CategoryId;
        algorithms: ActiveAlgorithm[];
    };
    /** One input per category: its recipe, its value, whether hand-edited. */
    inputs: CategoryInputs;
    registry: {
        algorithms: RegistryAlgorithm[];
    };
    options: {
        defaultStepTypes: SortStepType[];
    };
    ui: {
        brush: GridBrush;
        sidebarOpen: boolean;
        sidebarTab: SidebarTab;
        /** Algorithm followed by the Code/Info tabs (null = none). */
        observedAlgorithmId: string | null;
        /** The algorithm shown in focus mode. */
        windowAlgorithmId: string | null;
        /** The full-screen category overview. */
        overviewOpen: boolean;
        /** The data editor over the stage. */
        editorOpen: boolean;
        /** How many panels fit on the stage right now (measured by the grid). */
        panelCapacity: number;
        /** Last algorithm closed automatically to make room (seq bumps). */
        evicted: { name: string; seq: number } | null;
        stepWorkerReady: boolean;
        canvasWorkerReady: boolean;
        /** Canvas workers still computing a run (any category). */
        canvasWorkerLoadingCount: number;
    };
    animation: {
        status: AnimationStatus;
        speeds: number[];
        step: { value: number; trigger: string };
        maxStep: number;
        speed: number;
    };
};

type StepPayload = { payload: { value: number; trigger?: string } };

const INITIAL_CATEGORY: CategoryId = "sort";

function initialSpeed(speeds: number[]): number {
    const preferred = CATEGORY_DATA[INITIAL_CATEGORY].defaultSpeed;
    if (speeds.includes(preferred)) return preferred;
    if (speeds.includes(SORT_DEFAULT_ANIMATION_SPEED)) {
        return SORT_DEFAULT_ANIMATION_SPEED;
    }
    return speeds[0] || 100;
}

function registryAlgorithmsOf(category: CategoryId): RegistryAlgorithm[] {
    const items = registryApi.getAlgorithmsInCategory(category) ?? [];
    return items.map((algo) => ({ ...algo.meta, id: algo.id }));
}

function getInitialState(): PlayState {
    const speeds = SORT_ANIMATION_SPEEDS;
    return {
        // Nothing open at start; the overview or a shared link picks.
        active: { category: INITIAL_CATEGORY, algorithms: [] },
        inputs: initialInputs(),
        registry: { algorithms: registryAlgorithmsOf(INITIAL_CATEGORY) },
        options: {
            defaultStepTypes: SORT_DEFAULT_STEP_TYPES as SortStepType[],
        },
        ui: {
            brush: "wall",
            sidebarOpen: false,
            sidebarTab: "input",
            observedAlgorithmId: null,
            windowAlgorithmId: null,
            overviewOpen: false,
            editorOpen: false,
            panelCapacity: UNLIMITED,
            evicted: null,
            stepWorkerReady: false,
            canvasWorkerReady: false,
            canvasWorkerLoadingCount: 0,
        },
        animation: {
            status: "stopped",
            speeds,
            step: { value: 0, trigger: "init" },
            maxStep: NO_RUN,
            speed: initialSpeed(speeds),
        },
    };
}

const playSlice = createSlice({
    name: "play",
    initialState: getInitialState(),
    reducers: {
        /** New input for a category, generated from a recipe. */
        applyInput(
            state,
            action: {
                payload: {
                    [C in CategoryId]: { category: C; config: ConfigOf<C> };
                }[CategoryId];
            }
        ) {
            const { category, config } = action.payload;
            const slot = state.inputs[category] as {
                config: unknown;
                value: unknown;
                edited: boolean;
            };
            slot.config = config;
            slot.value = generateFor(category, config as never);
            slot.edited = false;
            if (category === state.active.category) {
                resetPlayback(state, "changeInput");
            }
        },

        /** Replace a category's input by hand (e.g. a shared, edited map). */
        setInputValue(
            state,
            action: {
                payload: {
                    [C in CategoryId]: { category: C; value: ValueOf<C> };
                }[CategoryId];
            }
        ) {
            const { category, value } = action.payload;
            const slot = state.inputs[category] as {
                value: unknown;
                edited: boolean;
            };
            slot.value = value;
            slot.edited = true;
            if (category === state.active.category) {
                resetPlayback(state, "changeInput");
            }
        },

        // Active algorithms

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
            const { stepsLength, metrics, id } = action.payload;
            const algo = state.active.algorithms.find((a) => a.id === id);
            if (!algo) return;
            algo.stepsLength = stepsLength;
            algo.metrics = metrics;
            fitStepToRuns(state, "passAlgorithmInfo");
        },

        openAlgorithm(state, action: { payload: string }) {
            const id = action.payload;
            if (!id) return;
            if (state.active.algorithms.some((algo) => algo.id === id)) return;
            const registry = registryApi.getAlgorithmRegistry(
                state.active.category,
                id
            );
            if (!registry) return;
            addPanel(state, {
                id,
                info: registry.meta,
                stepsLength: 0,
                metrics: undefined,
            });
            state.animation.maxStep = findMaxStep(visibleOf(state));
        },

        closeAlgorithm(state, action: { payload: string }) {
            const id = action.payload;
            if (!id) return;
            state.active.algorithms = state.active.algorithms.filter(
                (algo) => algo.id !== id
            );
            fitStepToRuns(state, "closeAlgorithm");
        },

        closeAllAlgorithms(state) {
            state.active.algorithms = [];
            fitStepToRuns(state, "closeAlgorithm");
        },

        /** The grid reports how many panels fit; extras are parked, not
            closed, and come back when the space does. */
        setPanelCapacity(state, action: { payload: number }) {
            const capacity = Math.max(1, Math.floor(action.payload));
            if (state.ui.panelCapacity === capacity) return;
            state.ui.panelCapacity = capacity;
            fitStepToRuns(state, "capacity");
        },

        changeCategory(state, action: { payload: string }) {
            const category = action.payload as CategoryId;
            if (!(category in state.inputs)) return;
            if (state.active.category === category) return;
            state.active.category = category;
            state.active.algorithms = [];
            state.registry.algorithms = registryAlgorithmsOf(category);
            state.ui.observedAlgorithmId = null;
            state.animation.maxStep = NO_RUN;
            state.animation.step = { value: 0, trigger: "changeCategory" };
            state.animation.status = "stopped";
            state.animation.speed = CATEGORY_DATA[category].defaultSpeed;
        },

        setBrush(state, action: { payload: GridBrush }) {
            state.ui.brush = action.payload;
        },

        // Step

        decreaseStep(state, action: StepPayload) {
            const { value, trigger = "action" } = action.payload;
            state.animation.step = {
                value: Math.max(0, state.animation.step.value - value),
                trigger,
            };
        },

        increaseStep(state, action: StepPayload) {
            const { value, trigger = "action" } = action.payload;
            const { step, maxStep } = state.animation;
            state.animation.step = {
                value: Math.min(maxStep, step.value + value),
                trigger,
            };
        },

        changeStep(state, action: StepPayload) {
            const { value, trigger = "action" } = action.payload;
            state.animation.step = {
                value: clamp(value, 0, state.animation.maxStep),
                trigger,
            };
        },

        // UI

        setOverviewOpen(state, action: { payload: boolean }) {
            state.ui.overviewOpen = action.payload;
        },

        setEditorOpen(state, action: { payload: boolean }) {
            state.ui.editorOpen = action.payload;
            if (action.payload) state.ui.windowAlgorithmId = null;
        },

        toggleSidebar(state) {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
        },

        setSidebarOpen(state, action: { payload: boolean }) {
            state.ui.sidebarOpen = Boolean(action.payload);
        },

        setSidebarTab(state, action: { payload: SidebarTab }) {
            state.ui.sidebarTab = action.payload;
        },

        openAlgorithmWindow(state, action: { payload: string }) {
            state.ui.windowAlgorithmId = action.payload;
            state.ui.observedAlgorithmId = action.payload;
        },

        closeAlgorithmWindow(state) {
            state.ui.windowAlgorithmId = null;
        },

        /** Click on empty stage: stop following. */
        clearObservedAlgorithm(state) {
            state.ui.observedAlgorithmId = null;
        },

        setStepWorkerReady(state, action: { payload: boolean }) {
            state.ui.stepWorkerReady = Boolean(action.payload);
        },

        setCanvasWorkerReady(state, action: { payload: boolean }) {
            state.ui.canvasWorkerReady = Boolean(action.payload);
        },

        incrementCanvasWorkerLoading(state) {
            state.ui.canvasWorkerLoadingCount += 1;
        },

        decrementCanvasWorkerLoading(state) {
            state.ui.canvasWorkerLoadingCount = Math.max(
                0,
                state.ui.canvasWorkerLoadingCount - 1
            );
        },

        // Animation

        freezeAnimation(state) {
            state.animation.status = "freezed";
        },

        startAnimation(state) {
            state.animation.status = "playing";
        },

        stopAnimation(state) {
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
    closeAllAlgorithms,
    toggleSidebar,
    setSidebarOpen,
    setSidebarTab,
    clearObservedAlgorithm,
    openAlgorithmWindow,
    closeAlgorithmWindow,
    setPanelCapacity,
    setOverviewOpen,
    setEditorOpen,
    setStepWorkerReady,
    setCanvasWorkerReady,
    incrementCanvasWorkerLoading,
    decrementCanvasWorkerLoading,
    stopAnimation,
    changeSpeed,
    startAnimation,
    freezeAnimation,
    applyInput,
    setInputValue,
    setBrush,
} = playSlice.actions;

export default playSlice.reducer;

// Selectors

export const getAnimationStatus = (state: RootState): AnimationStatus =>
    state.play.animation.status;
export const getAlgorithms = (state: RootState): RegistryAlgorithm[] =>
    state.play.registry.algorithms;
export const getStep = (state: RootState): { value: number; trigger: string } =>
    state.play.animation.step;
export const getMaxStep = (state: RootState): number =>
    state.play.animation.maxStep;
export const getSpeeds = (state: RootState): number[] =>
    state.play.animation.speeds;
export const getCurrentSpeed = (state: RootState): number =>
    state.play.animation.speed;
export const getDefaultStepTypes = (state: RootState): SortStepType[] =>
    state.play.options.defaultStepTypes;
export const getActiveCategory = (state: RootState): CategoryId =>
    state.play.active.category;
export const getActiveAlgorithms = (state: RootState): ActiveAlgorithm[] =>
    state.play.active.algorithms;

// Typed shortcuts into the per-category inputs.
export const getInput = (state: RootState): number[] =>
    state.play.inputs.sort.value;
export const getInputConfig = (state: RootState): InputConfig =>
    state.play.inputs.sort.config;
export const getGridEdited = (state: RootState): boolean =>
    state.play.inputs.path.edited;

export const getBrush = (state: RootState): GridBrush => state.play.ui.brush;
export const getSidebarOpen = (state: RootState): boolean =>
    state.play.ui.sidebarOpen;
export const getOverviewOpen = (state: RootState): boolean =>
    state.play.ui.overviewOpen;
export const getEditorOpen = (state: RootState): boolean =>
    state.play.ui.editorOpen;
export const getPanelCapacity = (state: RootState): number =>
    state.play.ui.panelCapacity;
export const getEvicted = (
    state: RootState
): { name: string; seq: number } | null => state.play.ui.evicted;
export const getStepWorkerReady = (state: RootState): boolean =>
    state.play.ui.stepWorkerReady;
export const getCanvasWorkerReady = (state: RootState): boolean =>
    state.play.ui.canvasWorkerReady;
export const getCanvasWorkerLoading = (state: RootState): boolean =>
    state.play.ui.canvasWorkerLoadingCount > 0;

const hasAlgorithm = (state: RootState, id: string): boolean =>
    state.play.active.algorithms.some((algo) => algo.id === id);

/** The followed algorithm: the one picked, else the first one open. */
const getObservedAlgorithmId = (state: RootState): string | null => {
    const chosen = state.play.ui.observedAlgorithmId;
    if (chosen && hasAlgorithm(state, chosen)) return chosen;
    return state.play.active.algorithms[0]?.id ?? null;
};

/** The panel to outline: only while the sidebar shows a per-algorithm tab. */
export const getHighlightedPanelId = (state: RootState): string | null => {
    const { sidebarOpen, sidebarTab } = state.play.ui;
    if (!sidebarOpen || !PER_ALGORITHM_TABS.includes(sidebarTab)) return null;
    return getObservedAlgorithmId(state);
};

/** The focus-mode algorithm, or null once it (or the window) is closed. */
export const getWindowAlgorithmId = (state: RootState): string | null => {
    const id = state.play.ui.windowAlgorithmId;
    return id && hasAlgorithm(state, id) ? id : null;
};

const selectAlgorithms = (state: RootState): ActiveAlgorithm[] =>
    state.play.active.algorithms;
const selectCapacity = (state: RootState): number =>
    state.play.ui.panelCapacity;

/** Algorithms with a panel on the stage (the first `capacity`). */
export const getVisibleAlgorithms = createSelector(
    [selectAlgorithms, selectCapacity],
    (algorithms, capacity) => algorithms.slice(0, capacity)
);

/** Open but parked for lack of room. */
export const getParkedAlgorithms = createSelector(
    [selectAlgorithms, selectCapacity],
    (algorithms, capacity) => algorithms.slice(capacity)
);

// Helpers

/* New input: back to step 0, stopped, wait for the workers' new length. */
function resetPlayback(state: PlayState, trigger: string): void {
    state.animation.step = { value: 0, trigger };
    state.animation.maxStep = 0;
    state.animation.status = "stopped";
}

/** Panels that get a slot on the stage; the rest are parked. */
function visibleOf(state: PlayState): ActiveAlgorithm[] {
    return state.active.algorithms.slice(0, state.ui.panelCapacity);
}

function findMaxStep(algorithms: ActiveAlgorithm[]): number {
    if (algorithms.length === 0) return NO_RUN;
    return Math.max(
        ...algorithms.map((algo) => Math.max(0, (algo.stepsLength || 0) - 1))
    );
}

/* The visible runs changed: recompute the end and keep the step inside it. */
function fitStepToRuns(state: PlayState, trigger: string): void {
    const maxStep = findMaxStep(visibleOf(state));
    state.animation.maxStep = maxStep;
    state.animation.step = {
        value: clamp(state.animation.step.value, 0, maxStep),
        trigger,
    };
}

/* When the stage is full the oldest panel makes room, and the new one
   takes the last visible slot (parked panels stay parked). */
function addPanel(state: PlayState, algo: ActiveAlgorithm): void {
    const list = [...state.active.algorithms];
    const capacity = state.ui.panelCapacity;
    if (list.length >= capacity) {
        const [oldest] = list.splice(0, 1);
        list.splice(capacity - 1, 0, algo);
        state.ui.evicted = {
            name: oldest.info.name,
            seq: (state.ui.evicted?.seq ?? 0) + 1,
        };
    } else {
        list.push(algo);
    }
    state.active.algorithms = list;
}
