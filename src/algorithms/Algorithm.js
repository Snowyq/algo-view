import { insertSorted, removeSorted } from "../utils/arrays";

export class Algorithm {
	steps = [];
	state;
	operations = [];
	options = {};
	MAX_GROUP_CACHE_SIZE = 20;

	cache = {
		logs: {},
		stored: {},
		info: {},
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
			this.cache.info[group] = [];
			this.cache.stored[group] = {};
		}

		if (!this.cache.logs[group].includes(key)) {
			this.cache.logs[group].push(key);
			insertSorted(this.cache.info[group], key);
		}

		this.cache.stored[group][key] = item;

		if (this.cache.logs[group].length > this.MAX_GROUP_CACHE_SIZE) {
			const id = this.cache.logs[group].shift();
			delete this.cache.stored[group][id];
			removeSorted(this.cache.info[group], id);
		}
	}

	getCache(group, key) {
		if (!this.hasCache(group)) return [];
		return this.cache.stored[group]?.[key];
	}

	hasCache(group) {
		if (this.cache.logs[group]) {
			return true;
		} else return false;
	}

	getCacheInfo(group) {
		if (!this.hasCache(group)) return [];
		return this.cache.info[group].slice();
	}

	compare(a, b, operator) {
		console.log(a, b, operator);
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
