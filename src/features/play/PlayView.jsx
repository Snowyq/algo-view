import PlayWindow from "./PlayWindow";
import { BubbleSort } from "../../algorithms/sort/bubbleSort";
import { generateRandomArray } from "../../utils/randoms";
import { useEffect, useMemo, useState } from "react";
import PlaySortAlgorithm from "./PlaySortAlgorithm";

function PlayView({ algorithm }) {
	const [instanceKey, setInstanceKey] = useState(0);
	const bubbleSort = new BubbleSort(generateRandomArray(50, 2, 20));
	function reset() {
		bubbleSort.resetSteps();
		setInstanceKey(i => i + 1);
	}

	return (
		<PlayWindow>
			<PlayWindow.Header>BubbleSort</PlayWindow.Header>
			<PlayWindow.Body>
				<PlaySortAlgorithm key={instanceKey} algorithm={bubbleSort} />
				<button onClick={reset}>wstecz</button>
			</PlayWindow.Body>
		</PlayWindow>
	);
}

export default PlayView;
