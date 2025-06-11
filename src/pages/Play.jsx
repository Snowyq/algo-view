import { createContext } from "react";
import PlayLayout from "../features/play/PlayLayout";

const PlayContext = createContext();

function Play() {
	return (
		<PlayContext.Provider>
			<PlayLayout />
		</PlayContext.Provider>
	);
}

export default Play;
