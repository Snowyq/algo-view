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
		// [10, 25, 13, 11, 5, 7, 10, 22, 19, 4]
		// [
		// 	19, 28, 12, 27, 20, 11, 30, 15, 9, 4, 23, 2, 29, 25, 14, 12, 8, 3,
		// 	18, 10, 16, 21, 6, 5, 24, 13, 30, 7, 17, 26, 19, 11, 22, 6, 29, 3,
		// 	15, 8, 4, 27, 2, 28, 14, 12, 9, 7, 30, 5, 18, 25, 10, 17, 16, 22,
		// 	24, 13, 21, 26, 6, 23, 20, 11, 19, 3, 9, 5, 14, 17, 28, 8, 7, 2, 18,
		// 	12, 16, 29, 13, 22, 10, 4,
		// ]
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
