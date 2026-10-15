import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { Component, createRef, type ReactNode } from "react";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import { pixelWipe } from "../fx/pixelWipe";

gsap.registerPlugin(Flip);

/* Panels glide into freed space on a stepped ease: motion in pixel frames. */
const MOVE = { duration: 0.42, ease: "steps(9)" };

const Grid = styled.div`
    display: grid;
    gap: 1.2rem;
    grid-template-columns: 1fr;
    grid-auto-rows: minmax(0, 1fr);
    position: relative;
    z-index: 1;
    height: 100%;
    width: 100%;
    padding: 1.2rem;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        gap: 2rem;
        padding: 2.4rem;
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

/* New panels dissolve in from blocks of the stage color. */
export function revealPanels(elements: Element[], stagger = 0): void {
    elements.forEach((el, index) => {
        const host = el as HTMLElement;
        const run = (): void => {
            pixelWipe(host, {
                mode: "reveal",
                color: "--bg",
                block: 16,
                duration: 420,
                frames: 8,
            });
        };
        if (stagger > 0 && index > 0) setTimeout(run, index * stagger);
        else run();
    });
}

/*
 * getSnapshotBeforeUpdate is the one React API that runs after render but
 * before the DOM changes, which is exactly when FLIP needs to measure.
 */
class FlipGrid extends Component<FlipGridProps> {
    gridRef = createRef<HTMLDivElement>();

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
            ...MOVE,
            onEnter: (elements) => revealPanels(elements),
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
                data-panel-grid
            >
                {this.props.children}
            </Grid>
        );
    }
}

export default FlipGrid;
