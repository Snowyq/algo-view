import { JSX, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import InputLayout from "./InputLayout";
import type { AppDispatch, RootState } from "../../../../store";
import {
    TEXT_MAX_LENGTH,
    TEXT_MIN_LENGTH,
    TEXT_PRESETS,
    type TextConfig,
    type TextInput,
    type TextPreset,
} from "../../../../utils/textInput";
import { randomSeed } from "../../../../utils/randoms";
import { applyInput, getCanvasWorkerLoading } from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<TextPreset, { label: string; hint: string }> = {
    prose: { label: "Prose", hint: "skips pay off" },
    dna: { label: "DNA", hint: "4 letters" },
    repetitive: { label: "aaa…ab", hint: "naive worst case" },
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

/* The text, with every occurrence of the pattern underlined. */
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

const getConfig = (state: RootState): TextConfig =>
    state.play.inputs.strings.config;
const getValue = (state: RootState): TextInput =>
    state.play.inputs.strings.value;

function TextInputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, TextConfig>(getConfig);
    const input = useSelector<RootState, TextInput>(getValue);
    const busy = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const [size, setSize] = useState<number>(config.length);
    const [face, setFace] = useState<number>(5);

    const [synced, setSynced] = useState<TextConfig>(config);
    if (synced !== config) {
        setSynced(config);
        setSize(config.length);
    }

    useEffect(() => {
        if (size === config.length) return;
        const id = setTimeout(
            () =>
                dispatch(
                    applyInput({
                        category: "strings",
                        config: { ...config, length: size },
                    })
                ),
            250
        );
        return () => clearTimeout(id);
    }, [size, config, dispatch]);

    const apply = (patch: Partial<TextConfig>): void => {
        if (busy) return;
        const seed = randomSeed();
        dispatch(
            applyInput({
                category: "strings",
                config: { ...config, length: size, ...patch, seed },
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
                    New text · G
                </PixelButton>
            }
        >
            <Form>
                <Field>
                    <FieldHead>
                        <FieldLabel>Text</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {TEXT_PRESETS.map((preset) => (
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
                        <FieldLabel>Length</FieldLabel>
                        <BigValue>{size}</BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={TEXT_MIN_LENGTH}
                        max={TEXT_MAX_LENGTH}
                        values={[size]}
                        labels={["Text length"]}
                        onChange={([value]) => setSize(value)}
                    />
                </Field>

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

export default TextInputPanel;
