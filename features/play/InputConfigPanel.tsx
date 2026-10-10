import type { ChangeEvent, InputHTMLAttributes } from "react";
import { JSX, useEffect, useId, useRef, useState } from "react";
import { BsExclamationTriangle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    SORT_DEFAULT_INPUT_LENGTH,
    SORT_DEFAULT_INPUT_VALUE_RANGE,
    SORT_DEFAULT_MAX_INPUT_LENGTH,
    SORT_INPUT_BLOCK_DELAY_MS,
    SORT_INPUT_VALUES_RANGES,
    SORT_MAX_INPUT_LENGTH,
    SORT_MIN_INPUT_LENGTH,
} from "../../config/sort";
import type { AppDispatch, RootState } from "../../store";
import Button from "../../ui/Button";
import DefaultSlider from "../../ui/DefaultSlider";
import Input from "../../ui/Input";
import type { ActiveAlgorithm } from "./playSlice";
import {
    changeInput,
    getActiveAlgorithms,
    getSortWorkerLoading,
    getStepWorkerReady,
} from "./playSlice";
const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
`;

const Item = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
`;

const FieldLabel = styled.label`
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text);
`;

const LengthContainer = styled.div`
    display: flex;
    gap: var(--space-4);
    align-items: center;
    width: 100%;
`;

const RangeContainer = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-3);
    width: 100%;
`;

const RangeField = styled.label`
    display: flex;
    flex-direction: column;
    gap: var(--space-1);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--text-muted);
`;

const ToggleRow = styled.label`
    display: flex;
    align-items: center;
    gap: var(--space-2);
    margin-top: var(--space-1);
    font-size: var(--text-sm);
    color: var(--text-soft);
    cursor: pointer;
`;

const ToggleInput = styled.input`
    width: 1.6rem;
    height: 1.6rem;
    accent-color: var(--swap);
    cursor: pointer;
`;

const ToggleLabel = styled.span`
    display: inline-flex;
    align-items: center;
    flex-wrap: wrap;
    gap: var(--space-2);
`;

const WarningIcon = styled(BsExclamationTriangle)`
    color: var(--danger);
    font-size: 1.2rem;
    flex: 0 0 auto;
`;

const WarningRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: var(--space-1);
    color: var(--danger);
    font-family: var(--font-mono-stack);
    font-size: var(--text-xs);
    letter-spacing: 0.04em;
    line-height: 1.1;
`;

const GenerateButton = styled(Button)`
    width: 100%;
`;

const numericInputProps: InputHTMLAttributes<HTMLInputElement> = {
    type: "text",
    inputMode: "numeric",
    pattern: "[0-9]*",
    autoComplete: "off",
    spellCheck: false,
};

type NumericState = number | "";

