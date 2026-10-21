import { JSX } from "react";
import { useSelector } from "react-redux";
import type { MazeInput } from "../../algorithms/maze/MazeAlgorithm";
import type { RootState } from "../../store";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getMaze = (state: RootState): MazeInput => state.play.inputs.maze.value;

/* Maze generation on the shared size and seed, drawn by the maze worker. */
function MazeVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, MazeInput>(getMaze);
    return (
        <WorkerCanvas
            {...props}
            workerName="mazeCanvasWorker.ts"
            input={input}
            loaderLabel="Carving"
        />
    );
}

export default MazeVisualizerCanvas;
