"use client"

import type React from "react"
import { useEffect } from "react"
import { useMap } from "react-leaflet"
import { type LatLngTuple, latLngBounds } from "leaflet"
import L from "leaflet"

interface FitBoundsProps {
  polygons: L.LatLngTuple[][]
}

// This component will fit the map bounds to show all polygons
const FitBounds: React.FC<{ polygons: LatLngTuple[][] }> = ({ polygons }) => {
  const map = useMap()

  useEffect(() => {
    if (polygons.length > 0) {
      const bounds = L.latLngBounds(polygons.flat())
      map.fitBounds(bounds)
    }
  }, [map, polygons])

  return null
}

export default FitBounds

