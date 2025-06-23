import { useLayoutEffect, useRef, useState } from "react";

export function useRect(ref = null) {
	let targetRef = useRef(ref);
	const [rect, setRect] = useState({
		width: 0,
		height: 0,
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		x: 0,
		y: 0,
	});
	console.log(ref);
	console.log("hook");

	useLayoutEffect(() => {
		if (!targetRef.current) return;

		const updateRect = () => {
			const rect = targetRef.current.getBoundingClientRect();
			setRect(rect);
		};

		updateRect();

		window.addEventListener("resize", updateRect);
		return () => window.removeEventListener("resize", updateRect);
	}, []);

	return { rect, ref: targetRef };
}
