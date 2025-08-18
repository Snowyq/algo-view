import { configureStore } from "@reduxjs/toolkit";

import playReducer from "./features/play/playSlice.js";

const store = configureStore({
	reducer: {
		play: playReducer,
	},
});

export default store;
