import { useEffect, useRef } from "react";

const useClickOutside = (handler, ref, listenCapturing) => {
	const initRef = useRef(null);
	const targetRef = ref || initRef;

	useEffect(
		function () {
			function handleClick(e) {
				if (targetRef.current && !targetRef.current.contains(e.target))
					handler();
			}

			document.addEventListener("click", handleClick, listenCapturing);
			return () =>
				document.removeEventListener(
					"click",
					handleClick,
					listenCapturing
				);
		},
		[handler, listenCapturing, targetRef]
	);

	return { ref: targetRef };
};
export default useClickOutside;
