import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { LatLngTuple } from "leaflet"

export interface Polygon {
  id: string
  coordinates: LatLngTuple[]
  fillColor: string
  borderColor: string
  label: string
}

interface PolygonState {
  polygons: Polygon[]
}

const initialState: PolygonState = {
  polygons: [],
}

export const polygonSlice = createSlice({
  name: "polygon",
  initialState,
  reducers: {
    addPolygon: (state, action: PayloadAction<Polygon>) => {
      state.polygons.push(action.payload)
    },
    updatePolygon: (state, action: PayloadAction<Polygon>) => {
      const index = state.polygons.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.polygons[index] = action.payload
      }
    },
    deletePolygon: (state, action: PayloadAction<string>) => {
      state.polygons = state.polygons.filter((p) => p.id !== action.payload)
    },
    importPolygons: (state, action: PayloadAction<Polygon[]>) => {
      state.polygons = action.payload
    },
    updatePolygonLabel: (state, action: PayloadAction<{ id: string; label: string }>) => {
      const index = state.polygons.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.polygons[index].label = action.payload.label
      }
    },
  },
})

export const { addPolygon, updatePolygon, deletePolygon, importPolygons, updatePolygonLabel } = polygonSlice.actions

export default polygonSlice.reducer

