import registryApi from "../algorithms/algorithmsRegistryApi";

// Cached variables between WebWorker calls
let AlgorithmClass = null;
let AlgorithmInstance = null;
let ctx = null;
let currStepIndex = null;

/**
 * Updates canvas settings from payload.
 * Can modify block proportions, margin, and text display behavior.
 */
let blockProportion = 1; // 0 - 1
let upperBlockMargin = 15; // px
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
		const { stepIndex } = payload;
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
		postMessage({ type: "ready" });
		return;
	}

	/* ------------------------------ Resize Canvas ----------------------------- */
	if (type === "resize") {
		const { width, height } = payload;
		resize(width, height);
		redraw();
		postMessage({ type: "resized" });
		return;
	}

	/* ---------------------------- Initialize Canvas --------------------------- */
	if (type === "init-canvas") {
		ctx = canvas.getContext("2d");
		postMessage({ type: "canvas-initialized" });
		return;
	}

	/* -------------------------- Find Algorithm Class -------------------------- */
	if (type === "mount") {
		AlgorithmClass = registryApi.getAlgorithmClass("sort", payload.id);
		postMessage({ type: "mounted" });
		return;
	}

	/* -------------------------- Initialize Algorithm -------------------------- */
	if (type === "init") {
		AlgorithmInstance = new AlgorithmClass(payload.input);
		postMessage({ type: "initialized" });
		return;
	}

	/* ----------------------------- Update Settings ---------------------------- */
	if (type === "settings") {
		updateSettings(payload);
		redraw();
		return;
	}
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function resize(width, height) {
	if (ctx && ctx.canvas) {
		ctx.canvas.width = width;
		ctx.canvas.height = height;
	}
}

function redraw() {
	if (!isNaN(currStepIndex)) {
		draw(currStepIndex);
	}
}

function draw(stepIndex) {
	const state = AlgorithmInstance.getStateByStepsIndex(stepIndex);
	const step = AlgorithmInstance.getStepByIndex(stepIndex);
	const maxValue = AlgorithmInstance.getArrayMinMax().max;
	if (ctx && ctx.canvas) {
		const width = ctx.canvas.width;
		const height = ctx.canvas.height;
		drawArray(state, step, width, height, maxValue);
	}
}

function updateSettings(payload) {
	const {
		blockProportion: blockProportionValue,
		upperBlockMargin: upperBlockMarginValue,
		textDisplayThreshold: textDisplayThresholdValue,
	} = payload;
	if (blockProportionValue) blockProportion = blockProportionValue;
	if (upperBlockMarginValue) upperBlockMargin = upperBlockMarginValue;
	if (textDisplayThresholdValue)
		textDisplayThreshold = textDisplayThresholdValue;
}

function getColorByType(type) {
	switch (type) {
		case "swap":
			return "#60a5fa";
		case "select":
			return "#f472b6";
		case "check":
			return "#facc15";
		case "finish":
			return "#22d3ee";
		case "check-false":
			return "#f87171";
		case "check-true":
			return "#34d399";
		default:
			return "#d1d5db";
	}
}

function calcBlockGapWidthPx(canvasWidth, arrayLength, blockProportion) {
	const gapCount = arrayLength - 1;
	const blockWidthPx = (canvasWidth / arrayLength) * blockProportion;
	const gapWidthPx = (canvasWidth / gapCount) * (1 - blockProportion);
	return { blockWidthPx, gapWidthPx };
}

function drawArray(state, step, canvasWidth, canvasHeight, maxValue) {
	if (!ctx || !state) return;
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// Calculate block and gap widths proportionally based on canvas size
	const arrayLength = state.length;
	let { blockWidthPx, gapWidthPx } = calcBlockGapWidthPx(
		canvasWidth,
		arrayLength,
		blockProportion
	);

	if (gapWidthPx < 1) {
		blockWidthPx = blockWidthPx + gapWidthPx;
		gapWidthPx = 0;
	}

	state.forEach((val, index) => {
		// Account for vertical space above each block to fit the text label
		const maxBlockHeight = canvasHeight - upperBlockMargin;
		const heightPx = (val / maxValue) * maxBlockHeight;
		const x = index * (blockWidthPx + gapWidthPx);

		// Determine the step type to apply corresponding highlight styles
		let type = "default";
		if (step) {
			const isActive = step.activeItems?.includes(index);
			const isSelected = step.selected?.some(el => el.index === index);
			if (isSelected) type = "select";
			if (isActive) type = step.type || type;
		}

		// Apply fill style based on step type
		ctx.fillStyle = getColorByType(type);
		ctx.fillRect(x, canvasHeight - heightPx, blockWidthPx, heightPx);

		// Display block value only if its width exceeds the configured threshold
		if (blockWidthPx >= textDisplayThreshold) {
			ctx.fillStyle = "#111827";
			ctx.font = labelFont;
			ctx.textAlign = textAlign;
			ctx.fillText(
				val,
				x + blockWidthPx / 2,
				canvasHeight - heightPx - 5
			);
		}
	});
}
