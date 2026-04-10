import type * as React from "react";

declare module "react" {
	function createContext<T = any>(defaultValue?: T): React.Context<T>;
	function useRef<T = any>(initialValue?: T): React.MutableRefObject<T>;
}
