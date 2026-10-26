import { JSX, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import useReducedMotion from "../../../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../../../store";
import { CATEGORIES } from "../../categories";
import { CATEGORY_PREVIEW, MOTIF_COLORS } from "../../categoryPreview";
import {
    changeCategory,
    closeAllAlgorithms,
    getActiveAlgorithms,
    getActiveCategory,
    getOverviewOpen,
    openAlgorithm,
    setOverviewOpen,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText, pixelFrame } from "../primitives/pixel";

/*
 * The playground's front door and its category picker: every family on
 * one screen, each with a live pixel preview. A preview builds its motif
 * the way the algorithms work: the structure first, then the coloured
 * "steps" one by one, a pause, and again. One shared canvas loop drives
 * all of them; reduced motion shows the finished pictures.
 */

const CELL = 12;
const GAP = 2;
const BUILD_MS = 2600;
const HOLD_MS = 1200;

const Overlay = styled.section`
    position: fixed;
    top: var(--toolbar-h);
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 55;
    overflow-y: auto;
    overscroll-behavior: contain;
    padding: 4rem clamp(1.6rem, 4vw, 4.8rem) 6.4rem;
    background-color: var(--bg);
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 16px 16px;
    animation: px-drop-in 180ms steps(4) both;
`;

const Head = styled.header`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2.4rem;
    max-width: 128rem;
    margin: 0 auto 3.2rem;

    p {
        ${labelText};
        color: var(--accent);
        margin-bottom: 1.2rem;
    }
`;

const Title = styled.h1`
    font-family: var(--f-display);
    font-weight: 400;
    font-size: clamp(3.6rem, 2rem + 4vw, 7.2rem);
    line-height: 0.85;
    text-transform: uppercase;
    color: var(--fg);
`;

const Grid = styled.ul`
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 27rem), 1fr));
    gap: 1.6rem;
    max-width: 128rem;
    margin: 0 auto;
    list-style: none;
`;

const Card = styled.button`
    position: relative;
    display: grid;
    grid-template-rows: auto auto 1fr auto;
    gap: 1rem;
    width: 100%;
    height: 100%;
    padding: 1.6rem;
    margin: var(--b);
    border: 0;
    background-color: var(--surface);
    color: var(--fg-2);
    text-align: left;
    ${pixelFrame("var(--line)")};
    transition: transform 120ms steps(2);

    canvas {
        image-rendering: pixelated;
    }
    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 3.2rem;
        line-height: 0.85;
        text-transform: uppercase;
        color: var(--fg);
    }
    p {
        font-size: 1.4rem;
        line-height: 1.4;
        color: var(--fg-3);
    }
    small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
    [data-go] {
        ${labelText};
        font-size: 1rem;
        color: var(--accent);
        opacity: 0;
        transition: opacity 120ms steps(2);
    }

    &[aria-current="true"] {
        ${pixelFrame("var(--accent)")};
    }
    @media (hover: hover) {
        &:hover {
            transform: translateY(-4px);
            ${pixelFrame("var(--fg-3)")};
        }
        &:hover [data-go] {
            opacity: 1;
        }
    }
    &:focus-visible [data-go] {
        opacity: 1;
    }
`;

const Top = styled.span`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
`;

/* Draw every card's motif, revealed up to `progress` (0..1). */
function drawMotif(
    canvas: HTMLCanvasElement,
    rows: string[],
    order: Array<[number, number]>,
    progress: number,
    colors: Record<string, string>
): void {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const shown = Math.round(order.length * progress);
    for (let k = 0; k < order.length; k += 1) {
        const [x, y] = order[k];
        const visible = k < shown;
        ctx.fillStyle = visible ? colors[rows[y][x]] : colors.ghost;
        ctx.fillRect(x * (CELL + GAP), y * (CELL + GAP), CELL, CELL);
        if (visible && k === shown - 1 && progress < 1) {
            // The newest block: a lit top edge, like the step being run.
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillRect(x * (CELL + GAP), y * (CELL + GAP), CELL, 3);
        }
    }
}

/* Structure ('#') first in reading order, then the coloured steps. */
function buildOrder(rows: string[]): Array<[number, number]> {
    const structure: Array<[number, number]> = [];
    const steps: Array<[number, number]> = [];
    rows.forEach((row, y) =>
        [...row].forEach((cell, x) => {
            if (cell === ".") return;
            (cell === "#" ? structure : steps).push([x, y]);
        })
    );
    return [...structure, ...steps];
}

function resolveColors(): Record<string, string> {
    const style = getComputedStyle(document.documentElement);
    const out: Record<string, string> = {
        ghost: style.getPropertyValue("--surface-2").trim() || "#2b251f",
    };
    for (const [key, value] of Object.entries(MOTIF_COLORS)) {
        const name = value.match(/var\((--[^)]+)\)/)?.[1];
        out[key] = (name && style.getPropertyValue(name).trim()) || "#7a6c5a";
    }
    return out;
}

