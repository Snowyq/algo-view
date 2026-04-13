import { configureStore } from "@reduxjs/toolkit";

import playReducer from "./features/play/playSlice";

const store = configureStore({
    reducer: {
        play: playReducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: false, // <-- disable the serializability check
        }),
    devTools: true,
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
