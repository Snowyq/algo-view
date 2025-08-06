import PlayLayout from "../features/play/PlayLayout";
import PlayProvider from "../features/play/PlayProvider";
import { StepProvider } from "../features/play/StepProvider";

function Play() {
	return (
		<PlayProvider>
			<StepProvider>
				<PlayLayout />
			</StepProvider>
		</PlayProvider>
	);
}

export default Play;
