// randomUUID only exists in secure contexts, so keep a fallback.
function createTabId(): string {
    const id =
        typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `tab-${id}`;
}

export const tabId: string = createTabId();
