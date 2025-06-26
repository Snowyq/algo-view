import { FaSleigh } from "react-icons/fa";
import {
	binarySearch,
	findClosest,
	insertSorted,
	removeSorted,
} from "../utils/arrays";

export class Algorithm {
	steps = [];
	state;
	operations = [];
	options = {};
	MAX_GROUP_CACHE_SIZE = 20;
	DEFAULT_PERSISTENT_CACHE_SIZE = 100;
	MAX_PERSISTENT_CACHE_SIZE = 1000;

	cache = {
		logs: {},
		stored: {},
		info: {},
		persistent: {},
		groups: [],
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

	getStepsLength() {
		return this.steps.length;
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
				console.log("caching");
				this.addPersistentCache(group, index, state);
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
		const { info, persistent } = this.getCacheGroup(group);
		console.log(persistent);
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
}
