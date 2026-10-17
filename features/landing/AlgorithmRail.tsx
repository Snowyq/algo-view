import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { JSX, useRef } from "react";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type {
    AlgorithmMeta,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import PixelIcon from "../play/pixel/primitives/PixelIcon";
import { labelText, pixelFrame } from "../play/pixel/primitives/pixel";
import SplitWords from "./SplitWords";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const ALGORITHMS = registryApi.getAlgorithmsInCategory("sort") ?? [];
const FUN = ALGORITHMS.filter((algo) => algo.meta.group === "fun");
const CLASSIC = ALGORITHMS.filter((algo) => algo.meta.group !== "fun");

const Section = styled.section`
    position: relative;
    padding: 12.8rem clamp(1.6rem, 3vw, 3.2rem) 9.6rem;
    border-top: var(--b) solid var(--line);
`;

const Head = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    gap: 2.4rem;
    margin-bottom: 4.8rem;

    p {
        ${labelText};
        color: var(--fg-3);
        max-width: 32ch;
        line-height: 1.6;
    }

    @media (max-width: 760px) {
        flex-direction: column;
        align-items: flex-start;
    }
`;

const Eyebrow = styled.p`
    ${labelText};
    color: var(--accent) !important;
    margin-bottom: 1.6rem;
`;

const Title = styled.h2`
    font-family: var(--f-display);
    font-weight: 400;
    font-size: clamp(4rem, 2rem + 4vw, 8.8rem);
    line-height: 0.82;
    text-transform: uppercase;
    color: var(--fg);
`;

const GroupLabel = styled.h3`
    display: flex;
    align-items: center;
    gap: 1.2rem;
    margin: 3.2rem 0 1.2rem;
    ${labelText};
    color: var(--fg-4);

    &::after {
        content: "";
        flex: 1;
        height: 2px;
        background-image: repeating-linear-gradient(
            90deg,
            var(--line) 0 2px,
            transparent 2px 4px
        );
    }
`;

const Grid = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(22rem, 1fr));
    gap: 1.2rem;
    list-style: none;
`;

/* Compact tile: name, average cost, and a tiny growth fingerprint. */
const Tile = styled(Link)`
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: end;
    gap: 0.6rem 1.2rem;
    padding: 1.4rem 1.6rem;
    margin: var(--b);
    background-color: var(--surface);
    color: var(--fg-2);
    ${pixelFrame("var(--line)")};
    transition: transform 120ms steps(2);

    small {
        grid-column: 1 / -1;
        display: flex;
        justify-content: space-between;
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
    small b {
        font-weight: 400;
    }
    strong {
        display: block;
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 3.2rem;
        line-height: 0.8;
        text-transform: uppercase;
        color: var(--fg);
    }
    code {
        display: block;
        margin-top: 0.6rem;
        font-family: var(--f-mono);
        font-size: 1.25rem;
        color: var(--fg-3);
    }

    /* The promise of the click, spelled out: the tile fills from below. */
    [data-go] {
        position: absolute;
        inset: 0;
        display: flex;
        flex-direction: column;
        justify-content: center;
        gap: 0.6rem;
        padding: 0 1.6rem;
        background-color: var(--accent);
        color: var(--accent-ink);
        clip-path: inset(100% 0 0 0);
        transition: clip-path 180ms steps(5);
    }
    [data-go] b {
        display: inline-flex;
        align-items: center;
        gap: 0.8rem;
        ${labelText};
        font-size: 1.2rem;
        font-weight: 400;
        white-space: nowrap;
    }
    [data-go] strong {
        color: var(--accent-ink);
    }
    [data-go] em {
        ${labelText};
        font-size: 1rem;
        font-style: normal;
        opacity: 0.75;
        white-space: nowrap;
    }
    [data-go] svg {
        animation: px-nudge-right 0.6s steps(2) infinite;
    }

    @keyframes px-nudge-right {
        50% {
            transform: translateX(3px);
        }
    }

    &:focus-visible [data-go] {
        clip-path: inset(0 0 0 0);
    }

    @media (hover: hover) {
        &:hover {
            transform: translateY(-4px);
            ${pixelFrame("var(--accent)")};
        }
        &:hover [data-go] {
            clip-path: inset(0 0 0 0);
        }
        &:hover small b {
            opacity: 0;
        }
    }

    &:active [data-go] {
        background-color: var(--accent-2);
    }
`;

/* Rough operation counts for the average case, by n. */
function growthOf(meta: AlgorithmMeta): ((n: number) => number) | null {
    const c = meta.timeComplexity;
    if (/unbounded/i.test(c)) return null;
    const fact = (n: number): number => (n <= 1 ? 1 : n * fact(n - 1));
    if (c.includes("n!")) return (n) => n * fact(n);
    if (c.includes("log n/2")) return (n) => n ** (Math.log2(n + 1) / 2);
    if (c.includes("2.71")) return (n) => n ** 2.71;
    if (c.includes("log n")) return (n) => n * Math.log2(n + 1);
    if (c.includes("1.5")) return (n) => n ** 1.5;
    if (c.includes("n²")) return (n) => n * n;
    return (n) => n;
}

const COLS = 10;
const ROWS = 6;

/*
 * Growth fingerprint: ten columns (n = 1…10) of operations, measured
 * against n² at n = 10. Columns that blow past the top turn accent.
 */
function GrowthChart({ meta }: { meta: AlgorithmMeta }): JSX.Element {
    const f = growthOf(meta);
    const ref = COLS * COLS;
    return (
        <svg
            data-pixel
            viewBox={`0 0 ${COLS * 2} ${ROWS * 2}`}
            width={COLS * 6}
            height={ROWS * 6}
            aria-hidden="true"
        >
            {Array.from({ length: COLS }, (_, i) => {
                if (!f) {
                    return (
                        <rect
                            key={i}
                            x={i * 2}
                            y={ROWS * 2 - 1}
                            width={1}
                            height={1}
                            fill="var(--line-2)"
                        />
                    );
                }
                const value = f(i + 1) / ref;
                const blocks = Math.min(
                    ROWS,
                    Math.max(1, Math.ceil(value * ROWS))
                );
                const over = value > 1;
                return Array.from({ length: blocks }, (_, b) => (
                    <rect
                        key={`${i}-${b}`}
                        x={i * 2}
                        y={(ROWS - 1 - b) * 2}
                        width={1}
                        height={1}
                        fill={
                            over ? "var(--accent)" : "var(--color-step-default)"
                        }
                    />
                ));
            })}
        </svg>
    );
}

function TileList({
    items,
    offset,
}: {
    items: AlgorithmRegistryItem[];
    offset: number;
}): JSX.Element {
    return (
        <Grid>
            {items.map((algo, index) => (
                <li key={algo.id} data-tile>
                    <Tile
                        href={`/play?a=${algo.id}`}
                        aria-label={`${algo.meta.name} sort, average ${algo.meta.timeComplexity}. Open in the playground`}
                    >
                        <small>
                            <span>
                                {String(offset + index + 1).padStart(2, "0")}
                            </span>
                            <b>Open ▸</b>
                        </small>
                        <div>
                            <strong>{algo.meta.name}</strong>
                            <code>{algo.meta.timeComplexity}</code>
                        </div>
                        <GrowthChart meta={algo.meta} />
                        <span data-go aria-hidden="true">
                            <b>
                                Open in playground
                                <PixelIcon name="play" scale={2} />
                            </b>
                            <strong>{algo.meta.name}</strong>
                            <em>Loads ready to play</em>
                        </span>
                    </Tile>
                </li>
            ))}
        </Grid>
    );
}

function AlgorithmRail(): JSX.Element {
    const rootRef = useRef<HTMLElement | null>(null);

    // Tiles step in as the grid arrives, once.
    useGSAP(
        () => {
            const mm = gsap.matchMedia();
            mm.add("(prefers-reduced-motion: no-preference)", () => {
                ScrollTrigger.batch("[data-tile]", {
                    start: "top 92%",
                    once: true,
                    onEnter: (batch) =>
                        gsap.from(batch, {
                            y: 16,
                            opacity: 0,
                            duration: 0.3,
                            ease: "steps(4)",
                            stagger: 0.04,
                        }),
                });
            });
        },
        { scope: rootRef }
    );

    return (
        <Section
            ref={rootRef}
            id="algorithms"
            tabIndex={-1}
            aria-labelledby="algos-title"
        >
            <Head>
                <div>
                    <Eyebrow>(02) Algorithms</Eyebrow>
                    <SplitWords
                        as={Title}
                        id="algos-title"
                        reveal="section"
                        text={`${ALGORITHMS.length} ways to sort.`}
                    />
                </div>
                <p>
                    {CLASSIC.length} you would use, {FUN.length} you should not.
                    The bars show how the work grows with n, against n².
                </p>
            </Head>
            <GroupLabel>Classic</GroupLabel>
            <TileList items={CLASSIC} offset={0} />
            <GroupLabel>Just for fun</GroupLabel>
            <TileList items={FUN} offset={CLASSIC.length} />
        </Section>
    );
}

export default AlgorithmRail;
