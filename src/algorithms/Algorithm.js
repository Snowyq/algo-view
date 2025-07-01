import { findClosest, insertSorted, removeSorted } from "../utils/arrays";

import { isObject } from "../utils/objects";
import { OptionsManager } from "./OptionsManager";

export class Algorithm {
	optionsManager;
	steps = [];
	operations = [];
	options = {};
	MAX_GROUP_CACHE_SIZE = 20;
	DEFAULT_DYNAMIC_CACHE_SIZE = 20;
	DEFAULT_PERSISTENT_CACHE_SIZE = 100;
	MAX_PERSISTENT_CACHE_SIZE = 1000;

	cache = {
		logs: [], //
		stored: {}, // dynamic cache
		info: [],
		persistent: {}, // static cache
		groups: [],
	};

	constructor() {
		this.optionsManager = new OptionsManager(this.options);
	}

	getSteps() {
		return this.steps.slice();
	}

	withSteps() {
		const steps = this.steps.slice();

		const api = {
			get: () => {
				return steps.filter(step => api.isTypeEnabled(step.type));
			},

			isTypeEnabled: type => {
				return !!this.withOptions("steps").select("types").get(type);
			},

			getTypes: () => this.withOptions("steps").get("types"),

			hasType: type => {
				return this.withOptions("steps").select("types").has(type);
			},

			setTypeStatus: (type, status) => {
				if (api.hasType(type)) {
					this.withOptions("steps").select("types").set(type, status);
				}
				return api;
			},

			add: step => {
				if (api.isTypeEnabled(step.type)) {
					api.getRoot().push(step);
				}
			},

			create: step => {},

			getRoot: () => this.steps,

			getStepByIndex: index => steps[index],

			close: () => this,
		};

		return api;
	}

	withCache(group) {
		let opened = this.cache[group];
		if (!opened) {
			const api = {
				select: group => {
					if (this.cache.groups.includes(group)) {
						return this.withCache(group);
					}
				},

				hasGroup: group => {
					return this.cache.groups.includes(group);
				},

				getGroups: () => this.cache.groups,

				initGroup: group => {
					if (api.hasGroup(group)) return;
					this.cache[group] = {
						index: [],
						dynamic: {
							values: {},
							keys: [],
						},
						persistent: {
							values: {},
						},
						config: {
							enableDynamic: true,
							persistentSize: this.DEFAULT_PERSISTENT_CACHE_SIZE,
							dynamicSize: this.DEFAULT_DYNAMIC_CACHE_SIZE,
						},
					};
					return this.withCache(group);
				},
			};
			return api;
		}

		const tools = {
			getGroup: () => {
				return opened;
			},

			getPersistentValues: () => opened.persistent.values,

			getDynamicValues: () => opened.dynamic.values,

			getDynamicKeys: () => opened.dynamic.keys,

			getStoredInfo: () => opened.index,

			withConfig: () => {
				return this.withOptions().open(opened.config);
			},

			addDynamic: (key, item) => {
				const keys = tools.getDynamicKeys();
				keys.push(key);
				tools.getDynamicValues()[key] = item;
				if (keys.length > tools.withConfig().get("dynamicSize")) {
					const oldKey = keys.shift();
					delete tools.getDynamicValues()[oldKey];
					removeSorted(tools.getStoredInfo(), oldKey);
				}
			},
		};

		const api = {
			get: key => {
				const dynamic = tools.getDynamicValues();
				const persistent = tools.getPersistentValues();
				if (key in dynamic) return dynamic[key];
				if (key in persistent) return persistent[key];
			},

			has: key => {
				if (key in tools.getDynamicValues()) return true;
				if (key in tools.getPersistentValues()) return true;
				return false;
			},

			add: (key, item) => {
				if (api.has(key)) return;
			},

			withConfig: tools.withConfig,

			close: () => this,
		};

		return api;
	}

	withOperations() {
		const api = {};
		return api;
	}

	getStepsLength() {
		return this.steps.length;
	}

	getOperations() {
		return this.operations.slice();
	}

	// updateOperations(func) {
	// 	if (typeof func !== "function") {
	// 		throw new TypeError("setSteps expects a function");
	// 	}
	// 	this.operations = func(this.operations.slice());
	// }

	// updateSteps(func) {
	// 	if (typeof func !== "function") {
	// 		throw new TypeError("setSteps expects a function");
	// 	}
	// 	this.steps = func(this.steps.slice());
	// }

	getFromAnyCache(group, key) {
		const { stored, persistent } = this.getCacheGroup(group);
		if (key in stored) return stored[key];
		if (key in persistent) return persistent[key];
		return undefined;
	}

