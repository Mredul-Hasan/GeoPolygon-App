"use client"

import type React from "react"
import { useState } from "react"
import PolygonList from "../components/PolygonList"
import ExportImport from "../components/ExportImport"
import { MapIcon, ListBulletIcon } from "@heroicons/react/24/outline"
import dynamic from "next/dynamic";

const MapComponent = dynamic(() => import("../components/MapComponent"), {
  ssr: false, // Prevents server-side rendering
});

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<"map" | "list">("map")
  const [searchTerm, setSearchTerm] = useState("")

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">GeoPolygon App</h1>
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex" aria-label="Tabs">
              <button
                onClick={() => setActiveTab("map")}
                className={`${
                  activeTab === "map"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                <MapIcon className="w-5 h-5 mr-2 inline-block" />
                Map View
              </button>
              <button
                onClick={() => setActiveTab("list")}
                className={`${
                  activeTab === "list"
                    ? "border-indigo-500 text-indigo-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } flex-1 py-4 px-1 text-center border-b-2 font-medium text-sm`}
              >
                <ListBulletIcon className="w-5 h-5 mr-2 inline-block" />
                Polygon List
              </button>
            </nav>
          </div>
          <div className="p-6">
            <div className="mb-4 flex justify-between items-center">
              <div className="w-64">
                <input
                  type="text"
                  placeholder="Search polygons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <ExportImport />
            </div>
            {activeTab === "map" ? <MapComponent searchTerm={searchTerm} /> : <PolygonList searchTerm={searchTerm} />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

