import { clamp } from "../../utils/values";
import { Algorithm } from "../Algorithm";
import { CacheManager } from "../CacheManager";
import { OptionsManager } from "../OptionsManager";

export const sortStepTypes = [
	"initial",
	"check",
	"check-true",
	"check-false",
	"check-value",
	"check-value-true",
	"check-value-false",
	"swap",
	"copy",
	"select",
	"finish",
	"assign",
];

export class SortAlgorithm extends Algorithm {
	optionsManager;
	cacheManager;
	name;
	complexity;
	MAX_GROUP_CACHE_SIZE = 20;
	operations = [];
	selected = [];

	shouldCountSubArrays = false;
	shouldCountArrayAccess = false;
	metrics = {};

	stepTypes = {
		enabled: [],
		available: [],
	};

	constructor(array, options) {
		super();
		this.array = array;
		this.cacheManager = new CacheManager(this.cache);
		this.init(options);
	}

	init(options) {
		this.setEnabledStepTypes(options?.stepTypes);
		this.createSteps();
	}

	reset() {
		this.selected = [];
		this.operations = [];
		this.steps = [];
		this.createSteps();
	}

	changeInput(array) {
		this.array = array;
		this.reset();
	}

	use() {
		return {
			steps: this.getSteps(),
			operations: this.getOperations(),
			array: this.getArray(),
			minValue: this.getArrayMinMax().min,
			maxValue: this.getArrayMinMax().max,
			name: this.name,
			complexity: this.complexity,
		};
	}

	data() {
		return this.use();
	}

	setEnabledStepTypes(types, shouldReset = false) {
		if (Array.isArray(types)) {
			this.stepTypes.enabled = types.slice();
		} else {
			this.stepTypes.enabled = sortStepTypes.slice();
		}

		if (shouldReset) {
			this.reset();
		}
	}

	addStepTypeToAvailableTypes(type) {
		if (!this.stepTypes.available.includes(type)) {
			this.stepTypes.available.push(type);
		}
	}

	isStepTypeEnabled(type) {
		return this.stepTypes.enabled.includes(type);
	}

	createStep(step) {
		this.addStepTypeToAvailableTypes(step.type);
		if (!this.isStepTypeEnabled(step.type)) return;
		this.assignPrevOperationIdToStep(step);

		const metrics = this.createStepMetrics();

		// finally destructure step into steps creating new object
		this.steps.push({
			...step,
			metrics,
			selected: this.selected.slice(),
		});
	}

	assignPrevOperationIdToStep(step) {
		if (!("operationId" in step)) {
			if (this.operations.length > 0) {
				step.prevOperationId = this.operations.length - 1;
			}
		}
	}

	createStepMetrics() {
		const metrics = {};
		for (const key in this.metrics) {
			metrics[key] = {
				count: this.metrics[key].count,
				name: this.metrics[key].name,
			};
		}

		return metrics;
	}

	getSteps() {
		console.log(this.steps);
		return this.steps.slice();
	}

	getStepByIndex(index) {
		const steps = this.getSteps();
		const stepIndex = clamp(index, 0, steps.length - 1);
		const step = steps[stepIndex];
		return step;
	}

	createOperation(type, elements, payload) {
		this.operations.push({ type, elements, payload });
		return this.operations.length - 1;
	}

	/* -------------------------------------------------------------------------- */
	/*                                 Step Types                                 */
	/* -------------------------------------------------------------------------- */

	assign(targetIndex, item, arr, options) {
		// operation details
		const type = "assign";
		const instructionId = options?.instructionId;
		const payload = item;
		const activeItems = [targetIndex];

		this.count(type, "assignments");

		// Creates and executes an operation. Saves its id and assigns it to step
		const operationId = this.createOperation(type, activeItems, payload);
		this.makeOperation({ type, elements: [targetIndex], payload }, arr);

		// creates step
		this.createStep({
			type,
			activeItems,
			instructionId,
			operationId,
		});
	}

