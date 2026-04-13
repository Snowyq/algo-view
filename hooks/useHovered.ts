import type { RefObject } from "react";
import { useEffect, useState } from "react";

function useHovered<T extends HTMLElement>(ref: RefObject<T | null>) {
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const toggleHoverOn = () => setIsHovered(true);
    const toggleHoverOff = () => setIsHovered(false);

    useEffect(() => {
        const node = ref.current;
        if (!node) return;

        node.addEventListener("mouseenter", toggleHoverOn);
        node.addEventListener("mousemove", toggleHoverOn);
        node.addEventListener("mouseleave", toggleHoverOff);

        return () => {
            //terminate
            node.removeEventListener("mouseenter", toggleHoverOn);
            node.removeEventListener("mousemove", toggleHoverOn);
            node.removeEventListener("mouseleave", toggleHoverOff);
        };
    }, [ref]);

    return { isHovered };
}

export default useHovered;
