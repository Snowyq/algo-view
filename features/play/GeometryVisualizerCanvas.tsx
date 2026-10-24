import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { PointsInput } from "../../utils/pointsInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getPoints = (state: RootState): PointsInput =>
    state.play.inputs.geometry.value;

/* The shared point set, wrapped by the geometry worker. */
function GeometryVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, PointsInput>(getPoints);
    return (
        <WorkerCanvas
            {...props}
            workerName="geometryCanvasWorker.ts"
            input={input}
            loaderLabel="Wrapping"
        />
    );
}

export default GeometryVisualizerCanvas;
