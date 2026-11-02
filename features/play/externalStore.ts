import { useCallback, useSyncExternalStore } from "react";

type Listener = () => void;

export type Signal = {
    subscribe: (listener: Listener) => () => void;
    emit: () => void;
};

/** A listener set in the shape useSyncExternalStore expects. */
export function createSignal(): Signal {
    const listeners = new Set<Listener>();
    return {
        subscribe(listener) {
            listeners.add(listener);
            return () => {
                listeners.delete(listener);
            };
        },
        emit() {
            listeners.forEach((listener) => listener());
        },
    };
}

/** One value per id; a change only re-renders the readers of that id. */
export function createKeyedStore<T>(fallback: T) {
    const values = new Map<string, T>();
    const signals = new Map<string, Signal>();

    const signalOf = (id: string): Signal => {
        let signal = signals.get(id);
        if (!signal) {
            signal = createSignal();
            signals.set(id, signal);
        }
        return signal;
    };

    const get = (id: string): T => values.get(id) ?? fallback;

    const set = (id: string, value: T): void => {
        values.set(id, value);
        signals.get(id)?.emit();
    };

    function useValue(id: string): T {
        const subscribe = useCallback(
            (listener: Listener) => signalOf(id).subscribe(listener),
            [id]
        );
        const getSnapshot = useCallback(() => get(id), [id]);
        return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
    }

    return { get, set, useValue };
}
