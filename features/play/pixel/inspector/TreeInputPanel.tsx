import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    TREE_MAX_COUNT,
    TREE_MIN_COUNT,
    TREE_PRESETS,
    type TreeConfig,
    type TreeInput,
    type TreePreset,
} from "../../../../utils/treeInput";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<TreePreset, { label: string; hint: string }> = {
    random: { label: "Random", hint: "bushy BST" },
    ascending: { label: "Ascending", hint: "BST → list" },
    zigzag: { label: "Zigzag", hint: "outside in" },
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

const getConfig = (state: RootState): TreeConfig =>
    state.play.inputs.tree.config;
const getValue = (state: RootState): TreeInput => state.play.inputs.tree.value;

function TreeInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, TreeConfig>(getConfig);
    const input = useSelector<RootState, TreeInput>(getValue);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [size, setSize] = useState<number>(config.count);
    const [face, setFace] = useState<number>(5);

    const [synced, setSynced] = useState<TreeConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setSize(config.count);
    }

    useEffect(() => {
        if (size === config.count) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "tree",
                        config: { ...config, count: size },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [size, config, dispatch]);

    const apply = (patch: Partial<TreeConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "tree",
                config: { ...config, count: size, ...patch, seed },
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
                    New keys · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Insert order</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {TREE_PRESETS.map((preset) => (
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
                        <FieldLabel>Keys</FieldLabel>
                        <BigValue>{size}</BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={TREE_MIN_COUNT}
                        max={TREE_MAX_COUNT}
                        values={[size]}
                        labels={["Key count"]}
                        onChange={([value]) => setSize(value)}
                    />
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Each algorithm gets</FieldLabel>
                    </FieldHead>
                    <Facts>
                        <dt>Keys</dt>
                        <dd>{input.keys.join(" ")}</dd>
                    </Facts>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default TreeInputPanel;
