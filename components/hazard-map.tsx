"use client"

import { useEffect, useRef } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import type { Region, YearlyHazardData } from "@/lib/types"

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoia2lyYW5zYW5nIiwiYSI6ImNtYjkxeTM2bTA5bnMybHF1ampraWs0czYifQ.jJR1zdpLtaQmvFm7V-vPOw"

interface HazardMapProps {
  region: Region
  hazardData: YearlyHazardData[]
  hazardType: string
}

export default function HazardMap({ region, hazardData, hazardType }: HazardMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)

  // Calculate intensity for color coding
  const getIntensityColor = (intensity: number) => {
    if (intensity < 2) return "#22c55e" // Green - Low
    if (intensity < 4) return "#eab308" // Yellow - Medium
    if (intensity < 6) return "#f97316" // Orange - High
    return "#ef4444" // Red - Very High
  }

  const averageIntensity = hazardData.reduce((sum, data) => sum + data.intensity, 0) / hazardData.length
  const totalEvents = hazardData.reduce((sum, data) => sum + data.frequency, 0)

  useEffect(() => {
    if (map.current || !mapContainer.current) return

    // Initialize map
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/light-v11",
      center: [region.lon, region.lat],
      zoom: 9,
    })

    // Add navigation controls
    map.current.addControl(new mapboxgl.NavigationControl(), "top-right")

    // Wait for map to load
    map.current.on("load", () => {
      if (!map.current) return

      // Add region bounds
      map.current.addSource("region-bounds", {
        type: "geojson",
        data: {
          type: "Feature",
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [region.bounds.west, region.bounds.south],
                [region.bounds.east, region.bounds.south],
                [region.bounds.east, region.bounds.north],
                [region.bounds.west, region.bounds.north],
                [region.bounds.west, region.bounds.south],
              ],
            ],
          },
          properties: {},
        },
      })

      map.current.addLayer({
        id: "region-bounds-fill",
        type: "fill",
        source: "region-bounds",
        layout: {},
        paint: {
          "fill-color": getIntensityColor(averageIntensity),
          "fill-opacity": 0.3,
        },
      })

      map.current.addLayer({
        id: "region-bounds-line",
        type: "line",
        source: "region-bounds",
        layout: {},
        paint: {
          "line-color": getIntensityColor(averageIntensity),
          "line-width": 2,
        },
      })

      // Add a marker for the region center
      new mapboxgl.Marker({ color: getIntensityColor(averageIntensity) })
        .setLngLat([region.lon, region.lat])
        .addTo(map.current)

      // Add a popup with region info
      new mapboxgl.Popup({ closeOnClick: false })
        .setLngLat([region.lon, region.lat])
        .setHTML(`
          <div style="font-family: sans-serif; padding: 5px;">
            <h3 style="margin: 0 0 5px 0; font-size: 16px;">${region.name}</h3>
            <p style="margin: 0; font-size: 12px;">Total Events: ${totalEvents}</p>
            <p style="margin: 0; font-size: 12px;">Avg. Intensity: ${averageIntensity.toFixed(1)}</p>
          </div>
        `)
        .addTo(map.current)

      // Add heat zones for recent years
      hazardData.slice(-5).forEach((data, index) => {
        const radius = Math.max(5000, data.frequency * 2000)
        const circleId = `heat-zone-${index}`

        map.current?.addSource(circleId, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [region.lon + (index * 0.02 - 0.04), region.lat + (index * 0.01 - 0.02)],
            },
            properties: {
              year: data.year,
              frequency: data.frequency,
              intensity: data.intensity,
            },
          },
        })

        map.current?.addLayer({
          id: circleId,
          type: "circle",
          source: circleId,
          paint: {
            "circle-radius": radius,
            "circle-color": getIntensityColor(data.intensity),
            "circle-opacity": 0.2,
            "circle-stroke-width": 1,
            "circle-stroke-color": getIntensityColor(data.intensity),
          },
        })

        // Add year label
        map.current?.addSource(`label-${index}`, {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "Point",
              coordinates: [region.lon + (index * 0.02 - 0.04), region.lat + (index * 0.01 - 0.02)],
            },
            properties: {
              year: data.year,
            },
          },
        })

        map.current?.addLayer({
          id: `label-${index}`,
          type: "symbol",
          source: `label-${index}`,
          layout: {
            "text-field": ["to-string", ["get", "year"]],
            "text-size": 12,
            "text-offset": [0, 0],
          },
          paint: {
            "text-color": "#000000",
            "text-halo-color": "#ffffff",
            "text-halo-width": 1,
          },
        })
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update map when region or data changes
  useEffect(() => {
    if (!map.current) return

    map.current.flyTo({
      center: [region.lon, region.lat],
      zoom: 9,
      essential: true,
    })

    // Update region bounds if the source exists
    if (map.current.getSource("region-bounds")) {
      map.current.getSource("region-bounds").setData({
        type: "Feature",
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [region.bounds.west, region.bounds.south],
              [region.bounds.east, region.bounds.south],
              [region.bounds.east, region.bounds.north],
              [region.bounds.west, region.bounds.north],
              [region.bounds.west, region.bounds.south],
            ],
          ],
        },
        properties: {},
      })

      // Update fill color based on new intensity
      if (map.current.getLayer("region-bounds-fill")) {
        map.current.setPaintProperty("region-bounds-fill", "fill-color", getIntensityColor(averageIntensity))
      }

      // Update line color based on new intensity
      if (map.current.getLayer("region-bounds-line")) {
        map.current.setPaintProperty("region-bounds-line", "line-color", getIntensityColor(averageIntensity))
      }
    }
  }, [region, hazardData])

  return (
    <div className="space-y-4">
      {/* Mapbox Map */}
      <div ref={mapContainer} className="w-full h-96 rounded-lg overflow-hidden" />

      {/* Legend */}
      <div className="flex items-center justify-center space-x-6 text-sm">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-green-500"></div>
          <span>Low Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-yellow-500"></div>
          <span>Medium Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-orange-500"></div>
          <span>High Risk</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 rounded-full bg-red-500"></div>
          <span>Very High Risk</span>
        </div>
      </div>

      {/* Region Bounds Info */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium mb-2">Analysis Bounds</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">North:</span> {region.bounds.north.toFixed(4)}°
          </div>
          <div>
            <span className="font-medium">South:</span> {region.bounds.south.toFixed(4)}°
          </div>
          <div>
            <span className="font-medium">East:</span> {region.bounds.east.toFixed(4)}°
          </div>
          <div>
            <span className="font-medium">West:</span> {region.bounds.west.toFixed(4)}°
          </div>
        </div>
      </div>
    </div>
  )
}
