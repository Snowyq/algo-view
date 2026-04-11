import React, {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import styled from "styled-components";

/* -------------------------------------------------------------------------- */
/*                              Styled Components                             */
/* -------------------------------------------------------------------------- */

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

const ProgressContainer = styled.div`
    position: absolute;
    left: 0;
    bottom: 0;
    top: 0;
    transition: width ${({ transition = 0 }) => transition + "s"};
`;

/* -------------------------------------------------------------------------- */
/*                               Compound Parent                              */
/* -------------------------------------------------------------------------- */

const SliderContext = createContext();

function Slider({
    children,
    value: stateValue,
    maxValue,
    minValue = 0,
    snapToValue = true,
    onChange,
    onMouseUp,
}) {
    /* ---------------------------------- Refs ---------------------------------- */

    const tooltipRef = useRef();
    const sliderRef = useRef();
    const dotRef = useRef();
    const hoverDotRef = useRef();
    const progressFillRef = useRef();

    /* --------------------------------- States --------------------------------- */

    const [isDragging, setIsDragging] = useState(false);
    const [tooltipValue, setTooltipValue] = useState(0);

    /* --------------------------------- Helpers -------------------------------- */

    const changeValue = useCallback(
        (value) => {
            onChange?.(value);
        },
        [onChange]
    );

    // Dot
    const moveDot = (progress) => setNodeLeft(dotRef, progress);

    // hoverDot
    const moveHoverDot = (progress) => setNodeLeft(hoverDotRef, progress);
    const showHoverDot = () => setNodeOpacity(hoverDotRef, 1);
    const hideHoverDot = () => setNodeOpacity(hoverDotRef, 0);

    // Tooltip
    const moveTooltip = (progress) => setNodeLeft(tooltipRef, progress);
    const showTooltip = () => setNodeOpacity(tooltipRef, 1);
    const hideTooltip = () => setNodeOpacity(tooltipRef, 0);

    // ProgressFill
    const setProgressFill = (progress) =>
        setNodeRight(progressFillRef, progress);

    // calculates final progress for moving dotes and tooltip
    const getFinalProgressAndValue = useCallback(
        (e) => {
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

    /* ----------------------------- Event Listeners ---------------------------- */

    const handleDotDrag = useCallback(
        (e) => {
            const { value } = getFinalProgressAndValue(e);
            changeValue(value);
        },
        [getFinalProgressAndValue, changeValue]
    );

    const handleMouseMove = (e) => {
        e.preventDefault();
        const { progress, value } = getFinalProgressAndValue(e);
        if (isDragging) {
            hideHoverDot();
        } else {
            showHoverDot();
            moveHoverDot(progress);
            setTooltipValue(value);
            moveTooltip(progress);
        }
    };

    const handleMouseDown = (e) => {
        e.preventDefault();
        disableSelection();
        const { value } = getFinalProgressAndValue(e);
        setIsDragging(true);
        changeValue(value);
    };

    const handleMouseUp = useCallback(
        (e) => {
            e.preventDefault();
            enableSelection();
            setIsDragging(false);
            const rect = sliderRef.current.getBoundingClientRect();
            if (!isMouseOverRect(e, rect)) {
                hideTooltip();
            }
            onMouseUp?.();
        },
        [setIsDragging, onMouseUp]
    );

    const handleMouseEnter = () => {
        showTooltip();
    };

    const handleMouseLeave = () => {
        hideHoverDot();
        if (!isDragging) {
            hideTooltip();
        }
    };

    /* --------------------------------- Effects -------------------------------- */

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
            setTooltipValue(stateValue);
        }
    }, [stateValue, minValue, maxValue, isDragging, setTooltipValue]);

    /* ------------------------- Context Provider Value ------------------------- */

    const value = useMemo(
        () => ({
            dotRef,
            hoverDotRef,
            tooltipRef,
            progressFillRef,
            tooltipValue,
        }),
        [dotRef, hoverDotRef, tooltipRef, progressFillRef, tooltipValue]
    );

    /* --------------------------------- Render --------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*                               Compound Children                            */
/* -------------------------------------------------------------------------- */

function Dot({ children }) {
    const { dotRef } = useContext(SliderContext);
    return (
        <DotContainer ref={dotRef}>
            {children && React.cloneElement(children)}
        </DotContainer>
    );
}

function HoverDot({ children }) {
    const { hoverDotRef } = useContext(SliderContext);

    return (
        <HoverDotContainer ref={hoverDotRef}>
            {children && React.cloneElement(children)}
        </HoverDotContainer>
    );
}

function Tooltip({ children, modifyValue = (val) => val }) {
    const { tooltipRef, tooltipValue } = useContext(SliderContext);
    const value = modifyValue(tooltipValue);
    return (
        <TooltipContainer ref={tooltipRef}>
            {children && React.cloneElement(children, { children: value })}
        </TooltipContainer>
    );
}

function ProgressFill({ children, transition = 0 }) {
    const { progressFillRef } = useContext(SliderContext);
    return (
        <ProgressContainer ref={progressFillRef} transition={transition}>
            {children && React.cloneElement(children)}
        </ProgressContainer>
    );
}

/* -------------------------------------------------------------------------- */
/*                                   Helpers                                  */
/* -------------------------------------------------------------------------- */

const calcProgress = (mouseX, parentX, parentWidth) => {
    const x = mouseX - parentX;
    const progress = clamp(x / parentWidth, 0, 1);
    return progress;
};

const setNodeLeft = (ref, left) => {
    if (!ref.current) return;
    ref.current.style.left = left * 100 + "%";
};

const setNodeRight = (ref, right) => {
    if (!ref.current) return;
    ref.current.style.width = right * 100 + "%";
};

const setNodeOpacity = (ref, opacity) => {
    if (!ref.current) return;
    ref.current.style.opacity = opacity;
};

const getValueFromProgress = (progress, minValue, maxValue) => {
    const value = Math.round(progress * (maxValue - minValue) + minValue);
    return value;
};

const getProgressFromValue = (value, min, max) => {
    if (max === min) return 0;
    const progress = (value - min) / (max - min);
    return clamp(progress, 0, 1);
};

function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}

const disableSelection = () => {
    document.body.style.userSelect = "none";
};

const enableSelection = () => {
    document.body.style.userSelect = "auto";
};

function isMouseOverRect(mouseEvent, rect) {
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
