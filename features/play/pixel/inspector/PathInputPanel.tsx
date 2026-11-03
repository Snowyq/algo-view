import { JSX, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import {
    Choices,
    DiceButton,
    Field,
    FieldHead,
    FieldLabel,
    Form,
    Note,
    SizeField,
    ThumbChoice,
} from "./form";
import { useCategoryInput } from "./useCategoryInput";
import type { AppDispatch, RootState } from "../../../../store";
import {
    CELL_MUD,
    CELL_WALL,
    GRID_MAX_COLS,
    GRID_MIN_COLS,
    GRID_PRESETS,
    generateGrid,
    gridSize,
    type GridInput,
    type GridPreset,
} from "../../../../utils/grid";
import { getGridEdited, setEditorOpen } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import { labelText } from "../primitives/pixel";

const PRESET_LABELS: Record<GridPreset, string> = {
    empty: "Open field",
    scatter: "Scatter",
    maze: "Maze",
    mud: "Mud",
    rooms: "Rooms",
};

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

const snapCols = (cols: number): number => gridSize(cols).cols;

function cellColor(grid: GridInput, i: number): string {
    if (i === grid.start) return "var(--color-path-start)";
    if (i === grid.end) return "var(--color-path-end)";
    if (grid.cells[i] === CELL_WALL) return "var(--color-path-wall)";
    if (grid.cells[i] === CELL_MUD) return "var(--color-path-mud-dot)";
    return "var(--color-path-empty)";
}

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
            {grid.cells.map((_, i) => (
                <rect
                    key={i}
                    x={i % grid.cols}
                    y={Math.floor(i / grid.cols)}
                    width={1}
                    height={1}
                    fill={cellColor(grid, i)}
                />
            ))}
        </svg>
    );
}

function PathInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const edited = useSelector<RootState, boolean>(getGridEdited);
    const { config, busy, size, setSize, face, apply } = useCategoryInput(
        "path",
        "cols",
        { face: 2, reseedOnResize: true, snap: snapCols, busyNeedsPanels: true }
    );
    const { cols, rows } = gridSize(size);

    return (
        <InputLayout
            action={
                <Actions>
                    <PixelButton
                        type="button"
                        $size="lg"
                        disabled={busy}
                        onClick={() => apply({ preset: "empty" })}
                    >
                        <PixelIcon name="trash" scale={2} />
                        Clear
                    </PixelButton>
                    <DiceButton
                        face={face}
                        disabled={busy}
                        onClick={() => apply()}
                    >
                        New map · G
                    </DiceButton>
                </Actions>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Map</FieldLabel>
                        {edited && <Edited>Edited by hand</Edited>}
                    </FieldHead>
                    <Choices>
                        {GRID_PRESETS.map((preset) => (
                            <ThumbChoice
                                key={preset}
                                type="button"
                                aria-pressed={
                                    config.preset === preset && !edited
                                }
                                disabled={busy}
                                onClick={() => apply({ preset })}
                            >
                                <PresetThumb preset={preset} />
                                {PRESET_LABELS[preset]}
                            </ThumbChoice>
                        ))}
                    </Choices>
                </Field>

                <SizeField
                    label="Size"
                    sliderLabel="Grid width in cells"
                    display={`${cols}×${rows}`}
                    tabular
                    value={size}
                    min={GRID_MIN_COLS}
                    max={GRID_MAX_COLS}
                    step={2}
                    onChange={setSize}
                />

                <Field>
                    <FieldHead>
                        <FieldLabel>Your own map</FieldLabel>
                    </FieldHead>
                    <Note>
                        Draw walls and mud, and move the start and end, in the
                        editor over the panels.
                    </Note>
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
