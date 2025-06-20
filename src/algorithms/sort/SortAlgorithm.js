import { Algorithm } from "../Algorithm";

export class SortAlgorithm extends Algorithm {
	name;
	complexity;
	operations = [];
	stepOptions = {
		check: true,
		"check-true": true,
		"check-false": true,
		swap: true,
		select: true,
		finish: true,
	};
	constructor(array, direction) {
		super();
		this.array = array.slice();
		this.direction = direction;
	}

	resetSteps() {
		this.operations = [];
		this.steps = [];
		this.createSteps();
	}

	setStepOptions(options) {
		for (let key in options) {
			if (Object.keys(this.stepOptions).includes(key)) {
				this.stepOptions[key] = options[key];
			}
		}
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
		console.log(step.type);
		if (this.getStepOption(step.type)) {
			this.steps.push(step);
			console.log("yes");
		}
	}

	createOperation(type, elements) {
		this.operations.push({ type, elements });
		return this.operations.length - 1;
	}

	swap(index1, index2, arr) {
		const activeItems = [index1, index2];
		const actionType = "swap";
		const operationId = this.createOperation(actionType, [index1, index2]);
		[arr[index1], arr[index2]] = [arr[index2], arr[index1]];
		this.createStep({ type: actionType, activeItems, operationId });
	}

	check(index1, operator, index2, arr) {
		const activeItems = [index1, index2];
		this.createStep({ type: "check", activeItems, operator });

		const a = arr[index1];
		const b = arr[index2];
		function checkEq(a, b, operator) {
			switch (operator) {
				case ">":
					return a > b;
				case "<":
					return a < b;
				case ">=":
					return a >= b;
				case "<=":
					return a <= b;
				case "==":
					return a == b;
				case "===":
					return a === b;
				case "!=":
					return a != b;
				case "!==":
					return a !== b;
				default:
					throw new Error(`wrong operator: ${operator}`);
			}
		}

		const isEqual = checkEq(a, b, operator);
		if (isEqual) {
			const type = "check-true";
			this.createStep({ type, activeItems });
		} else {
			const type = "check-false";
			this.createStep({ type, activeItems });
		}
		return isEqual;
	}

	select(index, arr) {
		const activeItems = [index];
		this.createStep({ type: "select", activeItems });
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
		for (let i = stepIndex; i >= 0; i--) {
			const step = steps[i];
			if (!isNaN(step.operationId)) {
				return step.operationId;
			}
		}
	}

	getStateByOperationId(operationId) {
		const makeOperation = (operation, state) => {
			if (operation.type === "swap") {
				const [index1, index2] = operation.elements;
				[state[index1], state[index2]] = [state[index2], state[index1]];
			}
		};

		let state = this.getArray();
		const operations = this.getOperations();
		if (isNaN(operationId)) return state;

		const cacheValue = this.getCache("state", operationId - 1);
		if (!isNaN(cacheValue)) {
			state = cacheValue;
			const operation = operations[operationId];
			return makeOperation(operation, state);
		}

		let counter = 0;
		while (counter <= operationId) {
			const operation = operations[counter];
			makeOperation(operation, state);
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
