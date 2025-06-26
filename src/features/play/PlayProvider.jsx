import { useState } from "react";
import { BubbleSort } from "../../algorithms/sort/bubbleSort";
import { PlayContext } from "./PlayContext";
import { generateRandomArray } from "../../utils/randoms";

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
	const [algorithmInput, setAlgorithmInput] = useState(
		generateRandomArray(50, 2, 30)
	);

	return (
		<PlayContext.Provider
			value={{ algorithmCategory, activeWindows, algorithmInput }}
		>
			{children}
		</PlayContext.Provider>
	);
}

export default PlayProvider;
