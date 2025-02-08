import type React from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../lib/store"
import { importPolygons, type Polygon } from "../lib/features/polygonSlice"

const ExportImport: React.FC = () => {
  const polygons = useSelector((state: RootState) => state.polygon.polygons)
  const dispatch = useDispatch()

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const importedPolygons = JSON.parse(e.target?.result as string) as Polygon[]
          dispatch(importPolygons(importedPolygons))
        } catch (error) {
          console.error("Error parsing imported file:", error)
          alert("Error importing file. Please make sure it's a valid JSON file.")
        }
      }
      reader.readAsText(file)
    }
  }

  return (
    <div className="flex space-x-4 mb-4">
      <label className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors duration-300 cursor-pointer">
        Import Polygons
        <input type="file" accept=".json" onChange={handleImport} className="hidden" />
      </label>
    </div>
  )
}

export default ExportImport

