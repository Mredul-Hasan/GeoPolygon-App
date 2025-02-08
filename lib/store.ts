import { configureStore } from "@reduxjs/toolkit"
import polygonReducer from "./features/polygonSlice"

export const store = configureStore({
  reducer: {
    polygon: polygonReducer,
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

