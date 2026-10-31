import { findClosest, insertSorted } from "../utils/arrays";

const MAX_CACHE_SIZE = 100000;

type CacheGroup<TState> = {
    /** Sorted keys of every saved state. */
    index: number[];
    values: Record<number, TState>;
};

type CacheStore = {
    groups: string[];
    [key: string]: unknown;
};

type CacheClosest<TState> = {
    key: number;
    item: TState;
};

/** Copies of a replayed state saved at chosen operation indices, per group. */
export class CacheManager<
    TState extends unknown[] = number[],
    TMutation = unknown,
> {
    cache: CacheStore;

    constructor(cache: CacheStore) {
        this.cache = cache;
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
            const empty: CacheGroup<TState> = { index: [], values: {} };
            this.cache[group] = empty;
        }
        return this;
    }

    get(group: string, key: number): TState | undefined {
        const values = this.getGroup(group)?.values;
        if (!this.hasGroup(group) || !values) return undefined;
        return key in values ? values[key] : undefined;
    }

    add(group: string, key: number, item: TState): void {
        const groupCache = this.getGroup(group);
        if (!this.hasGroup(group) || !groupCache) return;
        insertSorted(groupCache.index, key);
        groupCache.values[key] = item;
    }

    getClosestKey(group: string, key: number): number | null | undefined {
        const index = this.getGroup(group)?.index;
        if (!index) return undefined;
        return findClosest(index, key);
    }

    getClosest(group: string, key: number): CacheClosest<TState> | undefined {
        if (!this.hasGroup(group)) return undefined;
        const closestKey = this.getClosestKey(group, key);
        if (typeof closestKey !== "number") return undefined;
        const closestValue = this.get(group, closestKey);
        if (!closestValue) return undefined;
        return { key: closestKey, item: closestValue };
    }

    /**
     * Replays every mutation from the initial state and saves at most
     * `maxCacheSize` evenly spaced states (always the first and last).
     */
    createPersistentCache(
        group: string,
        initialState: TState,
        mutations: TMutation[],
        mutatorFn: (mutation: TMutation, state: TState) => void,
        { maxCacheSize }: { maxCacheSize?: number } = {}
    ): this | undefined {
        if (!this.hasGroup(group)) return undefined;
        const cacheSize = maxCacheSize
            ? Math.min(maxCacheSize, MAX_CACHE_SIZE)
            : MAX_CACHE_SIZE;
        const step =
            mutations.length > cacheSize ? mutations.length / cacheSize : 1;
        const last = mutations.length - 1;
        let next = step;
        const shouldCache = (index: number): boolean => {
            if (step <= 1) return true;
            if (index >= Math.floor(next) || index === 0 || index === last) {
                next += step;
                return true;
            }
            return false;
        };

        const state = initialState.slice() as TState;
        mutations.forEach((mutation, index) => {
            mutatorFn(mutation, state);
            if (shouldCache(index)) {
                this.add(group, index, state.slice() as TState);
            }
        });
        return this;
    }
}
