import { createSlice } from "@reduxjs/toolkit";
import { generateRandomArray } from "../../utils/randoms";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { ANIMATION_SPEEDS, DEFAULT_STEP_TYPES } from "../../utils/constants";

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
			maxSteps: [],
		},
		animation: {
			status: "stopped",
			speeds,
			step: 0,
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

		openAlgorithm(state, action) {
			const algoId = action.payload;
			if (!algoId) return;

			const isAdded = state.active.algorithms.find(
				algo => algo.id === algoId
			);
			if (isAdded) return;

			const algo = { id: algoId };
			state.active.algorithms = [...state.active.algorithms, algo];
		},

		closeAlgorithm(state, action) {
			const algoId = action.payload;
			state.active.algorithms = state.active.algorithms.filter(
				algo => algo.id !== algoId
			);

			state.options.maxSteps = state.options.maxSteps.filter(
				opt => opt.id !== algoId
			);

			const values = state.options.maxSteps.map(opt => opt.value);
			state.animation.maxStep =
				values.length > 0 ? Math.max(...values) : -1;
		},

		/* ----------------------------- Handle Category ---------------------------- */

		changeCategory(state, action) {
			if (!state.registry.logs.includes(action.payload)) return;
			state.active.category = action.payload;
			state.active.algorithms = [];
			state.options.maxSteps = [];
			state.animation.maxStep = -1;
			state.animation.step = 0;
			state.animation.isPlaying = false;
		},

		/* ---------------------------- Handle Step Value --------------------------- */

		passMaxStep(state, action) {
			const { id: algoId, value: maxStep } = action.payload;
			if (!algoId || (!maxStep && maxStep !== 0)) return;

			const rest = state.options.maxSteps.filter(
				opt => opt.id !== algoId
			);
			const opt = { id: algoId, value: maxStep };
			state.options.maxSteps = [...rest, opt];

			const values = state.options.maxSteps.map(opt => opt.value);
			state.animation.maxStep =
				values.length > 0 ? Math.max(...values) : -1;
		},

		decreaseStep(state, action) {
			state.animation.step = state.animation.step - action.payload;
		},

		increaseStep(state, action) {
			state.animation.step = state.animation.step + action.payload;
		},

		changeStep(state, action) {
			state.animation.step = action.payload;
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

		freezeAnimation(state, action) {
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
	openAlgorithm,
	changeCategory,
	closeAlgorithm,
	passMaxStep,
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

// export const getExamples = state => state.examples
