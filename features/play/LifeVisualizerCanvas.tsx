import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { LifeInput } from "../../utils/lifeInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getLife = (state: RootState): LifeInput => state.play.inputs.life.value;

/* The shared starting grid, evolved by the automata worker. */
function LifeVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, LifeInput>(getLife);
    return (
        <WorkerCanvas
            {...props}
            workerName="lifeCanvasWorker.ts"
            input={input}
            loaderLabel="Seeding"
        />
    );
}

export default LifeVisualizerCanvas;