	copy(targetIndex, copiedIndex, arr, options) {
		// operation details
		const type = "copy";
		const instructionId = options?.instructionId;
		const payload = arr[copiedIndex];
		const activeItems = [targetIndex, copiedIndex];

		this.count(type, "copies");

		// Creates and executes an operation. Saves its id and assigns it to step
		const operationId = this.createOperation(type, activeItems, payload);
		this.makeOperation({ type, elements: activeItems }, arr);

		// creates step
		this.createStep({
			type,
			activeItems,
			instructionId,
			operationId,
		});
	}

	swap(index1, index2, arr, options) {
		// Operation Details
		const type = "swap";
		const activeItems = [index1, index2];
		const instructionId = options?.instructionId;

		this.count(type, "swaps");

		// saves and executes operation
		const operationId = this.createOperation(type, activeItems);
		this.makeOperation({ type, elements: activeItems }, arr);

		// creates step and binding operation id with it
		this.createStep({
			type,
			activeItems,
			operationId,
			instructionId,
		});
	}

	checkWithValue(index, operator, value, arr, options) {
		// Operation Details
		const type = "check-value";
		const activeItems = [index];
		const payload = value;
		const instructionId = options?.instructionId;

		// creates check step
		this.createStep({
			type,
			activeItems,
			operator,
			payload,
			instructionId,
		});

		// creates additional step based on result of comparison
		const result = this.compare(arr[index], value, operator);

		if (result) {
			this.createStep({
				type: "check-value-true",
				activeItems,
				payload,
				instructionId,
			});
		} else {
			this.createStep({
				type: "check-value-false",
				activeItems,
				payload,
				instructionId,
			});
		}

		// return result for easier sort method creation
		return result;
	}

	check(index1, operator, index2, arr, options) {
		// Operation Details
		const type = "check";
		const activeItems = [index1, index2];
		const instructionId = options?.instructionId;

		// creates check step
		this.createStep({
			type,
			activeItems,
			operator,
			instructionId,
		});

		// creates additional step based on result of comparison
		const result = this.compare(arr[index1], arr[index2], operator);

		if (result) {
			this.createStep({ type: "check-true", activeItems, instructionId });
		} else {
			this.createStep({
				type: "check-false",
				activeItems,
				instructionId,
			});
		}

		// return result for easier sort method creation
		return result;
	}

	select(index, options) {
		// Operation details
		const type = "select";
		const activeItems = [index];

		// handles perm selection
		if (options && options.mode === "perm") {
			this.selected = this.selected.filter(el => el.id !== options.id);
			this.selected.push({ id: options.id, index });
		}

		// creates step
		this.createStep({ type, activeItems });
	}

	unSelect(id) {
		this.selected = this.selected.filter(el => el.id !== id);
	}

	selectMany(selects) {
		selects.forEach(sel => {
			if (sel.options && sel.options.mode === "perm") {
				this.selected = this.selected.filter(
					el => el.id !== sel.options.id
				);
				this.selected.push({ id: sel.options.id, index: sel.index });
			}
		});
		this.createStep({
			type: "select",
			activeItems: selects.map(sel => sel.index),
			instructionId: [
				...new Set(
					selects.map(sel => sel.options?.instructionId).flat()
				),
			],
		});
	}

	/* -------------------------------------------------------------------------- */
	/*                                   Metrics                                  */
	/* -------------------------------------------------------------------------- */

	countArrayAccess(count = 1) {
		this.count("arrayAccess", "Array Accesses", count);
	}

	countSubArrays(count = 1) {
		this.count("subArrays", "Sub Arrays", count);
	}

	countConditionChecks(count = 1) {
		this.count("conditionChecks", "Condition Checks", count);
	}

	countRecursiveCalls(count = 1) {
		this.count("recursiveCalls", "Recursive Calls", count);
	}

	count(id, name, count = 1) {
		if (!(id in this.metrics)) {
			this.metrics[id] = { count, name: name ? name : id };
		} else {
			this.metrics[id].count = this.metrics[id].count + count;
		}
	}

