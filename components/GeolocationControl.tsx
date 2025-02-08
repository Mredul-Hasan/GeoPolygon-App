import type React from "react"
import { useMap } from "react-leaflet"

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

export default GeolocationControl

