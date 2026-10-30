import {
    Component,
    createRef,
    type CSSProperties,
    type ReactNode,
} from "react";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../../../constants/breakpoints";
import { ditherIn } from "../fx/dither";
import { pixelWipe } from "../fx/pixelWipe";

/* Spacing in CSS px; PanelGrid needs the same numbers to do the maths. */
export const GRID_GAP = 20;
export const GRID_PAD = 24;
export const GRID_GAP_SMALL = 12;

/* Columns come from panelColumns (see PanelGrid); rows always share the
   stage height, so the stage never scrolls. */
const Grid = styled.div`
    display: grid;
    gap: ${GRID_GAP_SMALL}px;
    grid-template-columns: repeat(var(--columns, 1), minmax(0, 1fr));
    grid-auto-rows: minmax(0, 1fr);
    position: relative;
    z-index: 1;
    height: 100%;
    width: 100%;
    padding: ${GRID_GAP_SMALL}px;

    @media screen and (min-width: ${PLAY_LAYOUT_BREAKPOINT}) {
        gap: ${GRID_GAP}px;
        padding: ${GRID_PAD}px;
    }
`;

type FlipGridProps = {
    /** Changes whenever the set or order of children changes. */
    flipKey: string;
    reduced: boolean;
    columns: number;
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
                duration: 280,
                frames: 8,
            });
        };
        if (stagger > 0 && index > 0) setTimeout(run, index * stagger);
        else run();
    });
}

/*
 * Layout changes (a panel added, closed, or the column count) do not slide
 * panels across the stage: the ones that stay dither in at their new slot
 * and new ones build up from blocks. getSnapshotBeforeUpdate records which
 * panels were there before the DOM changes.
 */
class FlipGrid extends Component<FlipGridProps> {
    gridRef = createRef<HTMLDivElement>();

    getSnapshotBeforeUpdate(prevProps: FlipGridProps): Set<string> | null {
        const grid = this.gridRef.current;
        if (!grid || this.props.reduced) return null;
        if (prevProps.flipKey === this.props.flipKey) return null;
        return new Set(
            Array.from(
                grid.children,
                (el) => (el as HTMLElement).dataset.flipId ?? ""
            )
        );
    }

    componentDidUpdate(
        _prevProps: FlipGridProps,
        _prevState: unknown,
        before: Set<string> | null
    ): void {
        const grid = this.gridRef.current;
        if (!grid || !before) return;
        const entering: Element[] = [];
        Array.from(grid.children).forEach((el) => {
            const host = el as HTMLElement;
            if (host.dataset.exiting === "true") return;
            if (before.has(host.dataset.flipId ?? "")) ditherIn(host);
            else entering.push(el);
        });
        revealPanels(entering);
    }

    render(): ReactNode {
        return (
            <Grid
                ref={this.gridRef}
                data-panel-grid
                style={{ "--columns": this.props.columns } as CSSProperties}
            >
                {this.props.children}
            </Grid>
        );
    }
}

export default FlipGrid;
