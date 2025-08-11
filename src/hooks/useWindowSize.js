import { useEffect, useState } from "react";

export default function useWindowSize() {
	const [size, setSize] = useState({ width: 0, height: 0 });

	function handleUpdate() {
		const newSize = {
			height: window.innerHeight,
			width: window.innerWidth,
		};
		setSize(newSize);
	}

	useEffect(() => {
		const resizeObserver = new ResizeObserver(handleUpdate);
		resizeObserver.observe(document.body);
		return () => resizeObserver.disconnect();
	}, []);

	return { size, update: handleUpdate };
}
