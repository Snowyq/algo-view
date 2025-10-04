import { useCallback, useLayoutEffect, useRef, useState } from "react";

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

	const updateRect = useCallback(() => {
		const node = targetRef.current;
		if (!node) return;
		const newRect = node.getBoundingClientRect();
		setRect(newRect);
	}, [targetRef]);

	useLayoutEffect(() => {
		const node = targetRef.current;
		if (!node) return;

		updateRect();

		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(node);

		return () => resizeObserver.disconnect();
	}, [targetRef, updateRect]);

	return { rect, ref: targetRef, update: updateRect };
}
