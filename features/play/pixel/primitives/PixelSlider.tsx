import {
    JSX,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
    type KeyboardEvent,
    type PointerEvent,
    type ReactNode,
} from "react";
import styled from "styled-components";
import { clamp } from "../../../../utils/values";
import { blockPattern, pixelFrame } from "./pixel";

const Root = styled.div`
    position: relative;
    width: 100%;
    height: 3.6rem;
    touch-action: none;
    user-select: none;
    cursor: pointer;
`;

const Track = styled.div`
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0.8rem;
    height: 1.2rem;
    background-color: var(--bg);
    ${pixelFrame("var(--line-2)")};

    &::before {
        content: "";
        position: absolute;
        inset: 3px;
        ${blockPattern("var(--surface-3)")};
    }
`;

/* Fill snaps to whole blocks, so it grows one pixel block at a time. */
const Fill = styled.div`
    position: absolute;
    top: 3px;
    bottom: 3px;
    ${blockPattern("var(--accent)")};
`;

const Thumb = styled.div`
    position: absolute;
    bottom: 0.4rem;
    translate: -50% 0;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    min-width: 1.2rem;
    outline: none;
    cursor: grab;

    &:focus-visible > * {
        outline: var(--b) solid var(--accent);
        outline-offset: 3px;
    }
    &[data-dragging="true"] {
        cursor: grabbing;
    }
`;

const DefaultKnob = styled.span`
    display: block;
    width: 1.2rem;
    height: 2rem;
    background-color: var(--fg);
    ${pixelFrame("var(--bg)")};
`;

type ThumbRender = (args: {
    index: number;
    ratio: number;
    value: number;
    dragging: boolean;
}) => ReactNode;

type PixelSliderProps = {
    min: number;
    max: number;
    /** One value, or two for a range. */
    values: number[];
    onChange: (values: number[]) => void;
    step?: number;
    labels: string[];
    renderThumb?: ThumbRender;
    className?: string;
};

const BLOCK = 8;

function PixelSlider({
    min,
    max,
    values,
    onChange,
    step = 1,
    labels,
    renderThumb,
    className,
}: PixelSliderProps): JSX.Element {
    const rootRef = useRef<HTMLDivElement | null>(null);
    const [dragging, setDragging] = useState<number | null>(null);
    const [width, setWidth] = useState<number>(0);
    useLayoutEffect(() => {
        const node = rootRef.current;
        if (!node) return;
        setWidth(node.offsetWidth);
        const observer = new ResizeObserver(([entry]) =>
            setWidth(entry.contentRect.width)
        );
        observer.observe(node);
        return () => observer.disconnect();
    }, []);
    const span = Math.max(1, max - min);
    const ratio = (value: number): number => clamp((value - min) / span, 0, 1);

    const commit = useCallback(
        (index: number, raw: number): void => {
            const snapped = Math.round(raw / step) * step;
            let next = clamp(snapped, min, max);
            const copy = [...values];
            // range thumbs never cross
            if (copy.length === 2) {
                if (index === 0) next = Math.min(next, copy[1]);
                else next = Math.max(next, copy[0]);
            }
            if (copy[index] === next) return;
            copy[index] = next;
            onChange(copy);
        },
        [max, min, onChange, step, values]
    );

    const valueAt = (clientX: number): number => {
        const rect = rootRef.current?.getBoundingClientRect();
        if (!rect || rect.width === 0) return min;
        return min + ((clientX - rect.left) / rect.width) * span;
    };

    const handlePointerDown = (event: PointerEvent<HTMLDivElement>): void => {
        if (event.button !== 0) return;
        const value = valueAt(event.clientX);
        // grab the nearest thumb
        let index = 0;
        if (values.length === 2) {
            index =
                Math.abs(value - values[0]) <= Math.abs(value - values[1])
                    ? 0
                    : 1;
            if (values[0] === values[1]) index = value > values[1] ? 1 : 0;
        }
        event.currentTarget.setPointerCapture(event.pointerId);
        setDragging(index);
        commit(index, value);
        rootRef.current
            ?.querySelectorAll<HTMLElement>("[role='slider']")
            [index]?.focus({ preventScroll: true });
    };

    const handlePointerMove = (event: PointerEvent<HTMLDivElement>): void => {
        if (dragging === null) return;
        commit(dragging, valueAt(event.clientX));
    };

    const endDrag = (): void => setDragging(null);

    const handleKey = (
        index: number,
        event: KeyboardEvent<HTMLDivElement>
    ): void => {
        const big = Math.max(step, Math.round(span / 10 / step) * step);
        const nudge = event.shiftKey ? big : step;
        const current = values[index];
        const map: Record<string, number> = {
            ArrowRight: current + nudge,
            ArrowUp: current + nudge,
            ArrowLeft: current - nudge,
            ArrowDown: current - nudge,
            PageUp: current + big,
            PageDown: current - big,
            Home: min,
            End: max,
        };
        if (!(event.key in map)) return;
        event.preventDefault();
        event.stopPropagation();
        commit(index, map[event.key]);
    };

    const fillFrom = values.length === 2 ? ratio(values[0]) : 0;
    const fillTo = ratio(values[values.length - 1]);
    const inner = Math.max(0, width - 6);
    const left = Math.floor((fillFrom * inner) / BLOCK) * BLOCK;
    const right = Math.ceil((fillTo * inner) / BLOCK) * BLOCK;

    return (
        <Root
            ref={rootRef}
            className={className}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
        >
            <Track>
                <Fill
                    style={{
                        left: 3 + left,
                        width: Math.max(0, Math.min(inner, right) - left),
                    }}
                />
            </Track>
            {values.map((value, index) => (
                <Thumb
                    key={index}
                    role="slider"
                    tabIndex={0}
                    aria-label={labels[index]}
                    aria-valuemin={min}
                    aria-valuemax={max}
                    aria-valuenow={value}
                    data-dragging={dragging === index}
                    style={{ left: `${ratio(value) * 100}%` }}
                    onKeyDown={(event) => handleKey(index, event)}
                >
                    {renderThumb ? (
                        renderThumb({
                            index,
                            ratio: ratio(value),
                            value,
                            dragging: dragging === index,
                        })
                    ) : (
                        <DefaultKnob />
                    )}
                </Thumb>
            ))}
        </Root>
    );
}

export default PixelSlider;
