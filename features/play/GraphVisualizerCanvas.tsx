import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { GraphInput } from "../../utils/graphInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getGraph = (state: RootState): GraphInput =>
    state.play.inputs.graph.value;

/* The shared graph, drawn by the graph worker. */
function GraphVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, GraphInput>(getGraph);
    return (
        <WorkerCanvas
            {...props}
            workerName="graphCanvasWorker.ts"
            input={input}
            loaderLabel="Wiring"
        />
    );
}

export default GraphVisualizerCanvas;
