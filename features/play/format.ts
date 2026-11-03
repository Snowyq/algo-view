const numberFormat = new Intl.NumberFormat("en-US");
const compactFormat = new Intl.NumberFormat("en-US", { notation: "compact" });

/** 4253 -> "4,253" */
export function formatNumber(value: number): string {
    return numberFormat.format(value);
}

/** 4253 -> "4.3K" */
export function formatCompact(value: number): string {
    return compactFormat.format(value);
}
