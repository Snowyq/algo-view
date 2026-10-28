import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    LIFE_MAX_COLS,
    LIFE_MIN_COLS,
    LIFE_PRESETS,
    lifeRows,
    type LifeConfig,
    type LifeInput,
    type LifePreset,
} from "../../../../utils/lifeInput";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<LifePreset, { label: string; hint: string }> = {
    soup: { label: "Soup", hint: "random noise" },
    symmetric: { label: "Mirror", hint: "4-way symmetric" },
    rpentomino: { label: "R-pentomino", hint: "5 busy cells" },
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

const getConfig = (state: RootState): LifeConfig =>
    state.play.inputs.life.config;
const getValue = (state: RootState): LifeInput => state.play.inputs.life.value;

function LifeInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, LifeConfig>(getConfig);
    const input = useSelector<RootState, LifeInput>(getValue);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [size, setSize] = useState<number>(config.cols);
    const [face, setFace] = useState<number>(5);

    const [synced, setSynced] = useState<LifeConfig>(config);
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
                        category: "life",
                        config: { ...config, cols: size },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [size, config, dispatch]);

    const apply = (patch: Partial<LifeConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "life",
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
                    New start · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Start</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {LIFE_PRESETS.map((preset) => (
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
                            {size}×{lifeRows(size)}
                        </BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={LIFE_MIN_COLS}
                        max={LIFE_MAX_COLS}
                        values={[size]}
                        labels={["Grid width"]}
                        onChange={([value]) => setSize(value)}
                    />
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Grid</dt>
                        <dd>
                            {input.cols} × {input.rows}, edges wrap
                        </dd>
                        <dt>Alive</dt>
                        <dd>{input.cells.filter(Boolean).length} cells</dd>
                        <dt>Runs</dt>
                        <dd>up to 150 generations</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default LifeInputPanel;
