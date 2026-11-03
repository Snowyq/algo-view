import {
    JSX,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ComponentProps,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { css, keyframes } from "styled-components";
import InputLayout from "./InputLayout";
import {
    BarThumb,
    BigValue,
    Choices,
    Field,
    FieldHead,
    FieldLabel,
    Form,
    ThumbChoice,
} from "./form";
import {
    SORT_DEFAULT_MAX_INPUT_LENGTH,
    SORT_INPUT_BLOCK_DELAY_MS,
    SORT_INPUT_VALUES_RANGES,
    SORT_MAX_INPUT_LENGTH,
    SORT_MIN_INPUT_LENGTH,
} from "../../../../config/sort";
import type { AppDispatch, RootState } from "../../../../store";
import {
    generateInput,
    INPUT_PRESETS,
    randomSeed,
    type InputConfig,
    type InputPreset,
} from "../../../../utils/randoms";
import { clamp } from "../../../../utils/values";
import {
    applyInput,
    getActiveAlgorithms,
    getInputConfig,
    getCanvasWorkerLoading,
    getStepWorkerReady,
} from "../../playSlice";
import PixelButton from "../primitives/PixelButton";
import PixelIcon from "../primitives/PixelIcon";
import PixelSlider from "../primitives/PixelSlider";
import PixelToggle from "../primitives/PixelToggle";
import { DICE } from "../primitives/icons";
import { labelText, pixelFrame } from "../primitives/pixel";

const PRESET_LABELS: Record<InputPreset, string> = {
    random: "Random",
    nearlySorted: "Nearly sorted",
    reversed: "Reversed",
    fewUnique: "Few unique",
    sawtooth: "Sawtooth",
    organPipe: "Organ pipe",
};

const ROLL_MS = 380;
const [RANGE_MIN, RANGE_MAX] = SORT_INPUT_VALUES_RANGES;

const Preset = styled(ThumbChoice)`
    /* the global button:has(svg) line-height: 0 stacks wrapped labels */
    line-height: 1.2;

    svg {
        color: var(--color-step-default);
    }
    @media (hover: hover) {
        &:hover:not(:disabled) svg {
            color: var(--fg-3);
        }
    }
    &[aria-pressed="true"] svg {
        color: var(--accent);
    }
`;

const quake = keyframes`
    0%, 100% { transform: translateX(0); }
    50% { transform: translateX(1px); }
`;

/* Length thumb: a stack of blocks that grows with the value. */
const Stack = styled.span<{ $strain: boolean }>`
    display: flex;
    flex-direction: column-reverse;
    gap: 2px;
    padding: 2px;
    background-color: var(--bg);

    i {
        width: 1.2rem;
        height: 0.4rem;
        background-color: var(--fg);
    }
    i:last-child {
        background-color: var(--accent);
    }

    ${({ $strain }) =>
        $strain &&
        css`
            animation: ${quake} 0.12s steps(2) infinite;
            i {
                background-color: var(--accent);
            }
        `}
`;

const RangeThumb = styled.span<{ $tall: boolean }>`
    display: block;
    width: 1.2rem;
    height: ${({ $tall }) => ($tall ? "2.8rem" : "1.6rem")};
    background-color: ${({ $tall }) => ($tall ? "var(--fg)" : "var(--fg-3)")};
    box-shadow: inset 0 4px 0 rgba(255, 255, 255, 0.3);
`;

const Inputs = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 1.2rem;
`;

const NumberField = styled.label`
    display: flex;
    flex-direction: column;
    gap: 0.6rem;

    span {
        ${labelText};
        font-size: 1rem;
        color: var(--fg-4);
    }
`;

const NumberInput = styled.input`
    height: 4rem;
    width: 100%;
    padding: 0 1.2rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg);
    color: var(--fg);
    font-family: var(--f-display);
    font-size: 2.4rem;
    font-variant-numeric: tabular-nums;
    ${pixelFrame("var(--line-2)")};

    &:focus-visible {
        outline: none;
        ${pixelFrame("var(--accent)")};
    }
`;

const Warning = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    ${labelText};
    font-size: 1rem;
    color: var(--color-step-check);
`;

const roll = keyframes`
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
`;

const GenerateButton = styled(PixelButton)`
    width: calc(100% - var(--b) * 2);

    &[data-rolling="true"] svg {
        animation: ${roll} 360ms steps(4) both;
    }
`;

