import { useEffect, useMemo, useRef, useState } from "react";

import styled from "styled-components";

import { useDispatch, useSelector } from "react-redux";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useOnResize from "../../hooks/useOnResize";
import useSortCanvas from "../../hooks/useSortCanvas";
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

function SortVisualizerCanvas({
    registry,
    onMetricsUpdate = undefined,
    onStepMetricsUpdate = undefined,
}) {
    // Contexts

    const dispatch = useDispatch();
    const stepTypes = useSelector(getDefaultStepTypes);
    const input = useSelector(getInput);
    const hasInput = Array.isArray(input) && input.length > 0;

    // Refs

    const canvasRef = useRef();
    const sizerRef = useRef();

    // States

    const [isLoading, setIsLoading] = useState(true);
    const pendingLoadsRef = useRef(0);
    // Canvas API

    const algoOptions = useMemo(() => {
        return { stepTypes };
    }, [stepTypes]);

    const canvasApi = useSortCanvas(canvasRef, registry.id);
    const { worker, changeSize, renderAlgorithm, onStatusType } = canvasApi;

    const onResize = (ref) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        changeSize(rect);
    };

    useOnResize(onResize, sizerRef);

    useEffect(() => {
        dispatch(setSortWorkerReady(Boolean(worker)));
    }, [dispatch, worker]);

    useEffect(() => {
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

    useEffect(() => {
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
            const { stepsLength, metrics } = payload || {};
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
            if (typeof onStepMetricsUpdate === "function") {
                onStepMetricsUpdate(payload.metrics || null);
            }
        });
    }, [
        onStatusType,
        registry,
        dispatch,
        onMetricsUpdate,
        onStepMetricsUpdate,
    ]);

    useEffect(() => {
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
                {hasInput && isLoading && <Loader />}
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
