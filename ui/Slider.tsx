import React, {
    createContext,
    JSX,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type MutableRefObject,
    type ReactElement,
    type ReactNode,
} from "react";
import styled from "styled-components";
// Styled components

const SliderContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    cursor: pointer;

    /* 👇 Prevent mobile scrolling during drag */
    touch-action: none;
`;
const DotContainer = styled.div`
    position: absolute;
    top: 50%;
    height: 100%;
    pointer-events: none;
    translate: -50% -50%;
    z-index: 1000;

    user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-callout: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-modify: none;
    -webkit-highlight: none;
`;

const HoverDotContainer = styled.div`
    position: absolute;
    top: 50%;
    height: 100%;
    opacity: 0;
    pointer-events: none;
    translate: -50% -50%;
    z-index: 500;

    user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-callout: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-modify: none;
    -webkit-highlight: none;
`;

const TooltipContainer = styled.div`
    position: absolute;
    pointer-events: none;
    top: 50%;
    opacity: 0;
    height: 100%;
    z-index: 750;
    user-select: none;

    user-select: none;
    -webkit-touch-callout: none;
    -webkit-user-callout: none;
    -webkit-user-select: none;
    -webkit-user-drag: none;
    -webkit-user-modify: none;
    -webkit-highlight: none;
`;

const ProgressContainer = styled.div<{ transition?: number }>`
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
    transition: width ${({ transition = 0 }) => transition + "s"};
