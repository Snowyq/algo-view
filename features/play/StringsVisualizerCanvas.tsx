import { JSX } from "react";
import { useSelector } from "react-redux";
import type { RootState } from "../../store";
import type { TextInput } from "../../utils/textInput";
import WorkerCanvas, { type VisualizerProps } from "./WorkerCanvas";

const getText = (state: RootState): TextInput =>
    state.play.inputs.strings.value;

/* A pattern sliding along the shared text, drawn by the strings worker. */
function StringsVisualizerCanvas(props: VisualizerProps): JSX.Element {
    const input = useSelector<RootState, TextInput>(getText);
    return (
        <WorkerCanvas
            {...props}
            workerName="stringsCanvasWorker.ts"
            input={input}
            loaderLabel="Matching"
        />
    );
}

export default StringsVisualizerCanvas;
