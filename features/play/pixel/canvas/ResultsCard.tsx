import { JSX, useState } from "react";
import { useSelector } from "react-redux";
import styled from "styled-components";
import { mainMetricKey } from "../../../../algorithms/growth";
import type { RootState } from "../../../../store";
import { formatNumber } from "../../format";
import {
    getMaxStep,
    getVisibleAlgorithms,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";

/* End-of-run comparison for two or more panels; dismissed until the next run. */

/* Counters that are flags, not work. */
const SKIP = new Set(["gaveUp", "noPath"]);

const Card = styled.section`
    position: absolute;
    left: 50%;
    bottom: 1.6rem;
    z-index: 6;
    width: min(60rem, calc(100% - 2.4rem));
    translate: -50% 0;
    padding: 1.4rem 1.6rem 1.6rem;
    background-color: var(--surface-2);
    ${pixelFrame("var(--line-2)")};
    animation: px-dither-in 200ms steps(5) both;
`;

const Head = styled.header`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1.2rem;
    margin-bottom: 1rem;

    h2 {
        display: inline-flex;
        align-items: flex-end;
        gap: 0.8rem;
        ${labelText};
        font-size: 1.2rem;
        color: var(--accent);
    }
`;

const Takeaway = styled.p`
    margin-bottom: 1.2rem;
    font-size: 1.6rem;
    line-height: 1.4;
    color: var(--fg);
    text-wrap: balance;

    b {
        font-weight: 400;
        color: var(--accent);
    }
`;

const Table = styled.table`
    width: 100%;
    border-collapse: collapse;
    font-size: 1.3rem;

    th {
        ${labelText};
        font-size: 1rem;
        font-weight: 400;
        color: var(--fg-4);
        text-align: right;
        padding: 0 0 0.6rem 1.2rem;
    }
    th:first-child,
    td:first-child {
        text-align: left;
        padding-left: 0;
    }
    td {
        padding: 0.4rem 0 0.4rem 1.2rem;
        text-align: right;
        font-family: var(--f-mono);
        color: var(--fg-2);
        border-top: 2px dashed var(--line);
        white-space: nowrap;
    }
    td:first-child {
        font-family: var(--f-body);
        color: var(--fg);
    }
    tbody tr {
        animation: px-dither-in 200ms both;
    }
    tr[data-best] td:first-child::before {
        content: "▲ ";
        color: var(--color-step-finish);
    }
    td[data-gave-up] {
        color: var(--danger);
    }
`;

function count(algo: ActiveAlgorithm, key: string): number {
    return algo.metrics?.[key]?.count ?? 0;
}

function gaveUp(algo: ActiveAlgorithm): boolean {
    return Boolean(count(algo, "gaveUp") || count(algo, "noPath"));
}

/* The main counter (comparisons where there are any) first, then two more. */
function tableKeys(metrics: ActiveAlgorithm["metrics"]): string[] {
    const primary = mainMetricKey(metrics);
    return [
        ...(primary ? [primary] : []),
        ...Object.keys(metrics ?? {}).filter(
            (key) => !SKIP.has(key) && key !== primary
        ),
    ].slice(0, 3);
}

/* Finishers first, then fewest steps. */
function rank(algorithms: ActiveAlgorithm[]): ActiveAlgorithm[] {
    return [...algorithms].sort(
        (a, b) =>
            Number(gaveUp(a)) - Number(gaveUp(b)) ||
            a.stepsLength - b.stepsLength
    );
}

/* One sentence: the spread on the main counter, or who gave up. */
function takeawayOf(algorithms: ActiveAlgorithm[]): JSX.Element {
    const primary = mainMetricKey(algorithms[0].metrics);
    const finishers = algorithms.filter((algo) => !gaveUp(algo));
    const quitters = algorithms.filter(gaveUp);
    if (primary && finishers.length >= 2) {
        const byPrimary = [...finishers].sort(
            (a, b) => count(a, primary) - count(b, primary)
        );
        const best = byPrimary[0];
        const worst = byPrimary[byPrimary.length - 1];
        const name = (
            algorithms[0].metrics?.[primary]?.name ?? primary
        ).toLowerCase();
        const low = count(best, primary);
        const high = count(worst, primary);
        if (high === low) {
            return <>All of them needed the same number of {name}.</>;
        }
        const ratio = high / low;
        return (
            <>
                <b>{worst.info.name}</b> needed{" "}
                <b>
                    {low > 0
                        ? `${ratio.toFixed(ratio < 10 ? 1 : 0)}×`
                        : formatNumber(high - low)}
                </b>{" "}
                {low > 0 ? "as many" : "more"} {name} as <b>{best.info.name}</b>
                .
            </>
        );
    }
    if (quitters.length > 0) {
        return (
            <>
                <b>{quitters.map((algo) => algo.info.name).join(", ")}</b> gave
                up; {finishers[0]?.info.name ?? "none"} got there.
            </>
        );
    }
    return <>Every run reached its end.</>;
}

function ResultsCard(): JSX.Element | null {
    const algorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getVisibleAlgorithms
    );
    const maxStep = useSelector<RootState, number>(getMaxStep);
    const atEnd = useSelector<RootState, boolean>(
        (state) =>
            state.play.animation.maxStep > 0 &&
            state.play.animation.step.value >= state.play.animation.maxStep &&
            state.play.animation.status !== "playing"
    );
    // Identity of this run: which algorithms, and how long each one was.
    const runKey = algorithms
        .map((algo) => `${algo.id}:${algo.stepsLength}`)
        .join("|");
    const [dismissed, setDismissed] = useState<string>("");

    const ready =
        algorithms.length >= 2 &&
        algorithms.every((algo) => algo.stepsLength > 0 && algo.metrics);
    if (!atEnd || !ready || maxStep <= 0 || dismissed === runKey) return null;

    const keys = tableKeys(algorithms[0].metrics);

    return (
        <Card aria-label="Results" data-no-observe>
            <Head>
                <h2>
                    <PixelSprite animal="cheetah" state="done" scale={2} />
                    Results
                </h2>
                <PixelButton
                    type="button"
                    $variant="ghost"
                    $size="sm"
                    $square
                    aria-label="Close results"
                    onClick={() => setDismissed(runKey)}
                >
                    <PixelIcon name="close" scale={2} />
                </PixelButton>
            </Head>
            <Takeaway>{takeawayOf(algorithms)}</Takeaway>
            <Table>
                <thead>
                    <tr>
                        <th scope="col">Algorithm</th>
                        <th scope="col">Steps</th>
                        {keys.map((key) => (
                            <th key={key} scope="col">
                                {algorithms[0].metrics?.[key]?.name ?? key}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {rank(algorithms).map((algo, index) => (
                        <tr
                            key={algo.id}
                            data-best={index === 0 || undefined}
                            style={{ animationDelay: `${120 + index * 60}ms` }}
                        >
                            <td>{algo.info.name}</td>
                            <td data-gave-up={gaveUp(algo) || undefined}>
                                {gaveUp(algo)
                                    ? "gave up"
                                    : formatNumber(algo.stepsLength - 1)}
                            </td>
                            {keys.map((key) => (
                                <td key={key}>
                                    {formatNumber(count(algo, key))}
                                </td>
                            ))}
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Card>
    );
}

export default ResultsCard;
