import { createSelector, createSlice } from "@reduxjs/toolkit";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import {
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
import type { FindConfig, FindInput } from "../../utils/findInput";
import {
    CELL_EMPTY,
    CELL_WALL,
    type GridConfig,
    type GridInput,
} from "../../utils/grid";
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

export type SidebarTab = "input" | "selection" | "code" | "info";

/** What a drag on the path grid paints. */
export type GridBrush = "wall" | "mud" | "erase";

/** Tabs that show one algorithm (and outline its panel). */
export const PER_ALGORITHM_TABS: SidebarTab[] = ["code", "info"];

/** No measured limit yet (before the stage has a size). */
const UNLIMITED = 99;

type PlayState = {
    active: {
        category: CategoryId;
        algorithms: ActiveAlgorithm[];
    };
    /** One input per category: its recipe, its value, whether hand-edited. */
    inputs: CategoryInputs;
    registry: {
        categories: string[];
        algorithms: RegistryAlgorithm[];
    };
    options: {
        defaultStepTypes: SortStepType[];
        maxSteps: number[];
    };
    ui: {
        brush: GridBrush;
        sidebarOpen: boolean;
        sidebarTab: SidebarTab;
        /** Algorithm followed by the Code/Info tabs (null = none). */
        observedAlgorithmId: string | null;
        /** Phones: the algorithm whose code/about window covers the stage. */
        windowAlgorithmId: string | null;
        /** The full-screen category overview (welcome / category picker). */
        overviewOpen: boolean;
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
        isPlaying: boolean;
        speed: number;
    };
};

function getInitialState(): PlayState {
    const defaultCategory: CategoryId = "sort";
    const defaultAlgorithmId = "selectionSort";
    const categories = registryApi.getCategoriesIds() || [];
    const speeds = SORT_ANIMATION_SPEEDS;
    const defaultSpeed = speeds.includes(SORT_DEFAULT_ANIMATION_SPEED)
        ? SORT_DEFAULT_ANIMATION_SPEED
        : speeds[0] || 100;
    const defaultStepTypes = SORT_DEFAULT_STEP_TYPES as SortStepType[];
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
        inputs: initialInputs(),
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
            brush: "wall",
            sidebarOpen: false,
            sidebarTab: "input",
            observedAlgorithmId: null,
            windowAlgorithmId: null,
            overviewOpen: false,
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
            state.animation.maxStep = findMaxStep(visibleOf(state));
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
            const list = [...state.active.algorithms];
            const capacity = state.ui.panelCapacity;
            if (list.length >= capacity) {
                // Full: the oldest panel makes room, and the new one takes
                // the last visible slot (parked panels stay parked).
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
            state.animation.maxStep = findMaxStep(visibleOf(state));
        },

        /** The grid reports how many panels fit; extras are parked, not
            closed, and come back when the space does. */
        setOverviewOpen(state, action: { payload: boolean }) {
            state.ui.overviewOpen = action.payload;
        },

        setPanelCapacity(state, action: { payload: number }) {
            const capacity = Math.max(1, Math.floor(action.payload));
            if (state.ui.panelCapacity === capacity) return;
            state.ui.panelCapacity = capacity;
            state.animation.maxStep = findMaxStep(visibleOf(state));
            const { step, maxStep } = state.animation;
            state.animation.step = {
                value: clamp(step.value, 0, Math.max(0, maxStep)),
                trigger: "capacity",
            };
        },

        closeAlgorithm(state, action: { payload: string }) {
            const algoId = action.payload;
            if (!algoId) return;

            state.active.algorithms = state.active.algorithms.filter(
                (algo) => algo.id !== algoId
            );

            state.animation.maxStep = findMaxStep(visibleOf(state));
            const { step, maxStep } = state.animation;
            state.animation.step = {
                value: clamp(step.value, 0, maxStep),
                trigger: "closeAlgorithm",
            };
        },

        closeAllAlgorithms(state) {
            state.active.algorithms = [];
            state.animation.maxStep = findMaxStep(visibleOf(state));
            state.animation.step = {
                value: 0,
                trigger: "closeAlgorithm",
            };
        },

        // Handle category

        changeCategory(state, action: { payload: string }) {
            const category = action.payload as CategoryId;
            if (!(category in state.inputs)) return;
            if (state.active.category === category) return;
            const items = registryApi.getAlgorithmsInCategory(category) ?? [];
            state.active.category = category;
            state.active.algorithms = [];
            state.registry.algorithms = items.map((algo) => ({
                ...algo.meta,
                id: algo.id,
            }));
            state.options.maxSteps = [];
            state.ui.observedAlgorithmId = null;
            state.animation.maxStep = -1;
            state.animation.step = { value: 0, trigger: "changeCategory" };
            state.animation.status = "stopped";
            state.animation.isPlaying = false;
        },

        // Path grid

        /** Paint cells; start and end are never painted over. */
        paintGridCells(
            state,
            action: { payload: { cells: number[]; value: number } }
        ) {
            const { cells, value } = action.payload;
            const slot = state.inputs.path;
            const { start, end } = slot.value;
            let changed = false;
            cells.forEach((cell) => {
                if (cell === start || cell === end) return;
                if (cell < 0 || cell >= slot.value.cells.length) return;
                if (slot.value.cells[cell] === value) return;
                slot.value.cells[cell] = value;
                changed = true;
            });
            if (!changed) return;
            slot.edited = true;
            resetPlayback(state, "changeInput");
        },

        /** Move the start or end marker onto an open cell. */
        moveGridMarker(
            state,
            action: { payload: { marker: "start" | "end"; cell: number } }
        ) {
            const { marker, cell } = action.payload;
            const grid = state.inputs.path.value;
            if (cell < 0 || cell >= grid.cells.length) return;
            if (cell === grid.start || cell === grid.end) return;
            if (grid.cells[cell] === CELL_WALL) grid.cells[cell] = CELL_EMPTY;
            grid[marker] = cell;
            state.inputs.path.edited = true;
            resetPlayback(state, "changeInput");
        },

        setBrush(state, action: { payload: GridBrush }) {
            state.ui.brush = action.payload;
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

        // UI state

        toggleSidebar(state) {
            state.ui.sidebarOpen = !state.ui.sidebarOpen;
        },

        setSidebarOpen(state, action: { payload: boolean }) {
            state.ui.sidebarOpen = Boolean(action.payload);
        },

        setSidebarTab(state, action: { payload: SidebarTab }) {
            state.ui.sidebarTab = action.payload;
        },

        setObservedAlgorithm(state, action: { payload: string }) {
            state.ui.observedAlgorithmId = action.payload;
        },

        /** Clicked panel: follow it. Shows its code, unless the open
            Details tab already follows algorithms (Code / About). */
        observeAlgorithm(state, action: { payload: string }) {
            state.ui.observedAlgorithmId = action.payload;
            if (
                !state.ui.sidebarOpen ||
                !PER_ALGORITHM_TABS.includes(state.ui.sidebarTab)
            )
                state.ui.sidebarTab = "code";
            state.ui.sidebarOpen = true;
        },

        /** Click on empty space between panels: stop following. */
        openAlgorithmWindow(state, action: { payload: string }) {
            state.ui.windowAlgorithmId = action.payload;
            state.ui.observedAlgorithmId = action.payload;
        },

        closeAlgorithmWindow(state) {
            state.ui.windowAlgorithmId = null;
        },

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

        toggleAnimation(state) {
            state.animation.isPlaying = !state.animation.isPlaying;
        },

        changeAnimationStatus(state, action: { payload: AnimationStatus }) {
            const status = action.payload;
            state.animation.status = status;
        },

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
    setObservedAlgorithm,
    clearObservedAlgorithm,
    observeAlgorithm,
    openAlgorithmWindow,
    closeAlgorithmWindow,
    setPanelCapacity,
    setOverviewOpen,
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
    paintGridCells,
    moveGridMarker,
    setBrush,
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
export const getActiveCategory = (state: RootState): CategoryId =>
    state.play.active.category;
export const getActiveAlgorithms = (state: RootState): ActiveAlgorithm[] =>
    state.play.active.algorithms;
/* Typed shortcuts into the per-category inputs. */
export const getInput = (state: RootState): number[] =>
    state.play.inputs.sort.value;
export const getInputConfig = (state: RootState): InputConfig =>
    state.play.inputs.sort.config;
export const getGrid = (state: RootState): GridInput =>
    state.play.inputs.path.value;
export const getGridConfig = (state: RootState): GridConfig =>
    state.play.inputs.path.config;
export const getGridEdited = (state: RootState): boolean =>
    state.play.inputs.path.edited;
export const getFindInput = (state: RootState): FindInput =>
    state.play.inputs.find.value;
export const getFindConfig = (state: RootState): FindConfig =>
    state.play.inputs.find.config;
export const getBrush = (state: RootState): GridBrush => state.play.ui.brush;
export const getSidebarOpen = (state: RootState): boolean =>
    state.play.ui.sidebarOpen;
export const getSidebarTab = (state: RootState): SidebarTab =>
    state.play.ui.sidebarTab;
/** The followed algorithm: the one picked, else the first one open. */
export const getObservedAlgorithmId = (state: RootState): string | null => {
    const { algorithms } = state.play.active;
    const chosen = state.play.ui.observedAlgorithmId;
    if (chosen && algorithms.some((algo) => algo.id === chosen)) return chosen;
    return algorithms[0]?.id ?? null;
};
/** The panel to outline: only while the sidebar shows a per-algorithm tab. */
/** The window's algorithm, or null once it is closed or the window is. */
export const getWindowAlgorithmId = (state: RootState): string | null => {
    const id = state.play.ui.windowAlgorithmId;
    return id && state.play.active.algorithms.some((algo) => algo.id === id)
        ? id
        : null;
};
export const getOverviewOpen = (state: RootState): boolean =>
    state.play.ui.overviewOpen;
export const getPanelCapacity = (state: RootState): number =>
    state.play.ui.panelCapacity;
/** Algorithms with a panel on the stage (the first `capacity`). */
export const getVisibleAlgorithms = createSelector(
    [
        (state: RootState) => state.play.active.algorithms,
        (state: RootState) => state.play.ui.panelCapacity,
    ],
    (algorithms, capacity) => algorithms.slice(0, capacity)
);
/** Open but parked for lack of room. */
export const getParkedAlgorithms = createSelector(
    [
        (state: RootState) => state.play.active.algorithms,
        (state: RootState) => state.play.ui.panelCapacity,
    ],
    (algorithms, capacity) => algorithms.slice(capacity)
);
export const getEvicted = (
    state: RootState
): { name: string; seq: number } | null => state.play.ui.evicted;
export const getHighlightedPanelId = (state: RootState): string | null => {
    const { sidebarOpen, sidebarTab } = state.play.ui;
    if (!sidebarOpen || !PER_ALGORITHM_TABS.includes(sidebarTab)) return null;
    return getObservedAlgorithmId(state);
};
export const getStepWorkerReady = (state: RootState): boolean =>
    state.play.ui.stepWorkerReady;
export const getCanvasWorkerReady = (state: RootState): boolean =>
    state.play.ui.canvasWorkerReady;
export const getCanvasWorkerLoading = (state: RootState): boolean =>
    state.play.ui.canvasWorkerLoadingCount > 0;

// Helpers

/* New input: back to step 0, stopped, wait for the workers' new length. */
function resetPlayback(state: PlayState, trigger: string): void {
    state.animation.step = { value: 0, trigger };
    state.animation.maxStep = 0;
    state.animation.status = "stopped";
    state.animation.isPlaying = false;
}

/** Panels that get a slot on the stage; the rest are parked. */
function visibleOf(state: PlayState): ActiveAlgorithm[] {
    return state.active.algorithms.slice(0, state.ui.panelCapacity);
}

function findMaxStep(algorithms: ActiveAlgorithm[]): number {
    const values = algorithms.map((algo) => {
        const length =
            typeof algo.stepsLength === "number" ? algo.stepsLength : 0;
        return length > 0 ? length - 1 : 0;
    });
    const max = values.length > 0 ? Math.max(...values) : -1;
    return max;
}