	createSteps() {
		const dir = this.direction;
		const arr = this.getArray();

		this.createStep({
			type: "initial",
			activeItems: [],
		});
		this.sort(arr, dir);
		this.createStep({
			type: "finish",
			activeItems: Array.from({ length: arr.length }, (_, i) => i),
		});
		this.cacheManager
			.initGroup("state")
			.createPersistentCache(
				"state",
				this.getArray(),
				this.getOperations(),
				this.makeOperation
			);
	}

	getResult() {
		return this.resultArray.slice();
	}

	#calcArrayMinMax() {
		const arr = this.getArray();
		this.minValue = Math.min(...arr);
		this.maxValue = Math.max(...arr);
	}

	getArrayMinMax() {
		if (isNaN(this.minValue) || isNaN(this.maxValue)) {
			this.#calcArrayMinMax();
		}
		return { min: this.minValue, max: this.maxValue };
	}

	getOperationIdByStepIndex(index) {
		const steps = this.getSteps();
		if (!steps || steps.length === 0) return;
		const stepIndex = clamp(index, 0, steps.length - 1);

		if (steps[stepIndex].prevOperationId) {
			return steps[stepIndex].prevOperationId;
		}

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
		const closestState = this.cacheManager.getClosest("state", operationId);
		if (closestState) {
			state = closestState.item.slice();
			stateId = closestState.key;
		}
		if (stateId === operationId) return state;

		if (stateId > operationId) {
			let counter = stateId + 1;
			while (counter - 1 > operationId) {
				counter--;
				const operation = operations[counter];
				this.makeOperation(operation, state);
			}
		} else if (stateId < operationId) {
			let counter = stateId;
			while (counter < operationId) {
				counter++;
				const operation = operations[counter];
				this.makeOperation(operation, state);
			}
		}
		return state;
	}

	makeOperation(operation, state) {
		if (operation.type === "swap") {
			const [index1, index2] = operation.elements;
			[state[index1], state[index2]] = [state[index2], state[index1]];
		}
		if (operation.type === "assign") {
			const [targetIndex] = operation.elements;
			state[targetIndex] = operation.payload;
		}

		if (operation.type === "copy") {
			const [targetIndex, copiedIndex] = operation.elements;
			state[targetIndex] = state[copiedIndex];
		}
	}

	getStateByStepsIndex(stepIndex) {
		const operationId = this.getOperationIdByStepIndex(stepIndex);
		const state = this.getStateByOperationId(operationId);
		return state;
	}

	getArrayLength() {
		return this.array.length;
	}

	getArray() {
		return this.array.slice();
	}

	sort() {}

	static getInstructions() {}
}

// assignMany(assignArray, arr) {
// 		const type = "assign";
// 		let id;
// 		let instructionId = [];
// 		let finalActiveItems = [];
// 		assignArray.forEach(assign => {
// 			// operation details
// 			const targetIndex = assign.targetIndex;
// 			const itemType = assign.options?.itemType ?? "value"; // value or index
// 			let instruction = assign.options?.instructionId;
// 			if (instruction) instructionId.push(instruction);
// 			// Handling item type
// 			let payload, activeItems;
// 			if (itemType === "index") {
// 				payload = arr[assign.item];
// 				activeItems = [targetIndex, assign.item];
// 			} else if (itemType === "value") {
// 				payload = assign.item;
// 				activeItems = [targetIndex];
// 			}

// 			finalActiveItems = finalActiveItems.concat(
// 				finalActiveItems,
// 				activeItems
// 			);
// 			// Creates and executes an operation. Saves its id and assigns it to step
// 			id = this.createOperation(type, activeItems, payload);
// 			this.makeOperation({ type, elements: [targetIndex], payload }, arr);
// 		});

// 		this.createStep({
// 			type,
// 			activeItems: finalActiveItems,
// 			instructionId,
// 			operationId: id,
// 		});
// 	}
