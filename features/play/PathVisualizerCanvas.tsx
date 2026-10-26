import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { GridInput } from "../../utils/grid";
import GridEditor from "./GridEditor";
import { getGrid } from "./playSlice";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

/* Path finding on the shared grid, with the grid editor on top. */
function PathVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const grid = useSelector<RootState, GridInput>(getGrid);
    return (
        <WorkerCanvas
            {...props}
            workerName="pathCanvasWorker.ts"
            input={grid}
            loaderLabel="Searching"
            overlay={<GridEditor label={props.registry.meta.name} />}
        />
    );
}

export default PathVisualizerCanvas;
