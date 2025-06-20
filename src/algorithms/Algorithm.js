export class Algorithm {
	steps = [];
	input;
	state;
	operations = [];

	cache = {
		logs: {},
		groups: {},
	};

	constructor(input) {
		this.input = input;
	}

	getSteps() {
		return this.steps.slice();
	}

	getOperations() {
		return this.operations.slice();
	}

	updateOperations(func) {
		if (typeof func !== "function") {
			throw new TypeError("setSteps expects a function");
		}
		this.operations = func(this.operations.slice());
	}

	updateSteps(func) {
		if (typeof func !== "function") {
			throw new TypeError("setSteps expects a function");
		}
		this.steps = func(this.steps.slice());
	}

	addCache(group, key, item) {
		if (!this.cache.logs[group]) {
			this.cache.logs[group] = [];
		}
		if (!this.cache.logs[group].includes(key)) {
			this.cache.logs[group].push(key);
		}

		if (!this.cache.groups[group]) {
			this.cache.groups[group] = {};
		}
		this.cache.groups[group][key] = item;

		if (this.cache.logs[group].length > 20) {
			const id = this.cache.logs[group].shift();
			delete this.cache.groups[group][id];
		}
	}

	getCache(group, key) {
		return this.cache.groups[group]?.[key];
	}
}
