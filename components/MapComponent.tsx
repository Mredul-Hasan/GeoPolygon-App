"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { MapContainer, TileLayer, FeatureGroup, Polygon, Marker, Tooltip, useMap } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { useDispatch, useSelector } from "react-redux"
import { addPolygon, updatePolygon } from "../lib/features/polygonSlice"
import type { RootState } from "../lib/store"
import { type LatLngTuple, latLngBounds } from "leaflet"
import { v4 as uuidv4 } from "uuid"
import L from "leaflet"

// Utility function to check if two polygons intersect
const doPolygonsIntersect = (poly1: LatLngTuple[], poly2: LatLngTuple[]): boolean => {
  const poly1Bounds = latLngBounds(poly1)
  const poly2Bounds = latLngBounds(poly2)

  if (!poly1Bounds.intersects(poly2Bounds)) {
    return false
  }

  for (let i = 0; i < poly1.length; i++) {
    for (let j = 0; j < poly2.length; j++) {
      const seg1 = [poly1[i], poly1[(i + 1) % poly1.length]]
      const seg2 = [poly2[j], poly2[(j + 1) % poly2.length]]
      if (doLineSegmentsIntersect(seg1, seg2)) {
        return true
      }
    }
  }

  return false
}

// Utility function to check if two line segments intersect
const doLineSegmentsIntersect = (seg1: LatLngTuple[], seg2: LatLngTuple[]): boolean => {
  const [p1, p2] = seg1
  const [p3, p4] = seg2

  const d1 = direction(p3, p4, p1)
  const d2 = direction(p3, p4, p2)
  const d3 = direction(p1, p2, p3)
  const d4 = direction(p1, p2, p4)

  if (((d1 > 0 && d2 < 0) || (d1 < 0 && d2 > 0)) && ((d3 > 0 && d4 < 0) || (d3 < 0 && d4 > 0))) {
    return true
  }

  return false
}

// Utility function to calculate direction
const direction = (p1: LatLngTuple, p2: LatLngTuple, p3: LatLngTuple): number => {
  return (p3[1] - p1[1]) * (p2[0] - p1[0]) - (p2[1] - p1[1]) * (p3[0] - p1[0])
}

const GeolocationControl: React.FC = () => {
  const map = useMap()

  const handleGeolocation = () => {
    map.locate({ setView: true, maxZoom: 16 })
  }

  return (
    <div className="leaflet-bottom leaflet-left">
      <div className="leaflet-control leaflet-bar">
        <a href="#" title="Locate me" onClick={handleGeolocation} className="leaflet-control-geolocation">
          📍
        </a>
      </div>
    </div>
  )
}

interface MapComponentProps {
  searchTerm: string
}

const MapComponent: React.FC<MapComponentProps> = ({ searchTerm }) => {
  const dispatch = useDispatch()
  const polygons = useSelector((state: RootState) => state.polygon.polygons)
  const [selectedPolygon, setSelectedPolygon] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const mapRef = useRef<L.Map>(null)

  const handleCreated = (e: any) => {
    const { layer } = e
    const coordinates = layer.getLatLngs()[0].map((latLng: L.LatLng) => [latLng.lat, latLng.lng] as LatLngTuple)

    // Check for intersections with existing polygons
    const intersects = polygons.some((polygon) => doPolygonsIntersect(coordinates, polygon.coordinates))
debugger
    if (intersects) {
      setError("Error: New polygon intersects with an existing polygon.")
      layer.remove()
      return
    }

    const newPolygon = {
      id: uuidv4(),
      coordinates,
      fillColor: "#3388ff",
      borderColor: "#3388ff",
      label: `Polygon ${polygons.length + 1}`,
    }
    dispatch(addPolygon(newPolygon))
    setError(null)
  }

  const handleEdited = (e: any) => {
    const { layers } = e
    layers.eachLayer((layer: L.Layer) => {
      if (layer instanceof L.Polygon) {
        const id = (layer as any).options.id
        const coordinates = layer.getLatLngs()[0].map((latLng: L.LatLng) => [latLng.lat, latLng.lng] as LatLngTuple)

        // Check for intersections with other polygons
        const intersects = polygons.some(
          (polygon) => polygon.id !== id && doPolygonsIntersect(coordinates, polygon.coordinates),
        )

        if (intersects) {
          setError("Error: Edited polygon intersects with an existing polygon.")
          return
        }

        const updatedPolygon = polygons.find((p) => p.id === id)
        if (updatedPolygon) {
          dispatch(updatePolygon({ ...updatedPolygon, coordinates }))
        }
        setError(null)
      }
    })
  }

  const calculateCenter = (coordinates: LatLngTuple[]): LatLngTuple => {
    const lat = coordinates.reduce((sum, coord) => sum + coord[0], 0) / coordinates.length
    const lng = coordinates.reduce((sum, coord) => sum + coord[1], 0) / coordinates.length
    return [lat, lng]
  }

  const calculateArea = (coordinates: LatLngTuple[]): number => {
    if (coordinates.length < 3) return 0
    let area = 0
    for (let i = 0; i < coordinates.length; i++) {
      const j = (i + 1) % coordinates.length
      area += coordinates[i][0] * coordinates[j][1]
      area -= coordinates[j][0] * coordinates[i][1]
    }
    area = Math.abs(area) / 2
    return area * 111.32 * 111.32 // Convert to square kilometers (approximate)
  }

  const handlePolygonClick = useCallback((id: string) => {
    setSelectedPolygon(id)
  }, [])
debugger
  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon?.label.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      polygon?.id.toLowerCase().includes(searchTerm?.toLowerCase()),
  )

  useEffect(() => {
    if (mapRef.current && filteredPolygons.length > 0) {
      const bounds = latLngBounds(filteredPolygons.flatMap((p) => p.coordinates))
      mapRef.current.fitBounds(bounds)
    }
  }, [filteredPolygons])

  return (
    <div className="h-[600px] rounded-lg overflow-hidden shadow-md relative">
      {error && <div className="absolute top-0 left-0 right-0 bg-red-500 text-white p-2 z-[1000]">{error}</div>}
      <MapContainer center={[51.505, -0.09]} zoom={13} style={{ height: "100%", width: "100%" }} ref={mapRef}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <FeatureGroup>
          <EditControl
            position="topright"
            onCreated={handleCreated}
            onEdited={handleEdited}
            draw={{
              rectangle: false,
              circle: false,
              circlemarker: false,
              marker: false,
              polyline: false,
            }}
          />
          {filteredPolygons.map((polygon) => (
            <Polygon
              key={polygon.id}
              positions={polygon.coordinates}
              pathOptions={{
                color: polygon.borderColor,
                fillColor: polygon.fillColor,
                fillOpacity: 0.7,
              }}
              eventHandlers={{
                click: () => handlePolygonClick(polygon.id),
              }}
            >
              <Tooltip permanent>
                <div className="text-xs font-semibold">{polygon.label}</div>
              </Tooltip>
            </Polygon>
          ))}
          {filteredPolygons.map((polygon) => {
            const center = calculateCenter(polygon.coordinates)
            const area = calculateArea(polygon.coordinates)
            return (
              <Marker key={`marker-${polygon.id}`} position={center}>
                <Tooltip>
                  <div className="text-xs font-semibold">Area: {area.toFixed(2)} km²</div>
                </Tooltip>
              </Marker>
            )
          })}
        </FeatureGroup>
        <GeolocationControl />
      </MapContainer>
    </div>
  )
}

export default MapComponent

