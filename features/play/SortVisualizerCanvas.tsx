import { JSX, useMemo } from "react";
import { useSelector } from "react-redux";
import type { SortStepType } from "../../algorithms/sort/SortAlgorithm";
import type { RootState } from "../../store";
import { getDefaultStepTypes, getInput } from "./playSlice";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

/* Sorting on the shared array, drawn by the sort worker. */
function SortVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, number[]>(getInput);
    const stepTypes = useSelector<RootState, SortStepType[]>(
        getDefaultStepTypes
    );
    const options = useMemo(() => ({ stepTypes }), [stepTypes]);
    return (
        <WorkerCanvas
            {...props}
            workerName="sortCanvasWorker.ts"
            input={input}
            options={options}
            loaderLabel="Sorting"
        />
    );
}

export default SortVisualizerCanvas;
