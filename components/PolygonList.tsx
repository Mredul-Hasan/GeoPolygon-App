import type React from "react"
import { useState } from "react"
import { useSelector, useDispatch } from "react-redux"
import type { RootState } from "../lib/store"
import { updatePolygon, deletePolygon, updatePolygonLabel } from "../lib/features/polygonSlice"
import { TrashIcon, PencilIcon } from "@heroicons/react/24/outline"

interface PolygonListProps {
  searchTerm: string
}

const PolygonList: React.FC<PolygonListProps> = ({ searchTerm }) => {
  const polygons = useSelector((state: RootState) => state.polygon.polygons)
  const dispatch = useDispatch()
  const [editingLabel, setEditingLabel] = useState<string | null>(null)

  const handleColorChange = (id: string, type: "fillColor" | "borderColor", color: string) => {
    const polygon = polygons.find((p) => p.id === id)
    if (polygon) {
      dispatch(updatePolygon({ ...polygon, [type]: color }))
    }
  }

  const handleExport = (id: string) => {
    debugger
    const polygon = polygons.filter(p => p.id == id)[0]
    const dataStr = JSON.stringify(polygon)
    const dataUri = "data:application/json;charset=utf-8," + encodeURIComponent(dataStr)
    const exportFileDefaultName = `${polygon.label}.json`

    const linkElement = document.createElement("a")
    linkElement.setAttribute("href", dataUri)
    linkElement.setAttribute("download", exportFileDefaultName)
    linkElement.click()
  }

  const handleDelete = (id: string) => {
    dispatch(deletePolygon(id))
  }

  const handleLabelChange = (id: string, newLabel: string) => {
    dispatch(updatePolygonLabel({ id, label: newLabel }))
    setEditingLabel(null)
  }

  const filteredPolygons = polygons.filter(
    (polygon) =>
      polygon.label.toLowerCase().includes(searchTerm?.toLowerCase()) ||
      polygon.id.toLowerCase().includes(searchTerm?.toLowerCase()),
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredPolygons.map((polygon) => (
        <div
          key={polygon.id}
          className="bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300 hover:shadow-lg"
        >
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              {editingLabel === polygon.id ? (
                <input
                  type="text"
                  value={polygon.label}
                  onChange={(e) => handleLabelChange(polygon.id, e.target.value)}
                  onBlur={() => setEditingLabel(null)}
                  autoFocus
                  className="text-lg font-semibold text-gray-800 border-b border-gray-300 focus:outline-none focus:border-blue-500"
                />
              ) : (
                <h3 className="text-lg font-semibold text-gray-800">{polygon.label}</h3>
              )}
              <button onClick={() => setEditingLabel(polygon.id)} className="text-gray-500 hover:text-gray-700">
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">ID: {polygon.id.slice(0, 8)}</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Fill Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={polygon.fillColor}
                    onChange={(e) => handleColorChange(polygon.id, "fillColor", e.target.value)}
                    className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{polygon.fillColor}</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Border Color</label>
                <div className="flex items-center">
                  <input
                    type="color"
                    value={polygon.borderColor}
                    onChange={(e) => handleColorChange(polygon.id, "borderColor", e.target.value)}
                    className="w-8 h-8 rounded-full mr-2 cursor-pointer"
                  />
                  <span className="text-sm text-gray-600">{polygon.borderColor}</span>
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-6 py-3">
            <button
              onClick={() => handleDelete(polygon.id)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-300 rounded-md hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors duration-300"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Delete
            </button>
            <button
              onClick={() => handleExport(polygon.id)}
              className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white-600 bg-blue-500 border border-red-300 rounded-md hover:hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors duration-300"
            >
              <TrashIcon className="w-4 h-4 mr-2" />
              Export Polygons
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default PolygonList

