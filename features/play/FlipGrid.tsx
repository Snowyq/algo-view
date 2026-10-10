import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Component, createRef, type ReactNode } from "react";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";

gsap.registerPlugin(Flip);

export const FLIP_ENTER = { duration: 0.5, ease: "expo.out" };

const Grid = styled.div`
    display: grid;
    gap: 0;
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, 1fr);
    position: relative;
    height: 100%;
    width: 100%;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        gap: var(--space-4);
        padding: var(--space-6);
        /* Keep panels clear of the sidebar tab that hangs into this area. */
        padding-right: calc(var(--sidebar-tab-width) + var(--space-4));
    }

    &.grid-two-columns {
        @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
            grid-template-columns: repeat(2, minmax(0, 1fr));
        }
    }
`;

type FlipGridProps = {
    /** Changes whenever the set or order of children changes. */
    flipKey: string;
    reduced: boolean;
    twoColumns: boolean;
    children: ReactNode;
};

/*
 * getSnapshotBeforeUpdate is the one React API that runs after render but
 * before the DOM changes, which is exactly when FLIP needs to measure.
 */
class FlipGrid extends Component<FlipGridProps> {
    gridRef = createRef<HTMLDivElement>();

    componentDidMount(): void {
        const grid = this.gridRef.current;
        if (!grid || this.props.reduced || grid.children.length === 0) return;
        gsap.fromTo(
            grid.children,
            { opacity: 0, y: 12 },
            {
                opacity: 1,
                y: 0,
                stagger: 0.06,
                ...FLIP_ENTER,
                clearProps: "transform",
            }
        );
    }

    getSnapshotBeforeUpdate(prevProps: FlipGridProps): Flip.FlipState | null {
        const grid = this.gridRef.current;
        if (!grid || this.props.reduced) return null;
        if (prevProps.flipKey === this.props.flipKey) return null;
        return Flip.getState(grid.children);
    }

    componentDidUpdate(
        _prevProps: FlipGridProps,
        _prevState: unknown,
        snapshot: Flip.FlipState | null
    ): void {
        const grid = this.gridRef.current;
        if (!grid || !snapshot) return;
        Flip.from(snapshot, {
            targets: grid.children,
            scale: true,
            ...FLIP_ENTER,
            onEnter: (elements) =>
                gsap.fromTo(
                    elements,
                    { opacity: 0, scale: 0.94 },
                    { opacity: 1, scale: 1, ...FLIP_ENTER }
                ),
        });
    }

    componentWillUnmount(): void {
        const grid = this.gridRef.current;
        if (grid) gsap.killTweensOf(grid.children);
    }

    render(): ReactNode {
        return (
            <Grid
                ref={this.gridRef}
                className={this.props.twoColumns ? "grid-two-columns" : ""}
            >
                {this.props.children}
            </Grid>
        );
    }
}

export default FlipGrid;
