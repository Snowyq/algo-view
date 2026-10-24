import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { FindInput } from "../../utils/findInput";
import { getFindInput } from "./playSlice";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

/* Array search on the shared find input, drawn by the find worker. */
function FindVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, FindInput>(getFindInput);
    return (
        <WorkerCanvas
            {...props}
            workerName="findCanvasWorker.ts"
            input={input}
            loaderLabel="Searching"
        />
    );
}

export default FindVisualizerCanvas;
