import { useEffect, useMemo, useRef, useState, type RefObject } from "react";

import styled from "styled-components";

import { JSX } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { SortStepType } from "../../algorithms/sort/SortAlgorithm";
import type {
    AlgorithmMetrics,
    AlgorithmRegistryItem,
} from "../../algorithms/types";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useOnResize from "../../hooks/useOnResize";
import useSortCanvas from "../../hooks/useSortCanvas";
import type { AppDispatch, RootState } from "../../store";
import Loader from "../../ui/Loader";
import {
    decrementSortWorkerLoading,
    getDefaultStepTypes,
    getInput,
    incrementSortWorkerLoading,
    passAlgorithmInfo,
    setSortWorkerReady,
} from "./playSlice";

const AlgorithmContainer = styled.div`
    position: relative;
    width: 100%;
    height: 100%;
    display: flex;
    flex: 1;
    min-height: 0;
    gap: 2rem;
    padding: 1rem;
    background-color: var(--color-grey-50);
    border-radius: 15px;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        padding: 1rem;
        box-shadow: 0.2rem 0.2rem 0px 2px var(--color-grey-300);
    }
`;

const Sizer = styled.div`
    width: 100%;
    height: 100%;
    position: relative;
    overflow: hidden;
    flex: 1;
    min-height: 0;
`;

const LoaderOverlay = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    pointer-events: none;
`;

const Placeholder = styled.div`
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    color: var(--color-grey-500);
    font-size: 1.4rem;
    padding: 2rem;
    z-index: 1;
`;

type SortVisualizerCanvasProps = {
    registry: AlgorithmRegistryItem;
    onMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
    onStepMetricsUpdate?: (metrics: AlgorithmMetrics | null) => void;
};

type AlgorithmOptions = {
    stepTypes?: SortStepType[];
};

type RenderDonePayload = {
    stepsLength?: number;
    metrics?: AlgorithmMetrics;
};

type StepMetricsPayload = {
    metrics?: AlgorithmMetrics;
};

function SortVisualizerCanvas({
    registry,
    onMetricsUpdate,
    onStepMetricsUpdate,
}: SortVisualizerCanvasProps): JSX.Element {
    // Contexts

    const dispatch = useDispatch<AppDispatch>();
    const stepTypes = useSelector<RootState, SortStepType[]>(
        getDefaultStepTypes
    );
    const input = useSelector<RootState, number[]>(getInput);
    const hasInput: boolean = Array.isArray(input) && input.length > 0;

    // Refs

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const sizerRef = useRef<HTMLDivElement | null>(null);

    // States

    const [isLoading, setIsLoading] = useState<boolean>(true);
    const pendingLoadsRef = useRef<number>(0);
    // Canvas API

    const algoOptions = useMemo<AlgorithmOptions>(() => {
        return { stepTypes };
    }, [stepTypes]);

    const canvasApi = useSortCanvas(canvasRef, registry.id);
    const { worker, changeSize, renderAlgorithm, onStatusType } = canvasApi;

    const onResize = (ref: RefObject<HTMLDivElement | null>): void => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        changeSize(rect);
    };

    useOnResize(onResize, sizerRef);

    useEffect((): void => {
        dispatch(setSortWorkerReady(Boolean(worker)));
    }, [dispatch, worker]);

    useEffect((): void => {
        if (!hasInput) return;
        if (!worker) return;
        if (!sizerRef.current) return;
        const rect = sizerRef.current.getBoundingClientRect();
        pendingLoadsRef.current += 1;
        dispatch(incrementSortWorkerLoading());
        if (typeof onStepMetricsUpdate === "function") {
            onStepMetricsUpdate(null);
        }
        renderAlgorithm(input, algoOptions, rect);
    }, [
        algoOptions,
        renderAlgorithm,
        input,
        hasInput,
        worker,
        dispatch,
        onStepMetricsUpdate,
    ]);

    useEffect((): void => {
        onStatusType("mounted", () => {
            dispatch(setSortWorkerReady(true));
        });
        onStatusType("canvas-initialized", () => {
            dispatch(setSortWorkerReady(true));
        });
        onStatusType("render-start", () => {
            setIsLoading(true);
        });
        onStatusType("render-done", (payload) => {
            console.log("rendered");
            const { stepsLength, metrics } = (payload ||
                {}) as RenderDonePayload;
            if (typeof stepsLength === "number") {
                dispatch(
                    passAlgorithmInfo({
                        id: registry.id,
                        stepsLength,
                        metrics,
                    })
                );
            }
            if (typeof onMetricsUpdate === "function") {
                onMetricsUpdate(metrics || null);
            }
            setIsLoading(false);
            if (pendingLoadsRef.current > 0) {
                pendingLoadsRef.current -= 1;
                dispatch(decrementSortWorkerLoading());
            }
        });
        onStatusType("step-metrics", (payload) => {
            if (!payload) return;
            const { metrics } = payload as StepMetricsPayload;
            if (typeof onStepMetricsUpdate === "function") {
                onStepMetricsUpdate(metrics || null);
            }
        });
    }, [
        onStatusType,
        registry,
        dispatch,
        onMetricsUpdate,
        onStepMetricsUpdate,
    ]);

    useEffect((): void | (() => void) => {
        return () => {
            if (pendingLoadsRef.current > 0) {
                const pending = pendingLoadsRef.current;
                pendingLoadsRef.current = 0;
                for (let i = 0; i < pending; i += 1) {
                    dispatch(decrementSortWorkerLoading());
                }
            }
        };
    }, [dispatch]);

    return (
        <AlgorithmContainer>
            <Sizer ref={sizerRef}>
                {hasInput && isLoading && (
                    <LoaderOverlay>
                        <Loader />
                    </LoaderOverlay>
                )}
                <canvas
                    ref={canvasRef}
                    style={{
                        width: "100%",
                        height: "100%",
                        display: "block",
                        position: "absolute",
                    }}
                />
                {!hasInput && (
                    <Placeholder>
                        Choose input in the sidebar and click Generate input.
                    </Placeholder>
                )}
            </Sizer>
        </AlgorithmContainer>
    );
}

export default SortVisualizerCanvas;
