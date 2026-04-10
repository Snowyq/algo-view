import { useEffect, useRef, useState } from "react";
import { BsExclamationTriangle } from "react-icons/bs";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import {
    DEFAULT_SORT_INPUT_LENGTH,
    DEFAULT_SORT_INPUT_VALUE_RANGE,
} from "../../config/sort";
import {
    SORT_DEFAULT_MAX_INPUT_LENGTH,
    SORT_INPUT_BLOCK_DELAY_MS,
    SORT_INPUT_VALUES_RANGES,
    SORT_MAX_INPUT_LENGTH,
    SORT_MIN_INPUT_LENGTH,
} from "../../constants/sort";
import Button from "../../ui/Button";
import DefaultSlider from "../../ui/DefaultSlider";
import Input from "../../ui/Input";
import {
    changeInput,
    getActiveAlgorithms,
    getSortWorkerLoading,
    getStepWorkerReady,
} from "./playSlice";

const Container = styled.div`
    display: flex;
    flex-direction: column;
    gap: 1.6rem;
`;

const Item = styled.div`
    display: flex;
    flex-direction: column;
    gap: 0.8rem;
`;

const LengthContainer = styled.div`
    display: flex;
    gap: 2rem;
    align-items: center;
    width: 100%;
`;

const RangeContainer = styled.div`
    display: flex;
    gap: 2rem;
    width: 100%;
`;

const ToggleRow = styled.label`
    display: flex;
    align-items: flex-start;
    gap: 0.8rem;
    font-size: 1.3rem;
    color: var(--color-grey-700);
`;

const ToggleInput = styled.input`
    margin-top: 0.2rem;
    accent-color: var(--color-brand-600);
`;

const ToggleLabel = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.6rem;
`;

const WarningIcon = styled(BsExclamationTriangle)`
    color: var(--color-red-600);
    font-size: 1.2rem;
    flex: 0 0 auto;
`;

const WarningRow = styled.span`
    display: inline-flex;
    align-items: center;
    gap: 0.4rem;
    color: var(--color-red-600);
    font-size: 1.1rem;
    line-height: 1.1;
`;

const numericInputProps = {
    type: "text",
    inputMode: "numeric",
    pattern: "[0-9]*",
};

function InputConfigPanel() {
    const dispatch = useDispatch();
    const activeAlgorithms = useSelector(getActiveAlgorithms);
    const stepWorkerReady = useSelector(getStepWorkerReady);
    const sortWorkerLoading = useSelector(getSortWorkerLoading);
    const needsSortWorker = activeAlgorithms.length > 0;
    const isBlockedRaw =
        !stepWorkerReady || (needsSortWorker && sortWorkerLoading);
    const [isBlockedDelayed, setIsBlockedDelayed] = useState(isBlockedRaw);
    const unblockTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
        null
    );
    const isBlocked = isBlockedRaw || isBlockedDelayed;
    const [allowLargeInput, setAllowLargeInput] = useState(false);
    const [length, setLength] = useState<number | "">(
        DEFAULT_SORT_INPUT_LENGTH
    );
    const [minValue, setMinValue] = useState<number | "">(
        DEFAULT_SORT_INPUT_VALUE_RANGE[0]
    );
    const [maxValue, setMaxValue] = useState<number | "">(
        DEFAULT_SORT_INPUT_VALUE_RANGE[1]
    );
    const maxInputLength = allowLargeInput
        ? SORT_MAX_INPUT_LENGTH
        : SORT_DEFAULT_MAX_INPUT_LENGTH;
    const lengthValue =
        typeof length === "number" && Number.isFinite(length)
            ? Math.max(SORT_MIN_INPUT_LENGTH, Math.min(maxInputLength, length))
            : DEFAULT_SORT_INPUT_LENGTH;
    const clampNumber = (value, min, max) =>
        Math.max(min, Math.min(max, value));
    const normalizeRangeValue = (value, fallback) => {
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
            setIsBlockedDelayed(true);
            return;
        }

        if (SORT_INPUT_BLOCK_DELAY_MS <= 0) {
            setIsBlockedDelayed(false);
            return;
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

    useEffect(() => {
        if (typeof length !== "number" || !Number.isFinite(length)) {
            return;
        }
        if (length > maxInputLength) {
            setLength(maxInputLength);
        }
    }, [length, maxInputLength]);

    const handleLengthChangeBySlider = (val) => {
        setLengthClamped(val);
    };

    const setLengthClamped = (val) => {
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

    const handleMinValueChange = (e) => {
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

    const handleMaxValueChange = (e) => {
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

    const handleLengthBlur = () => {
        if (typeof length !== "number" || !Number.isFinite(length)) {
            setLength(DEFAULT_SORT_INPUT_LENGTH);
            return;
        }
        setLength(clampNumber(length, SORT_MIN_INPUT_LENGTH, maxInputLength));
    };

    const handleMinValueBlur = () => {
        const nextMin = normalizeRangeValue(
            minValue,
            DEFAULT_SORT_INPUT_VALUE_RANGE[0]
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

    const handleMaxValueBlur = () => {
        const nextMax = normalizeRangeValue(
            maxValue,
            DEFAULT_SORT_INPUT_VALUE_RANGE[1]
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

    const handleInputLengthChange = (e) => {
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
        setLength(value);
    };

    const handleChangeInput = (e) => {
        if (isBlocked) return;
        const safeLength =
            typeof length === "number" && Number.isFinite(length)
                ? length
                : DEFAULT_SORT_INPUT_LENGTH;
        const safeMin =
            typeof minValue === "number" && Number.isFinite(minValue)
                ? minValue
                : DEFAULT_SORT_INPUT_VALUE_RANGE[0];
        const safeMax =
            typeof maxValue === "number" && Number.isFinite(maxValue)
                ? maxValue
                : DEFAULT_SORT_INPUT_VALUE_RANGE[1];

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

    return (
        <Container>
            <Item>
                <p>Values number</p>
                <LengthContainer>
                    <PlaySidebarInput
                        {...numericInputProps}
                        value={length}
                        onChange={handleInputLengthChange}
                        onBlur={handleLengthBlur}
                    />
                    <DefaultSlider
                        min={SORT_MIN_INPUT_LENGTH}
                        max={maxInputLength}
                        value={lengthValue}
                        onChange={handleLengthChangeBySlider}
                    />
                </LengthContainer>
                <ToggleRow>
                    <ToggleInput
                        type="checkbox"
                        checked={allowLargeInput}
                        onChange={(event) =>
                            setAllowLargeInput(event.target.checked)
                        }
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
                <p>Values range</p>

                <RangeContainer>
                    <div>
                        <span>min</span>
                        <PlaySidebarInput
                            {...numericInputProps}
                            value={minValue}
                            onChange={handleMinValueChange}
                            onBlur={handleMinValueBlur}
                        />
                    </div>
                    <div>
                        <span>max</span>
                        <PlaySidebarInput
                            {...numericInputProps}
                            value={maxValue}
                            onChange={handleMaxValueChange}
                            onBlur={handleMaxValueBlur}
                        />
                    </div>
                </RangeContainer>
            </Item>

            <Button onClick={handleChangeInput} disabled={isBlocked}>
                Generate input
            </Button>
        </Container>
    );
}

const InputContainer = styled.div`
    margin: 0.2rem 0;
    height: 3rem;
    width: 10rem;
`;

function PlaySidebarInput({ ...props }) {
    return (
        <InputContainer>
            <Input {...props} />
        </InputContainer>
    );
}

export default InputConfigPanel;
