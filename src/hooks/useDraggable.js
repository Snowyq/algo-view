import { useEffect, useRef, useState } from "react";
import { useRect } from "./useRect";

export function useDraggable({
	ref,
	parentRef,
	// onMouseDown,
	// onMouseUp,
	// onMouseMove,
	onDrag,
}) {
	const initRef = useRef(null);
	const initParentRef = useRef(null);
	const targetRef = ref || initRef;
	const targetParentRef = parentRef || initParentRef;
	const isVerticalDraggable = false;
	const isHorizontalDraggable = true;

	const { rect: targetParentRect } = useRect(targetParentRef);
	const { rect: targetRect } = useRect(targetRef);

	// const [position, setPosition] = useState({ x: 0, y: 0 });
	// const posRef = useRef({ x: 0, y: 0 });
	const draggingRef = useRef(false);

	const targetRectRef = useRef(targetRect);
	const targetParentRectRef = useRef(targetParentRect);

	useEffect(() => {
		targetRectRef.current = targetRect;
	}, [targetRect]);

	useEffect(() => {
		targetParentRectRef.current = targetParentRect;
	}, [targetParentRect]);

	const MouseMoveHandler = Event => {
		console.log("move");
		if (!draggingRef.current) return;

		const mousePosition = {
			x: Event.clientX,
			y: Event.clientY,
		};

		if (onDrag) {
			onDrag(
				mousePosition,
				targetRectRef.current,
				targetParentRectRef.current
			);
		}

		// posRef.current = { x: Event.clientX, y: Event.clientY };

		// if (onMouseMove) onMouseMove(Event);
	};

	const MouseDownHandler = Event => {
		console.log("down");
		draggingRef.current = true;
		window.addEventListener("mousemove", MouseMoveHandler);
		window.addEventListener("mouseup", MouseUpHandler);
		// if (onMouseDown) onMouseDown(Event);
		// if (onDrag) onDrag(Event, targetRect, targetParentRect);
	};
	const MouseUpHandler = Event => {
		console.log("up");
		if (!draggingRef.current) return;
		draggingRef.current = false;
		window.removeEventListener("mousemove", MouseMoveHandler);
		window.removeEventListener("mouseup", MouseUpHandler);
		// if (onMouseUp) onMouseUp(Event);
	};

	useEffect(() => {
		if (!targetRef.current || !targetParentRef) return;

		targetRef.current.addEventListener("mousedown", MouseDownHandler);

		return () => {
			window.removeEventListener("mousemove", MouseMoveHandler);
			window.removeEventListener("mouseup", MouseUpHandler);
			window.removeEventListener("mousedown", MouseDownHandler);
		};
	}, [targetRef, targetParentRef]);

	return {
		ref: targetRef,
		parentRef: targetParentRef,
		parentRect: targetParentRect,
		rect: targetRect,
	};
}
