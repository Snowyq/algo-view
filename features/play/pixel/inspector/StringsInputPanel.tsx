import { JSX } from "react";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import {
    DiceButton,
    Field,
    FieldHead,
    FieldLabel,
    Form,
    PresetField,
    SizeField,
    type ChoiceLabels,
} from "./form";
import { useCategoryInput } from "./useCategoryInput";
import {
    TEXT_MAX_LENGTH,
    TEXT_MIN_LENGTH,
    TEXT_PRESETS,
    type TextPreset,
} from "../../../../utils/textInput";
import { pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: ChoiceLabels<TextPreset> = {
    prose: { label: "Prose", hint: "skips pay off" },
    dna: { label: "DNA", hint: "4 letters" },
    repetitive: { label: "aaa…ab", hint: "naive worst case" },
};

const Sample = styled.p`
    padding: 1.2rem 1.4rem;
    margin: var(--b);
    background-color: var(--bg);
    font-family: var(--f-mono);
    font-size: 1.3rem;
    line-height: 1.7;
    color: var(--fg-3);
    word-break: break-all;
    white-space: pre-wrap;
    ${pixelFrame("var(--line)")};

    mark {
        background: transparent;
        color: var(--fg);
        box-shadow: inset 0 -0.3rem 0 var(--color-step-finish);
    }
`;

const Pattern = styled.output`
    font-family: var(--f-mono);
    font-size: 1.6rem;
    color: var(--fg);
`;

/* Wraps every occurrence of the pattern in <mark>; overlaps merge. */
function highlight(text: string, pattern: string): Array<string | JSX.Element> {
    const out: Array<string | JSX.Element> = [];
    let from = 0;
    let at = text.indexOf(pattern);
    while (pattern && at !== -1) {
        if (at > from) out.push(text.slice(from, at));
        const end = Math.max(at + pattern.length, from);
        out.push(<mark key={at}>{text.slice(Math.max(at, from), end)}</mark>);
        from = end;
        at = text.indexOf(pattern, at + 1);
    }
    out.push(text.slice(from));
    return out;
}

function StringsInputPanel(): JSX.Element {
    const {
        config,
        value: input,
        busy,
        size,
        setSize,
        face,
        apply,
    } = useCategoryInput("strings", "length");

    return (
        <InputLayout
            action={
                <DiceButton face={face} disabled={busy} onClick={() => apply()}>
                    New text · G
                </DiceButton>
            }
        >
            <Form>
                <PresetField
                    label="Text"
                    presets={TEXT_PRESETS}
                    labels={PRESET_LABELS}
                    current={config.preset}
                    disabled={busy}
                    onPick={(preset) => apply({ preset })}
                />
                <SizeField
                    label="Length"
                    sliderLabel="Text length"
                    value={size}
                    min={TEXT_MIN_LENGTH}
                    max={TEXT_MAX_LENGTH}
                    onChange={setSize}
                />
                <Field>
                    <FieldHead>
                        <FieldLabel>Find</FieldLabel>
                        <Pattern>{input.pattern}</Pattern>
                    </FieldHead>
                    <Sample>{highlight(input.text, input.pattern)}</Sample>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default StringsInputPanel;
