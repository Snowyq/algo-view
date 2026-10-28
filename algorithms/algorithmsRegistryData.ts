import { BubbleSort } from "./sort/BubbleSort";
import { QuickSort } from "./sort/QuickSort";
import { HeapSort } from "./sort/HeapSort";
import { CocktailShakerSort } from "./sort/CocktailShakerSort";
import { CombSort } from "./sort/CombSort";
import { GnomeSort } from "./sort/GnomeSort";
import { OddEvenSort } from "./sort/OddEvenSort";
import { PancakeSort } from "./sort/PancakeSort";
import { RadixSort } from "./sort/RadixSort";
import { BogoSort } from "./sort/BogoSort";
import { BozoSort } from "./sort/BozoSort";
import { StoogeSort } from "./sort/StoogeSort";
import { SlowSort } from "./sort/SlowSort";
import { SleepSort } from "./sort/SleepSort";
import { MiracleSort } from "./sort/MiracleSort";
import { InsertionSort } from "./sort/InsertionSort";
import { MergeSort } from "./sort/MergeSort";
import { SelectionSort } from "./sort/SelectionSort";
import { ShellSort } from "./sort/ShellSort";
import { BinarySearch } from "./find/BinarySearch";
import { ExponentialSearch } from "./find/ExponentialSearch";
import { InterpolationSearch } from "./find/InterpolationSearch";
import { JumpSearch } from "./find/JumpSearch";
import { LinearSearch } from "./find/LinearSearch";
import { RandomGuess } from "./find/RandomGuess";
import { TernarySearch } from "./find/TernarySearch";
import { AldousBroder } from "./maze/AldousBroder";
import { BinaryTree } from "./maze/BinaryTree";
import { HuntAndKill } from "./maze/HuntAndKill";
import { Kruskal } from "./maze/Kruskal";
import { Prim } from "./maze/Prim";
import { RecursiveBacktracker } from "./maze/RecursiveBacktracker";
import { Sidewinder } from "./maze/Sidewinder";
import { Wilson } from "./maze/Wilson";
import { CoinChange } from "./dp/CoinChange";
import { EditDistance } from "./dp/EditDistance";
import { Knapsack } from "./dp/Knapsack";
import { LongestCommonSubsequence } from "./dp/LongestCommonSubsequence";
import { LongestIncreasingSubsequence } from "./dp/LongestIncreasingSubsequence";
import { Horspool } from "./strings/Horspool";
import { KnuthMorrisPratt } from "./strings/KnuthMorrisPratt";
import { NaiveMatch } from "./strings/NaiveMatch";
import { RabinKarp } from "./strings/RabinKarp";
import { ZAlgorithm } from "./strings/ZAlgorithm";
import { BellmanFord } from "./graph/BellmanFord";
import { Boruvka } from "./graph/Boruvka";
import { GraphBfs } from "./graph/GraphBfs";
import { GraphDfs } from "./graph/GraphDfs";
import { GraphDijkstra } from "./graph/GraphDijkstra";
import { Kruskal as KruskalMst } from "./graph/Kruskal";
import { Prim as PrimMst } from "./graph/Prim";
import { TopologicalSort } from "./graph/TopologicalSort";
import { AvlTree } from "./tree/AvlTree";
import { BinaryHeap } from "./tree/BinaryHeap";
import { BinarySearchTree } from "./tree/BinarySearchTree";
import { RedBlackTree } from "./tree/RedBlackTree";
import { SplayTree } from "./tree/SplayTree";
import { Treap } from "./tree/Treap";
import { BruteForceHull } from "./geometry/BruteForceHull";
import { GrahamScan } from "./geometry/GrahamScan";
import { JarvisMarch } from "./geometry/JarvisMarch";
import { MonotoneChain } from "./geometry/MonotoneChain";
import { Quickhull } from "./geometry/Quickhull";
import { ComponentLabeling } from "./fill/ComponentLabeling";
import { EightWayFill } from "./fill/EightWayFill";
import { QueueFill } from "./fill/QueueFill";
import { RandomFill } from "./fill/RandomFill";
import { ScanlineFill } from "./fill/ScanlineFill";
import { StackFill } from "./fill/StackFill";
import { BriansBrain } from "./life/BriansBrain";
import { ConwayLife } from "./life/ConwayLife";
import { DayAndNight } from "./life/DayAndNight";
import { HighLife } from "./life/HighLife";
import { LangtonsAnt } from "./life/LangtonsAnt";
import { MazeRule } from "./life/MazeRule";
import { Seeds } from "./life/Seeds";
import { AStar } from "./path/AStar";
import { BidirectionalBFS } from "./path/BidirectionalBFS";
import { BreadthFirstSearch } from "./path/BreadthFirstSearch";
import { DepthFirstSearch } from "./path/DepthFirstSearch";
import { Dijkstra } from "./path/Dijkstra";
import { GreedyBestFirst } from "./path/GreedyBestFirst";
import { RandomWalk } from "./path/RandomWalk";
import { WallFollower } from "./path/WallFollower";
import type {
    AlgorithmCategory,
    AlgorithmConstructor,
    AlgorithmsRegistry,
} from "./types";

