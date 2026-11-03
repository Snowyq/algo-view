import { useEffect } from "react";
import { useDispatch } from "react-redux";
import type { AppDispatch } from "../../../../store";
import {
    applyInput,
    changeCategory,
    changeSpeed,
    closeAllAlgorithms,
    openAlgorithm,
    setInputValue,
    setOverviewOpen,
} from "../../playSlice";
import { parseShareUrl } from "./shareState";

/* Loads a shared setup from the URL once; a bare /play opens the category overview. */
function useSharedSetup(): void {
    const dispatch = useDispatch<AppDispatch>();
    useEffect(() => {
        const setup = parseShareUrl(window.location.search);
        if (!setup) {
            dispatch(setOverviewOpen(true));
            return;
        }
        // category first: switching it clears the open algorithms
        dispatch(changeCategory(setup.category));
        if (setup.input) {
            const { category, config, value } = setup.input;
            dispatch(
                applyInput({ category, config } as Parameters<
                    typeof applyInput
                >[0])
            );
            // a hand-edited input replaces the generated one
            if (value !== undefined) {
                dispatch(
                    setInputValue({ category, value } as Parameters<
                        typeof setInputValue
                    >[0])
                );
            }
        }
        if (setup.speed) dispatch(changeSpeed(setup.speed));
        if (setup.algorithms) {
            dispatch(closeAllAlgorithms());
            setup.algorithms.forEach((id) => dispatch(openAlgorithm(id)));
        }
    }, [dispatch]);
}

export default useSharedSetup;
