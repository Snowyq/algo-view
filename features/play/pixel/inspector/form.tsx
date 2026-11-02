import { JSX, type ReactNode } from "react";
import styled from "styled-components";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

/* Building blocks shared by the category input panels. */

export type ChoiceLabels<P extends string> = Record<
    P,
    { label: string; hint: string }
>;

export const Form = styled.div`
    display: flex;
    flex-direction: column;
    gap: 2.8rem;
`;

export const Field = styled.section`
    display: flex;
    flex-direction: column;
    gap: 1.2rem;
`;

export const FieldHead = styled.div`
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1.2rem;
`;

export const FieldLabel = styled.h3`
    ${labelText};
    color: var(--fg-3);
`;

export const BigValue = styled.output<{ $tabular?: boolean }>`
    font-family: var(--f-display);
    font-size: 3.2rem;
    line-height: 0.8;
    color: var(--fg);
    ${({ $tabular }) => $tabular && "font-variant-numeric: tabular-nums;"}
`;

export const Choices = styled.div<{ $cols?: number }>`
    display: grid;
    grid-template-columns: repeat(${({ $cols = 3 }) => $cols}, minmax(0, 1fr));
    gap: 0.8rem;
`;

/* Text preset: a label with a small hint under it. */
export const Choice = styled.button`
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

/* Preset with a picture on top; also used as a radio. */
export const ThumbChoice = styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
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

/* "Each algorithm gets": a small term/value list. */
export const Facts = styled.dl`
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

export const Note = styled.p`
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

/* Twelve bars, each 1-8 units tall. */
export function BarThumb({ levels }: { levels: number[] }): JSX.Element {
    return (
        <svg
            data-pixel
            width={60}
            height={24}
            viewBox="0 0 60 24"
            fill="currentColor"
            aria-hidden="true"
        >
            {levels.map((level, i) => (
                <rect
                    key={i}
                    x={i * 5}
                    y={24 - level * 3}
                    width={4}
                    height={level * 3}
                />
            ))}
        </svg>
    );
}

type DiceButtonProps = {
    face: number;
    disabled: boolean;
    onClick: () => void;
    children: ReactNode;
};

/* The panel's main "new input" action. */
export function DiceButton({
    face,
    disabled,
    onClick,
    children,
}: DiceButtonProps): JSX.Element {
    return (
        <PixelButton
            type="button"
            $variant="primary"
            $size="lg"
            disabled={disabled}
            onClick={onClick}
        >
            <PixelIcon name={DICE[face]} scale={2} />
            {children}
        </PixelButton>
    );
}

type PresetFieldProps<P extends string> = {
    label: string;
    presets: readonly P[];
    labels: ChoiceLabels<P>;
    current: P;
    disabled: boolean;
    onPick: (preset: P) => void;
};

export function PresetField<P extends string>({
    label,
    presets,
    labels,
    current,
    disabled,
    onPick,
}: PresetFieldProps<P>): JSX.Element {
    return (
        <Field>
            <FieldHead>
                <FieldLabel>{label}</FieldLabel>
            </FieldHead>
            <Choices>
                {presets.map((preset) => (
                    <Choice
                        key={preset}
                        type="button"
                        aria-pressed={current === preset}
                        disabled={disabled}
                        onClick={() => onPick(preset)}
                    >
                        {labels[preset].label}
                        <small>{labels[preset].hint}</small>
                    </Choice>
                ))}
            </Choices>
        </Field>
    );
}

type SizeFieldProps = {
    label: string;
    /** Slider's accessible name. */
    sliderLabel: string;
    /** Shown big next to the label; defaults to the value. */
    display?: ReactNode;
    tabular?: boolean;
    value: number;
    min: number;
    max: number;
    step?: number;
    onChange: (value: number) => void;
};

export function SizeField({
    label,
    sliderLabel,
    display,
    tabular,
    value,
    min,
    max,
    step,
    onChange,
}: SizeFieldProps): JSX.Element {
    return (
        <Field>
            <FieldHead>
                <FieldLabel>{label}</FieldLabel>
                <BigValue $tabular={tabular}>{display ?? value}</BigValue>
            </FieldHead>
            <PixelSlider
                min={min}
                max={max}
                step={step}
                values={[value]}
                labels={[sliderLabel]}
                onChange={([next]) => onChange(next)}
            />
        </Field>
    );
}