const data: AlgorithmCategory[] = [
    {
        name: "Sort",
        id: "sort",
        items: [
            {
                id: "bubbleSort",
                meta: {
                    name: "Bubble",
                    description:
                        "Swaps neighbours that are out of order; each pass bubbles the largest value to the end. This version always runs every pass.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                },
                algorithm: {
                    Class: BubbleSort as AlgorithmConstructor,
                    instructions: BubbleSort.getInstructions(),
                },
            },
            {
                id: "selectionSort",
                meta: {
                    name: "Selection",
                    description:
                        "Finds the smallest remaining value and swaps it into place, one position at a time.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                },
                algorithm: {
                    Class: SelectionSort as AlgorithmConstructor,
                    instructions: SelectionSort.getInstructions(),
                },
            },
            {
                id: "mergeSort",
                meta: {
                    name: "Merge",
                    description:
                        "Splits the array in halves, sorts each, then merges them. Ties take the right-hand value, so equal items can swap order.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(n)",
                    stable: false,
                    inPlace: false,
                },
                algorithm: {
                    Class: MergeSort as AlgorithmConstructor,
                    instructions: MergeSort.getInstructions(),
                },
            },
            {
                id: "insertionSort",
                meta: {
                    name: "Insertion",
                    description:
                        "Takes each value and shifts larger ones right until it fits into the sorted prefix.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                },
                algorithm: {
                    Class: InsertionSort as AlgorithmConstructor,
                    instructions: InsertionSort.getInstructions(),
                },
            },
            {
                id: "shellSort",
                meta: {
                    name: "Shell",
                    description:
                        "Insertion sort over shrinking gaps (n/2, n/4, …, 1), so values travel far early on.",
                    timeComplexity: "O(n^1.5)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                },
                algorithm: {
                    Class: ShellSort as AlgorithmConstructor,
                    instructions: ShellSort.getInstructions(),
                },
            },
            {
                id: "quickSort",
                meta: {
                    name: "Quick",
                    description:
                        "Partitions around the last value as pivot, then sorts each side. Already sorted input is its worst case.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(log n)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: QuickSort as AlgorithmConstructor,
                    instructions: QuickSort.getInstructions(),
                },
            },
            {
                id: "heapSort",
                meta: {
                    name: "Heap",
                    description:
                        "Builds a max-heap and pops the largest item to the end.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: HeapSort as AlgorithmConstructor,
                    instructions: HeapSort.getInstructions(),
                },
            },
            {
                id: "cocktailShakerSort",
                meta: {
                    name: "Cocktail",
                    description:
                        "Bubble sort that sweeps in both directions and stops early once a pass makes no swaps.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: CocktailShakerSort as AlgorithmConstructor,
                    instructions: CocktailShakerSort.getInstructions(),
                },
            },
            {
                id: "combSort",
                meta: {
                    name: "Comb",
                    description:
                        "Bubble sort with a gap that shrinks by 1.3, so small values near the end move quickly.",
                    timeComplexity: "O(n²/2^p)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: CombSort as AlgorithmConstructor,
                    instructions: CombSort.getInstructions(),
                },
            },
            {
                id: "gnomeSort",
                meta: {
                    name: "Gnome",
                    description:
                        "Steps forward when in order, swaps and steps back when not.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: GnomeSort as AlgorithmConstructor,
                    instructions: GnomeSort.getInstructions(),
                },
            },
            {
                id: "oddEvenSort",
                meta: {
                    name: "Odd-Even",
                    description:
                        "Alternates comparing odd and even neighbour pairs until a full round makes no swaps.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: OddEvenSort as AlgorithmConstructor,
                    instructions: OddEvenSort.getInstructions(),
                },
            },
            {
                id: "pancakeSort",
                meta: {
                    name: "Pancake",
                    description:
                        "Flips prefixes to bring the largest remaining item to the end.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "classic",
                },
                algorithm: {
                    Class: PancakeSort as AlgorithmConstructor,
                    instructions: PancakeSort.getInstructions(),
                },
            },
            {
                id: "radixSort",
                meta: {
                    name: "Radix",
                    description:
                        "Distributes values into ten digit buckets, least significant digit first. Never compares two values.",
                    timeComplexity: "O(d·(n + b))",
                    bestCase: "O(d·(n + b))",
                    worstCase: "O(d·(n + b))",
                    auxiliarySpace: "O(n + b)",
                    stable: true,
                    inPlace: false,
                    group: "classic",
                },
                algorithm: {
                    Class: RadixSort as AlgorithmConstructor,
                    instructions: RadixSort.getInstructions(),
                },
            },
            {
                id: "bogoSort",
                meta: {
                    name: "Bogo",
                    description:
                        "Shuffles until sorted. Gives up after 25,000 steps.",
                    timeComplexity: "O(n·n!)",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: BogoSort as AlgorithmConstructor,
                    instructions: BogoSort.getInstructions(),
                },
            },
            {
                id: "bozoSort",
                meta: {
                    name: "Bozo",
                    description:
                        "Swaps two random items until sorted. Gives up after 25,000 steps.",
                    timeComplexity: "O(n!)",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: BozoSort as AlgorithmConstructor,
                    instructions: BozoSort.getInstructions(),
                },
            },
            {
                id: "stoogeSort",
                meta: {
                    name: "Stooge",
                    description:
                        "Sorts the first two thirds, the last two thirds, then the first two thirds again. Gives up after 160,000 steps.",
                    timeComplexity: "O(n^2.71)",
                    bestCase: "O(n^2.71)",
                    worstCase: "O(n^2.71)",
                    auxiliarySpace: "O(log n)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: StoogeSort as AlgorithmConstructor,
                    instructions: StoogeSort.getInstructions(),
                },
            },
            {
                id: "slowSort",
                meta: {
                    name: "Slow",
                    description:
                        "Multiply and surrender: deliberately the slowest recursion. Gives up after 25,000 steps.",
                    timeComplexity: "Ω(n^(log n/2))",
                    bestCase: "Ω(n^(log n/2))",
                    worstCase: "Ω(n^(log n/2))",
                    auxiliarySpace: "O(n)",
                    stable: false,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: SlowSort as AlgorithmConstructor,
                    instructions: SlowSort.getInstructions(),
                },
            },
            {
                id: "sleepSort",
                meta: {
                    name: "Sleep",
                    description:
                        "Every value sleeps for its own length; the first to wake goes next. Equal values wake in their original order.",
                    timeComplexity: "O(n + max)",
                    bestCase: "O(n + max)",
                    worstCase: "O(n + max)",
                    auxiliarySpace: "O(n)",
                    stable: true,
                    inPlace: false,
                    group: "fun",
                },
                algorithm: {
                    Class: SleepSort as AlgorithmConstructor,
                    instructions: SleepSort.getInstructions(),
                },
            },
            {
                id: "miracleSort",
                meta: {
                    name: "Miracle",
                    description:
                        "Checks five times whether the array is sorted, waiting for a miracle in between.",
                    timeComplexity: "Unbounded",
                    bestCase: "O(n)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    stable: true,
                    inPlace: true,
                    group: "fun",
                },
                algorithm: {
                    Class: MiracleSort as AlgorithmConstructor,
                    instructions: MiracleSort.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Path Finding",
        id: "path",
        items: [
            {
                id: "bfs",
                meta: {
                    name: "BFS",
                    description:
                        "Breadth-first search explores ring by ring from the start, so the first time it reaches the end it has the route with the fewest steps. It treats mud like any other cell.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    optimal: true,
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: BreadthFirstSearch as AlgorithmConstructor,
                    instructions: BreadthFirstSearch.getInstructions(),
                },
            },
            {
                id: "dijkstra",
                meta: {
                    name: "Dijkstra",
                    description:
                        "Always expands the cheapest cell found so far. Mud costs five times more, so the route it returns is the cheapest one, which is not always the shortest.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E log V)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    optimal: true,
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: Dijkstra as AlgorithmConstructor,
                    instructions: Dijkstra.getInstructions(),
                },
            },
            {
                id: "astar",
                meta: {
                    name: "A*",
                    description:
                        "Dijkstra with a sense of direction: it ranks cells by cost so far plus the Manhattan distance still to go. Same cheapest route, usually far fewer cells explored.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    optimal: true,
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: AStar as AlgorithmConstructor,
                    instructions: AStar.getInstructions(),
                },
            },
            {
                id: "greedy",
                meta: {
                    name: "Greedy",
                    description:
                        "Picks whichever open cell looks closest to the goal and ignores how far it has already walked. Very quick on open ground, easily led into dead ends.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    optimal: false,
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: GreedyBestFirst as AlgorithmConstructor,
                    instructions: GreedyBestFirst.getInstructions(),
                },
            },
            {
                id: "bidirectional",
                meta: {
                    name: "Bidirectional",
                    description:
                        "Two breadth-first searches, one from each end, take turns until they touch. The fewest-steps route, after exploring roughly half as much.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    optimal: true,
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: BidirectionalBFS as AlgorithmConstructor,
                    instructions: BidirectionalBFS.getInstructions(),
                },
            },
            {
                id: "dfs",
                meta: {
                    name: "DFS",
                    description:
                        "Depth-first search follows one corridor until it dead-ends, then backtracks. It finds a route if there is one, rarely a short one.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    optimal: false,
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: DepthFirstSearch as AlgorithmConstructor,
                    instructions: DepthFirstSearch.getInstructions(),
                },
            },
            {
                id: "randomWalk",
                meta: {
                    name: "Random walk",
                    description:
                        "Steps to a random neighbour again and again until it stumbles onto the end, or gives up after twice as many moves as there are cells.",
                    timeComplexity: "Unbounded",
                    bestCase: "O(path)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(V)",
                    optimal: false,
                    weighted: false,
                    group: "fun",
                },
                algorithm: {
                    Class: RandomWalk as AlgorithmConstructor,
                    instructions: RandomWalk.getInstructions(),
                },
            },
            {
                id: "wallFollower",
                meta: {
                    name: "Wall follower",
                    description:
                        "Keeps its left hand on the wall. Solves every maze whose walls all connect to the edge; circles forever around a free-standing wall, so it eventually gives up.",
                    timeComplexity: "O(V)",
                    bestCase: "O(path)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(V)",
                    optimal: false,
                    weighted: false,
                    group: "fun",
                },
                algorithm: {
                    Class: WallFollower as AlgorithmConstructor,
                    instructions: WallFollower.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Maze",
        id: "maze",
        items: [
            {
                id: "backtracker",
                meta: {
                    name: "Backtracker",
                    description:
                        "Walks into unvisited rooms and backs up at dead ends; the open stack glows. Long, winding corridors with few junctions.",
                    timeComplexity: "O(V)",
                    bestCase: "O(V)",
                    worstCase: "O(V)",
                    auxiliarySpace: "O(V)",
                    uniform: false,
                    longCorridors: true,
                    group: "classic",
                },
                algorithm: {
                    Class: RecursiveBacktracker as AlgorithmConstructor,
                    instructions: RecursiveBacktracker.getInstructions(),
                },
            },
            {
                id: "prim",
                meta: {
                    name: "Prim",
                    description:
                        "Grows from one room by adding a random frontier room each time. Lots of short dead ends, a branching coral texture.",
                    timeComplexity: "O(V log V)",
                    bestCase: "O(V)",
                    worstCase: "O(V log V)",
                    auxiliarySpace: "O(V)",
                    uniform: false,
                    longCorridors: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Prim as AlgorithmConstructor,
                    instructions: Prim.getInstructions(),
                },
            },
            {
                id: "kruskal",
                meta: {
                    name: "Kruskal",
                    description:
                        "Starts with every room as its own island and knocks down walls in random order whenever they separate two islands (union-find).",
                    timeComplexity: "O(V α(V))",
                    bestCase: "O(V)",
                    worstCase: "O(V α(V))",
                    auxiliarySpace: "O(V)",
                    uniform: false,
                    longCorridors: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Kruskal as AlgorithmConstructor,
                    instructions: Kruskal.getInstructions(),
                },
            },
            {
                id: "wilson",
                meta: {
                    name: "Wilson",
                    description:
                        "Random walks from a new room until they reach the maze, erasing every loop on the way. Slow to start, but every maze is equally likely.",
                    timeComplexity: "O(V)",
                    bestCase: "O(V)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(V)",
                    uniform: true,
                    longCorridors: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Wilson as AlgorithmConstructor,
                    instructions: Wilson.getInstructions(),
                },
            },
            {
                id: "huntKill",
                meta: {
                    name: "Hunt and kill",
                    description:
                        "Like the backtracker, but at a dead end it scans row by row for an unvisited room next to the maze and continues from there.",
                    timeComplexity: "O(V²)",
                    bestCase: "O(V)",
                    worstCase: "O(V²)",
                    auxiliarySpace: "O(1)",
                    uniform: false,
                    longCorridors: true,
                    group: "classic",
                },
                algorithm: {
                    Class: HuntAndKill as AlgorithmConstructor,
                    instructions: HuntAndKill.getInstructions(),
                },
            },
            {
                id: "sidewinder",
                meta: {
                    name: "Sidewinder",
                    description:
                        "Works row by row: runs of rooms going east, each run closed by one opening north. The top row is always one long corridor.",
                    timeComplexity: "O(V)",
                    bestCase: "O(V)",
                    worstCase: "O(V)",
                    auxiliarySpace: "O(row)",
                    uniform: false,
                    longCorridors: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Sidewinder as AlgorithmConstructor,
                    instructions: Sidewinder.getInstructions(),
                },
            },
            {
                id: "binaryTree",
                meta: {
                    name: "Binary tree",
                    description:
                        "Each room opens north or east on a coin flip. The simplest maze there is, with two open edges and a clear diagonal bias.",
                    timeComplexity: "O(V)",
                    bestCase: "O(V)",
                    worstCase: "O(V)",
                    auxiliarySpace: "O(1)",
                    uniform: false,
                    longCorridors: false,
                    group: "classic",
                },
                algorithm: {
                    Class: BinaryTree as AlgorithmConstructor,
                    instructions: BinaryTree.getInstructions(),
                },
            },
            {
                id: "aldousBroder",
                meta: {
                    name: "Aldous-Broder",
                    description:
                        "A random walk that carves whenever it reaches a new room. Perfectly fair and painfully slow to find the last few rooms.",
                    timeComplexity: "O(V log V)",
                    bestCase: "O(V)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    uniform: true,
                    longCorridors: false,
                    group: "fun",
                },
                algorithm: {
                    Class: AldousBroder as AlgorithmConstructor,
                    instructions: AldousBroder.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Dynamic programming",
        id: "dp",
        items: [
            {
                id: "editDistance",
                meta: {
                    name: "Edit distance",
                    description:
                        "Fewest single-letter inserts, deletes and substitutions that turn one word into the other (Levenshtein). Each cell is the best edit of two prefixes.",
                    timeComplexity: "O(m·n)",
                    bestCase: "O(m·n)",
                    worstCase: "O(m·n)",
                    auxiliarySpace: "O(m·n)",
                    tableDims: 2,
                    group: "classic",
                },
                algorithm: {
                    Class: EditDistance as AlgorithmConstructor,
                    instructions: EditDistance.getInstructions(),
                },
            },
            {
                id: "lcs",
                meta: {
                    name: "LCS",
                    description:
                        "Longest sequence of letters both words share in order, gaps allowed. A match extends the diagonal; otherwise the cell keeps the better neighbour.",
                    timeComplexity: "O(m·n)",
                    bestCase: "O(m·n)",
                    worstCase: "O(m·n)",
                    auxiliarySpace: "O(m·n)",
                    tableDims: 2,
                    group: "classic",
                },
                algorithm: {
                    Class: LongestCommonSubsequence as AlgorithmConstructor,
                    instructions: LongestCommonSubsequence.getInstructions(),
                },
            },
            {
                id: "knapsack",
                meta: {
                    name: "Knapsack",
                    description:
                        "Best total value that fits in a weight limit, each item taken at most once. Every cell decides one item: skip it, or take it and look up the rest.",
                    timeComplexity: "O(n·W)",
                    bestCase: "O(n·W)",
                    worstCase: "O(n·W)",
                    auxiliarySpace: "O(n·W)",
                    tableDims: 2,
                    group: "classic",
                },
                algorithm: {
                    Class: Knapsack as AlgorithmConstructor,
                    instructions: Knapsack.getInstructions(),
                },
            },
            {
                id: "coinChange",
                meta: {
                    name: "Coin change",
                    description:
                        "Fewest coins adding up to an amount, coins reusable. Greedy gets sets like {1, 3, 4} for 6 wrong; the table does not.",
                    timeComplexity: "O(c·A)",
                    bestCase: "O(c·A)",
                    worstCase: "O(c·A)",
                    auxiliarySpace: "O(c·A)",
                    tableDims: 2,
                    group: "classic",
                },
                algorithm: {
                    Class: CoinChange as AlgorithmConstructor,
                    instructions: CoinChange.getInstructions(),
                },
            },
            {
                id: "lis",
                meta: {
                    name: "LIS",
                    description:
                        "Longest strictly rising run you can pick from a sequence, keeping order. Each cell looks back at every smaller value before it.",
                    timeComplexity: "O(n²)",
                    bestCase: "O(n²)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(n)",
                    tableDims: 1,
                    group: "classic",
                },
                algorithm: {
                    Class: LongestIncreasingSubsequence as AlgorithmConstructor,
                    instructions:
                        LongestIncreasingSubsequence.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Life",
        id: "life",
        items: [
            {
                id: "conwayLife",
                meta: {
                    name: "Game of Life",
                    description:
                        "Conway's rule: a cell with two or three live neighbours survives, and an empty cell with exactly three comes alive. Gliders, blinkers and still lifes come out of noise.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B3/S23",
                    explosive: false,
                    group: "classic",
                },
                algorithm: {
                    Class: ConwayLife as AlgorithmConstructor,
                    instructions: ConwayLife.getInstructions(),
                },
            },
            {
                id: "highLife",
                meta: {
                    name: "HighLife",
                    description:
                        "Life plus one extra birth rule (six neighbours). That small change makes a pattern that copies itself.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B36/S23",
                    explosive: false,
                    group: "classic",
                },
                algorithm: {
                    Class: HighLife as AlgorithmConstructor,
                    instructions: HighLife.getInstructions(),
                },
            },
            {
                id: "dayAndNight",
                meta: {
                    name: "Day & Night",
                    description:
                        "Swapping live and dead cells gives the same rule, so dark islands behave exactly like light ones.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B3678/S34678",
                    explosive: false,
                    group: "classic",
                },
                algorithm: {
                    Class: DayAndNight as AlgorithmConstructor,
                    instructions: DayAndNight.getInstructions(),
                },
            },
            {
                id: "mazeRule",
                meta: {
                    name: "Maze",
                    description:
                        "Cells almost never die, so growth leaves narrow corridors behind and the grid ends up as a maze.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B3/S12345",
                    explosive: true,
                    group: "classic",
                },
                algorithm: {
                    Class: MazeRule as AlgorithmConstructor,
                    instructions: MazeRule.getInstructions(),
                },
            },
            {
                id: "seeds",
                meta: {
                    name: "Seeds",
                    description:
                        "Every live cell dies at once, and an empty cell with two live neighbours is born. Almost any start explodes into noise.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B2/S",
                    explosive: true,
                    group: "classic",
                },
                algorithm: {
                    Class: Seeds as AlgorithmConstructor,
                    instructions: Seeds.getInstructions(),
                },
            },
            {
                id: "briansBrain",
                meta: {
                    name: "Brian's Brain",
                    description:
                        "Three states: on, then dying, then off. An off cell turns on with exactly two on neighbours, and dying cells block rebirth, so everything moves.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "B2/S/3",
                    explosive: true,
                    group: "classic",
                },
                algorithm: {
                    Class: BriansBrain as AlgorithmConstructor,
                    instructions: BriansBrain.getInstructions(),
                },
            },
            {
                id: "langtonsAnt",
                meta: {
                    name: "Langton's ant",
                    description:
                        "One ant: on a dead cell turn right, on a live one turn left, flip the cell and step forward. It wanders chaotically, then suddenly builds a straight highway.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    rule: "ant RL",
                    group: "fun",
                },
                algorithm: {
                    Class: LangtonsAnt as AlgorithmConstructor,
                    instructions: LangtonsAnt.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Fill",
        id: "fill",
        items: [
            {
                id: "queueFill",
                meta: {
                    name: "Queue fill",
                    description:
                        "Flood fill with a queue. Paint spreads in rings from the start (a diamond, since it moves four ways), and the queue only ever holds the wavefront.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    connectivity: 4,
                    spans: false,
                    group: "classic",
                },
                algorithm: {
                    Class: QueueFill as AlgorithmConstructor,
                    instructions: QueueFill.getInstructions(),
                },
            },
            {
                id: "stackFill",
                meta: {
                    name: "Stack fill",
                    description:
                        "The same fill with a stack, which is what a recursive fill does. Paint snakes off in one direction first, and the stack can grow huge, which is why recursive fills crash on big images.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    connectivity: 4,
                    spans: false,
                    group: "classic",
                },
                algorithm: {
                    Class: StackFill as AlgorithmConstructor,
                    instructions: StackFill.getInstructions(),
                },
            },
            {
                id: "scanlineFill",
                meta: {
                    name: "Scanline",
                    description:
                        "Paints whole horizontal runs at once and pushes only one seed per run above and below. Far fewer pushes and a tiny stack: the way paint programs do it.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(h)",
                    connectivity: 4,
                    spans: true,
                    group: "classic",
                },
                algorithm: {
                    Class: ScanlineFill as AlgorithmConstructor,
                    instructions: ScanlineFill.getInstructions(),
                },
            },
            {
                id: "eightWayFill",
                meta: {
                    name: "8-way fill",
                    description:
                        "A queue fill that also steps diagonally. It spreads as a square instead of a diamond, and slips through diagonal gaps between walls into regions a 4-way fill never reaches.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    connectivity: 8,
                    spans: false,
                    group: "classic",
                },
                algorithm: {
                    Class: EightWayFill as AlgorithmConstructor,
                    instructions: EightWayFill.getInstructions(),
                },
            },
            {
                id: "componentLabeling",
                meta: {
                    name: "Labelling",
                    description:
                        "Two-pass connected-component labelling. It scans row by row, takes each cell's label from its left or upper neighbour, and records which labels touch. A second pass merges them, so every region gets its own colour.",
                    timeComplexity: "O(n·α(n))",
                    bestCase: "O(n)",
                    worstCase: "O(n·α(n))",
                    auxiliarySpace: "O(n)",
                    connectivity: 4,
                    spans: false,
                    group: "classic",
                },
                algorithm: {
                    Class: ComponentLabeling as AlgorithmConstructor,
                    instructions: ComponentLabeling.getInstructions(),
                },
            },
            {
                id: "randomFill",
                meta: {
                    name: "Mould fill",
                    description:
                        "Paints a random cell from the frontier each time. It fills exactly the same region, because order doesn't matter, but it grows like mould instead of a wave.",
                    timeComplexity: "O(n)",
                    bestCase: "O(n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    connectivity: 4,
                    spans: false,
                    group: "fun",
                },
                algorithm: {
                    Class: RandomFill as AlgorithmConstructor,
                    instructions: RandomFill.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Geometry",
        id: "geometry",
        items: [
            {
                id: "grahamScan",
                meta: {
                    name: "Graham scan",
                    description:
                        "Sorts the points by angle around the lowest one, then walks them with a stack, popping every point that makes a right turn.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(n)",
                    outputSensitive: false,
                    sortsFirst: true,
                    group: "classic",
                },
                algorithm: {
                    Class: GrahamScan as AlgorithmConstructor,
                    instructions: GrahamScan.getInstructions(),
                },
            },
            {
                id: "monotoneChain",
                meta: {
                    name: "Monotone chain",
                    description:
                        "Andrew's algorithm sorts the points by x, then builds the lower hull left to right and the upper hull right to left with the same right-turn rule.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n log n)",
                    worstCase: "O(n log n)",
                    auxiliarySpace: "O(n)",
                    outputSensitive: false,
                    sortsFirst: true,
                    group: "classic",
                },
                algorithm: {
                    Class: MonotoneChain as AlgorithmConstructor,
                    instructions: MonotoneChain.getInstructions(),
                },
            },
            {
                id: "quickhull",
                meta: {
                    name: "Quickhull",
                    description:
                        "Splits the points by the line between the extremes. On each side it takes the farthest point, drops the triangle, and recurses on the two new edges. Quicksort's geometric cousin.",
                    timeComplexity: "O(n log n)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(n)",
                    outputSensitive: false,
                    sortsFirst: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Quickhull as AlgorithmConstructor,
                    instructions: Quickhull.getInstructions(),
                },
            },
            {
                id: "jarvisMarch",
                meta: {
                    name: "Jarvis march",
                    description:
                        "Gift wrapping: from the leftmost point, find the point that has every other point on its left, then repeat from there. It costs O(n·h), so it is fast on small hulls and slow on a ring.",
                    timeComplexity: "O(n·h)",
                    bestCase: "O(n)",
                    worstCase: "O(n²)",
                    auxiliarySpace: "O(1)",
                    outputSensitive: true,
                    sortsFirst: false,
                    group: "classic",
                },
                algorithm: {
                    Class: JarvisMarch as AlgorithmConstructor,
                    instructions: JarvisMarch.getInstructions(),
                },
            },
            {
                id: "bruteForceHull",
                meta: {
                    name: "Brute force",
                    description:
                        "Checks every ordered pair: if all the other points lie on its left, it is a hull edge. Simple and O(n³), so watch the test counter.",
                    timeComplexity: "O(n³)",
                    bestCase: "O(n³)",
                    worstCase: "O(n³)",
                    auxiliarySpace: "O(1)",
                    outputSensitive: false,
                    sortsFirst: false,
                    group: "fun",
                },
                algorithm: {
                    Class: BruteForceHull as AlgorithmConstructor,
                    instructions: BruteForceHull.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Trees",
        id: "tree",
        items: [
            {
                id: "avl",
                meta: {
                    name: "AVL",
                    description:
                        "After every insert it walks back up and rotates wherever the two subtrees' heights differ by more than one. The badges show each node's balance. Height stays under 1.44 log n.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(log n)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(n)",
                    balanced: true,
                    rotates: true,
                    group: "classic",
                },
                algorithm: {
                    Class: AvlTree as AlgorithmConstructor,
                    instructions: AvlTree.getInstructions(),
                },
            },
            {
                id: "redBlack",
                meta: {
                    name: "Red-black",
                    description:
                        "New nodes are red, a red node never has a red child, and every path has the same number of black nodes. A red uncle means recolouring; otherwise at most two rotations fix it.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(log n)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(n)",
                    balanced: true,
                    rotates: true,
                    group: "classic",
                },
                algorithm: {
                    Class: RedBlackTree as AlgorithmConstructor,
                    instructions: RedBlackTree.getInstructions(),
                },
            },
            {
                id: "bst",
                meta: {
                    name: "BST",
                    description:
                        "A plain binary search tree: smaller keys go left, larger go right, and each new key hangs as a leaf. Bushy on random keys, but a linked list on sorted ones.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(log n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    balanced: false,
                    rotates: false,
                    group: "classic",
                },
                algorithm: {
                    Class: BinarySearchTree as AlgorithmConstructor,
                    instructions: BinarySearchTree.getInstructions(),
                },
            },
            {
                id: "splay",
                meta: {
                    name: "Splay",
                    description:
                        "Rotates every inserted key all the way to the root. It has no balance rule, yet costs O(log n) amortised, and recently used keys stay near the top.",
                    timeComplexity: "O(log n)*",
                    bestCase: "O(1)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    balanced: false,
                    rotates: true,
                    group: "classic",
                },
                algorithm: {
                    Class: SplayTree as AlgorithmConstructor,
                    instructions: SplayTree.getInstructions(),
                },
            },
            {
                id: "treap",
                meta: {
                    name: "Treap",
                    description:
                        "A search tree on keys and a heap on random priorities at the same time. Rotating by priority gives the shape of a random BST, whatever the insert order. The badges show priorities.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(log n)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(n)",
                    balanced: false,
                    rotates: true,
                    group: "classic",
                },
                algorithm: {
                    Class: Treap as AlgorithmConstructor,
                    instructions: Treap.getInstructions(),
                },
            },
            {
                id: "binaryHeap",
                meta: {
                    name: "Binary heap",
                    description:
                        "A min-heap stored in an array and drawn as the complete tree it encodes. New keys swap upward while smaller than their parent. It always stays perfectly shaped, but only the root is ordered.",
                    timeComplexity: "O(1)",
                    bestCase: "O(1)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(n)",
                    balanced: true,
                    rotates: false,
                    group: "classic",
                },
                algorithm: {
                    Class: BinaryHeap as AlgorithmConstructor,
                    instructions: BinaryHeap.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Graphs",
        id: "graph",
        items: [
            {
                id: "kruskalMst",
                meta: {
                    name: "Kruskal",
                    description:
                        "Sorts every edge by weight and keeps the ones that join two separate pieces. Union-find tells in almost constant time whether two nodes are already connected.",
                    timeComplexity: "O(E log E)",
                    bestCase: "O(E log E)",
                    worstCase: "O(E log E)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "mst",
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: KruskalMst as AlgorithmConstructor,
                    instructions: KruskalMst.getInstructions(),
                },
            },
            {
                id: "primMst",
                meta: {
                    name: "Prim",
                    description:
                        "Grows a single tree from A, always adding the cheapest edge that reaches a new node. Each waiting node shows the cheapest link found so far.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E log V)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "mst",
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: PrimMst as AlgorithmConstructor,
                    instructions: PrimMst.getInstructions(),
                },
            },
            {
                id: "boruvka",
                meta: {
                    name: "Borůvka",
                    description:
                        "In every round each piece picks its cheapest outgoing edge, and all of them are added at once. The oldest MST algorithm (1926), and easy to run in parallel.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "mst",
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: Boruvka as AlgorithmConstructor,
                    instructions: Boruvka.getInstructions(),
                },
            },
            {
                id: "graphDijkstra",
                meta: {
                    name: "Dijkstra",
                    description:
                        "Settles nodes in order of distance from A and relaxes their edges. The labels are the best distances known so far, and the teal edges form the shortest-path tree.",
                    timeComplexity: "O(E log V)",
                    bestCase: "O(E log V)",
                    worstCase: "O(E log V)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "shortest",
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: GraphDijkstra as AlgorithmConstructor,
                    instructions: GraphDijkstra.getInstructions(),
                },
            },
            {
                id: "bellmanFord",
                meta: {
                    name: "Bellman-Ford",
                    description:
                        "Relaxes every edge in rounds until nothing improves. It needs no priority queue and handles negative weights, at the cost of many more checks.",
                    timeComplexity: "O(V·E)",
                    bestCase: "O(E)",
                    worstCase: "O(V·E)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "shortest",
                    weighted: true,
                    group: "classic",
                },
                algorithm: {
                    Class: BellmanFord as AlgorithmConstructor,
                    instructions: BellmanFord.getInstructions(),
                },
            },
            {
                id: "graphBfs",
                meta: {
                    name: "BFS",
                    description:
                        "Visits the graph ring by ring from A and ignores weights. The labels count hops, and its tree uses the fewest edges, not the least weight.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "order",
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: GraphBfs as AlgorithmConstructor,
                    instructions: GraphBfs.getInstructions(),
                },
            },
            {
                id: "graphDfs",
                meta: {
                    name: "DFS",
                    description:
                        "Goes as deep as it can, then backs up. The labels are discovery order, and nodes on the current path stay lit until the search returns.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "order",
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: GraphDfs as AlgorithmConstructor,
                    instructions: GraphDfs.getInstructions(),
                },
            },
            {
                id: "topologicalSort",
                meta: {
                    name: "Topological sort",
                    description:
                        "Kahn's algorithm with every edge pointing right. A node goes out once nothing points into it, and its outgoing edges are then removed.",
                    timeComplexity: "O(V + E)",
                    bestCase: "O(V + E)",
                    worstCase: "O(V + E)",
                    auxiliarySpace: "O(V)",
                    graphGoal: "order",
                    weighted: false,
                    group: "classic",
                },
                algorithm: {
                    Class: TopologicalSort as AlgorithmConstructor,
                    instructions: TopologicalSort.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Strings",
        id: "strings",
        items: [
            {
                id: "kmp",
                meta: {
                    name: "KMP",
                    description:
                        "Knuth-Morris-Pratt never re-reads the text. On a mismatch the prefix table says how much of the pattern already matches, so the text index only moves forward.",
                    timeComplexity: "O(n + m)",
                    bestCase: "O(n)",
                    worstCase: "O(n + m)",
                    auxiliarySpace: "O(m)",
                    preprocesses: true,
                    linearWorst: true,
                    group: "classic",
                },
                algorithm: {
                    Class: KnuthMorrisPratt as AlgorithmConstructor,
                    instructions: KnuthMorrisPratt.getInstructions(),
                },
            },
            {
                id: "horspool",
                meta: {
                    name: "Horspool",
                    description:
                        "Boyer-Moore-Horspool compares from the end of the pattern and jumps ahead by how far the text's last letter sits from the pattern's end. Long jumps on natural text.",
                    timeComplexity: "O(n / m)",
                    bestCase: "O(n / m)",
                    worstCase: "O(n·m)",
                    auxiliarySpace: "O(σ)",
                    preprocesses: true,
                    linearWorst: false,
                    group: "classic",
                },
                algorithm: {
                    Class: Horspool as AlgorithmConstructor,
                    instructions: Horspool.getInstructions(),
                },
            },
            {
                id: "rabinKarp",
                meta: {
                    name: "Rabin-Karp",
                    description:
                        "Rolls a hash over every window of the text and checks letters only when it equals the pattern's hash. A tiny modulus here makes false alarms visible.",
                    timeComplexity: "O(n + m)",
                    bestCase: "O(n + m)",
                    worstCase: "O(n·m)",
                    auxiliarySpace: "O(1)",
                    preprocesses: true,
                    linearWorst: false,
                    group: "classic",
                },
                algorithm: {
                    Class: RabinKarp as AlgorithmConstructor,
                    instructions: RabinKarp.getInstructions(),
                },
            },
            {
                id: "zAlgorithm",
                meta: {
                    name: "Z-algorithm",
                    description:
                        "Computes, for every text position, how many letters match the start of the pattern. A box of letters already matched lets most positions skip work.",
                    timeComplexity: "O(n + m)",
                    bestCase: "O(n + m)",
                    worstCase: "O(n + m)",
                    auxiliarySpace: "O(n + m)",
                    preprocesses: true,
                    linearWorst: true,
                    group: "classic",
                },
                algorithm: {
                    Class: ZAlgorithm as AlgorithmConstructor,
                    instructions: ZAlgorithm.getInstructions(),
                },
            },
            {
                id: "naiveMatch",
                meta: {
                    name: "Naive",
                    description:
                        "Tries every alignment and compares left to right until a mismatch. Fine on everyday text, quadratic on a text like aaaa…ab.",
                    timeComplexity: "O(n·m)",
                    bestCase: "O(n)",
                    worstCase: "O(n·m)",
                    auxiliarySpace: "O(1)",
                    preprocesses: false,
                    linearWorst: false,
                    group: "classic",
                },
                algorithm: {
                    Class: NaiveMatch as AlgorithmConstructor,
                    instructions: NaiveMatch.getInstructions(),
                },
            },
        ],
    },
    {
        name: "Find",
        id: "find",
        items: [
            {
                id: "binarySearch",
                meta: {
                    name: "Binary",
                    description:
                        "Looks at the middle element and throws away the half that cannot contain the target. Halving each time, it needs about log₂ n looks.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(1)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: true,
                    randomAccess: true,
                    group: "classic",
                },
                algorithm: {
                    Class: BinarySearch as AlgorithmConstructor,
                    instructions: BinarySearch.getInstructions(),
                },
            },
            {
                id: "interpolationSearch",
                meta: {
                    name: "Interpolation",
                    description:
                        "Guesses where the target should be from its value, like opening a dictionary near the right letter. Nearly instant on evenly spread values, slow on skewed ones.",
                    timeComplexity: "O(log log n)",
                    bestCase: "O(1)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: true,
                    randomAccess: true,
                    group: "classic",
                },
                algorithm: {
                    Class: InterpolationSearch as AlgorithmConstructor,
                    instructions: InterpolationSearch.getInstructions(),
                },
            },
            {
                id: "exponentialSearch",
                meta: {
                    name: "Exponential",
                    description:
                        "Checks positions 1, 2, 4, 8… until it passes the target, then runs a binary search on the last stretch. Strong when the target sits near the front.",
                    timeComplexity: "O(log i)",
                    bestCase: "O(1)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: true,
                    randomAccess: true,
                    group: "classic",
                },
                algorithm: {
                    Class: ExponentialSearch as AlgorithmConstructor,
                    instructions: ExponentialSearch.getInstructions(),
                },
            },
            {
                id: "jumpSearch",
                meta: {
                    name: "Jump",
                    description:
                        "Hops ahead √n elements at a time until it overshoots, then walks back through that one block.",
                    timeComplexity: "O(√n)",
                    bestCase: "O(1)",
                    worstCase: "O(√n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: true,
                    randomAccess: true,
                    group: "classic",
                },
                algorithm: {
                    Class: JumpSearch as AlgorithmConstructor,
                    instructions: JumpSearch.getInstructions(),
                },
            },
            {
                id: "ternarySearch",
                meta: {
                    name: "Ternary",
                    description:
                        "Probes two points per round and keeps one third. It cuts deeper than binary search per round but spends more looks in total.",
                    timeComplexity: "O(log n)",
                    bestCase: "O(1)",
                    worstCase: "O(log n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: true,
                    randomAccess: true,
                    group: "classic",
                },
                algorithm: {
                    Class: TernarySearch as AlgorithmConstructor,
                    instructions: TernarySearch.getInstructions(),
                },
            },
            {
                id: "linearSearch",
                meta: {
                    name: "Linear",
                    description:
                        "Checks every element from the start. The only one here that works on unsorted data, and the slowest on long arrays.",
                    timeComplexity: "O(n)",
                    bestCase: "O(1)",
                    worstCase: "O(n)",
                    auxiliarySpace: "O(1)",
                    needsSorted: false,
                    randomAccess: false,
                    group: "classic",
                },
                algorithm: {
                    Class: LinearSearch as AlgorithmConstructor,
                    instructions: LinearSearch.getInstructions(),
                },
            },
            {
                id: "randomGuess",
                meta: {
                    name: "Random guess",
                    description:
                        "Points at random positions until one holds the target. It cannot tell when the value is missing, so it gives up after 3n tries.",
                    timeComplexity: "O(n)",
                    bestCase: "O(1)",
                    worstCase: "Unbounded",
                    auxiliarySpace: "O(1)",
                    needsSorted: false,
                    randomAccess: true,
                    group: "fun",
                },
                algorithm: {
                    Class: RandomGuess as AlgorithmConstructor,
                    instructions: RandomGuess.getInstructions(),
                },
            },
        ],
    },
];

export const registry: AlgorithmsRegistry = {
    data,
    categoriesLog: data.map((item) => item.id),
};
