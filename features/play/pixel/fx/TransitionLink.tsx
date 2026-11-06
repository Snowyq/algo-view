"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { forwardRef, type ComponentProps, type MouseEvent } from "react";
import { leaveTo } from "./pageTransition";

/* <Link> through the page transition; modified and same-page clicks stay plain. */
const TransitionLink = forwardRef<
    HTMLAnchorElement,
    ComponentProps<typeof Link>
>(function TransitionLink({ href, onClick, ...props }, ref) {
    const router = useRouter();
    const pathname = usePathname();
    const target = typeof href === "string" ? href : (href.pathname ?? "/");
    const handleClick = (event: MouseEvent<HTMLAnchorElement>): void => {
        onClick?.(event);
        if (
            event.defaultPrevented ||
            event.button !== 0 ||
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            (props.target && props.target !== "_self") ||
            target.split(/[?#]/)[0] === pathname
        ) {
            return;
        }
        event.preventDefault();
        leaveTo(target, (to) => router.push(to));
    };
    return <Link ref={ref} href={href} onClick={handleClick} {...props} />;
});

export default TransitionLink;
