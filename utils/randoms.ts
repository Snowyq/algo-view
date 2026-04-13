export function generateRandomArray(
    n: number,
    min: number,
    max: number
): number[] {
    return Array.from({ length: n }, () =>
        Math.floor(Math.random() * (max - min) + min)
    );
}
