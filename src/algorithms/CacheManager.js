export class CacheManager {
	DEFAULT_PERSISTENT_CACHE_SIZE;
	DEFAULT_DYNAMIC_CACHE_SIZE;
	group;
	constructor(cacheObject) {
		this.cache = cacheObject;
	}

	selectGroup(group) {
		this.group = group;
		return this;
	}

	unselectGroup() {
		this.group = undefined;
		return this;
	}

	hasGroup(group) {
		return this.cache.group.includes(group);
	}

	isGroupSelected() {
		return !!this.group;
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

	getStoredValuesInfo() {
		if (!this.isGroupSelected()) return;
		return this.group.index;
	}

	getPersistentValues() {}

	addDynamicValue(key, item) {
		if (!this.isGroupSelected()) return;
	}

	getDynamicValues() {
		if (!this.isGroupSelected()) return;
	}

	getDynamicKeys() {}

	addGroup(group) {
		if (!this.hasGroup(group)) this.initGroup(group);
		return this;
	}

	has(key) {
		if (!this.isGroupSelected()) return;
	}

	get(key) {
		if (!this.isGroupSelected()) return;
	}
}
