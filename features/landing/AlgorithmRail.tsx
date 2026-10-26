import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Link from "next/link";
import { JSX, useRef } from "react";
import styled from "styled-components";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import { CATEGORY_PREVIEW, MOTIF_COLORS } from "../play/categoryPreview";
import PixelIcon from "../play/pixel/primitives/PixelIcon";
import { labelText, pixelFrame } from "../play/pixel/primitives/pixel";
import SplitWords from "./SplitWords";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/* One tile per family, in the playground's order. */
const FAMILIES = (
    Object.keys(CATEGORY_PREVIEW) as Array<keyof typeof CATEGORY_PREVIEW>
).flatMap((id) => {
    const category = registryApi.getCategory(id);
    if (!category) return [];
    const preview = CATEGORY_PREVIEW[id];
    const nameOf = (algoId: string): string =>
        category.items.find((item) => item.id === algoId)?.meta.name ?? algoId;
    return [
        {
            id,
            name: category.name,
            count: category.items.length,
            names: category.items.map((item) => item.meta.name),
            starter: preview.starter,
            starterNames: preview.starter.map(nameOf),
            motif: preview.motif,
            blurb: preview.blurb,
        },
    ];
});
const TOTAL = FAMILIES.reduce((sum, family) => sum + family.count, 0);

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

const Grid = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(28rem, 1fr));
    gap: 1.2rem;
    list-style: none;
`;

/* One family: its motif, name, size and members. */
const Tile = styled(Link)`
    position: relative;
    overflow: hidden;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    gap: 1rem 1.2rem;
    height: 100%;
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
    p {
        grid-column: 1 / -1;
        font-size: 1.4rem;
        line-height: 1.4;
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

/* The family's motif, the same picture the playground's empty state uses. */
function Motif({ rows }: { rows: string[] }): JSX.Element {
    return (
        <svg
            data-pixel
            viewBox={`0 0 ${rows[0].length * 3} ${rows.length * 3}`}
            width={rows[0].length * 7}
            height={rows.length * 7}
            aria-hidden="true"
        >
            {rows.flatMap((row, y) =>
                [...row].map((cell, x) =>
                    cell === "." ? null : (
                        <rect
                            key={`${x}-${y}`}
                            x={x * 3}
                            y={y * 3}
                            width={2.5}
                            height={2.5}
                            fill={MOTIF_COLORS[cell]}
                        />
                    )
                )
            )}
        </svg>
    );
}

function FamilyTiles(): JSX.Element {
    return (
        <Grid>
            {FAMILIES.map((family, index) => (
                <li key={family.id} data-tile>
                    <Tile
                        href={`/play?c=${family.id}&a=${family.starter.join(",")}`}
                        aria-label={`${family.name}: ${family.count} algorithms. Open in the playground with ${family.starterNames.join(", ")}`}
                    >
                        <small>
                            <span>
                                {String(index + 1).padStart(2, "0")} ·{" "}
                                {family.count} algorithms
                            </span>
                            <b>Open ▸</b>
                        </small>
                        <div>
                            <strong>{family.name}</strong>
                            <code>
                                {family.names.slice(0, 3).join(" · ")}
                                {family.count > 3 ? "\u00a0…" : ""}
                            </code>
                        </div>
                        <Motif rows={family.motif} />
                        <p>{family.blurb}</p>
                        <span data-go aria-hidden="true">
                            <b>
                                Open in playground
                                <PixelIcon name="play" scale={2} />
                            </b>
                            <strong>{family.name}</strong>
                            <em>Loads {family.starterNames.join(" · ")}</em>
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
                        text={`${TOTAL} algorithms, ${FAMILIES.length} families.`}
                    />
                </div>
                <p>
                    Each family shares one input, so its panels race on equal
                    terms. Pick one and it opens ready to play.
                </p>
            </Head>
            <FamilyTiles />
        </Section>
    );
}

export default AlgorithmRail;
