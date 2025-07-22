import { getAlgorithmClass } from "../algorithms/algorithmsRegistry";

let AlgorithmClass = null;
let AlgorithmInstance = null;
let ctx = null;
let currStepIndex = null;

let blockProportion = 1; // 0 - 1
let upperBlockMargin = 15; // px

self.onmessage = function (event) {
	const { type, payload, canvas } = event.data;

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

		currStepIndex = stepIndex;

		draw(stepIndex);
		postMessage({ type: "ready" });
		return;
	}

	if (type === "resize") {
		const { width, height } = payload;

		if (ctx && ctx.canvas) {
			ctx.canvas.width = width;
			ctx.canvas.height = height;
		}

		redraw();
		return;
	}

	if (type === "init-canvas") {
		ctx = canvas.getContext("2d");
		postMessage({ type: "canvas-initialized" });
		return;
	}

	if (type === "mount") {
		AlgorithmClass = getAlgorithmClass("sort", payload.id);
		postMessage({ type: "mounted" });
		return;
	}

	if (type === "init") {
		AlgorithmInstance = new AlgorithmClass(payload.input);
		postMessage({ type: "initialized" });
		return;
	}

	if (type === "settings") {
		updateSettings(payload);
		redraw();
		return;
	}
};

function redraw() {
	if (currStepIndex && !isNaN(currStepIndex)) {
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
	} = payload;
	if (blockProportionValue) blockProportion = blockProportionValue;
	if (upperBlockMarginValue) upperBlockMargin = upperBlockMarginValue;
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

function drawArray(state, step, canvasWidth, canvasHeight, maxValue) {
	if (!ctx || !state) return;

	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	const arrayLength = state.length;
	const totalGapCount = arrayLength - 1;
	const blockWidthPx = (canvasWidth / arrayLength) * blockProportion;
	const gapWidthPx = (canvasWidth / totalGapCount) * (1 - blockProportion);

	state.forEach((val, index) => {
		const maxBlockHeight = canvasHeight - upperBlockMargin;
		const heightPx = (val / maxValue) * maxBlockHeight;
		const x = index * (blockWidthPx + gapWidthPx);

		let type = "default";
		if (step) {
			const isActive = step.activeItems?.includes(index);
			const isSelected = step.selected?.some(el => el.index === index);
			if (isSelected) type = "select";
			if (isActive) type = step.type || type;
		}

		ctx.fillStyle = getColorByType(type);
		ctx.fillRect(x, canvasHeight - heightPx, blockWidthPx, heightPx);

		if (blockWidthPx > 10) {
			ctx.fillStyle = "#111827";
			ctx.font = "10px sans-serif";
			ctx.textAlign = "center";
			ctx.fillText(
				val,
				x + blockWidthPx / 2,
				canvasHeight - heightPx - 5
			);
		}
	});
}