	addCache(group, key, item) {
		if (this.getFromAnyCache(group, key)) return;
		const { log, info, stored } = this.getCacheGroup(group);

		log.push(key);
		insertSorted(info, key);
		stored[key] = item;

		if (log.length > this.MAX_GROUP_CACHE_SIZE) {
			const id = log.shift();
			delete stored[id];
			removeSorted(info, id);
		}
	}

	addPersistentCache(group, key, item) {
		this.cache[group].persistent[key] = item;
	}

	initCacheGroup(group) {
		if (!this.cache.groups.includes(group)) {
			this.cache[group] = {};
			this.cache[group].logs = [];
			this.cache[group].info = [];
			this.cache[group].stored = {};
			this.cache[group].persistent = {};
			this.cache[group].shouldDynamicCache = true;
			this.cache.groups.push(group);
		}
	}

	getCacheGroup(group) {
		if (!this.cache.groups.includes(group)) this.initCacheGroup(group);
		return {
			log: this.cache[group].logs,
			info: this.cache[group].info,
			stored: this.cache[group].stored,
			persistent: this.cache[group].persistent,
			shouldDynamicCache: this.cache[group].shouldDynamicCache,
		};
	}

	setShouldDynamicCache(group, shouldCache) {
		this.cache[group].shouldDynamicCache = shouldCache;
	}

	createPersistentCache(
		group,
		array,
		operations,
		{ totalCacheSize, cachedRatio }
	) {
		this.initCacheGroup(group);
		const { info } = this.getCacheGroup(group);
		let maxCacheSize = this.MAX_PERSISTENT_CACHE_SIZE;

		if (
			typeof totalCacheSize === "number" &&
			totalCacheSize < maxCacheSize
		) {
			maxCacheSize = totalCacheSize;
		}

		if (typeof cachedRatio === "number") {
			let maxCacheSizeFromRatio = operations.length * cachedRatio;
			if (maxCacheSizeFromRatio < maxCacheSize) {
				maxCacheSize = maxCacheSizeFromRatio;
			}
		}

		let cacheStep;
		if (operations.length <= maxCacheSize) {
			cacheStep = 1;
			console.log("1");
			this.setShouldDynamicCache(group, false);
		} else {
			cacheStep = operations.length / maxCacheSize;
		}

		const shouldCache = (() => {
			if (cacheStep <= 1) return () => true;
			let next = cacheStep;

			return (index, arr) => {
				if (
					index >= Math.floor(next) ||
					index === 0 ||
					index === arr.length - 1
				) {
					next += cacheStep;
					return true;
				}
				return false;
			};
		})();

		let state = array.slice();
		operations.forEach((operation, index, arr) => {
			this.makeOperation(operation, state);
			if (shouldCache(index, arr)) {
				this.addPersistentCache(group, index, state.slice());
				insertSorted(info, index);
			}
		});
	}

	makeOperation() {}

	getCache(group, key) {
		return this.getFromAnyCache(group, key);
	}

	getClosestCache(group, key) {
		const closestKey = this.getClosestCacheKey(group, key);
		const item = this.getFromAnyCache(group, closestKey);
		return { key: closestKey, item };
	}

	getClosestCacheKey(group, key) {
		const { info } = this.getCacheGroup(group);
		return findClosest(info, key);
	}

	hasCache(group) {
		return this.cache.groups.includes(group);
	}

	getCacheInfo(group) {
		if (!this.hasCache(group)) return [];
		return this.getCacheGroup(group).info;
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

	withOptions(group = "") {
		let opened = this.options[group];
		const stack = [];
		if (!opened) {
			return {
				getAll: () => this.options,

				getGroups: () => Object.keys(this.options),

				select: group => {
					return this.withOptions(group);
				},

				open: target => {
					if (isObject(target)) {
						opened = target;
					}
				},
			};
		}

		const api = {
			get: option => {
				if (!option) return opened;
				return opened[option];
			},

			select: group => {
				if (group in opened) {
					stack.push(opened);
					opened = opened[group];
				}
				return api;
			},

			has: option => {
				if (option in opened) return true;
				else return false;
			},

			back: () => {
				if (stack.length) {
					opened = stack.pop();
				}
				return api;
			},

			isEnabled: option => !!api.get(option),

			set: (option, value) => {
				if (option in opened) {
					opened[option] = value;
				}
				return api;
			},

			setOptions: options => {
				for (let option in options) {
					api.set(option, options[option]);
				}
				return api;
			},

			close: () => this,
		};

		return api;
	}
}
