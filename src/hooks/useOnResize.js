import { useCallback, useLayoutEffect, useRef } from "react";

function useOnResize(onResize, ref) {
	const initRef = useRef(document.body);
	const targetRef = ref || initRef;

	const updateRect = useCallback(() => {
		if (!targetRef.current) return;
		onResize?.(targetRef);
	}, [targetRef, onResize]);

	useLayoutEffect(() => {
		const node = targetRef.current;
		if (!node) return;

		updateRect();

		const resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(node);

		return () => resizeObserver.disconnect();
	}, [targetRef, updateRect]);

	return { ref: targetRef, update: updateRect };
}

export default useOnResize;
