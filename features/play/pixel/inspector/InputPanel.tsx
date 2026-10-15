import {
    JSX,
    useEffect,
    useId,
    useMemo,
    useRef,
    useState,
    type ChangeEvent,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import styled, { css, keyframes } from "styled-components";
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
import {
    applyInputConfig,
    getActiveAlgorithms,
    getInputConfig,
    getSortWorkerLoading,
    getStepWorkerReady,
    type ActiveAlgorithm,
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

const Presets = styled.div`
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 0.8rem;
`;

const Preset = styled.button`
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.8rem;
    padding: 0.8rem 0.8rem 0.8rem;
    margin: var(--b);
    border: 0;
    background-color: var(--bg-2);
    color: var(--fg-3);
    font-size: 1.3rem;
    text-align: left;
    ${pixelFrame("var(--line)")};

    svg {
        color: var(--color-step-default);
    }

    @media (hover: hover) {
        &:hover:not(:disabled) {
            color: var(--fg);
            ${pixelFrame("var(--fg-3)")};
        }
        &:hover:not(:disabled) svg {
            color: var(--fg-3);
        }
    }

    &[aria-pressed="true"] {
        color: var(--fg);
        background-color: var(--surface-2);
        ${pixelFrame("var(--accent)")};
    }
    &[aria-pressed="true"] svg {
        color: var(--accent);
    }
    &:active:not(:disabled) {
        transform: translateY(2px);
    }
`;

/* A dozen bars of the shape this preset produces. */
function PresetThumb({ preset }: { preset: InputPreset }): JSX.Element {
    const values = useMemo(
        () => generateInput({ preset, length: 12, min: 1, max: 8, seed: 7 }),
        [preset]
    );
    return (
        <svg
            data-pixel
            width={12 * 5}
            height={8 * 3}
            viewBox="0 0 60 24"
            fill="currentColor"
            aria-hidden="true"
        >
            {values.map((value, index) => (
                <rect
                    key={index}
                    x={index * 5}
                    y={24 - value * 3}
                    width={4}
                    height={value * 3}
                />
            ))}
        </svg>
    );
}

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

type NumericState = number | "";

function toNumber(raw: string): NumericState {
    if (raw === "") return "";
    const value = Number(raw);
    return Number.isFinite(value) ? value : "";
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

const numericInputProps = {
    type: "text",
    inputMode: "numeric",
    pattern: "[0-9]*",
    autoComplete: "off",
    spellCheck: false,
} as const;

function InputPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const config = useSelector<RootState, InputConfig>(getInputConfig);
    const active = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const stepWorkerReady = useSelector<RootState, boolean>(getStepWorkerReady);
    const sortWorkerLoading = useSelector<RootState, boolean>(
        getSortWorkerLoading
    );
    const lengthId = useId();

    // Busy workers block regeneration; unblock a beat later so a fast
    // double click can't queue renders.
    const blockedRaw =
        !stepWorkerReady || (active.length > 0 && sortWorkerLoading);
    const [blockedDelayed, setBlockedDelayed] = useState<boolean>(blockedRaw);
    const blocked = blockedRaw || blockedDelayed;
    useEffect(() => {
        const id = setTimeout(
            () => setBlockedDelayed(blockedRaw),
            blockedRaw ? 0 : SORT_INPUT_BLOCK_DELAY_MS
        );
        return () => clearTimeout(id);
    }, [blockedRaw]);

    const [allowLarge, setAllowLarge] = useState<boolean>(
        config.length > SORT_DEFAULT_MAX_INPUT_LENGTH
    );
    const [length, setLength] = useState<NumericState>(config.length);
    const [minValue, setMinValue] = useState<NumericState>(config.min);
    const [maxValue, setMaxValue] = useState<NumericState>(config.max);
    // The recipe can change from outside (shared link, G shortcut):
    // adopt it, dropping unsaved edits.
    const [syncedConfig, setSyncedConfig] = useState<InputConfig>(config);
    if (syncedConfig !== config) {
        setSyncedConfig(config);
        setLength(config.length);
        setMinValue(config.min);
        setMaxValue(config.max);
        if (config.length > SORT_DEFAULT_MAX_INPUT_LENGTH) setAllowLarge(true);
    }
    const [rolling, setRolling] = useState<boolean>(false);
    const [face, setFace] = useState<number>(4);
    const rollTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

    const maxLength = allowLarge
        ? SORT_MAX_INPUT_LENGTH
        : SORT_DEFAULT_MAX_INPUT_LENGTH;
    const [rangeLo, rangeHi] = SORT_INPUT_VALUES_RANGES;
    const lengthValue =
        typeof length === "number"
            ? clamp(length, SORT_MIN_INPUT_LENGTH, maxLength)
            : config.length;
    const lo =
        typeof minValue === "number"
            ? clamp(minValue, rangeLo, rangeHi)
            : config.min;
    const hi =
        typeof maxValue === "number"
            ? clamp(maxValue, rangeLo, rangeHi)
            : config.max;

    const buildConfig = (preset: InputPreset): InputConfig => ({
        preset,
        length: clamp(lengthValue, SORT_MIN_INPUT_LENGTH, maxLength),
        min: Math.min(lo, hi),
        max: Math.max(lo, hi),
        seed: randomSeed(),
    });

    const generate = (preset: InputPreset = config.preset): void => {
        if (blocked) return;
        dispatch(applyInputConfig(buildConfig(preset)));
        setFace(Math.floor(Math.random() * 6));
        setRolling(true);
        if (rollTimer.current) clearTimeout(rollTimer.current);
        rollTimer.current = setTimeout(() => setRolling(false), 380);
    };

    useEffect(
        () => () => {
            if (rollTimer.current) clearTimeout(rollTimer.current);
        },
        []
    );

    const handleAllowLarge = (next: boolean): void => {
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
        <Form>
            <Field aria-labelledby={`${lengthId}-shape`}>
                <FieldHead>
                    <FieldLabel id={`${lengthId}-shape`}>Shape</FieldLabel>
                </FieldHead>
                <Presets>
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
                </Presets>
            </Field>

            <Field>
                <FieldHead>
                    <FieldLabel as="label" htmlFor={lengthId}>
                        Values
                    </FieldLabel>
                    <BigValue htmlFor={lengthId}>{lengthValue}</BigValue>
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
                    <NumberField>
                        <span>Exact</span>
                        <NumberInput
                            {...numericInputProps}
                            id={lengthId}
                            value={length}
                            onChange={(
                                event: ChangeEvent<HTMLInputElement>
                            ) => {
                                const next = toNumber(event.target.value);
                                setLength(
                                    typeof next === "number"
                                        ? Math.min(next, maxLength)
                                        : next
                                );
                            }}
                            onBlur={() =>
                                setLength(
                                    typeof length === "number"
                                        ? clamp(
                                              length,
                                              SORT_MIN_INPUT_LENGTH,
                                              maxLength
                                          )
                                        : config.length
                                )
                            }
                        />
                    </NumberField>
                </Inputs>
                <PixelToggle checked={allowLarge} onChange={handleAllowLarge}>
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
                    <BigValue>
                        {Math.min(lo, hi)}–{Math.max(lo, hi)}
                    </BigValue>
                </FieldHead>
                <PixelSlider
                    min={rangeLo}
                    max={rangeHi}
                    values={[Math.min(lo, hi), Math.max(lo, hi)]}
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
                    <NumberField>
                        <span>Min</span>
                        <NumberInput
                            {...numericInputProps}
                            value={minValue}
                            onChange={(event) =>
                                setMinValue(toNumber(event.target.value))
                            }
                            onBlur={() => {
                                setMinValue(lo);
                                if (lo > hi) setMaxValue(lo);
                            }}
                        />
                    </NumberField>
                    <NumberField>
                        <span>Max</span>
                        <NumberInput
                            {...numericInputProps}
                            value={maxValue}
                            onChange={(event) =>
                                setMaxValue(toNumber(event.target.value))
                            }
                            onBlur={() => {
                                setMaxValue(hi);
                                if (hi < lo) setMinValue(hi);
                            }}
                        />
                    </NumberField>
                </Inputs>
            </Field>

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
        </Form>
    );
}

export default InputPanel;
