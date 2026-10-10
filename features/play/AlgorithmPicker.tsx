import type { MouseEvent } from "react";
import { JSX, useEffect } from "react";
import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import styled from "styled-components";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useWindowSize from "../../hooks/useWindowSize";
import type { AppDispatch, RootState } from "../../store";
import ButtonIcon from "../../ui/ButtonIcon";
import type { ActiveAlgorithm, RegistryAlgorithm } from "./playSlice";
import ButtonText from "../../ui/ButtonText";
import {
    closeAlgorithm,
    closeAllAlgorithms,
    getActiveAlgorithms,
    getAlgorithms,
    openAlgorithm,
} from "./playSlice";

type ItemState = "default" | "selected";

const StyledItem = styled.div<{ state: ItemState; $isDisabled?: boolean }>`
    position: relative;
    display: flex;
    align-items: stretch;
    height: 4.4rem;
    border-radius: var(--radius-sm);
    border: 1px solid
        ${({ state }) =>
            state === "selected" ? "var(--swap)" : "var(--ink-700)"};
    background-color: ${({ state }) =>
        state === "selected"
            ? "rgba(var(--swap-rgb), 0.12)"
            : "var(--ink-950)"};
    opacity: ${({ $isDisabled }) => ($isDisabled ? 0.45 : 1)};
    transition:
        border-color var(--dur-fast) var(--ease-out),
        background-color var(--dur-fast) var(--ease-out);

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            border-color: ${({ state, $isDisabled }) =>
                $isDisabled
                    ? "var(--ink-700)"
                    : state === "selected"
                      ? "var(--swap-strong)"
                      : "var(--ink-600)"};
        }
    }
`;

const ItemButton = styled.button<{ state: ItemState }>`
    flex: 1;
    display: flex;
    align-items: center;
    gap: var(--space-2);
    min-width: 0;
    padding: 0 var(--space-3);
    border: none;
    border-radius: inherit;
    background: none;
    color: ${({ state }) =>
        state === "selected" ? "var(--text)" : "var(--text-soft)"};
    font-size: var(--text-sm);
    font-weight: 500;
    text-align: left;

    &::before {
        content: "";
        flex: 0 0 auto;
        width: 0.8rem;
        height: 0.8rem;
        border-radius: 2px;
        background-color: ${({ state }) =>
            state === "selected" ? "var(--swap)" : "var(--ink-600)"};
        transition: background-color var(--dur-fast) var(--ease-out);
    }

    &:disabled {
        background: none;
        color: var(--text-muted);
    }
`;

const ItemCloseButton = styled(ButtonIcon)`
    align-self: center;
    margin-right: 0.4rem;
    --hover-background: rgba(255, 125, 125, 0.16);
    --hover-color: var(--danger);
`;

const Toolbar = styled.div`
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-3);
    min-height: 2.4rem;
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

const Count = styled.span`
    font-variant-numeric: tabular-nums;
`;

const ClearButton = styled(ButtonText)`
    font-size: var(--text-sm);

    &:disabled {
        color: var(--text-faint);
        text-decoration: none;
        cursor: default;
    }
`;

const LimitNote = styled.p`
    font-size: var(--text-sm);
    color: var(--text-muted);
`;

const Groups = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-5);
`;

const Group = styled.div`
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
`;

const GroupLabel = styled.p`
    display: flex;
    align-items: center;
    gap: var(--space-2);
    font-size: var(--text-sm);
    font-weight: 500;
    color: var(--text-soft);

    &::after {
        content: "";
        flex: 1;
        height: 1px;
        background-color: var(--ink-700);
    }
`;

