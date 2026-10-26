import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    DP_MAX_SIZE,
    DP_MIN_SIZE,
    DP_PRESETS,
    type DpConfig,
    type DpInput,
    type DpPreset,
} from "../../../../utils/dpInput";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<DpPreset, { label: string; hint: string }> = {
    words: { label: "Words", hint: "kitten → sitting" },
    dna: { label: "DNA", hint: "ACGT strands" },
    letters: { label: "Letters", hint: "random a–h" },
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

/* What each algorithm in this category receives from the bundle. */
const Bundle = styled.dl`
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
        word-break: break-word;
    }
`;

const getConfig = (state: RootState): DpConfig => state.play.inputs.dp.config;
const getValue = (state: RootState): DpInput => state.play.inputs.dp.value;

function DpInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, DpConfig>(getConfig);
    const input = useSelector<RootState, DpInput>(getValue);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [size, setSize] = useState<number>(config.size);
    const [face, setFace] = useState<number>(5);

    const [synced, setSynced] = useState<DpConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setSize(config.size);
    }

    useEffect(() => {
        if (size === config.size) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({ category: "dp", config: { ...config, size } })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [size, config, dispatch]);

    const apply = (patch: Partial<DpConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "dp",
                config: { ...config, size, ...patch, seed },
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
                    New data · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Strings</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {DP_PRESETS.map((preset) => (
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
                        <FieldLabel>Size</FieldLabel>
                        <BigValue>{size}</BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={DP_MIN_SIZE}
                        max={DP_MAX_SIZE}
                        values={[size]}
                        labels={["Problem size"]}
                        onChange={([value]) => setSize(value)}
                    />
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Bundle>
                        <dt>Words</dt>
                        <dd>
                            {input.a} · {input.b}
                        </dd>
                        <dt>Items</dt>
                        <dd>
                            {input.items
                                .map((item) => `${item.weight}kg/${item.value}`)
                                .join("  ")}{" "}
                            · max {input.capacity}kg
                        </dd>
                        <dt>Coins</dt>
                        <dd>
                            {input.coins.join(", ")} → {input.amount}
                        </dd>
                        <dt>Sequence</dt>
                        <dd>{input.sequence.join(" ")}</dd>
                    </Bundle>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default DpInputPanel;
