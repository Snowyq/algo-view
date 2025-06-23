export class Algorithm {
	steps = [];
	state;
	operations = [];
	options = {};
	MAX_GROUP_CACHE_SIZE = 20;

	cache = {
		logs: {},
		groups: {},
	};

	getOptions(group) {
		return this.options[group];
	}

	changeOptions(newOptions, group = "") {
		let target = this.options;

		if (group && typeof this.options[group] === "object") {
			target = this.options[group];
		}

		for (let key in newOptions) {
			if (Object.keys(target).includes(key)) {
				target[key] = newOptions[key];
			}
		}
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

		if (this.cache.logs[group].length > this.MAX_GROUP_CACHE_SIZE) {
			const id = this.cache.logs[group].shift();
			delete this.cache.groups[group][id];
		}
	}

	getCache(group, key) {
		return this.cache.groups[group]?.[key];
	}

	compare(a, b, operator) {
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
}