function InputConfigPanel(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();
    const lengthId = useId();
    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const stepWorkerReady = useSelector<RootState, boolean>(getStepWorkerReady);
    const sortWorkerLoading = useSelector<RootState, boolean>(
        getSortWorkerLoading
    );
    const needsSortWorker: boolean = activeAlgorithms.length > 0;
    const isBlockedRaw: boolean =
        !stepWorkerReady || (needsSortWorker && sortWorkerLoading);
    const [isBlockedDelayed, setIsBlockedDelayed] =
        useState<boolean>(isBlockedRaw);
    const unblockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const isBlocked: boolean = isBlockedRaw || isBlockedDelayed;
    const [allowLargeInput, setAllowLargeInput] = useState<boolean>(false);
    const [length, setLength] = useState<NumericState>(
        SORT_DEFAULT_INPUT_LENGTH
    );
    const [minValue, setMinValue] = useState<NumericState>(
        SORT_DEFAULT_INPUT_VALUE_RANGE[0]
    );
    const [maxValue, setMaxValue] = useState<NumericState>(
        SORT_DEFAULT_INPUT_VALUE_RANGE[1]
    );
    const maxInputLength: number = allowLargeInput
        ? SORT_MAX_INPUT_LENGTH
        : SORT_DEFAULT_MAX_INPUT_LENGTH;
    const lengthValue: number =
        typeof length === "number" && Number.isFinite(length)
            ? Math.max(SORT_MIN_INPUT_LENGTH, Math.min(maxInputLength, length))
            : SORT_DEFAULT_INPUT_LENGTH;
    const clampNumber = (value: number, min: number, max: number): number =>
        Math.max(min, Math.min(max, value));
    const normalizeRangeValue = (
        value: NumericState,
        fallback: number
    ): number => {
        if (typeof value !== "number" || !Number.isFinite(value)) {
            return fallback;
        }
        return clampNumber(
            value,
            SORT_INPUT_VALUES_RANGES[0],
            SORT_INPUT_VALUES_RANGES[1]
        );
    };

    useEffect(() => {
        if (unblockTimeoutRef.current) {
            clearTimeout(unblockTimeoutRef.current);
            unblockTimeoutRef.current = null;
        }

        if (isBlockedRaw) {
            const immediateId = setTimeout(() => {
                setIsBlockedDelayed(true);
            }, 0);
            return () => clearTimeout(immediateId);
        }

        if (SORT_INPUT_BLOCK_DELAY_MS <= 0) {
            const immediateId = setTimeout(() => {
                setIsBlockedDelayed(false);
            }, 0);
            return () => clearTimeout(immediateId);
        }

        unblockTimeoutRef.current = setTimeout(() => {
            unblockTimeoutRef.current = null;
            setIsBlockedDelayed(false);
        }, SORT_INPUT_BLOCK_DELAY_MS);

        return () => {
            if (unblockTimeoutRef.current) {
                clearTimeout(unblockTimeoutRef.current);
                unblockTimeoutRef.current = null;
            }
        };
    }, [isBlockedRaw]);

    const handleLengthChangeBySlider = (val: number): void => {
        setLengthClamped(val);
    };

    const setLengthClamped = (val: number | string): void => {
        const numeric = Number(val);
        if (!Number.isFinite(numeric)) {
            setLength("");
            return;
        }
        const next = clampNumber(
            numeric,
            SORT_MIN_INPUT_LENGTH,
            maxInputLength
        );
        setLength(next);
    };

    const handleMinValueChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const raw = e.target.value;
        if (raw === "") {
            setMinValue("");
            return;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) {
            setMinValue("");
            return;
        }
        setMinValue(value);
    };

    const handleMaxValueChange = (e: ChangeEvent<HTMLInputElement>): void => {
        const raw = e.target.value;
        if (raw === "") {
            setMaxValue("");
            return;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) {
            setMaxValue("");
            return;
        }
        setMaxValue(value);
    };

    const handleLengthBlur = (): void => {
        if (typeof length !== "number" || !Number.isFinite(length)) {
            setLength(SORT_DEFAULT_INPUT_LENGTH);
            return;
        }
        setLength(clampNumber(length, SORT_MIN_INPUT_LENGTH, maxInputLength));
    };

    const handleMinValueBlur = (): void => {
        const nextMin = normalizeRangeValue(
            minValue,
            SORT_DEFAULT_INPUT_VALUE_RANGE[0]
        );
        setMinValue(nextMin);
        if (
            typeof maxValue === "number" &&
            Number.isFinite(maxValue) &&
            nextMin > maxValue
        ) {
            setMaxValue(nextMin);
        }
    };

    const handleMaxValueBlur = (): void => {
        const nextMax = normalizeRangeValue(
            maxValue,
            SORT_DEFAULT_INPUT_VALUE_RANGE[1]
        );
        setMaxValue(nextMax);
        if (
            typeof minValue === "number" &&
            Number.isFinite(minValue) &&
            nextMax < minValue
        ) {
            setMinValue(nextMax);
        }
    };

    const handleInputLengthChange = (
        e: ChangeEvent<HTMLInputElement>
    ): void => {
        const raw = e.target.value;
        if (raw === "") {
            setLength("");
            return;
        }
        const value = Number(raw);
        if (!Number.isFinite(value)) {
            setLength("");
            return;
        }
        if (value > maxInputLength) {
            setLength(maxInputLength);
            return;
        }
        setLength(value);
    };

    const handleChangeInput = (): void => {
        if (isBlocked) return;
        const safeLength =
            typeof length === "number" && Number.isFinite(length)
                ? length
                : SORT_DEFAULT_INPUT_LENGTH;
        const safeMin =
            typeof minValue === "number" && Number.isFinite(minValue)
                ? minValue
                : SORT_DEFAULT_INPUT_VALUE_RANGE[0];
        const safeMax =
            typeof maxValue === "number" && Number.isFinite(maxValue)
                ? maxValue
                : SORT_DEFAULT_INPUT_VALUE_RANGE[1];

        const finalLength = Math.max(
            SORT_MIN_INPUT_LENGTH,
            Math.min(maxInputLength, safeLength)
        );

        const finalMin = Math.min(safeMin, safeMax);
        const finalMax = Math.max(safeMin, safeMax);

        dispatch(
            changeInput({ length: finalLength, min: finalMin, max: finalMax })
        );
    };

    const handleAllowLargeInputChange = (
        event: ChangeEvent<HTMLInputElement>
    ): void => {
        const nextAllowLargeInput = event.target.checked;
        setAllowLargeInput(nextAllowLargeInput);
        const nextMaxInputLength = nextAllowLargeInput
            ? SORT_MAX_INPUT_LENGTH
            : SORT_DEFAULT_MAX_INPUT_LENGTH;
        setLength((prev) => {
            if (typeof prev !== "number" || !Number.isFinite(prev)) {
                return prev;
            }
            return Math.min(prev, nextMaxInputLength);
        });
    };

    return (
        <Container>
            <Item>
                <FieldLabel htmlFor={lengthId}>Values number</FieldLabel>
                <LengthContainer>
                    <PlaySidebarInput
                        {...numericInputProps}
                        id={lengthId}
                        value={length}
                        onChange={handleInputLengthChange}
                        onBlur={handleLengthBlur}
                    />
                    <DefaultSlider
                        min={SORT_MIN_INPUT_LENGTH}
                        max={maxInputLength}
                        value={lengthValue}
                        onChange={handleLengthChangeBySlider}
                        showFill
                    />
                </LengthContainer>
                <ToggleRow>
                    <ToggleInput
                        type="checkbox"
                        checked={allowLargeInput}
                        onChange={handleAllowLargeInputChange}
                    />
                    <ToggleLabel>
                        <span>Allow large arrays</span>
                        <WarningRow>
                            <WarningIcon aria-hidden="true" />
                            <span>unstable</span>
                        </WarningRow>
                    </ToggleLabel>
                </ToggleRow>
            </Item>
            <Item>
                <FieldLabel as="p">Values range</FieldLabel>

                <RangeContainer>
                    <RangeField>
                        <span>min</span>
                        <PlaySidebarInput
                            {...numericInputProps}
                            value={minValue}
                            onChange={handleMinValueChange}
                            onBlur={handleMinValueBlur}
                        />
                    </RangeField>
                    <RangeField>
                        <span>max</span>
                        <PlaySidebarInput
                            {...numericInputProps}
                            value={maxValue}
                            onChange={handleMaxValueChange}
                            onBlur={handleMaxValueBlur}
                        />
                    </RangeField>
                </RangeContainer>
            </Item>

            <GenerateButton onClick={handleChangeInput} disabled={isBlocked}>
                Generate input
            </GenerateButton>
        </Container>
    );
}

const InputContainer = styled.div`
    flex: 0 0 auto;
    height: 4rem;
    width: 100%;
    max-width: 9rem;

    ${RangeField} & {
        max-width: none;
    }
`;

function PlaySidebarInput(
    props: InputHTMLAttributes<HTMLInputElement>
): JSX.Element {
    return (
        <InputContainer>
            <Input {...props} />
        </InputContainer>
    );
}

export default InputConfigPanel;
