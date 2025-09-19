import { createSlice } from "@reduxjs/toolkit";
import { generateRandomArray } from "../../utils/randoms";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { ANIMATION_SPEEDS, DEFAULT_STEP_TYPES } from "../../utils/constants";
import { clamp } from "../../utils/values";

function getInitialState() {
	const defaultCategory = "sort";
	const categories = registryApi.getCategoriesIds() || [];
	const speeds = ANIMATION_SPEEDS[defaultCategory] || [];
	const defaultStepTypes = DEFAULT_STEP_TYPES[defaultCategory] || [];

	return {
		active: {
			category: defaultCategory,
			algorithms: [],
		},
		input: generateRandomArray(50, 0, 30),
		allMetricsVisible: false,
		registry: {
			categories,
			algorithms: registryApi
				.getAlgorithmsInCategory(defaultCategory)
				.map(algo => ({ ...algo.meta, id: algo.id })),
		},
		options: {
			defaultStepTypes,
		},
		animation: {
			status: "stopped",
			speeds,
			step: { value: 0, trigger: "init" },
			maxStep: -1,
			isPlaying: false,
			speed: speeds[0] || 100,
		},
	};
}

const playSlice = createSlice({
	name: "play",
	initialState: getInitialState(),
	reducers: {
		/* ------------------------ Handle Active Algorithms ------------------------ */

		passAlgorithmInfo(state, action) {
			const { steps, metrics, id: algoId } = action.payload;
			if (!algoId) return;

			const prevAlgorithmInfo = state.active.algorithms.find(
				algo => algo.id === algoId
			);
			const restAlgorithms = state.active.algorithms.filter(
				algo => algo.id !== algoId
			);

			const newAlgorithmInfo = {
				...prevAlgorithmInfo,
				steps,
				metrics,
			};

			state.active.algorithms = [...restAlgorithms, newAlgorithmInfo];
			state.animation.maxStep = findMaxStep(state.active.algorithms);
		},

		openAlgorithm(state, action) {
			const algoId = action.payload;
			if (!algoId) return;

			const isAdded = state.active.algorithms.find(
				algo => algo.id === algoId
			);
			if (isAdded) return;

			const registry = registryApi.getAlgorithmRegistry(
				state.active.category,
				algoId
			);

			const algo = { id: algoId, info: registry.meta };
			state.active.algorithms = [...state.active.algorithms, algo];
		},

		closeAlgorithm(state, action) {
			const algoId = action.payload;
			if (!algoId) return;

			state.active.algorithms = state.active.algorithms.filter(
				algo => algo.id !== algoId
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
	stopAnimation,
	changeSpeed,
	startAnimation,
	freezeAnimation,
} = playSlice.actions;

export default playSlice.reducer;

export const getAnimationStatus = state => state.play.animation.status;
export const getAlgorithms = state => state.play.registry.algorithms;
export const getIsPlaying = state => state.play.animation.isPlaying;
export const getStep = state => state.play.animation.step;
export const getMaxStep = state => state.play.animation.maxStep;
export const getSpeeds = state => state.play.animation.speeds;
export const getCurrentSpeed = state => state.play.animation.speed;
export const getDefaultStepTypes = state => state.play.options.defaultStepTypes;
export const getActiveCategory = state => state.play.active.category;
export const getActiveAlgorithms = state => state.play.active.algorithms;
export const getInput = state => state.play.input;
export const getAllMetricsVisible = state => state.play.allMetricsVisible;

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

function findMaxStep(algorithms) {
	const values = algorithms.map(algo => algo.steps.length - 1 || 0);
	const max = values.length > 0 ? Math.max(...values) : -1;
	return max;
}
