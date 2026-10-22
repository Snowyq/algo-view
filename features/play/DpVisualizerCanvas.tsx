import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { DpInput } from "../../utils/dpInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getDp = (state: RootState): DpInput => state.play.inputs.dp.value;

/* A DP table on the shared bundle, drawn by the DP worker. */
function DpVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, DpInput>(getDp);
    return (
        <WorkerCanvas
            {...props}
            workerName="dpCanvasWorker.ts"
            input={input}
            loaderLabel="Filling"
        />
    );
}

export default DpVisualizerCanvas;
