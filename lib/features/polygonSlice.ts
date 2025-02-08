import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import { polygon, type LatLngTuple } from "leaflet"
import type { Feature, FeatureCollection, Polygon as GeoJSONPolygon } from "geojson"
import { v4 as uuidv4 } from "uuid"

export interface Polygon {
  id: string
  coordinates: LatLngTuple[]
  fillColor: string
  borderColor: string
  label: string
  geoJSON?: Feature<GeoJSONPolygon>
}

interface PolygonState {
  polygons: Polygon[],
  selectedPolygonIndex: number
}

const initialState: PolygonState = {
  polygons: [],
  selectedPolygonIndex: -1
}

const generateRandomColor = () => {
  return "#" + Math.floor(Math.random() * 16777215).toString(16)
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
    reshapePolygon: (state, action: PayloadAction<string>) => {
      state.polygons = state.polygons.splice((state.polygons.filter((p) => p.id == action.payload), 1))
    },
    updatePolygonLabel: (state, action: PayloadAction<{ id: string; label: string }>) => {
      const index = state.polygons.findIndex((p) => p.id === action.payload.id)
      if (index !== -1) {
        state.polygons[index].label = action.payload.label
      }
    },
    importPolygons: (state, action: PayloadAction<FeatureCollection>) => {
      const newPolygons = action.payload.features
        .filter((feature): feature is Feature<GeoJSONPolygon> => feature.geometry.type === "Polygon")
        .map((feature) => ({
          id: feature.id?.toString() || uuidv4(),
          coordinates: feature.geometry.coordinates[0].map((coord) => [coord[1], coord[0]] as LatLngTuple),
          fillColor: generateRandomColor(),
          borderColor: generateRandomColor(),
          label: feature.properties?.name || `Uploaded GeoJSON ${state.polygons.length + 1}`,
          properties: feature.properties || {},
        }))
      state.polygons = [...state.polygons, ...newPolygons]
    },
  },
})

export const { addPolygon, updatePolygon, deletePolygon, reshapePolygon, importPolygons, updatePolygonLabel } =
  polygonSlice.actions

export default polygonSlice.reducer

