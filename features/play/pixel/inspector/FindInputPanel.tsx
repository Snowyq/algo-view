import { JSX, useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    FIND_MAX_LENGTH,
    FIND_MIN_LENGTH,
    FIND_PRESETS,
    FIND_TARGETS,
    generateFindInput,
    type FindConfig,
    type FindInput,
    type FindPreset,
    type FindTarget,
} from "../../../../utils/findInput";
import { randomSeed } from "../../../../utils/randoms";
import {
    applyInput,
    getActiveAlgorithms,
    getFindConfig,
    getFindInput,
    getCanvasWorkerLoading,
    type ActiveAlgorithm,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<FindPreset, string> = {
    even: "Even steps",
    random: "Random",
    duplicates: "Duplicates",
    skewed: "Skewed",
};

const TARGET_LABELS: Record<FindTarget, { label: string; hint: string }> = {
    present: { label: "In the array", hint: "somewhere" },
    missing: { label: "Missing", hint: "not there" },
    first: { label: "First", hint: "index 0" },
    last: { label: "Last", hint: "the end" },
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

const Choices = styled.div<{ $cols: number }>`
    display: grid;
    grid-template-columns: repeat(${({ $cols }) => $cols}, minmax(0, 1fr));
    gap: 0.8rem;
`;

const Choice = styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.6rem;
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

const Target = styled.p`
    display: flex;
    align-items: baseline;
    gap: 1rem;
    padding: 1.2rem 1.4rem;
    margin: var(--b);
    background-color: var(--bg);
    color: var(--fg-3);
    ${pixelFrame("var(--line)")};

    strong {
        font-family: var(--f-display);
        font-weight: 400;
        font-size: 3.2rem;
        line-height: 0.8;
        color: var(--color-find-target);
    }
`;

/* A dozen bars of the shape this preset produces, plus a target tick. */
function PresetThumb({ preset }: { preset: FindPreset }): JSX.Element {
    const { values } = useMemo(
        () =>
            generateFindInput({
                preset,
                length: 12,
                target: "present",
                seed: 7,
            }),
        [preset]
    );
    const max = Math.max(...values);
    return (
        <svg
            data-pixel
            width={12 * 5}
            height={24}
            viewBox="0 0 60 24"
            fill="currentColor"
            aria-hidden="true"
        >
            {values.map((value, i) => {
                const h = Math.max(1, Math.round((value / max) * 8)) * 3;
                return (
                    <rect key={i} x={i * 5} y={24 - h} width={4} height={h} />
                );
            })}
        </svg>
    );
}

function FindInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, FindConfig>(getFindConfig);
    const input = useSelector<RootState, FindInput>(getFindInput);
    const loading = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const panels = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    ).length;
    const busy = loading && panels > 0;
    const [length, setLength] = useState<number>(config.length);
    const [face, setFace] = useState<number>(3);

    const [synced, setSynced] = useState<FindConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setLength(config.length);
    }

    const apply = (patch: Partial<FindConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "find",
                config: { ...config, length, ...patch, seed },
            })
        );
        setFace(seed % 6);
    };

    // Length applies shortly after the slider settles.
    useEffect(() => {
        if (length === config.length) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "find",
                        config: { ...config, length, seed: randomSeed() },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [length, config, dispatch]);

    const present = input.values.includes(input.target);

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
                    New array · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Looking for</FieldLabel>
                    </FieldHead>
                    <Target>
                        <strong>{input.target}</strong>
                        {present ? "is in the array" : "is not in the array"}
                    </Target>
                    <Choices $cols={2} role="radiogroup" aria-label="Target">
                        {FIND_TARGETS.map((target) => (
                            <Choice
                                key={target}
                                type="button"
                                role="radio"
                                aria-checked={config.target === target}
                                disabled={busy}
                                onClick={() => apply({ target })}
                            >
                                {TARGET_LABELS[target].label}
                                <small>{TARGET_LABELS[target].hint}</small>
                            </Choice>
                        ))}
                    </Choices>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Shape (sorted)</FieldLabel>
                    </FieldHead>
                    <Choices $cols={2}>
                        {FIND_PRESETS.map((preset) => (
                            <Choice
                                key={preset}
                                type="button"
                                aria-pressed={config.preset === preset}
                                disabled={busy}
                                onClick={() => apply({ preset })}
                            >
                                <PresetThumb preset={preset} />
                                {PRESET_LABELS[preset]}
                            </Choice>
                        ))}
                    </Choices>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Values</FieldLabel>
                        <BigValue>{length}</BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={FIND_MIN_LENGTH}
                        max={FIND_MAX_LENGTH}
                        values={[length]}
                        labels={["Number of values"]}
                        onChange={([value]) => setLength(value)}
                    />
                </Field>
            </Form>
        </InputLayout>
    );
}

export default FindInputPanel;
