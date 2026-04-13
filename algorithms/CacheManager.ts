import { findClosest, insertSorted, removeSorted } from "../utils/arrays";

type CacheConfig = {
    enableDynamic: boolean;
    persistentSize: number;
    dynamicSize: number;
};

type CacheGroup<TState extends unknown[]> = {
    index: number[];
    dynamic: {
        values: Record<number, TState>;
        keys: number[];
    };
    persistent: {
        values: Record<number, TState>;
    };
    config: CacheConfig;
};

type CacheStore<TState extends unknown[]> = {
    groups: string[];
    [key: string]: CacheGroup<TState> | string[] | unknown;
};

type CacheClosest<TState extends unknown[]> = {
    key: number;
    item: TState;
};

export class CacheManager<
    TState extends unknown[] = number[],
    TMutation = unknown,
> {
    MAX_PERSISTENT_CACHE_SIZE: number = 100000;
    MAX_DYNAMIC_CACHE_SIZE: number = 100;
    DEFAULT_PERSISTENT_CACHE_SIZE: number = 100000;
    DEFAULT_DYNAMIC_CACHE_SIZE: number = 30;
    group: string | null = null;
    cache: CacheStore<TState>;

    constructor(cacheObject: CacheStore<TState>) {
        this.cache = cacheObject;
    }

    private getGroup(group: string): CacheGroup<TState> | undefined {
        const groupCache = this.cache[group];
        if (!groupCache || typeof groupCache !== "object") return undefined;
        return groupCache as CacheGroup<TState>;
    }

    hasGroup(group: string): boolean {
        return this.cache.groups.includes(group);
    }

    initGroup(group: string): this {
        if (!this.hasGroup(group)) {
            this.cache.groups.push(group);
            const nextGroup: CacheGroup<TState> = {
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
            this.cache[group] = nextGroup;
        }
        return this;
    }

    getStoredValuesInfo(group: string): number[] | undefined {
        return this.getGroup(group)?.index;
    }

    getPersistentValues(group: string): Record<number, TState> | undefined {
        return this.getGroup(group)?.persistent.values;
    }

    getDynamicValues(group: string): Record<number, TState> | undefined {
        return this.getGroup(group)?.dynamic.values;
    }

    getDynamicKeys(group: string): number[] | undefined {
        return this.getGroup(group)?.dynamic.keys;
    }

    addGroup(group: string): this {
        if (!this.hasGroup(group)) this.initGroup(group);
        return this;
    }

    has(group: string, key: number): boolean | undefined {
        if (!this.hasGroup(group)) return undefined;
        const dynamicValues = this.getDynamicValues(group);
        const persistentValues = this.getPersistentValues(group);
        if (!dynamicValues || !persistentValues) return undefined;
        if (key in dynamicValues) return true;
        if (key in persistentValues) return true;
        return undefined;
    }

    get(group: string, key: number): TState | undefined {
        if (!this.hasGroup(group)) return undefined;
        const dynamicValues = this.getDynamicValues(group);
        const persistentValues = this.getPersistentValues(group);
        if (!dynamicValues || !persistentValues) return undefined;
        if (key in dynamicValues) return dynamicValues[key];
        if (key in persistentValues) return persistentValues[key];
        return undefined;
    }

    add(group: string, key: number, item: TState): void {
        if (!this.hasGroup(group)) return;
        const storedKeys = this.getStoredValuesInfo(group);
        const dynamicKeys = this.getDynamicKeys(group);
        const dynamicValues = this.getDynamicValues(group);

        if (!storedKeys || !dynamicKeys || !dynamicValues) return;

        if (!this.has(group, key)) {
            dynamicKeys.push(key);
            insertSorted(storedKeys, key);
        }

        dynamicValues[key] = item;

        const maxDynamicSize =
            this.getGroup(group)?.config.dynamicSize ??
            this.DEFAULT_DYNAMIC_CACHE_SIZE;

        if (dynamicKeys.length > maxDynamicSize) {
            const oldKey = dynamicKeys.shift();
            if (typeof oldKey === "number") {
                delete dynamicValues[oldKey];
                removeSorted(dynamicKeys, oldKey);
            }
        }
    }

    getClosestKey(group: string, key: number): number | null | undefined {
        const storedKeys = this.getStoredValuesInfo(group);
        if (!storedKeys) return undefined;
        return findClosest(storedKeys, key);
    }

    getClosest(group: string, key: number): CacheClosest<TState> | undefined {
        if (!this.hasGroup(group)) return undefined;
        const closestKey = this.getClosestKey(group, key);
        if (typeof closestKey !== "number") return undefined;
        const closestValue = this.get(group, closestKey);
        if (!closestValue) return undefined;
        return { key: closestKey, item: closestValue };
    }

    addPersistent(group: string, key: number, item: TState): void {
        if (!this.hasGroup(group)) return;
        const storedKeys = this.getStoredValuesInfo(group);
        const persistentValues = this.getPersistentValues(group);
        if (!storedKeys || !persistentValues) return;
        insertSorted(storedKeys, key);
        persistentValues[key] = item;
    }

    toggleDynamicCache(group: string, bool: boolean): void {
        const groupCache = this.getGroup(group);
        if (!groupCache) return;
        groupCache.config.enableDynamic = bool ? true : false;
    }

    createPersistentCache(
        group: string,
        initialState: TState,
        mutations: TMutation[],
        mutatorFn: (mutation: TMutation, state: TState) => void,
        { maxCacheSize }: { maxCacheSize?: number } = {}
    ): this | undefined {
        if (!this.hasGroup(group)) return undefined;
        const cacheSize =
            maxCacheSize && typeof maxCacheSize === "number"
                ? Math.min(maxCacheSize, this.MAX_PERSISTENT_CACHE_SIZE)
                : this.DEFAULT_PERSISTENT_CACHE_SIZE;

        const cacheStep =
            mutations.length > cacheSize ? mutations.length / cacheSize : 1;

        if (cacheStep <= 1) this.toggleDynamicCache(group, false);

        const shouldCache = (() => {
            if (cacheStep <= 1) return () => true;

            let next = cacheStep;
            return (index: number, arr: TMutation[]) => {
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

        const state = initialState.slice() as TState;
        mutations.forEach(
            (mutation: TMutation, index: number, arr: TMutation[]) => {
                mutatorFn(mutation, state);
                if (shouldCache(index, arr)) {
                    this.addPersistent(group, index, state.slice() as TState);
                }
            }
        );

        return this;
    }
}