/* Number fields hold "" while being typed into. */
type NumericState = number | "";

function toNumber(raw: string): NumericState {
    if (raw === "") return "";
    const value = Number(raw);
    return Number.isFinite(value) ? value : "";
}

function clampOr(
    value: NumericState,
    min: number,
    max: number,
    fallback: number
): number {
    return typeof value === "number" ? clamp(value, min, max) : fallback;
}

function PresetThumb({ preset }: { preset: InputPreset }): JSX.Element {
    const levels = useMemo(
        () => generateInput({ preset, length: 12, min: 1, max: 8, seed: 7 }),
        [preset]
    );
    return <BarThumb levels={levels} />;
}

type NumberBoxProps = { label: string } & ComponentProps<typeof NumberInput>;

function NumberBox({ label, ...input }: NumberBoxProps): JSX.Element {
    return (
        <NumberField>
            <span>{label}</span>
            <NumberInput
                type="text"
                inputMode="numeric"
                pattern="[0-9]*"
                autoComplete="off"
                spellCheck={false}
                {...input}
            />
        </NumberField>
    );
}

/* Busy workers block regeneration; unblock a beat later so a fast double
   click can't queue renders. */
function useGenerateBlocked(): boolean {
    const panels = useSelector(
        (state: RootState) => getActiveAlgorithms(state).length
    );
    const stepWorkerReady = useSelector<RootState, boolean>(getStepWorkerReady);
    const loading = useSelector<RootState, boolean>(getCanvasWorkerLoading);
    const blockedNow = !stepWorkerReady || (panels > 0 && loading);
    const [blockedLate, setBlockedLate] = useState<boolean>(blockedNow);
    useEffect(() => {
        const id = setTimeout(
            () => setBlockedLate(blockedNow),
            blockedNow ? 0 : SORT_INPUT_BLOCK_DELAY_MS
        );
        return () => clearTimeout(id);
    }, [blockedNow]);
    return blockedNow || blockedLate;
}

/* Random die face plus a short spin on every roll. */
function useDice(): { face: number; rolling: boolean; rollDice: () => void } {
    const [face, setFace] = useState<number>(4);
    const [rolling, setRolling] = useState<boolean>(false);
    const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(
        () => () => {
            if (timer.current) clearTimeout(timer.current);
        },
        []
    );

    const rollDice = (): void => {
        setFace(Math.floor(Math.random() * 6));
        setRolling(true);
        if (timer.current) clearTimeout(timer.current);
        timer.current = setTimeout(() => setRolling(false), ROLL_MS);
    };
    return { face, rolling, rollDice };
}

function InputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, InputConfig>(getInputConfig);
    const blocked = useGenerateBlocked();
    const { face, rolling, rollDice } = useDice();
    const lengthId = useId();

    const [allowLarge, setAllowLarge] = useState<boolean>(
        config.length > SORT_DEFAULT_MAX_INPUT_LENGTH
    );
    const [length, setLength] = useState<NumericState>(config.length);
    const [minValue, setMinValue] = useState<NumericState>(config.min);
    const [maxValue, setMaxValue] = useState<NumericState>(config.max);
    // An outside change (shared link, G shortcut) drops unsaved edits.
    const [syncedConfig, setSyncedConfig] = useState<InputConfig>(config);
    if (syncedConfig !== config) {
        setSyncedConfig(config);
        setLength(config.length);
        setMinValue(config.min);
        setMaxValue(config.max);
        if (config.length > SORT_DEFAULT_MAX_INPUT_LENGTH) setAllowLarge(true);
    }

    const maxLength = allowLarge
        ? SORT_MAX_INPUT_LENGTH
        : SORT_DEFAULT_MAX_INPUT_LENGTH;
    const lengthValue = clampOr(
        length,
        SORT_MIN_INPUT_LENGTH,
        maxLength,
        config.length
    );
    const lo = clampOr(minValue, RANGE_MIN, RANGE_MAX, config.min);
    const hi = clampOr(maxValue, RANGE_MIN, RANGE_MAX, config.max);
    const low = Math.min(lo, hi);
    const high = Math.max(lo, hi);

    const generate = (preset: InputPreset = config.preset): void => {
        if (blocked) return;
        const next: InputConfig = {
            preset,
            length: clamp(lengthValue, SORT_MIN_INPUT_LENGTH, maxLength),
            min: low,
            max: high,
            seed: randomSeed(),
        };
        dispatch(applyInput({ category: "sort", config: next }));
        rollDice();
    };

    const toggleLarge = (next: boolean): void => {
        setAllowLarge(next);
        const limit = next
            ? SORT_MAX_INPUT_LENGTH
            : SORT_DEFAULT_MAX_INPUT_LENGTH;
        setLength((prev) =>
            typeof prev === "number" ? Math.min(prev, limit) : prev
        );
    };

    const stackBlocks =
        1 +
        Math.round(
            ((lengthValue - SORT_MIN_INPUT_LENGTH) /
                (maxLength - SORT_MIN_INPUT_LENGTH)) *
                5
        );
    const strained = lengthValue >= SORT_MAX_INPUT_LENGTH;

    return (
        <InputLayout
            action={
                <GenerateButton
                    type="button"
                    $variant="primary"
                    $size="lg"
                    disabled={blocked}
                    data-rolling={rolling}
                    onClick={() => generate()}
                >
                    <PixelIcon name={DICE[face]} scale={2} />
                    Generate · G
                </GenerateButton>
            }
        >
            <Form>
                <Field aria-labelledby={`${lengthId}-shape`}>
                    <FieldHead>
                        <FieldLabel id={`${lengthId}-shape`}>Shape</FieldLabel>
                    </FieldHead>
                    <Choices>
                        {INPUT_PRESETS.map((preset) => (
                            <Preset
                                key={preset}
                                type="button"
                                aria-pressed={config.preset === preset}
                                disabled={blocked}
                                onClick={() => generate(preset)}
                            >
                                <PresetThumb preset={preset} />
                                {PRESET_LABELS[preset]}
                            </Preset>
                        ))}
                    </Choices>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel as="label" htmlFor={lengthId}>
                            Values
                        </FieldLabel>
                        <BigValue $tabular htmlFor={lengthId}>
                            {lengthValue}
                        </BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={SORT_MIN_INPUT_LENGTH}
                        max={maxLength}
                        values={[lengthValue]}
                        labels={["Number of values"]}
                        onChange={([value]) => setLength(value)}
                        renderThumb={() => (
                            <Stack $strain={strained}>
                                {Array.from({ length: stackBlocks }, (_, i) => (
                                    <i key={i} />
                                ))}
                            </Stack>
                        )}
                    />
                    <Inputs>
                        <NumberBox
                            label="Exact"
                            id={lengthId}
                            value={length}
                            onChange={(event) => {
                                const next = toNumber(event.target.value);
                                setLength(
                                    typeof next === "number"
                                        ? Math.min(next, maxLength)
                                        : next
                                );
                            }}
                            onBlur={() => setLength(lengthValue)}
                        />
                    </Inputs>
                    <PixelToggle checked={allowLarge} onChange={toggleLarge}>
                        <span>
                            Up to {SORT_MAX_INPUT_LENGTH}{" "}
                            <Warning>
                                <PixelIcon name="warning" scale={1} />
                                may stutter
                            </Warning>
                        </span>
                    </PixelToggle>
                </Field>

                <Field>
                    <FieldHead>
                        <FieldLabel>Range</FieldLabel>
                        <BigValue $tabular>
                            {low}–{high}
                        </BigValue>
                    </FieldHead>
                    <PixelSlider
                        min={RANGE_MIN}
                        max={RANGE_MAX}
                        values={[low, high]}
                        labels={["Smallest value", "Largest value"]}
                        onChange={([a, b]) => {
                            setMinValue(a);
                            setMaxValue(b);
                        }}
                        renderThumb={({ index }) => (
                            <RangeThumb $tall={index === 1} />
                        )}
                    />
                    <Inputs>
                        <NumberBox
                            label="Min"
                            value={minValue}
                            onChange={(event) =>
                                setMinValue(toNumber(event.target.value))
                            }
                            onBlur={() => {
                                setMinValue(lo);
                                if (lo > hi) setMaxValue(lo);
                            }}
                        />
                        <NumberBox
                            label="Max"
                            value={maxValue}
                            onChange={(event) =>
                                setMaxValue(toNumber(event.target.value))
                            }
                            onBlur={() => {
                                setMaxValue(hi);
                                if (hi < lo) setMinValue(hi);
                            }}
                        />
                    </Inputs>
                </Field>
            </Form>
        </InputLayout>
    );
}

export default InputPanel;
