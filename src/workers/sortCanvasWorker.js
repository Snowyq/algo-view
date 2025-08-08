import registryApi from "../algorithms/algorithmsRegistryApi";

// Cached variables between WebWorker calls
let AlgorithmClass = null;
let AlgorithmInstance = null;
let ctx = null;
let currStepIndex = null;
let dpr = null;
let stepColors = null;
let doFirstRender = true;
let animationIntervalId;

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

self.onmessage = function (event) {
	const { type, payload, canvas } = event.data;

	/* -------------------------------------------------------------------------- */
	/*                                 Event Types                                */
	/* -------------------------------------------------------------------------- */

	/* ------------------------------- Draw Canvas ------------------------------ */

	if (type === "draw-canvas") {
		const { stepIndex, devicePixelRatio } = payload;

		adjustSize(null, null, devicePixelRatio);

		if (!AlgorithmInstance || isNaN(stepIndex)) {
			postMessage({
				type: "error",
				message: !AlgorithmInstance
					? "Cannot draw canvas: Algorithm instance not initialized"
					: "Cannot draw canvas: stepIndex not set",
			});
			return;
		}

		currStepIndex = stepIndex; // saving stepIndex for refreshing purposes

		draw(stepIndex);

		postMessage({ type: "draw-done" });
		return;
	}

	/* ------------------------------ Resize Canvas ----------------------------- */

	if (type === "resize") {
		const { width, height, devicePixelRatio } = payload;
		if (shouldResize(width, height, devicePixelRatio)) {
			resize(width, height, devicePixelRatio);
			redraw();
		}
		postMessage({ type: "resized" });
		return;
	}

	/* ---------------------------- Initialize Canvas --------------------------- */

	if (type === "init-canvas") {
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
		const Class = findAlgorithmClass("sort", payload.id);
		mountAlgorithmClass(Class);
		postMessage({ type: "mounted" });
		return;
	}

	/* ---------------------------- Render Algorithm ---------------------------- */

	if (type === "render-algorithm") {
		console.log("render");
		const { devicePixelRatio, input, options, rect } = payload;
		adjustSize(rect.width, rect.height, devicePixelRatio);

		doFirstRender = true;
		createAlgorithmInstance(input, options);
		const stepsLength = getAlgorithmStepsLength();

		postMessage({ type: "render-done", payload: { stepsLength } });
	}

	/* ----------------------------- Update Settings ---------------------------- */

	if (type === "settings") {
		console.log("settings");
		const { settings, devicePixelRatio } = payload;
		updateDevicePixelRatio(devicePixelRatio);
		updateSettings(settings);
		redraw();
		postMessage({ type: "settings-updated" });
		return;
	}
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function shouldResize(width, height, devicePixelRatio) {
	if (width !== canvasWidth || height !== canvasHeight) return true;
	if (devicePixelRatio && dpr !== devicePixelRatio) return true;
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

function updateDevicePixelRatio(newDpr) {
	if (!newDpr) return;
	dpr = newDpr;
}

function adjustSize(width, height, devicePixelRatio) {
	if (shouldResize(width, height, devicePixelRatio)) {
		resize(width, height, devicePixelRatio);
	}
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

function redraw() {
	if (!isNaN(currStepIndex)) {
		draw(currStepIndex);
	}
}

function draw(stepIndex) {
	if (!AlgorithmInstance) return;

	const state = AlgorithmInstance.getStateByStepsIndex(stepIndex);
	const step = AlgorithmInstance.getStepByIndex(stepIndex);
	const maxValue = AlgorithmInstance.getArrayMinMax().max;

	handleDraw(() => {
		console.log("draw");
		if (doFirstRender) {
			animateDrawArray(state, step, maxValue);
			doFirstRender = false;
		} else {
			drawArray(state, step, maxValue);
		}
	});
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

function handleDraw(callback) {
	if (!ctx || !ctx.canvas) return;
	if (!dpr) updateDevicePixelRatio(1);

	ctx.save();

	ctx.scale(dpr, dpr);
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	callback();

	ctx.restore();
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

function drawBlock(val, index, step, blockWidth, gapWidth, maxValue) {
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
	if (blockWidth >= textDisplayThreshold) {
		displayText(val, x + blockWidth / 2, y - 5);
	}
}

function drawArray(state, step, maxValue) {
	let output = [];
	if (!state) return output;

	// Calculate block and gap widths proportionally based on canvas size
	let { blockWidth, gapWidth } = calcBlockGapWidth(state.length, blockRatio);

	const drawEachValue = (val, index) => {
		drawBlock(val, index, step, blockWidth, gapWidth, maxValue);
	};

	state.forEach(drawEachValue);
}

function animateDrawArray(
	state,
	step,
	maxValue,
	duration = 1500,
	appearInSameTime = false
) {
	let output = [];
	if (!state) return output;

	// Calculate block and gap widths proportionally based on canvas size
	let { blockWidth, gapWidth } = calcBlockGapWidth(state.length, blockRatio);

	const onDraw = (val, index) => {
		drawBlock(val, index, step, blockWidth, gapWidth, maxValue);
	};

	if (appearInSameTime) {
		animateAtOnce(state, onDraw, duration);
	} else {
		animateInSequence(state, onDraw, duration);
	}
}

function handleAnimate(callback) {
	const startTime = performance.now();

	function frame(now) {
		const shouldRepeat = callback(now, startTime);
		if (shouldRepeat) requestAnimationFrame(frame);
	}

	requestAnimationFrame(frame);
}

function animateAtOnce(state, onDraw, duration) {
	const onFrame = (now, startTime) => {
		const progress = Math.min((now - startTime) / duration, 1);

		handleDraw(() => {
			const drawEachValue = (val, index) => {
				const animatedVal = val * progress;
				onDraw(animatedVal, index);
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
				onDraw(animatedVal, index);
			};
			state.forEach(drawEachValue);
		});

		return elapsed < duration + (duration / totalBlocks) * totalBlocks;
	};

	handleAnimate(onFrame);
}
