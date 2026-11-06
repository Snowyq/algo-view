import { JSX, useMemo } from "react";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import {
    BarThumb,
    Choices,
    DiceButton,
    Field,
    FieldHead,
    FieldLabel,
    Form,
    SizeField,
    ThumbChoice,
    type ChoiceLabels,
} from "./form";
import { useCategoryInput } from "./useCategoryInput";
import {
    FIND_MAX_LENGTH,
    FIND_MIN_LENGTH,
    FIND_PRESETS,
    FIND_TARGETS,
    generateFindInput,
    type FindPreset,
    type FindTarget,
} from "../../../../utils/findInput";
import { pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<FindPreset, string> = {
    even: "Even steps",
    random: "Random",
    duplicates: "Duplicates",
    skewed: "Skewed",
};

const TARGET_LABELS: ChoiceLabels<FindTarget> = {
    present: { label: "In the array", hint: "somewhere" },
    missing: { label: "Missing", hint: "not there" },
    first: { label: "First", hint: "index 0" },
    last: { label: "Last", hint: "the end" },
};

const Choice = styled(ThumbChoice)`
    gap: 0.6rem;
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

function PresetThumb({ preset }: { preset: FindPreset }): JSX.Element {
    const levels = useMemo(() => {
        const { values } = generateFindInput({
            preset,
            length: 12,
            target: "present",
            seed: 7,
        });
        const max = Math.max(...values);
        return values.map((value) =>
            Math.max(1, Math.round((value / max) * 8))
        );
    }, [preset]);
    return <BarThumb levels={levels} />;
}

function FindInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("find", "length", {
        face: 3,
        reseedOnResize: true,
        busyNeedsPanels: true,
    });
    const present = input.values.includes(input.target);

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New array · G
                </DiceButton>
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

                <SizeField
                    label="Values"
                    sliderLabel="Number of values"
                    tabular
                    value={size}
                    min={FIND_MIN_LENGTH}
                    max={FIND_MAX_LENGTH}
                    onChange={setSize}
                />
            </Form>
        </InputLayout>
    );
}

export default FindInputPanel;
