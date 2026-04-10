import { createContext } from "react";

export const PlayContext = createContext({
	activeCategory: "sort",
});

export const StepContext = createContext({
	onStepUpdate: () => {},
	showMetrics: false,
});
