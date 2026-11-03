import { JSX } from "react";
import InputLayout from "./InputLayout";
import { DiceButton, Form, Note, SizeField } from "./form";
import { useCategoryInput } from "./useCategoryInput";
import { GRID_MAX_COLS, GRID_MIN_COLS, gridSize } from "../../../../utils/grid";

const snapCols = (cols: number): number => gridSize(cols).cols;

function MazeInputPanel(): JSX.Element {
    const { busy, size, setSize, face, apply } = useCategoryInput(
        "maze",
        "cols",
        { face: 1, snap: snapCols }
    );
    const { cols, rows } = gridSize(size);

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New seed · G
                </DiceButton>
            }
        >
            <Form>
                <SizeField
                    label="Size"
                    sliderLabel="Maze width in cells"
                    display={`${cols}×${rows}`}
                    tabular
                    value={size}
                    min={GRID_MIN_COLS}
                    max={GRID_MAX_COLS}
                    step={2}
                    onChange={setSize}
                />
                <Note>
                    Every panel carves from the <b>same seed</b>, so differences
                    you see come from the algorithm alone: long corridors versus
                    short branches, bias versus fairness. Use <b>Solve</b> on a
                    panel to race path finders through its maze.
                </Note>
            </Form>
        </InputLayout>
    );
}

export default MazeInputPanel;
