import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { TreeInput } from "../../utils/treeInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getTree = (state: RootState): TreeInput => state.play.inputs.tree.value;

/* The shared key sequence, inserted and drawn by the tree worker. */
function TreeVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, TreeInput>(getTree);
    return (
        <WorkerCanvas
            {...props}
            workerName="treeCanvasWorker.ts"
            input={input}
            loaderLabel="Planting"
        />
    );
}

export default TreeVisualizerCanvas;
