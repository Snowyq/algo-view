import { createContext } from "react";
const PlayContext = createContext();

function PlayProvider({ children }) {
	return <PlayContext.Provider>{children}</PlayContext.Provider>;
}

export default PlayProvider;
