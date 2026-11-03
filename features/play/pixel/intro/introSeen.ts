/* The playground intro plays once per session. */

const SEEN_KEY = "algo-view:intro-seen";

export function introSeen(): boolean {
    try {
        return window.sessionStorage.getItem(SEEN_KEY) === "1";
    } catch {
        return false;
    }
}

export function markIntroSeen(): void {
    try {
        window.sessionStorage.setItem(SEEN_KEY, "1");
    } catch {
        // storage blocked: the intro just plays again
    }
}
