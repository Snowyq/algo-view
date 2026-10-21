import type { UnknownAction } from "@reduxjs/toolkit";
import registryApi from "../../algorithms/algorithmsRegistryApi";
import type {
    MazeAlgorithm,
    MazeInput,
} from "../../algorithms/maze/MazeAlgorithm";
import type { AlgorithmConstructor } from "../../algorithms/types";
import { CELL_EMPTY, CELL_WALL } from "../../utils/grid";
import {
    changeCategory,
    closeAllAlgorithms,
    openAlgorithm,
    setInputValue,
} from "./playSlice";

/*
 * Maze → Path bridge: rebuild the finished maze (cheap, deterministic
 * from the seed) and hand it to the path finders, start in the top-left
 * room, end in the bottom-right one.
 */
export function solveMazeActions(
    algorithmId: string,
    maze: MazeInput
): UnknownAction[] {
    const Class = registryApi.getAlgorithmClass("maze", algorithmId) as
        | AlgorithmConstructor<MazeAlgorithm>
        | undefined;
    if (!Class) return [];
    const walls = new Class(maze).getFinalWalls();
    const { cols, rows } = maze;
    const cells = Array.from(walls, (wall) => (wall ? CELL_WALL : CELL_EMPTY));
    const start = 1 * cols + 1;
    const end = (rows - 2) * cols + (cols - 2);
    return [
        changeCategory("path"),
        setInputValue({
            category: "path",
            value: { cols, rows, cells, start, end },
        }),
        closeAllAlgorithms(),
        openAlgorithm("bfs"),
        openAlgorithm("astar"),
        openAlgorithm("wallFollower"),
    ];
}
