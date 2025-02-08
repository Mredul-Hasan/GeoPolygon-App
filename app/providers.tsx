"use client"

import { Provider } from "react-redux"
import { store } from "../lib/store"
import type React from "react" // Added import for React

export function Providers({ children }: { children: React.ReactNode }) {
  return <Provider store={store}>{children}</Provider>
}

