import { Algorithm } from "../Algorithm";

export class SortAlgorithm extends Algorithm {
	name;
	complexity;
	MAX_GROUP_CACHE_SIZE = 20;
	operations = [];
	options = {
		steps: {
			types: {
				check: true,
				"check-true": true,
				"check-false": true,
				swap: true,
				select: true,
				finish: true,
			},
		},
	};

	constructor(array) {
		super();
		this.array = array;
		this.init();
	}

	init() {
		this.createSteps();
	}

	reset() {
		this.operations = [];
		this.steps = [];
		this.createSteps();
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
		if (this.withOptions("steps").get("types")[step.type]) {
			this.steps.push(step);
		}
	}

	getSteps() {
		return this.steps.slice();
	}

	getStepByIndex(index) {
		const steps = this.getSteps();
		if (steps) return steps[index];
	}

	createOperation(type, elements) {
		this.operations.push({ type, elements });
		return this.operations.length - 1;
	}

	swap(index1, index2, arr) {
		const activeItems = [index1, index2];
		const actionType = "swap";
		const operationId = this.createOperation(actionType, activeItems);
		[arr[index1], arr[index2]] = [arr[index2], arr[index1]];
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
		this.createPersistentCache(
			"state",
			this.getArray(),
			this.operations.slice(),
			{
				totalCacheSize: 1000,
			}
		);
	}

	getResult() {
		return this.resultArray.slice();
	}

	getArrayMinMax() {
		if (this.arrayMin && this.arrayMax) {
			return {
				min: this.arrayMin,
				max: this.arrayMax,
			};
		} else {
			return {
				min: Math.min(this.array),
				max: Math.max(this.array),
			};
		}
	}

	getOperationIdByStepIndex(stepIndex) {
		const steps = this.getSteps();
		// From given state find closest prev state with assigned operationId
		for (let i = stepIndex; i > 0; i--) {
			const step = steps[i];
			if (!isNaN(step.operationId)) {
				return step.operationId;
			}
		}
	}

	getStateByOperationId(operationId) {
		let state = this.getArray();
		let stateId = 0;
		if (isNaN(operationId)) return state;
		const operations = this.getOperations();

		// Restore state by prev operationId and calculate state from that
		// const cacheValue = this.getCache("state", this);
		// if (!isNaN(cacheValue)) {
		// 	console.log("usedCached");
		// 	state = cacheValue;
		// 	const operation = operations[operationId];
		// 	this.addCache("state", operationId, state);
		// 	this.makeOperation(operation, state);
		// 	return state;
		// }
		// console.log("initial:", state);
		const closestState = this.getClosestCache("state", operationId);
		if (closestState) {
			state = closestState.item.slice();
			stateId = closestState.key;
			// console.log("=================================");
			// console.log("cached", operationId, "->", stateId, state);
			// console.log("=================================");
		}
		if (stateId === operationId) return state;

		if (stateId > operationId) {
			let counter = stateId;
			while (counter > operationId) {
				counter--;
				const operation = operations[counter];
				// console.log("-----------------------------");
				// console.log(operationId, counter, operation);
				// console.log("before", state);
				this.makeOperation(operation, state);
				// console.log("after", state);
				// console.log("-----------------------------");
			}
		} else if (stateId < operationId) {
			let counter = stateId;
			while (counter < operationId) {
				counter++;
				const operation = operations[counter];
				// console.log("-----------------------------");
				// console.log(operationId, counter, operation);
				// console.log("before", state);
				this.makeOperation(operation, state);
				// console.log("after", state);
				// console.log("-----------------------------");
			}
		}
		// console.log("\\\\\\\\\\\\\\\\\\");
		// console.log("end", state);
		// console.log("\\\\\\\\\\\\\\\\\\");
		return state;
	}

	makeOperation(operation, state) {
		if (operation.type === "swap") {
			const [index1, index2] = operation.elements;
			[state[index1], state[index2]] = [state[index2], state[index1]];
		}
	}

	getStateByStepsIndex(stepIndex) {
		const operationId = this.getOperationIdByStepIndex(stepIndex);
		return this.getStateByOperationId(operationId);
	}

	getArrayLength() {
		return this.array.length;
	}

	sort() {}

	getArray() {
		return this.array.slice();
	}
}
