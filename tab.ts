function createTabId() {
    if (
        typeof crypto !== "undefined" &&
        typeof crypto.randomUUID === "function"
    ) {
        return `tab-${crypto.randomUUID()}`;
    }

    const fallback = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return `tab-${fallback}`;
}

export const tabId = createTabId();
