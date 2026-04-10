import { useEffect } from "react";
import styled, { css } from "styled-components";

import { IoIosClose } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { PLAY_LAYOUT_BREAKPOINT } from "../../constants/breakpoints";
import useWindowSize from "../../hooks/useWindowSize";
import ButtonIcon from "../../ui/ButtonIcon";
import {
    closeAlgorithm,
    getActiveAlgorithms,
    getAlgorithms,
    openAlgorithm,
} from "./playSlice";

const ItemCloseButton = styled(ButtonIcon)`
    background-color: transparent;
    padding: 0.2rem;
    opacity: ${({ state }) => (state === "selected" ? 1 : 0)};
    visibility: ${({ state }) => (state === "selected" ? "visible" : "hidden")};
    svg {
        color: white;
        width: 2.2rem;
        height: 2.2rem;
    }

    &:hover {
        background-color: var(--color-red-500);

        svg {
            color: white;
        }
    }
`;

const itemStates = {
    default: css`
        box-shadow: 3px 3px 0px 1px var(--color-grey-300);
        @media (hover: hover) and (pointer: fine) {
            &:hover {
                background-color: var(--color-blue-200);
                box-shadow: 3px 3px 0px 1px var(--color-blue-300);
            }
        }
    `,
    selected: css`
        background-color: var(--color-blue-400);
        box-shadow: 3px 3px 0px 1px var(--color-blue-500);
        color: white;
        transition:
            background-color 0.2s,
            box-shadow 0.2s;

        &:has(${ItemCloseButton}:hover) {
            background-color: var(--color-red-400);
            box-shadow: 3px 3px 0px 1px var(--color-red-500);
        }
    `,
};

const disabledStyles = css`
    opacity: 0.5;
    cursor: not-allowed;

    @media (hover: hover) and (pointer: fine) {
        &:hover {
            background-color: var(--color-grey-50);
            box-shadow: 3px 3px 0px 1px var(--color-grey-300);
        }
    }
`;

const StyledItem = styled.div`
    background-color: var(--color-grey-50);
    padding: 1rem 0.5rem 1rem 1.5rem;
    border-radius: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    ${({ state }) => itemStates[state]};
    ${({ $isDisabled }) => $isDisabled && disabledStyles};
`;

const AlgorithmsList = styled.div`
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
    padding: 1rem 1rem;
    border-radius: 15px;
    background-color: var(--color-grey-200);
`;

function AlgorithmPicker() {
    const dispatch = useDispatch();

    const activeAlgorithms = useSelector(getActiveAlgorithms);
    const algorithms = useSelector(getAlgorithms);
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

    const handleClose = (id) => dispatch(closeAlgorithm(id));
    const handleOpen = (id) => dispatch(openAlgorithm(id));

    return (
        <AlgorithmsList>
            {algorithms.map((algo) => {
                const isSelected = activeAlgorithms.some(
                    (x) => x.id === algo.id
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
            })}
        </AlgorithmsList>
    );
}

function Item({ name, onOpen, id, onClose, isSelected, isDisabled }) {
    const state = isSelected ? "selected" : "default";

    const handleClose = (e) => {
        e.stopPropagation();
        onClose?.(id);
    };

    const handleOpen = () => {
        if (isDisabled) return;
        onOpen?.(id);
    };

    return (
        <StyledItem
            state={state}
            $isDisabled={isDisabled}
            aria-disabled={isDisabled}
            onClick={handleOpen}
        >
            <span>{name}</span>

            <ItemCloseButton state={state} onClick={handleClose}>
                <IoIosClose />
            </ItemCloseButton>
        </StyledItem>
    );
}

export default AlgorithmPicker;
