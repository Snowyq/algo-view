type SortStep = {
    type: "check" | "swap" | "markSorted"
    operations: number[]
    indices: number[]
}

class BubbleSort extends Algorithm {
