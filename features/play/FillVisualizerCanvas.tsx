import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { FillInput } from "../../utils/fillInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getFill = (state: RootState): FillInput => state.play.inputs.fill.value;

/* The shared bitmap, painted by the fill worker. */
function FillVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, FillInput>(getFill);
    return (
        <WorkerCanvas
            {...props}
            workerName="fillCanvasWorker.ts"
            input={input}
            loaderLabel="Pouring"
        />
    );
}

export default FillVisualizerCanvas;
