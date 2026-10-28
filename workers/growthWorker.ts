import registryApi from "../algorithms/algorithmsRegistryApi";
import { generateFor, type CategoryId } from "../algorithms/categoryData";
import { GROWTH_LADDERS } from "../algorithms/growth";

/*
 * Runs one algorithm on growing inputs (same preset and seed as the
 * playground, only the size changes) and reports its counters per size.
 * Stops early when a single run gets slow: brute force and bogo sort do
 * not need n = 512 to make the point.
 */

const SLOW_MS = 1200;
const MAX_STEPS = 2_000_000;

type Request = {
    category: CategoryId;
    id: string;
    config: Record<string, unknown>;
    options?: Record<string, unknown>;
};

onmessage = (event: MessageEvent<Request>): void => {
    const { category, id, config, options = {} } = event.data;
    const ladder = GROWTH_LADDERS[category];
    const Class = registryApi.getAlgorithmClass(category, id);
    if (!ladder || !Class) {
        postMessage({ type: "done" });
        return;
    }
    for (const n of ladder.sizes) {
        const input = generateFor(category, {
            ...config,
            [ladder.key]: n,
        } as never);
        const started = performance.now();
        let metrics: Record<string, { count: number; name: string }> = {};
        let steps = 0;
        try {
            const algo = new Class(input, options) as unknown as {
                getMetrics: () => typeof metrics;
                getStepsLength: () => number;
            };
            metrics = algo.getMetrics();
            steps = algo.getStepsLength();
        } catch {
            break;
        }
        const ms = performance.now() - started;
        postMessage({ type: "point", payload: { n, steps, metrics } });
        if (ms > SLOW_MS || steps > MAX_STEPS) {
            postMessage({ type: "cut", payload: { n } });
            break;
        }
    }
    postMessage({ type: "done" });
};
