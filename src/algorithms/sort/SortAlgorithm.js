import { Algorithm } from "../Algorithm";

export class SortAlgorithm extends Algorithm {
	name;
	complexity;
	operations = [];
	options = {
		steps: {
			check: true,
			"check-true": true,
			"check-false": true,
			swap: true,
			select: true,
			finish: true,
		},
	};

	constructor() {
		super();
		this.init();
	}

	init() {
		this.changeStepsOptions({
			// check: false,
		});
	}

	resetSteps() {
		this.operations = [];
		this.steps = [];
		this.createSteps();
	}

	changeStepsOptions(newOptions) {
		this.changeOptions(newOptions, "steps");
	}

	getStepOption(key) {
		return this.stepOptions[key];
	}

	use() {
		return {
			steps: this.getSteps(),
			operations: this.getOperations(),
			name: this.name,
			complexity: this.complexity,
		};
	}

	createStep(step) {
		if (this.getStepOption(step.type)) {
			this.steps.push(step);
		}
	}

	createOperation(type, elements) {
		this.operations.push({ type, elements });
		return this.operations.length - 1;
	}

	swap(index1, index2) {
		const activeItems = [index1, index2];
		const actionType = "swap";
		const operationId = this.createOperation(actionType, activeItems);
		// [arr[index1], arr[index2]] = [arr[index2], arr[index1]];
		this.createStep({ type: actionType, activeItems, operationId });
	}

	check(index1, operator, index2, arr) {
		const activeItems = [index1, index2];
		this.createStep({ type: "check", activeItems, operator });

		// Create step for result of comparison
		const isTrue = this.compare(arr[index1], arr[index2], operator);
		if (isTrue) this.createStep({ type: "check-true", activeItems });
		else this.createStep({ type: "check-false", activeItems });

		// return Result of comparison for use in if statement
		return isTrue;
	}

	select(index) {
		this.createStep({ type: "select", activeItems: [index] });
	}

	createSteps() {
		const dir = this.direction;
		const arr = this.getArray();
		this.sort(arr, dir);
		this.createStep({
			type: "finish",
			activeItems: Array.from({ length: arr.length }, (_, i) => i),
		});
	}

	getOperationIdByStepIndex(stepIndex) {
		const steps = this.getSteps();
		// From given state find closest prev state with assigned operationId
		for (let i = stepIndex; i >= 0; i--) {
			const step = steps[i];
			if (!isNaN(step.operationId)) {
				return step.operationId;
			}
		}
	}

	makeOperation(operation, state) {
		if (operation.type === "swap") {
			const [index1, index2] = operation.elements;
			[state[index1], state[index2]] = [state[index2], state[index1]];
		}
	}

	getStateByOperationId(operationId) {
		let state = this.getArray();
		if (isNaN(operationId)) return state;
		const operations = this.getOperations();

		// Restore state by prev operationId and calculate state from that
		const cacheValue = this.getCache("state", operationId - 1);
		if (!isNaN(cacheValue)) {
			state = cacheValue;
			const operation = operations[operationId];
			return this.makeOperation(operation, state);
		}

		// Calculate state from scratch
		let counter = 0;
		while (counter <= operationId) {
			const operation = operations[counter];
			this.makeOperation(operation, state);
			this.addCache("state", operationId, state);
			counter++;
		}

		return state;
	}

	getStateByStepsIndex(stepIndex) {
		const operationId = this.getOperationIdByStepIndex(stepIndex);
		return this.getStateByOperationId(operationId);
	}

	sort() {}

	getArray() {
		return this.array.slice();
	}
}
