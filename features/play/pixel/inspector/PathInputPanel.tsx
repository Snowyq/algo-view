import { JSX, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    CELL_MUD,
    CELL_WALL,
    GRID_MAX_COLS,
    GRID_MIN_COLS,
    GRID_PRESETS,
    generateGrid,
    gridSize,
    type GridConfig,
    type GridPreset,
} from "../../../../utils/grid";
import { randomSeed } from "../../../../utils/randoms";
import {
    applyInput,
    getActiveAlgorithms,
    getGridConfig,
    getGridEdited,
    getCanvasWorkerLoading,
    setEditorOpen,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<GridPreset, string> = {
    empty: "Open field",
    scatter: "Scatter",
    maze: "Maze",
    mud: "Mud",
    rooms: "Rooms",
};

const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.8rem;
`;

const Field = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
`;

const FieldHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.2rem;
`;

const FieldLabel = styled.h3`
    ${labelText};
    color: var(--fg-3);
`;

const BigValue = styled.output`
    font-family: var(--f-display);
    font-size: 3.2rem;
    line-height: 0.8;
    color: var(--fg);
    font-variant-numeric: tabular-nums;
`;

const Presets = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
`;

const Choice = styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.8rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg-2);
    color: var(--fg-3);
    font-size: 1.3rem;
    text-align: left;
    ${pixelFrame("var(--line)")};

    @media (hover: hover) {
        &:hover:not(:disabled) {
            color: var(--fg);
            ${pixelFrame("var(--fg-3)")};
        }
    }
    &[aria-pressed="true"],
    &[aria-checked="true"] {
        color: var(--fg);
        background-color: var(--surface-2);
        ${pixelFrame("var(--accent)")};
    }
    &:active:not(:disabled) {
        transform: translateY(2px);
    }

    small {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const Help = styled.p`
    padding: 1.2rem 1.4rem;
    background-color: var(--bg);
    color: var(--fg-3);
    font-size: 1.4rem;
    line-height: 1.5;
    ${pixelFrame("var(--line)")};
    margin: var(--b);

    b {
        color: var(--fg);
        font-weight: 400;
    }
    i {
        display: inline-block;
        width: 1rem;
        height: 1rem;
        margin: 0 0.4rem;
        vertical-align: -1px;
        font-style: normal;
    }
`;

const Edited = styled.p`
    ${labelText};
    font-size: 1rem;
    color: var(--color-step-check);
`;

const Actions = styled.div`
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 0.8rem;
`;

/* Tiny bitmap of what a preset produces (fixed seed). */
function PresetThumb({ preset }: { preset: GridPreset }): JSX.Element {
    const grid = useMemo(
        () => generateGrid({ preset, cols: 15, seed: 7 }),
        [preset]
    );
    return (
        <svg
            data-pixel
            width={grid.cols * 4}
            height={grid.rows * 4}
            viewBox={`0 0 ${grid.cols} ${grid.rows}`}
            aria-hidden="true"
        >
            {grid.cells.map((cell, i) => {
                const x = i % grid.cols;
                const y = Math.floor(i / grid.cols);
                const fill =
                    i === grid.start
                        ? "var(--color-path-start)"
                        : i === grid.end
                          ? "var(--color-path-end)"
                          : cell === CELL_WALL
                            ? "var(--color-path-wall)"
                            : cell === CELL_MUD
                              ? "var(--color-path-mud-dot)"
                              : "var(--color-path-empty)";
                return (
                    <rect
                        key={i}
                        x={x}
                        y={y}
                        width={1}
                        height={1}
                        fill={fill}
                    />
                );
            })}
        </svg>
    );
}

function PathInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, GridConfig>(getGridConfig);
    const edited = useSelector<RootState, boolean>(getGridEdited);
    const loading = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const panels = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    ).length;
    const busy = loading && panels > 0;
    const [cols, setCols] = useState<number>(config.cols);
    const [face, setFace] = useState<number>(2);

    // Follow outside changes (shared link, G shortcut).
    const [synced, setSynced] = useState<GridConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setCols(config.cols);
    }

    const apply = (preset: GridPreset, size = cols): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "path",
                config: { preset, cols: size, seed },
            })
        );
        // The die shows a face picked by the new map's own seed.
        setFace(seed % 6);
    };

    // Resizing rebuilds the map shortly after the slider settles.
    useEffect(() => {
        if (gridSize(cols).cols === gridSize(config.cols).cols) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "path",
                        config: { ...config, cols, seed: randomSeed() },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [cols, config, dispatch]);

    const { cols: realCols, rows } = gridSize(cols);

    return (
        <InputLayout
            action={
                <Actions>
                    <PixelButton
                        type="button"
                        $size="lg"
                        disabled={busy}
                        onClick={() => apply("empty")}
                    >
                        <PixelIcon name="trash" scale={2} />
                        Clear
                    </PixelButton>
                    <PixelButton
                        type="button"
                        $variant="primary"
                        $size="lg"
                        disabled={busy}
                        onClick={() => apply(config.preset)}
                    >
                        <PixelIcon name={DICE[face]} scale={2} />
                        New map · G
                    </PixelButton>
                </Actions>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Map</FieldLabel>
                        {edited && <Edited>Edited by hand</Edited>}
                    </FieldHead>
                    <Presets>
                        {GRID_PRESETS.map((preset) => (
                            <Choice
                                key={preset}
                                type="button"
                                aria-pressed={
                                    config.preset === preset && !edited
                                }
                                disabled={busy}
                                onClick={() => apply(preset)}
                            >
                                <PresetThumb preset={preset} />
                                {PRESET_LABELS[preset]}
                            </Choice>
                        ))}
                    </Presets>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Size</FieldLabel>
                        <BigValue>
                            {realCols}×{rows}
                        </BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={GRID_MIN_COLS}
                        max={GRID_MAX_COLS}
                        step={2}
                        values={[cols]}
                        labels={["Grid width in cells"]}
                        onChange={([value]) => setCols(value)}
                    />
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Your own map</FieldLabel>
                    </FieldHead>
                    <Help>
                        Draw walls and mud, and move the start and end, in the
                        editor over the panels.
                    </Help>
                    <PixelButton
                        type="button"
                        $variant="ghost"
                        onClick={() => dispatch(setEditorOpen(true))}
                    >
                        <PixelIcon name="edit" scale={2} />
                        Edit data · E
                    </PixelButton>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default PathInputPanel;
