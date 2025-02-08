"use client"

import type React from "react"
import { useState, useRef, useCallback, useEffect } from "react"
import { MapContainer, TileLayer, FeatureGroup, Polygon, LayersControl, Marker, Tooltip, useMap } from "react-leaflet"
import { EditControl } from "react-leaflet-draw"
import "leaflet/dist/leaflet.css"
import "leaflet-draw/dist/leaflet.draw.css"
import { useDispatch, useSelector } from "react-redux"
import { addPolygon, updatePolygon } from "../lib/features/polygonSlice"
import type { RootState } from "../lib/store"
import { type LatLngTuple, latLngBounds } from "leaflet"
import { v4 as uuidv4 } from "uuid"
import L from "leaflet"
import FitBounds from "./FitBounds"
import GeolocationControl from "./GeolocationControl"
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconUrl: markerIcon.src,
    iconRetinaUrl: markerIcon2x.src,
    shadowUrl: markerShadow.src,
})


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

interface MapComponentProps {
  searchTerm: string
}

const MapComponent: React.FC<MapComponentProps> = ({ searchTerm }) => {
  const dispatch = useDispatch()
  const polygons = useSelector((state: RootState) => state.polygon.polygons)

  const mapRef = useRef<L.Map>(null)
  const [error, setError] = useState<string | null>(null)

  const handleCreated = (e: any) => {
    const { layer } = e
    const coordinates = layer.getLatLngs()[0].map((latLng: L.LatLng) => [latLng.lat, latLng.lng] as LatLngTuple)

    // Check for intersections with existing polygons
    const intersects = polygons.some((polygon: any) => doPolygonsIntersect(coordinates, polygon.coordinates))

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
          (polygon: any) => polygon.id !== id && doPolygonsIntersect(coordinates, polygon.coordinates),
        )

        if (intersects) {
          setError("Error: Edited polygon intersects with an existing polygon.")
          return
        }

        const updatedPolygon = polygons.find((p: any) => p.id === id)
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

  const filteredPolygons = polygons.filter(
    (polygon: any) =>
      polygon?.label.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      polygon?.id.toLowerCase().includes(searchTerm?.toLowerCase()),
  )

  useEffect(() => {
    if (mapRef.current && filteredPolygons.length > 0) {
      const bounds = latLngBounds(filteredPolygons.flatMap((p: any) => p.coordinates))
      mapRef.current.fitBounds(bounds)
    }
  }, [filteredPolygons, mapRef]) // Added mapRef to dependencies

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow">
      {error && <p id="error-message">{error}</p>}

        <MapContainer center={[51.505, -0.09]} zoom={13} className="h-full w-full" ref={mapRef}>
          <LayersControl position="topleft">
            <LayersControl.BaseLayer checked name="OSM">
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Google">
              <TileLayer
                url="http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}"
                subdomains={["mt0", "mt1", "mt2", "mt3"]}
              />
            </LayersControl.BaseLayer>
          </LayersControl>

          <FeatureGroup>
            <EditControl
              position="topleft"
              onCreated={handleCreated}
              onEdited={handleEdited}
              draw={{
                rectangle: false,
                circle: false,
                circlemarker: false,
                marker: false,
                polyline: false,
                polygon: {
                  allowIntersection: false,
                  drawError: {
                    color: "#e1e4e8",
                    message: "<strong>Error:</strong> Polygon edges cannot cross!",
                  },
                  shapeOptions: {
                    color: "#000000",
                    fillColor: "#FFFFFF",
                  },
                },
              }}
            />
            {polygons.map((polygon) => {
              const center = calculateCenter(polygon.coordinates)
              const area = calculateArea(polygon.coordinates)
              return (
              <Polygon
              key={polygon.id}
              positions={polygon.coordinates}
              pathOptions={{
                color: polygon.borderColor,
                fillColor: polygon.fillColor,
                fillOpacity: 0.7,
                weight: 2,
              }}
            >
              <Marker key={`marker-${polygon.id}`} position={center}>
                <Tooltip>
                  <div className="text-xs font-semibold">Area: {area.toFixed(2)} km</div>
                </Tooltip>
              </Marker>
            </Polygon>
            )})}
          </FeatureGroup>
          <GeolocationControl />
          <FitBounds polygons={polygons.map((p) => p.coordinates)} />
        </MapContainer>
      </div>
    </div>
  )
}

export default MapComponent

