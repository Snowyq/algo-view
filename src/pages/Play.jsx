import PlayLayout from "../features/play/PlayLayout";
import PlayProvider from "../features/play/PlayProvider";
import { StepProvider } from "../features/play/StepProvider";

function Play() {
	return (
		<StepProvider>
			<PlayProvider>
				<PlayLayout />
			</PlayProvider>
		</StepProvider>
	);
}

export default Play;
