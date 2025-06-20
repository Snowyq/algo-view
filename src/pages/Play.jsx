import PlayLayout from "../features/play/PlayLayout";
import PlayProvider from "../features/play/PlayProvider";

function Play() {
	return (
		<PlayProvider>
			<PlayLayout />
		</PlayProvider>
	);
}

export default Play;
