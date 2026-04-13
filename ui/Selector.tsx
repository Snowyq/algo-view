import {
    createContext,
    JSX,
    useContext,
    useRef,
    type ComponentType,
    type Key,
    type MutableRefObject,
    type ReactNode,
} from "react";
import styled from "styled-components";
const Container = styled.div`
    position: relative;
    display: flex;
    width: fit-content;
`;
type SelectorOption = Key;

type SelectorRender = (
    option: SelectorOption,
    isSelected: boolean
) => ReactNode;

type SelectorWrapperProps = {
    children: ReactNode;
};

type SelectorProps = {
    onChange?: (id: SelectorOption) => void;
    Highlight?: ComponentType<unknown> | null;
    Wrapper?: ComponentType<SelectorWrapperProps>;
    highlightDuration?: number;
    render?: SelectorRender;
    options?: SelectorOption[];
    selected?: SelectorOption | null;
    omitItemPointerEvents?: boolean;
};

type SelectorContextValue = {
    itemRefs: MutableRefObject<Map<SelectorOption, HTMLDivElement | null>>;
    selected: SelectorOption | null;
    handleChange: (id: SelectorOption) => void;
    PassedHighlight: ComponentType<unknown> | null;
    highlightDuration: number;
    omitPointerEvents: boolean;
};

const StyledItem = styled.div<{ $pointerEvents?: "auto" | "none" }>`
    pointer-events: ${({ $pointerEvents = "auto" }) => $pointerEvents};
    z-index: 1;
`;

const SelectorContext = createContext<SelectorContextValue | null>(null);

function Selector({
    onChange,
    Highlight: PassedHighlight = null,
    Wrapper,
    highlightDuration = 0.3,
    render = () => null,
    options = [],
    selected = null,
    omitItemPointerEvents = false,
}: SelectorProps): JSX.Element {
    const itemRefs = useRef<Map<SelectorOption, HTMLDivElement | null>>(
        new Map()
    );

    const handleChange = (id: SelectorOption) => {
        onChange?.(id);
    };
    const renderedOptions = renderOptions(options, render, selected);

    return (
        <SelectorContext.Provider
            value={{
                itemRefs,
                selected,
                handleChange,
                PassedHighlight,
                highlightDuration,
                omitPointerEvents: omitItemPointerEvents,
            }}
        >
            <Container>
                {Wrapper ? (
                    <Wrapper>{renderedOptions}</Wrapper>
                ) : (
                    renderedOptions
                )}
            </Container>
        </SelectorContext.Provider>
    );
}

function Item({
    children,
    id,
}: {
    children: ReactNode;
    id: SelectorOption;
}): JSX.Element {
    const itemRef = useRef<HTMLDivElement | null>(null);
    const context = useContext(SelectorContext);
    if (!context) {
        throw new Error("Selector.Item must be used within Selector");
    }
    const { handleChange, omitPointerEvents } = context;

    const handleClick = (): void => {
        handleChange(id);
    };

    return (
        <StyledItem
            onClick={handleClick}
            ref={itemRef}
            $pointerEvents={omitPointerEvents ? "none" : "auto"}
        >
            {children}
        </StyledItem>
    );
}

function renderOptions(
    options: SelectorOption[],
    render: SelectorRender,
    selected: SelectorOption | null
): JSX.Element[] {
    return options.map((option) => {
        return (
            <Item key={option} id={option}>
                {render(option, option === selected)}
            </Item>
        );
    });
}

Selector.Item = Item;
export default Selector;
