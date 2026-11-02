import {
    JSX,
    useCallback,
    useLayoutEffect,
    useRef,
    useState,
    type ReactNode,
} from "react";
import styled from "styled-components";
import { scrollY } from "../primitives/pixel";

/* Fixed action on top, scrolling form below with edge shades. */

const Layout = styled.div`
    display: flex;
    flex-direction: column;
    height: 100%;
    min-height: 0;
`;

const Action = styled.div`
    flex: 0 0 auto;
    display: grid;
    padding: 2rem 1.6rem 1.2rem;
`;

const Frame = styled.div`
    position: relative;
    flex: 1;
    min-height: 0;
`;

const Scroll = styled.div`
    height: 100%;
    ${scrollY};
    padding: 1.2rem 1.6rem 2.4rem;
`;

/* three hard steps instead of a smooth fade */
const Shade = styled.span<{ $edge: "top" | "bottom" }>`
    position: absolute;
    left: 0;
    right: 0;
    ${({ $edge }) => $edge}: 0;
    z-index: 2;
    height: 2.4rem;
    pointer-events: none;
    opacity: 0;
    transition: opacity 120ms steps(2);
    background: linear-gradient(
        ${({ $edge }) => ($edge === "top" ? "180deg" : "0deg")},
        var(--bg-2) 0 0.8rem,
        color-mix(in srgb, var(--bg-2) 70%, transparent) 0.8rem 1.6rem,
        color-mix(in srgb, var(--bg-2) 35%, transparent) 1.6rem 2.4rem
    );

    &[data-on="true"] {
        opacity: 1;
    }
`;

type InputLayoutProps = {
    action: ReactNode;
    children: ReactNode;
};

function InputLayout({ action, children }: InputLayoutProps): JSX.Element {
    const scrollRef = useRef<HTMLDivElement | null>(null);
    const [edges, setEdges] = useState({ top: false, bottom: false });

    const measure = useCallback((): void => {
        const el = scrollRef.current;
        if (!el) return;
        const top = el.scrollTop > 1;
        const bottom = el.scrollTop + el.clientHeight < el.scrollHeight - 1;
        setEdges((prev) =>
            prev.top === top && prev.bottom === bottom ? prev : { top, bottom }
        );
    }, []);

    // re-measure when the box or its content resizes
    useLayoutEffect(() => {
        const el = scrollRef.current;
        if (!el) return;
        measure();
        const observer = new ResizeObserver(measure);
        observer.observe(el);
        if (el.firstElementChild) observer.observe(el.firstElementChild);
        return () => observer.disconnect();
    }, [measure]);

    return (
        <Layout>
            <Action>{action}</Action>
            <Frame>
                <Shade $edge="top" data-on={edges.top} aria-hidden="true" />
                <Scroll ref={scrollRef} onScroll={measure}>
                    {children}
                </Scroll>
                <Shade
                    $edge="bottom"
                    data-on={edges.bottom}
                    aria-hidden="true"
                />
            </Frame>
        </Layout>
    );
}

export default InputLayout;
