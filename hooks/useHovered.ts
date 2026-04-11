import { useEffect, useState } from "react";

function useHovered(ref) {
    const [isHovered, setIsHovered] = useState(false);
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
