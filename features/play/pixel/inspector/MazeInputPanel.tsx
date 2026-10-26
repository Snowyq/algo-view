import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { MazeConfig } from "../../../../algorithms/categoryData";
import type { AppDispatch, RootState } from "../../../../store";
import { GRID_MAX_COLS, GRID_MIN_COLS, gridSize } from "../../../../utils/grid";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

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

const Note = styled.p`
    padding: 1.2rem 1.4rem;
    margin: var(--b);
    background-color: var(--bg);
    color: var(--fg-3);
    font-size: 1.4rem;
    line-height: 1.5;
    ${pixelFrame("var(--line)")};

    b {
        color: var(--fg);
        font-weight: 400;
    }
`;

const getConfig = (state: RootState): MazeConfig =>
    state.play.inputs.maze.config;

function MazeInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, MazeConfig>(getConfig);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [cols, setCols] = useState<number>(config.cols);
    const [face, setFace] = useState<number>(1);

    const [synced, setSynced] = useState<MazeConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setCols(config.cols);
    }

    useEffect(() => {
        if (gridSize(cols).cols === gridSize(config.cols).cols) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "maze",
                        config: { ...config, cols },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [cols, config, dispatch]);

    const reseed = (): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(applyInput({ category: "maze", config: { cols, seed } }));
        setFace(seed % 6);
    };

    const { cols: realCols, rows } = gridSize(cols);

    return (
        <InputLayout
            action={
                <PixelButton
                    type="button"
                    $variant="primary"
                    $size="lg"
                    disabled={busy}
                    onClick={reseed}
                >
                    <PixelIcon name={DICE[face]} scale={2} />
                    New seed · G
                </PixelButton>
            }
        >
            <Form>
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
                        labels={["Maze width in cells"]}
                        onChange={([value]) => setCols(value)}
                    />
                </Field>
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
