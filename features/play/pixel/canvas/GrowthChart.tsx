import { JSX, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import type { CategoryId } from "../../../../algorithms/categoryData";
import {
    describeGrowth,
    GROWTH_LADDERS,
    growthExponent,
    mainMetricKey,
    type GrowthPoint,
} from "../../../../algorithms/growth";
import type { RootState } from "../../../../store";
import { getActiveCategory, getDefaultStepTypes } from "../../playSlice";
import { labelText, pixelFrame } from "../primitives/pixel";
import type { AnimalId } from "../sprites/animals";
import PixelSprite from "../sprites/PixelSprite";

/*
 * Measured growth for About: the algorithm runs in the background on
 * inputs from small to large (same preset and seed as the playground),
 * and its main counter is drawn as pixel bars against n. A fitted
 * exponent turns the bars into one sentence ("≈ n²: doubling n quadruples
 * the work"). Results are cached per algorithm and input recipe.
 */

const BLOCKS = 12;

type Result = {
    points: GrowthPoint[];
    metricName: string;
    cutAt: number | null;
    done: boolean;
};

const cache = new Map<string, Result>();

const Box = styled.section`
    padding: 1.4rem 1.4rem 1.2rem;
    background-color: var(--bg);
    ${pixelFrame("var(--line)")};

    h3 {
        ${labelText};
        font-size: 1.1rem;
        color: var(--fg-3);
        margin-bottom: 1.2rem;
    }
    p {
        margin-top: 1.2rem;
        font-size: 1.4rem;
        line-height: 1.4;
        color: var(--fg-2);
    }
    p b {
        font-weight: 400;
        color: var(--accent);
    }
    small {
        display: block;
        margin-top: 0.6rem;
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const Bars = styled.div`
    display: grid;
    grid-auto-flow: column;
    grid-auto-columns: minmax(0, 1fr);
    align-items: end;
    gap: 0.6rem;
    height: 16rem;
`;

const Column = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    gap: 0.3rem;
    min-width: 0;
    height: 100%;

    span {
        font-family: var(--f-mono);
        font-size: 1rem;
        color: var(--fg-3);
        white-space: nowrap;
    }
    i {
        display: block;
        width: min(2.4rem, 100%);
        height: 0.8rem;
        background-color: var(--color-step-finish);
        box-shadow: inset 0 2px 0 rgba(255, 255, 255, 0.25);
        animation: px-dither-in 120ms steps(2) both;
    }
    i[data-ghost] {
        background-color: var(--surface-2);
        box-shadow: none;
        animation: none;
    }
    b {
        ${labelText};
        font-size: 1rem;
        font-weight: 400;
        color: var(--fg-4);
    }
`;

/* Flavour with a meaning: the slower the work grows, the faster the
   animal (the same animals as the speed menu). */
function growthAnimal(k: number): AnimalId {
    if (k < 1.15) return "cheetah";
    if (k < 1.5) return "fox";
    if (k < 2.4) return "turtle";
    return "snail";
}

const Pace = styled.span`
    float: right;
    margin: -0.4rem 0 0 1.2rem;
`;

const compact = new Intl.NumberFormat("en-US", { notation: "compact" });

function GrowthChart({
    algorithmId,
}: {
    algorithmId: string;
}): JSX.Element | null {
    const category = useSelector<RootState, string>(
        getActiveCategory
    ) as CategoryId;
    const config = useSelector<RootState, Record<string, unknown>>(
        (state) =>
            (
                state.play.inputs as Record<
                    string,
                    { config: Record<string, unknown> }
                >
            )[category]?.config ?? {}
    );
    // Same algorithm options as the panels: sorts only count the step
    // types they are told to record.
    const stepTypes = useSelector(getDefaultStepTypes);
    const ladder = GROWTH_LADDERS[category];
    const key = `${category}:${algorithmId}:${JSON.stringify(config)}`;
    const [result, setResult] = useState<Result | null>(
        () => cache.get(key) ?? null
    );

    useEffect(() => {
        if (!ladder) return;
        const cached = cache.get(key);
        if (cached?.done) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setResult(cached);
            return;
        }
        const worker = new Worker(
            new URL("../../../../workers/growthWorker.ts", import.meta.url),
            { type: "module" }
        );
        let current: Result = {
            points: [],
            metricName: "",
            cutAt: null,
            done: false,
        };
        setResult(current);
        worker.onmessage = (event: MessageEvent) => {
            const { type, payload } = event.data as {
                type: string;
                payload?: {
                    n: number;
                    steps: number;
                    metrics?: Record<string, { count: number; name: string }>;
                };
            };
            if (type === "point" && payload) {
                const metricKey = mainMetricKey(payload.metrics);
                const metric = metricKey
                    ? payload.metrics?.[metricKey]
                    : undefined;
                current = {
                    ...current,
                    metricName: metric?.name ?? "Steps",
                    points: [
                        ...current.points,
                        {
                            n: payload.n,
                            value: metric?.count ?? payload.steps,
                            steps: payload.steps,
                        },
                    ],
                };
            } else if (type === "cut" && payload) {
                current = { ...current, cutAt: payload.n };
            } else if (type === "done") {
                current = { ...current, done: true };
                cache.set(key, current);
                worker.terminate();
            }
            setResult(current);
        };
        worker.postMessage({
            category,
            id: algorithmId,
            config,
            options: category === "sort" ? { stepTypes } : {},
        });
        return () => worker.terminate();
    }, [key, ladder, category, algorithmId, config, stepTypes]);

    if (!ladder) return null;
    const points = result?.points ?? [];
    const max = Math.max(1, ...points.map((p) => p.value));
    const k = growthExponent(points);

    return (
        <Box aria-label="Measured growth">
            <h3>
                Measured: {result?.metricName.toLowerCase() || "work"} as n
                grows
            </h3>
            <Bars>
                {ladder.sizes.map((n) => {
                    const point = points.find((p) => p.n === n);
                    const blocks = point
                        ? Math.max(1, Math.round((point.value / max) * BLOCKS))
                        : 0;
                    return (
                        <Column key={n}>
                            <span>
                                {point ? compact.format(point.value) : ""}
                            </span>
                            {point
                                ? Array.from({ length: blocks }, (_, i) => (
                                      <i key={i} />
                                  ))
                                : !result?.done && <i data-ghost />}
                            <b>{n}</b>
                        </Column>
                    );
                })}
            </Bars>
            <p>
                {k === null ? (
                    result?.done ? (
                        "Not enough sizes to tell."
                    ) : (
                        "Measuring…"
                    )
                ) : (
                    <>
                        <Pace aria-hidden="true">
                            <PixelSprite
                                animal={growthAnimal(k)}
                                state={k < 1.5 ? "run" : "idle"}
                                scale={2}
                            />
                        </Pace>
                        Measured <b>≈ n^{k.toFixed(2)}</b>: {describeGrowth(k)}.
                    </>
                )}
            </p>
            <small>
                n = {ladder.unit}
                {result?.cutAt
                    ? ` · stopped at ${result.cutAt}: one run took too long`
                    : ""}
            </small>
        </Box>
    );
}

export default GrowthChart;
