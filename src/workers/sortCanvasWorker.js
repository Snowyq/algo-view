import registryApi from "../algorithms/algorithmsRegistryApi";

// Cached variables between WebWorker calls
let AlgorithmClass = null;
let AlgorithmInstance = null;
let ctx = null;
let currStepIndex = null;
let dpr = null;
let stepColors = null;
let enabledStepTypes = [];

/**
 * Updates canvas settings from payload.
 * Can modify block proportions, margin, and text display behavior.
 */
let blockProportion = 1; // 0 - 1
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
		dpr = devicePixelRatio;

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
		const { width, height, devicePixelRatio } = payload;
		dpr = devicePixelRatio;
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

	/* ---------------------------- Load Step Colors ---------------------------- */

	if (type === "load-step-colors") {
		const { stepColors: colors } = payload;
		stepColors = colors;
		postMessage({ type: "colors-loaded" });
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
		const { input, options } = payload;
		AlgorithmInstance = new AlgorithmClass(input, options);
		const stepsLength = AlgorithmInstance.getStepsLength();
		postMessage({ type: "initialized", payload: { stepsLength } });
		return;
	}

	/* ----------------------------- Update Settings ---------------------------- */

	if (type === "settings") {
		const { settings, devicePixelRatio } = payload;
		dpr = devicePixelRatio;
		updateSettings(settings);
		redraw();
		return;
	}

	/* ------------------------ Update Enabled Step Types ----------------------- */

	// if (type === "update-step-types") {
	// 	const { enabledStepTypes, devicePixelRatio } = payload;
	// 	AlgorithmInstance.setEnabledStepTypes(enabledStepTypes, true);
	// 	const stepsLength = AlgorithmInstance.getStepsLength();
	// 	dpr = devicePixelRatio;
	// 	redraw();
	// 	postMessage({ type: "step-types-updated", payload: { stepsLength } });
	// 	return;
	// }

	if (type === "reset-algorithm") {
		const { devicePixelRatio, input, options } = payload;
		dpr = devicePixelRatio;
		AlgorithmInstance = new AlgorithmClass(input, options);
		const stepsLength = AlgorithmInstance.getStepsLength();
		postMessage({ type: "reset-done", payload: { stepsLength } });
	}
};

/* -------------------------------------------------------------------------- */
/*                              Helper Functions                              */
/* -------------------------------------------------------------------------- */

function resize(width, height) {
	if (ctx && ctx.canvas) {
		ctx.canvas.width = width * dpr;
		ctx.canvas.height = height * dpr;
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
		const width = ctx.canvas.width / dpr;
		const height = ctx.canvas.height / dpr;

		ctx.save();
		ctx.scale(dpr, dpr);
		drawArray(state, step, width, height, maxValue);
		ctx.restore();
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
	if (stepColors) {
		if (type in stepColors) return stepColors[type];
	}

	return "#d1d5db";
}

function calcBlockGapWidth(canvasWidth, arrayLength, blockProportion) {
	const gapCount = arrayLength - 1;
	const blockWidth = (canvasWidth / arrayLength) * blockProportion;
	const gapWidth = (canvasWidth / gapCount) * (1 - blockProportion);
	return { blockWidth, gapWidth };
}

function drawArray(state, step, canvasWidth, canvasHeight, maxValue) {
	let output = [];
	if (!ctx || !state) return output;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	// Calculate block and gap widths proportionally based on canvas size
	const arrayLength = state.length;
	let { blockWidth, gapWidth } = calcBlockGapWidth(
		canvasWidth,
		arrayLength,
		blockProportion
	);

	if (gapWidth < 1) {
		blockWidth = blockWidth + gapWidth;
		gapWidth = 0;
	}

	state.forEach((val, index) => {
		// Account for vertical space above each block to fit the text label
		const maxBlockHeight = canvasHeight - upperBlockMargin;
		const height = (val / maxValue) * maxBlockHeight;
		const x = index * (blockWidth + gapWidth);

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
		ctx.fillRect(x, canvasHeight - height, blockWidth, height);

		// Display block value only if its width exceeds the configured threshold
		if (blockWidth >= textDisplayThreshold) {
			ctx.fillStyle = "#111827";
			ctx.font = labelFont;
			ctx.textAlign = textAlign;
			ctx.fillText(val, x + blockWidth / 2, canvasHeight - height - 5);
		}
	});
}