const AlgorithmsList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: var(--space-2);
`;

function AlgorithmPicker(): JSX.Element {
    const dispatch = useDispatch<AppDispatch>();

    const activeAlgorithms = useSelector<RootState, ActiveAlgorithm[]>(
        getActiveAlgorithms
    );
    const algorithms = useSelector<RootState, RegistryAlgorithm[]>(
        getAlgorithms
    );
    const { size } = useWindowSize();
    const breakpointValue = Number.parseInt(PLAY_LAYOUT_BREAKPOINT, 10);
    const isMobile =
        Number.isFinite(breakpointValue) && size.width < breakpointValue;
    const maxVisibleAlgorithms = 3;
    const isLimitReached =
        isMobile && activeAlgorithms.length >= maxVisibleAlgorithms;

    useEffect(() => {
        if (!isMobile) return;
        if (activeAlgorithms.length <= maxVisibleAlgorithms) return;
        const idsToClose = activeAlgorithms
            .slice(maxVisibleAlgorithms)
            .map((algo) => algo.id);
        idsToClose.forEach((id) => dispatch(closeAlgorithm(id)));
    }, [activeAlgorithms, dispatch, isMobile, maxVisibleAlgorithms]);

    const handleClose = (id: string): void => {
        dispatch(closeAlgorithm(id));
    };
    const handleOpen = (id: string): void => {
        dispatch(openAlgorithm(id));
    };

    const renderItem = (algo: RegistryAlgorithm): JSX.Element => {
        const isSelected = activeAlgorithms.some(
            (x: ActiveAlgorithm) => x.id === algo.id
        );
        const isDisabled = !isSelected && isLimitReached;
        return (
            <Item
                key={algo.id}
                name={algo.name}
                id={algo.id}
                isSelected={isSelected}
                isDisabled={isDisabled}
                onClose={handleClose}
                onOpen={handleOpen}
            />
        );
    };

    const classic = algorithms.filter((algo) => algo.group !== "fun");
    const fun = algorithms.filter((algo) => algo.group === "fun");

    const selectedCount = activeAlgorithms.length;

    return (
        <Groups>
            <Toolbar>
                <Count aria-live="polite">
                    {selectedCount === 0
                        ? "None selected"
                        : `${selectedCount} selected`}
                </Count>
                <ClearButton
                    type="button"
                    onClick={() => dispatch(closeAllAlgorithms())}
                    disabled={selectedCount === 0}
                >
                    Clear all
                </ClearButton>
            </Toolbar>
            {isLimitReached && (
                <LimitNote>
                    Small screens show up to {maxVisibleAlgorithms} at once.
                    Remove one to pick another.
                </LimitNote>
            )}
            <AlgorithmsList>{classic.map(renderItem)}</AlgorithmsList>
            {fun.length > 0 && (
                <Group>
                    <GroupLabel>Just for fun</GroupLabel>
                    <AlgorithmsList>{fun.map(renderItem)}</AlgorithmsList>
                </Group>
            )}
        </Groups>
    );
}

type ItemProps = {
    name: string;
    id: string;
    onOpen?: (id: string) => void;
    onClose?: (id: string) => void;
    isSelected: boolean;
    isDisabled: boolean;
};

function Item({
    name,
    onOpen,
    id,
    onClose,
    isSelected,
    isDisabled,
}: ItemProps): JSX.Element {
    const state: ItemState = isSelected ? "selected" : "default";

    const handleClose = (e: MouseEvent<HTMLButtonElement>): void => {
        e.stopPropagation();
        onClose?.(id);
    };

    const handleOpen = (): void => {
        if (isDisabled) return;
        onOpen?.(id);
    };

    return (
        <StyledItem state={state} $isDisabled={isDisabled}>
            <ItemButton
                type="button"
                state={state}
                onClick={handleOpen}
                disabled={isDisabled}
                aria-pressed={isSelected}
            >
                <span>{name}</span>
            </ItemButton>

            {isSelected && (
                <ItemCloseButton
                    type="button"
                    onClick={handleClose}
                    aria-label={`Remove ${name}`}
                    title={`Remove ${name}`}
                    size="1.8rem"
                    padding="0.5rem"
                >
                    <IoIosClose />
                </ItemCloseButton>
            )}
        </StyledItem>
    );
}

export default AlgorithmPicker;
