import { findClosest, insertSorted, removeSorted } from "../utils/arrays";

export class CacheManager {
	MAX_PERSISTENT_CACHE_SIZE = 100000;
	MAX_DYNAMIC_CACHE_SIZE = 100;
	DEFAULT_PERSISTENT_CACHE_SIZE = 10000;
	DEFAULT_DYNAMIC_CACHE_SIZE = 30;
	group;

	constructor(cacheObject) {
		this.cache = cacheObject;
	}

	hasGroup(group) {
		return this.cache.groups.includes(group);
	}

	initGroup(group) {
		if (!this.hasGroup(group)) {
			this.cache.groups.push(group);
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
		}
		return this;
	}

	getStoredValuesInfo(group) {
		if (!this.hasGroup(group)) return;
		return this.cache[group].index;
	}

	getPersistentValues(group) {
		if (!this.hasGroup(group)) return;
		return this.cache[group].persistent.values;
	}

	getDynamicValues(group) {
		if (!this.hasGroup(group)) return;
		return this.cache[group].dynamic.values;
	}

	getDynamicKeys(group) {
		if (!this.hasGroup(group)) return;
		return this.cache[group].dynamic.keys;
	}

	addGroup(group) {
		if (!this.hasGroup(group)) this.initGroup(group);
		return this;
	}

	has(group, key) {
		if (!this.hasGroup(group)) return;
		if (key in this.getDynamicValues(group)) return true;
		if (key in this.getPersistentValues(group)) return true;
		return undefined;
	}

	get(group, key) {
		if (!this.hasGroup(group)) return;
		const dynamicValues = this.getDynamicValues(group);
		const persistentValues = this.getPersistentValues(group);
		if (key in dynamicValues) return dynamicValues[key];
		if (key in persistentValues) return persistentValues[key];
		else return undefined;
	}

	add(group, key, item) {
		if (!this.hasGroup(group)) return;
		const storedKeys = this.getStoredValuesInfo();
		const dynamicKeys = this.getDynamicKeys();
		const dynamicValues = this.getDynamicValues();

		if (!this.has(key)) {
			dynamicKeys.push(key);
			insertSorted(storedKeys, key);
		}

		dynamicValues[key] = item;

		const maxDynamicSize =
			this.group.config.dynamicSize ?? this.DEFAULT_DYNAMIC_CACHE_SIZE;

		if (dynamicKeys.length > maxDynamicSize) {
			const oldKey = dynamicKeys.shift();
			delete dynamicValues[oldKey];
			removeSorted(dynamicKeys, oldKey);
		}
	}

	getClosestKey(group, key) {
		if (!this.hasGroup(group)) return;
		const storedKeys = this.getStoredValuesInfo(group);
		return findClosest(storedKeys, key);
	}

	getClosest(group, key) {
		if (!this.hasGroup(group)) return;
		const closestKey = this.getClosestKey(group, key);
		const closestValue = this.get(group, closestKey);
		return { key: closestKey, item: closestValue };
	}

	addPersistent(group, key, item) {
		if (!this.hasGroup(group)) return;
		const storedKeys = this.getStoredValuesInfo(group);
		insertSorted(storedKeys, key);
		this.cache[group].persistent.values[key] = item;
	}

	toggleDynamicCache(group, bool) {
		if (!this.hasGroup(group)) return;
		this.cache[group].config.enableDynamic = bool ? true : false;
	}

	createPersistentCache(
		group,
		initialState,
		mutations,
		mutatorFn,
		{ maxCacheSize } = {}
	) {
		if (!this.hasGroup(group)) return;
		let cacheSize =
			maxCacheSize && typeof maxCacheSize === "number"
				? Math.min(maxCacheSize, this.MAX_PERSISTENT_CACHE_SIZE)
				: this.DEFAULT_PERSISTENT_CACHE_SIZE;

		const cacheStep =
			mutations.length > cacheSize ? mutations.length / cacheSize : 1;

		if (cacheStep <= 1) this.toggleDynamicCache(group, false);

		let shouldCache = (() => {
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

		let state = initialState.slice();
		mutations.forEach((mutation, index, arr) => {
			mutatorFn(mutation, state);
			if (shouldCache(index, arr)) {
				this.addPersistent(group, index, state.slice());
			}
		});

		return this;
	}
}
