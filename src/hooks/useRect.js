import { useLayoutEffect, useRef, useState } from "react";

export function useRect(ref) {
	const initRef = useRef(null);
	const targetRef = ref || initRef;

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

	useLayoutEffect(() => {
		if (!targetRef.current) return;

		const updateRect = () => {
			if (!targetRef.current || !targetRef) return;
			const rect = targetRef.current.getBoundingClientRect();
			setRect(rect);
		};

		updateRect();

		window.addEventListener("resize", updateRect);
		return () => window.removeEventListener("resize", updateRect);
	}, [targetRef]);

	return { rect, ref: targetRef };
}