function CategoryOverview(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const open = useSelector<RootState, boolean>(getOverviewOpen);
    const current = useSelector<RootState, string>(getActiveCategory);
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const reduced = useReducedMotion();
    const canvases = useRef<Map<string, HTMLCanvasElement>>(new Map());

    // One loop for every preview; each card runs a little out of phase.
    useEffect(() => {
        if (!open) return;
        const colors = resolveColors();
        const cards = CATEGORIES.map((def, index) => {
            const rows =
                CATEGORY_PREVIEW[def.id as keyof typeof CATEGORY_PREVIEW].motif;
            return {
                id: def.id,
                rows,
                order: buildOrder(rows),
                offset: index * 230,
            };
        });
        const paint = (now: number): void => {
            cards.forEach(({ id, rows, order, offset }) => {
                const canvas = canvases.current.get(id);
                if (!canvas) return;
                const t = (now + offset) % (BUILD_MS + HOLD_MS);
                const progress = reduced ? 1 : Math.min(1, t / BUILD_MS);
                drawMotif(canvas, rows, order, progress, colors);
            });
        };
        if (reduced) {
            paint(0);
            return;
        }
        let frame = 0;
        let last = 0;
        const tick = (now: number): void => {
            // ~12 fps is plenty for blocks appearing, and stays cheap.
            if (now - last > 80) {
                last = now;
                paint(now);
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [open, reduced]);

    // Escape goes back, but only if there is something to go back to.
    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent): void => {
            if (event.key === "Escape" && active.length > 0)
                dispatch(setOverviewOpen(false));
        };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [open, active.length, dispatch]);

    if (!open) return null;

    const choose = (id: string): void => {
        const starter =
            CATEGORY_PREVIEW[id as keyof typeof CATEGORY_PREVIEW].starter;
        // Same family with panels open: just go back to them.
        if (id === current && active.length > 0) {
            dispatch(setOverviewOpen(false));
            return;
        }
        dispatch(changeCategory(id));
        dispatch(closeAllAlgorithms());
        starter.forEach((algo) => dispatch(openAlgorithm(algo)));
        dispatch(setOverviewOpen(false));
    };

    const total = CATEGORIES.reduce(
        (sum, def) =>
            sum + (registryApi.getCategory(def.id)?.items.length ?? 0),
        0
    );

    return (
        <Overlay
            aria-labelledby="overview-title"
            role="dialog"
            aria-modal="true"
        >
            <Head>
                <div>
                    <p>
                        {CATEGORIES.length} families · {total} algorithms
                    </p>
                    <Title id="overview-title">
                        What do you want to watch?
                    </Title>
                </div>
                {active.length > 0 && (
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        onClick={() => dispatch(setOverviewOpen(false))}
                    >
                        <PixelIcon name="close" scale={2} />
                        Back
                    </PixelButton>
                )}
            </Head>
            <Grid>
                {CATEGORIES.map((def) => {
                    const preview =
                        CATEGORY_PREVIEW[
                            def.id as keyof typeof CATEGORY_PREVIEW
                        ];
                    const category = registryApi.getCategory(def.id);
                    const names = preview.starter.map(
                        (id) =>
                            category?.items.find((item) => item.id === id)?.meta
                                .name ?? id
                    );
                    const cols = preview.motif[0].length;
                    const rows = preview.motif.length;
                    return (
                        <li key={def.id}>
                            <Card
                                type="button"
                                aria-current={def.id === current || undefined}
                                onClick={() => choose(def.id)}
                            >
                                <Top>
                                    <small>
                                        {category?.items.length ?? 0} algorithms
                                    </small>
                                    <span data-go>Open ▸</span>
                                </Top>
                                <canvas
                                    ref={(el) => {
                                        if (el)
                                            canvases.current.set(def.id, el);
                                        else canvases.current.delete(def.id);
                                    }}
                                    width={cols * (CELL + GAP) - GAP}
                                    height={rows * (CELL + GAP) - GAP}
                                    aria-hidden="true"
                                />
                                <span>
                                    <strong>
                                        {category?.name ?? def.label}
                                    </strong>
                                    <p>{preview.blurb}</p>
                                </span>
                                <small>Starts with {names.join(" · ")}</small>
                            </Card>
                        </li>
                    );
                })}
            </Grid>
        </Overlay>
    );
}

export default CategoryOverview;
