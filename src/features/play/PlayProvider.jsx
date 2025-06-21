import { useState } from "react";
import { BubbleSort } from "../../algorithms/sort/bubbleSort";
import { PlayContext } from "./PlayContext";

const testActiveWindow = {
	role: "algorithm",
	algorithm: {
		id: "bubbleSort",
		category: "sort",
		name: "BubbleSort",
	},
};
function PlayProvider({ children }) {
	const [algorithmCategory, setAlgoritmCategory] = useState("sort");
	const [activeWindows, setActiveWindows] = useState([testActiveWindow]);

	return (
		<PlayContext.Provider value={{ algorithmCategory, activeWindows }}>
			{children}
		</PlayContext.Provider>
	);
}

export default PlayProvider;
