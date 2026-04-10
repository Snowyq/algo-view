import { configureStore } from "@reduxjs/toolkit";

import playReducer from "./features/play/playSlice";

const store = configureStore({
	reducer: {
		play: playReducer,
	},
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({
			serializableCheck: false, // <-- disable the serializability check
		}),
	devTools: true,
});

export default store;
