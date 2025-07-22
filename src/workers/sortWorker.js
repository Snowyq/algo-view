import { getAlgorithmClass } from "../algorithms/algorithmsRegistry";

let AlgorithmClass = null;
let AlgorithmInstance = null;
let algorithmInfo = null;
let ctx = null;

self.onmessage = function (event) {
	const { type, payload, canvas } = event.data;

	if (type === "init-canvas") {
		ctx = canvas.getContext("2d");
		return;
	}

	if (type === "canvas") {
		const stepIndex = payload;
		if (!AlgorithmInstance) return;
		const state = AlgorithmInstance.getStateByStepsIndex(stepIndex);
		const step = AlgorithmInstance.getStepByIndex(payload);
		if (ctx && ctx.canvas) {
			const width = ctx.canvas.width;
			const height = ctx.canvas.height;
			drawArray(state, step, width, height);
		}
		return;
	}

	if (type === "mount") {
		AlgorithmClass = getAlgorithmClass(payload.category, payload.id);
		postMessage({ type: "mounted" });
	}

	if (type === "init") {
		AlgorithmInstance = new AlgorithmClass(payload.input);
		algorithmInfo = AlgorithmInstance.data();
		postMessage({ type: "initialized", info: algorithmInfo });
	}
};

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

function drawArray(state, step, canvasWidth, canvasHeight) {
	if (!ctx || !state) return;
	console.log("drawing");
	ctx.clearRect(0, 0, canvasWidth, canvasHeight);

	const arrayLength = state.length;
	const maxValue = Math.max(...state);
	const blockProportion = 1;
	const totalGapCount = arrayLength - 1;
	const blockWidthPx = (canvasWidth / arrayLength) * blockProportion;
	const gapWidthPx = (canvasWidth / totalGapCount) * (1 - blockProportion);

	state.forEach((val, index) => {
		const maxBlockHeight = canvasHeight - 15;
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

// try {
// 	if (type === "mount") {
// 		AlgorithmClass = getAlgorithmClass(payload.category, payload.id);
// 		postMessage({ type: "mounted" });
// 	} else if (type === "init") {
// 		AlgorithmInstance = new AlgorithmClass(payload.input);
// 		algorithmInfo = AlgorithmInstance.data();
// 		postMessage({ type: "initialized", info: algorithmInfo });
// 	} else if (!AlgorithmInstance) {
// 		postMessage({
// 			type: "error",
// 			message: "Algorithm not initialized",
// 		});
// 	} else if (type === "state") {
// 		const state = AlgorithmInstance.getStateByStepsIndex(payload);
// 		postMessage({ type: "state", data: state, info: algorithmInfo });
// 	} else if (type === "step") {
// 		const step = AlgorithmInstance.getStepByIndex(payload);
// 		postMessage({ type: "step", data: step, info: algorithmInfo });
// 	} else if (type === "stepsLength") {
// 		const length = AlgorithmInstance.getStepsLength();
// 		postMessage({
// 			type: "stepsLength",
// 			data: length,
// 			info: algorithmInfo,
// 		});
// 	} else if (type === "maxValue") {
// 		const max = AlgorithmInstance.getArrayMinMax().max;
// 		postMessage({ type: "maxValue", data: max, info: algorithmInfo });
// 	} else if (type === "minValue") {
// 		const min = AlgorithmInstance.getArrayMinMax().min;
// 		postMessage({ type: "minValue", data: min, info: algorithmInfo });
// 	}
// } catch (error) {
// 	postMessage({ type: "error", message: error.message });
// }
