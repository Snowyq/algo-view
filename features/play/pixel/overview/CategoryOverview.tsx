import { JSX, useCallback, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import registryApi from "../../../../algorithms/algorithmsRegistryApi";
import useReducedMotion from "../../../../hooks/useReducedMotion";
import type { AppDispatch, RootState } from "../../../../store";
import { CATEGORIES, type CategoryDef } from "../../categories";
import {
    CATEGORY_PREVIEW,
    MOTIF_COLORS,
    type CategoryPreview,
} from "../../categoryPreview";
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
import { cssVar } from "../fx/dom";
import {
    labelText,
    pixelCorners,
    pixelFrame,
    scrollY,
} from "../primitives/pixel";
import PixelSprite from "../sprites/PixelSprite";
import { useEscapeKey } from "../../../../hooks/useEscapeKey";

/*
 * Category picker and the playground's front door. Each card's motif builds
 * like an algorithm run: structure, then steps, pause, repeat.
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
    ${scrollY};
    padding: 4rem clamp(1.6rem, 4vw, 4.8rem) 6.4rem;
    background-color: var(--bg);
    background-image: radial-gradient(var(--line) 1px, transparent 1px);
    background-size: 16px 16px;
    animation: px-dither-in 180ms steps(4) both;
`;

const Head = styled.header`
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: 2.4rem;
    max-width: 128rem;
    margin: 0 auto 3.2rem;

    p {
        display: flex;
        align-items: flex-end;
        gap: 1rem;
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

/* Cards dither in one after another. */
const Grid = styled.ul`
    & > li {
        animation: px-dither-in 220ms both;
    }

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
    ${pixelCorners()};
    @media (hover: hover) {
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

type Cell = [number, number];

const previewOf = (id: string): CategoryPreview =>
    CATEGORY_PREVIEW[id as keyof typeof CATEGORY_PREVIEW];

/* Draws a motif revealed up to `progress` (0..1). */
function drawMotif(
    canvas: HTMLCanvasElement,
    rows: string[],
    order: Cell[],
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
            // newest block gets a lit top edge, like the step being run
            ctx.fillStyle = "rgba(255, 255, 255, 0.55)";
            ctx.fillRect(x * (CELL + GAP), y * (CELL + GAP), CELL, 3);
        }
    }
}

/* Structure ('#') first in reading order, then the coloured steps. */
function buildOrder(rows: string[]): Cell[] {
    const structure: Cell[] = [];
    const steps: Cell[] = [];
    rows.forEach((row, y) =>
        [...row].forEach((cell, x) => {
            if (cell === ".") return;
            (cell === "#" ? structure : steps).push([x, y]);
        })
    );
    return [...structure, ...steps];
}

function resolveColors(): Record<string, string> {
    const root = document.documentElement;
    const out: Record<string, string> = {
        ghost: cssVar(root, "--surface-2", "#2b251f"),
    };
    for (const [key, value] of Object.entries(MOTIF_COLORS)) {
        const name = value.match(/var\((--[^)]+)\)/)?.[1];
        out[key] = name ? cssVar(root, name, "#7a6c5a") : "#7a6c5a";
    }
    return out;
}

/* One paint loop for all card canvases, each slightly out of phase. */
function useMotifPreviews(
    open: boolean
): (id: string) => (el: HTMLCanvasElement | null) => void {
    const reduced = useReducedMotion();
    const canvases = useRef<Map<string, HTMLCanvasElement>>(new Map());

    useEffect(() => {
        if (!open) return;
        const colors = resolveColors();
        const cards = CATEGORIES.map((def, index) => {
            const rows = previewOf(def.id).motif;
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
            // ~12 fps is plenty for blocks appearing
            if (now - last > 80) {
                last = now;
                paint(now);
            }
            frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(frame);
    }, [open, reduced]);

    return useCallback(
        (id: string) => (el: HTMLCanvasElement | null) => {
            if (el) canvases.current.set(id, el);
            else canvases.current.delete(id);
        },
        []
    );
}

type CategoryCardProps = {
    def: CategoryDef;
    index: number;
    current: boolean;
    canvasRef: (el: HTMLCanvasElement | null) => void;
    onChoose: (id: string) => void;
};

function CategoryCard({
    def,
    index,
    current,
    canvasRef,
    onChoose,
}: CategoryCardProps): JSX.Element {
    const preview = previewOf(def.id);
    const category = registryApi.getCategory(def.id);
    const names = preview.starter.map(
        (id) => category?.items.find((item) => item.id === id)?.meta.name ?? id
    );
    const cols = preview.motif[0].length;
    const rows = preview.motif.length;
    return (
        <li style={{ animationDelay: `${index * 35}ms` }}>
            <Card
                type="button"
                aria-current={current || undefined}
                onClick={() => onChoose(def.id)}
            >
                <Top>
                    <small>{category?.items.length ?? 0} algorithms</small>
                    <span data-go>Open ▸</span>
                </Top>
                <canvas
                    ref={canvasRef}
                    width={cols * (CELL + GAP) - GAP}
                    height={rows * (CELL + GAP) - GAP}
                    aria-hidden="true"
                />
                <span>
                    <strong>{category?.name ?? def.label}</strong>
                    <p>{preview.blurb}</p>
                </span>
                <small>Starts with {names.join(" · ")}</small>
            </Card>
        </li>
    );
}

function CategoryOverview(): JSX.Element | null {
    const dispatch = useDispatch<AppDispatch>();
    const open = useSelector<RootState, boolean>(getOverviewOpen);
    const current = useSelector<RootState, string>(getActiveCategory);
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const canvasRef = useMotifPreviews(open);

    // Escape goes back, but only if there is something to go back to
    useEscapeKey(open, () => {
        if (active.length > 0) dispatch(setOverviewOpen(false));
    });

    if (!open) return null;

    const choose = (id: string): void => {
        // same family with panels open: just go back to them
        if (id === current && active.length > 0) {
            dispatch(setOverviewOpen(false));
            return;
        }
        dispatch(changeCategory(id));
        dispatch(closeAllAlgorithms());
        previewOf(id).starter.forEach((algo) => dispatch(openAlgorithm(algo)));
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
                        <PixelSprite animal="cat" state="sit" scale={2} />
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
                {CATEGORIES.map((def, index) => (
                    <CategoryCard
                        key={def.id}
                        def={def}
                        index={index}
                        current={def.id === current}
                        canvasRef={canvasRef(def.id)}
                        onChoose={choose}
                    />
                ))}
            </Grid>
        </Overlay>
    );
}

export default CategoryOverview;
