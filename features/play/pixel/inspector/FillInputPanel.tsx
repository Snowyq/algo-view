import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    FILL_MAX_COLS,
    FILL_MIN_COLS,
    FILL_PRESETS,
    fillRows,
    type FillConfig,
    type FillInput,
    type FillPreset,
} from "../../../../utils/fillInput";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<FillPreset, { label: string; hint: string }> = {
    caves: { label: "Caves", hint: "diagonal pinches" },
    rooms: { label: "Rooms", hint: "doors" },
    rings: { label: "Rings", hint: "one corridor" },
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
`;

const Choices = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
`;

const Choice = styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.4rem;
    padding: 0.8rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg-2);
    color: var(--fg-3);
    font-size: 1.4rem;
    text-align: left;
    ${pixelFrame("var(--line)")};

    small {
        ${labelText};
        font-size: 0.9rem;
        color: var(--fg-4);
    }
    &[aria-pressed="true"] {
        color: var(--fg);
        background-color: var(--surface-2);
        ${pixelFrame("var(--accent)")};
    }
    @media (hover: hover) {
        &:hover:not([aria-pressed="true"]) {
            color: var(--fg);
        }
    }
`;

const Facts = styled.dl`
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 0.8rem 1.2rem;
    padding: 1.2rem 1.4rem;
    margin: var(--b);
    background-color: var(--bg);
    ${pixelFrame("var(--line)")};

    dt {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
        padding-top: 0.2rem;
    }
    dd {
        font-family: var(--f-mono);
        font-size: 1.3rem;
        color: var(--fg);
    }
`;

const getConfig = (state: RootState): FillConfig =>
    state.play.inputs.fill.config;
const getValue = (state: RootState): FillInput => state.play.inputs.fill.value;

function FillInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, FillConfig>(getConfig);
    const input = useSelector<RootState, FillInput>(getValue);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [size, setSize] = useState<number>(config.cols);
    const [face, setFace] = useState<number>(5);

    const [synced, setSynced] = useState<FillConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setSize(config.cols);
    }

    useEffect(() => {
        if (size === config.cols) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "fill",
                        config: { ...config, cols: size },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [size, config, dispatch]);

    const apply = (patch: Partial<FillConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "fill",
                config: { ...config, cols: size, ...patch, seed },
            })
        );
        setFace(seed % 6);
    };

    return (
        <InputLayout
            action={
                <PixelButton
                    type="button"
                    $variant="primary"
                    $size="lg"
                    disabled={busy}
                    onClick={() => apply({})}
                >
                    <PixelIcon name={DICE[face]} scale={2} />
                    New bitmap · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Bitmap</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {FILL_PRESETS.map((preset) => (
                            <Choice
                                key={preset}
                                type="button"
                                aria-pressed={config.preset === preset}
                                disabled={busy}
                                onClick={() => apply({ preset })}
                            >
                                {PRESET_LABELS[preset].label}
                                <small>{PRESET_LABELS[preset].hint}</small>
                            </Choice>
                        ))}
                    </Choices>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Width</FieldLabel>
                        <BigValue>
                            {size}×{fillRows(size)}
                        </BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={FILL_MIN_COLS}
                        max={FILL_MAX_COLS}
                        values={[size]}
                        labels={["Bitmap width"]}
                        onChange={([value]) => setSize(value)}
                    />
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Size</dt>
                        <dd>
                            {input.cols} × {input.rows}
                        </dd>
                        <dt>Open</dt>
                        <dd>
                            {input.walls.filter((w) => w === 0).length} cells
                        </dd>
                        <dt>Start</dt>
                        <dd>
                            {input.start % input.cols},{" "}
                            {Math.floor(input.start / input.cols)}
                        </dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default FillInputPanel;