`;

// Compound parent

type SliderContextValue = {
    dotRef: MutableRefObject<HTMLDivElement | null>;
    hoverDotRef: MutableRefObject<HTMLDivElement | null>;
    tooltipRef: MutableRefObject<HTMLDivElement | null>;
    progressFillRef: MutableRefObject<HTMLDivElement | null>;
    tooltipValue: number;
};

const SliderContext = createContext<SliderContextValue | null>(null);

type SliderProps = {
    children: ReactNode;
    value: number;
    maxValue: number;
    minValue?: number;
    snapToValue?: boolean;
    onChange?: (value: number) => void;
    onMouseUp?: () => void;
};

function Slider({
    children,
    value: stateValue,
    maxValue,
    minValue = 0,
    snapToValue = true,
    onChange,
    onMouseUp,
}: SliderProps): JSX.Element {
    // Refs

    const tooltipRef = useRef<HTMLDivElement | null>(null);
    const sliderRef = useRef<HTMLDivElement | null>(null);
    const dotRef = useRef<HTMLDivElement | null>(null);
    const hoverDotRef = useRef<HTMLDivElement | null>(null);
    const progressFillRef = useRef<HTMLDivElement | null>(null);

    // States

    const [isDragging, setIsDragging] = useState<boolean>(false);
    const [tooltipValue, setTooltipValue] = useState<number>(0);

    // Helpers

    const changeValue = useCallback(
        (value: number) => {
            onChange?.(value);
        },
        [onChange]
    );

    // Dot
    const moveDot = (progress: number): void => setNodeLeft(dotRef, progress);

    // hoverDot
    const moveHoverDot = (progress: number): void =>
        setNodeLeft(hoverDotRef, progress);
    const showHoverDot = (): void => setNodeOpacity(hoverDotRef, 1);
    const hideHoverDot = (): void => setNodeOpacity(hoverDotRef, 0);

    // Tooltip
    const moveTooltip = (progress: number): void =>
        setNodeLeft(tooltipRef, progress);
    const showTooltip = (): void => setNodeOpacity(tooltipRef, 1);
    const hideTooltip = (): void => setNodeOpacity(tooltipRef, 0);

    // ProgressFill
    const setProgressFill = (progress: number): void =>
        setNodeRight(progressFillRef, progress);

    // calculates final progress for moving dotes and tooltip
    const getFinalProgressAndValue = useCallback(
        (e: PointerEvent): { value: number; progress: number } | undefined => {
            if (!sliderRef.current || !e) return;
            const parent = sliderRef.current.getBoundingClientRect();
            const mouseX = e.clientX;
            const progress = calcProgress(mouseX, parent.x, parent.width);
            const value = getValueFromProgress(progress, minValue, maxValue);

            let finalProgress;
            if (snapToValue) {
                finalProgress = getProgressFromValue(value, minValue, maxValue);
            } else finalProgress = progress;

            return { value, progress: finalProgress };
        },
        [sliderRef, maxValue, minValue, snapToValue]
    );

    // Event listeners

    const handleDotDrag = useCallback(
        (e: PointerEvent): void => {
            const result = getFinalProgressAndValue(e);
            if (!result) return;
            changeValue(result.value);
            setTooltipValue(result.value);
            moveTooltip(result.progress);
        },
        [getFinalProgressAndValue, changeValue]
    );

    const handleMouseMove = (e: React.PointerEvent<HTMLDivElement>): void => {
        e.preventDefault();
        const result = getFinalProgressAndValue(e.nativeEvent);
        if (!result) return;
        const { progress, value } = result;
        if (isDragging) {
            hideHoverDot();
        } else {
            showHoverDot();
            moveHoverDot(progress);
            setTooltipValue(value);
            moveTooltip(progress);
        }
    };

    const handleMouseDown = (e: React.PointerEvent<HTMLDivElement>): void => {
        e.preventDefault();
        disableSelection();
        const result = getFinalProgressAndValue(e.nativeEvent);
        if (!result) return;
        const { value } = result;
        setIsDragging(true);
        changeValue(value);
        setTooltipValue(value);
        moveTooltip(result.progress);
    };

    const handleMouseUp = useCallback(
        (e: PointerEvent | React.PointerEvent<HTMLDivElement>): void => {
            e.preventDefault();
            enableSelection();
            setIsDragging(false);
            const rect = sliderRef.current?.getBoundingClientRect();
            const event = "nativeEvent" in e ? e.nativeEvent : e;
            if (rect && !isMouseOverRect(event, rect)) {
                hideTooltip();
            }
            onMouseUp?.();
        },
        [setIsDragging, onMouseUp]
    );

    const handleMouseEnter = (): void => {
        showTooltip();
    };

    const handleMouseLeave = (): void => {
        hideHoverDot();
        if (!isDragging) {
            hideTooltip();
        }
    };

    // Effects

    useEffect(() => {
        if (isDragging) {
            document.addEventListener("pointermove", handleDotDrag);
            document.addEventListener("pointerup", handleMouseUp);
        } else {
            document.removeEventListener("pointermove", handleDotDrag);
            document.removeEventListener("pointerup", handleMouseUp);
        }
        return () => {
            document.removeEventListener("pointermove", handleDotDrag);
            document.removeEventListener("pointerup", handleMouseUp);
        };
    }, [handleDotDrag, handleMouseUp, isDragging]);

    useEffect(() => {
        const progress = getProgressFromValue(stateValue, minValue, maxValue);
        moveDot(progress);
        setProgressFill(progress);
        if (isDragging) {
            moveTooltip(progress);
        }
    }, [stateValue, minValue, maxValue, isDragging]);

    // Context provider value

    const value = useMemo<SliderContextValue>(
        () => ({
            dotRef,
            hoverDotRef,
            tooltipRef,
            progressFillRef,
            tooltipValue,
        }),
        [dotRef, hoverDotRef, tooltipRef, progressFillRef, tooltipValue]
    );

    // Render

    return (
        <SliderContext.Provider value={value}>
            <SliderContainer
                ref={sliderRef}
                onPointerDown={handleMouseDown}
                onPointerUp={handleMouseUp}
                onPointerLeave={handleMouseLeave}
                onPointerEnter={handleMouseEnter}
                onPointerMove={handleMouseMove}
            >
                {children}
            </SliderContainer>
        </SliderContext.Provider>
    );
}

// Compound children

type SlotProps = { children?: ReactElement };

function Dot({ children }: SlotProps): JSX.Element | null {
    const context = useContext(SliderContext);
    if (!context) return null;
    const { dotRef } = context;
    return (
        <DotContainer ref={dotRef}>
            {children && React.cloneElement(children)}
        </DotContainer>
    );
}

function HoverDot({ children }: SlotProps): JSX.Element | null {
    const context = useContext(SliderContext);
    if (!context) return null;
    const { hoverDotRef } = context;

    return (
        <HoverDotContainer ref={hoverDotRef}>
            {children && React.cloneElement(children)}
        </HoverDotContainer>
    );
}

type TooltipProps = {
    children?: ReactElement;
    modifyValue?: (value: number) => number;
};

function Tooltip({
    children,
    modifyValue = (val: number) => val,
}: TooltipProps): JSX.Element | null {
    const context = useContext(SliderContext);
    if (!context) return null;
    const { tooltipRef, tooltipValue } = context;
    const value = modifyValue(tooltipValue);
    return (
        <TooltipContainer ref={tooltipRef}>
            {children && React.cloneElement(children, undefined, value)}
        </TooltipContainer>
    );
}

type ProgressFillProps = {
    children?: ReactElement;
    transition?: number;
};

function ProgressFill({
    children,
    transition = 0,
}: ProgressFillProps): JSX.Element | null {
    const context = useContext(SliderContext);
    if (!context) return null;
    const { progressFillRef } = context;
    return (
        <ProgressContainer ref={progressFillRef} transition={transition}>
            {children && React.cloneElement(children)}
        </ProgressContainer>
    );
}

// Helpers

const calcProgress = (
    mouseX: number,
    parentX: number,
    parentWidth: number
): number => {
    const x = mouseX - parentX;
    const progress = clamp(x / parentWidth, 0, 1);
    return progress;
};

const setNodeLeft = (
    ref: MutableRefObject<HTMLElement | null>,
    left: number
): void => {
    if (!ref.current) return;
    ref.current.style.left = left * 100 + "%";
};

const setNodeRight = (
    ref: MutableRefObject<HTMLElement | null>,
    right: number
): void => {
    if (!ref.current) return;
    ref.current.style.width = right * 100 + "%";
};

const setNodeOpacity = (
    ref: MutableRefObject<HTMLElement | null>,
    opacity: number
): void => {
    if (!ref.current) return;
    ref.current.style.opacity = String(opacity);
};

const getValueFromProgress = (
    progress: number,
    minValue: number,
    maxValue: number
): number => {
    const value = Math.round(progress * (maxValue - minValue) + minValue);
    return value;
};

const getProgressFromValue = (
    value: number,
    min: number,
    max: number
): number => {
    if (max === min) return 0;
    const progress = (value - min) / (max - min);
    return clamp(progress, 0, 1);
};

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}

const disableSelection = (): void => {
    document.body.style.userSelect = "none";
};

const enableSelection = (): void => {
    document.body.style.userSelect = "auto";
};

function isMouseOverRect(mouseEvent: PointerEvent, rect: DOMRect): boolean {
    const mouseX = mouseEvent.clientX;
    const mouseY = mouseEvent.clientY;

    return (
        mouseX >= rect.x &&
        mouseX <= rect.x + rect.width &&
        mouseY >= rect.y &&
        mouseY <= rect.y + rect.height
    );
}

Slider.ProgressFill = ProgressFill;
Slider.Dot = Dot;
Slider.HoverDot = HoverDot;
Slider.Tooltip = Tooltip;
export default Slider;
