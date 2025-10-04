import registryApi from "../algorithms/algorithmsRegistryApi";

let AlgorithmClass = null;
let AlgorithmInstance = null;
let ctx = null;
let currStepIndex = null;
let dpr = null;
let stepColors = null;
let doFirstRender = true;
let currentAnimationFrameId = null;
let sharedIndex;

let canvasHeight = 0;
let canvasHeightDpr = 0;
let canvasWidth = 0;
let canvasWidthDpr = 0;

/**
 * Updates canvas settings from payload.
 * Can modify block proportions, margin, and text display behavior.
 */
let blockRatio = 0.8; // 0 - 1
let upperBlockMargin = 15; //
let textDisplayThreshold = 10; // px
let textAlign = "center"; // 'center', 'start', 'end'
let labelFont = "10px sans-serif";

let tabId;
let channel;

self.onmessage = function (event) {
	const { type, payload, canvas } = event.data;
	console.log(type);
	function postError(message) {
		postMessage({
			type: "error",
			message,
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                                 Event Types                                */
	/* -------------------------------------------------------------------------- */

	if (type === "tab") {
		tabId = payload;
		channel = new BroadcastChannel(`animation-tick:${tabId}`);
		channel.onmessage = event => {
			const stepIndex = event.data.step;
			draw(stepIndex); // existing function
		};
	}

	/* ------------------------------- Draw Canvas ------------------------------ */

	if (type === "draw-canvas") {
		const { devicePixelRatio } = payload;

		let stepIndex = payload?.stepIndex;
		console.log(sharedIndex);
		if (sharedIndex) {
			console.log(stepIndex);
			console.log(sharedIndex);
			stepIndex = Atomics.load(sharedIndex, 0);
		}

		if (!AlgorithmInstance) {
			postError("Cannot draw canvas: Algorithm instance not initialized");
			return;
		}

		if (isNaN(stepIndex)) {
			postError("Cannot draw canvas: stepIndex not set");
			return;
		}

		adjustSize(null, null, devicePixelRatio);

		draw(stepIndex);
		const metrics = AlgorithmInstance.getMetrics();
		const step = AlgorithmInstance.getStepByIndex(stepIndex);

		postMessage({
			type: "draw-done",
			payload: { step, index: stepIndex, metrics },
		});
		return;
	}

	/* ------------------------------ Resize Canvas ----------------------------- */

	if (type === "resize") {
		const { width, height, devicePixelRatio } = payload;

		const resized = adjustSize(width, height, devicePixelRatio);
		if (resized) redraw();

		postMessage({ type: "resized" });
		return;
	}

	/* ---------------------------- Initialize Canvas --------------------------- */

	if (type === "init-canvas") {
		if (!canvas) {
			postError("canvas offscreen not provided");
			return;
		}

		ctx = canvas.getContext("2d");

		postMessage({ type: "canvas-initialized" });
		return;
	}

	/* ---------------------------- Load Step Colors ---------------------------- */

	if (type === "load-step-colors") {
		const { stepColors: colors } = payload;
		updateStepColors(colors);

		postMessage({ type: "colors-loaded" });
		return;
	}

	/* -------------------------- Find Algorithm Class -------------------------- */

	if (type === "mount") {
		const { id, sharedBuffer } = payload;
		if (sharedBuffer) {
			sharedIndex = new Uint32Array(payload.sharedBuffer);
		}
		if (!id) {
			postError("No Algorithm Id provided");
			return;
		}

		const Class = findAlgorithmClass("sort", payload.id);

		if (!Class) {
			postError(`Algorithm Class with Id: ${id} cannot be find`);
			return;
		}

		mountAlgorithmClass(Class);

		postMessage({ type: "mounted" });
		return;
	}

	/* ---------------------------- Render Algorithm ---------------------------- */

	if (type === "render-algorithm") {
		const { devicePixelRatio, input, options, rect } = payload;

		adjustSize(rect.width, rect.height, devicePixelRatio);

		if (!input) {
			postError("Array to sort not provided");
			return;
		}

		doFirstRender = true;
		createAlgorithmInstance(input, options);
		const stepsLength = getAlgorithmStepsLength();
		const steps = AlgorithmInstance.getSteps();
		const metrics = AlgorithmInstance.getMetrics();

		postMessage({
			type: "render-done",
			payload: { steps, stepsLength, metrics },
		});
	}

	/* ----------------------------- Update Settings ---------------------------- */

	if (type === "settings") {
		const { settings, devicePixelRatio } = payload;
		adjustSize(null, null, devicePixelRatio);
		updateSettings(settings);
		redraw();
		postMessage({ type: "settings-updated" });
		return;
	}
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function updateStepIndex(newIndex) {
	currStepIndex = newIndex;
}

function updateStepColors(colors) {
	stepColors = colors;
}

function findAlgorithmClass(category, id) {
	return registryApi.getAlgorithmClass(category, id);
}

function mountAlgorithmClass(Class) {
	AlgorithmClass = Class;
}

function createAlgorithmInstance(input, options) {
	if (!AlgorithmClass) return;
	AlgorithmInstance = new AlgorithmClass(input, options);
}

function getAlgorithmStepsLength() {
	return AlgorithmInstance.getStepsLength();
}

function updateSettings(payload) {
	const {
		blockProportion: blockProportionValue,
		upperBlockMargin: upperBlockMarginValue,
		textDisplayThreshold: textDisplayThresholdValue,
	} = payload;
	if (blockProportionValue) blockRatio = blockProportionValue;
	if (upperBlockMarginValue) upperBlockMargin = upperBlockMarginValue;
	if (textDisplayThresholdValue)
		textDisplayThreshold = textDisplayThresholdValue;
}

/* ---------------------------- Size Adjustments ---------------------------- */

function adjustSize(width, height, devicePixelRatio) {
	let resized = false;
	if (shouldResize(width, height, devicePixelRatio)) {
		resize(width, height, devicePixelRatio);
		resized = true;
	}
	return resized;
}

function updateDevicePixelRatio(newDpr) {
	if (!newDpr) return;
	dpr = newDpr;
}

function shouldResize(width, height, devicePixelRatio) {
	if (width !== canvasWidth || height !== canvasHeight) return true;
	if (devicePixelRatio && dpr !== devicePixelRatio) return true;
	return false;
}

function resize(width, height, devicePixelRatio) {
	updateDevicePixelRatio(devicePixelRatio);
	if (ctx && ctx.canvas && width && height) {
		canvasWidth = width;
		canvasHeight = height;
		canvasWidthDpr = canvasWidth * dpr;
		canvasHeightDpr = canvasHeight * dpr;

		ctx.canvas.width = canvasWidthDpr;
		ctx.canvas.height = canvasHeightDpr;
	}
}

/* --------------------------------- Drawing -------------------------------- */

function redraw() {
	if (!isNaN(currStepIndex)) {
		draw(currStepIndex);
	}
}

function draw(stepIndex) {
	if (!AlgorithmInstance) return;

	if (currentAnimationFrameId !== null) {
		cancelAnimationFrame(currentAnimationFrameId);
		currentAnimationFrameId = null;
	}

	updateStepIndex(stepIndex);
	const state = AlgorithmInstance.getStateByStepsIndex(stepIndex);
	const step = AlgorithmInstance.getStepByIndex(stepIndex);
	const maxValue = AlgorithmInstance.getArrayMinMax().max;

	if (doFirstRender) {
		doFirstRender = false;
		animateDrawArray(state, step, maxValue);
	} else {
		drawArray(state, step, maxValue);
	}
}

function handleDraw(callback) {
	if (!ctx || !ctx.canvas) return;
	if (!dpr) updateDevicePixelRatio(1);

	ctx.save();

	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	callback();

	ctx.restore();
}

function drawBlock(
	val,
	index,
	step,
	blockWidth,
	gapWidth,
	maxValue,
	showText = true
) {
	// Account for vertical space above each block to fit the text label

	const blockHeight = calculateBlockHeight(val, maxValue);
	const x = index * (blockWidth + gapWidth);
	const y = canvasHeight - blockHeight;
	// Determine the step type to apply corresponding highlight styles
	const type = getBlockDisplayType(step, index);

	// Apply fill style based on step type
	ctx.fillStyle = getColorByType(type);
	ctx.fillRect(x, y, blockWidth, blockHeight);

	// Display block value only if its width exceeds the configured threshold
	if (blockWidth >= textDisplayThreshold && showText) {
		displayText(val, x + blockWidth / 2, y - 5);
	}
}

function drawArray(state, step, maxValue) {
	let output = [];
	if (!state) return output;

	// Calculate block and gap widths proportionally based on canvas size
	let { blockWidth, gapWidth } = calcBlockGapWidth(state.length, blockRatio);

	handleDraw(() => {
		state.forEach((val, index) => {
			drawBlock(val, index, step, blockWidth, gapWidth, maxValue);
		});
	});
}

/* ----------------------------- Drawing Helpers ---------------------------- */

function getColorByType(type) {
	if (stepColors) {
		if (type in stepColors) return stepColors[type];
	}

	return "#d1d5db";
}

function calcBlockGapWidth(arrayLength, blockProportion) {
	const gapCount = arrayLength - 1;
	let blockWidth = (canvasWidth / arrayLength) * blockProportion;
	let gapWidth = (canvasWidth / gapCount) * (1 - blockProportion);

	if (gapWidth < 1) {
		blockWidth = blockWidth + gapWidth;
		gapWidth = 0;
	}
	return { blockWidth, gapWidth };
}

const calculateBlockHeight = (value, maxValue) => {
	const maxBlockHeight = canvasHeight - upperBlockMargin;
	const height = (value / maxValue) * maxBlockHeight;
	return height;
};

function displayText(text, x, y) {
	ctx.fillStyle = "#111827";
	ctx.font = labelFont;
	ctx.textAlign = textAlign;
	ctx.fillText(text, x, y);
}

function getBlockDisplayType(step, index) {
	let type = "default";
	if (step) {
		const isActive = step.activeItems?.includes(index);
		const isSelected = step.selected?.some(el => el.index === index);
		if (isSelected) type = "select";
		if (isActive) type = step.type || type;
	}
	return type;
}

/* -------------------------------- Animating ------------------------------- */

function handleAnimate(callback) {
	const startTime = performance.now();

	function frame(now) {
		const shouldRepeat = callback(now, startTime);
		if (shouldRepeat) {
			currentAnimationFrameId = requestAnimationFrame(frame);
		} else {
			currentAnimationFrameId = null;
		}
	}

	currentAnimationFrameId = requestAnimationFrame(frame);
}

function animateDrawArray(
	state,
	step,
	maxValue,
	duration = 500,
	appearStyle = "atOnce" // 'sequence', 'atOnce',
) {
	let output = [];
	if (!state) return output;

	// Calculate block and gap widths proportionally based on canvas size
	let { blockWidth, gapWidth } = calcBlockGapWidth(state.length, blockRatio);

	const onDraw = (val, index, showText) => {
		drawBlock(val, index, step, blockWidth, gapWidth, maxValue, showText);
	};

	const animations = {
		sequence: () => animateInSequence(state, onDraw, duration),
		atOnce: () => animateAtOnce(state, onDraw, duration),
	};

	(animations[appearStyle] || animations.atOnce)();
}

function animateAtOnce(state, onDraw, duration) {
	const onFrame = (now, startTime) => {
		const progress = Math.min((now - startTime) / duration, 1);

		handleDraw(() => {
			const drawEachValue = (val, index) => {
				const animatedVal = val * progress;
				onDraw(animatedVal, index, progress === 1);
			};

			state.forEach(drawEachValue);
		});

		return progress < 1;
	};

	handleAnimate(onFrame);
}
function animateInSequence(state, onDraw, duration) {
	const totalBlocks = state.length;

	const onFrame = (now, startTime) => {
		const elapsed = now - startTime;

		handleDraw(() => {
			const drawEachValue = (val, index) => {
				const delayPerBlock = (duration / totalBlocks) * index;
				const localElapsed = elapsed - delayPerBlock;
				const progress = Math.min(
					Math.max(localElapsed / (duration / totalBlocks), 0),
					1
				);
				const animatedVal = val * progress;
				onDraw(animatedVal, index, progress === 1);
			};
			state.forEach(drawEachValue);
		});

		return elapsed < duration + (duration / totalBlocks) * totalBlocks;
	};

	handleAnimate(onFrame);
}
