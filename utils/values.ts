export function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

/** Type guard for a string union declared as an `as const` array. */
export function isOneOf<T extends string>(
    list: readonly T[],
    value: unknown
): value is T {
    return (
        typeof value === "string" && (list as readonly string[]).includes(value)
    );
}
