"use client"

import { useEffect, useRef, useState } from "react"
import mapboxgl from "mapbox-gl"
import "mapbox-gl/dist/mapbox-gl.css"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { MapPin } from "lucide-react"
import type { Region } from "@/lib/types"

// Set your Mapbox access token
mapboxgl.accessToken = "pk.eyJ1Ijoia2lyYW5zYW5nIiwiYSI6ImNtYjkxeTM2bTA5bnMybHF1ampraWs0czYifQ.jJR1zdpLtaQmvFm7V-vPOw"

interface MapboxRegionSelectorProps {
  selectedRegion: Region
  onRegionChange: (region: Region) => void
}

export default function MapboxRegionSelector({ selectedRegion, onRegionChange }: MapboxRegionSelectorProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const marker = useRef<mapboxgl.Marker | null>(null)
  const [zoom, setZoom] = useState(9)
  const [mapLoaded, setMapLoaded] = useState(false)

  // Initialize map when component mounts
  useEffect(() => {
    if (map.current || !mapContainer.current) return

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [selectedRegion.lon, selectedRegion.lat],
      zoom: zoom,
    })

    map.current.on("load", () => {
      setMapLoaded(true)

      // Add navigation controls
      map.current?.addControl(new mapboxgl.NavigationControl(), "top-right")

      // Add initial marker
      marker.current = new mapboxgl.Marker({ color: "#ef4444", draggable: true })
        .setLngLat([selectedRegion.lon, selectedRegion.lat])
        .addTo(map.current)

      // Handle marker drag end
      marker.current.on("dragend", () => {
        if (marker.current) {
          const lngLat = marker.current.getLngLat()
          updateSelectedRegion(lngLat.lat, lngLat.lng)
        }
      })

      // Handle map click to place marker
      map.current.on("click", (e) => {
        if (marker.current) {
          marker.current.setLngLat([e.lngLat.lng, e.lngLat.lat])
          updateSelectedRegion(e.lngLat.lat, e.lngLat.lng)
        }
      })
    })

    return () => {
      if (map.current) {
        map.current.remove()
        map.current = null
      }
    }
  }, [])

  // Update marker position when selectedRegion changes
  useEffect(() => {
    if (map.current && marker.current && mapLoaded) {
      marker.current.setLngLat([selectedRegion.lon, selectedRegion.lat])
      map.current.flyTo({
        center: [selectedRegion.lon, selectedRegion.lat],
        zoom: zoom,
        essential: true,
      })
    }
  }, [selectedRegion, mapLoaded])

  // Function to update the selected region
  const updateSelectedRegion = (lat: number, lon: number) => {
    // Get a name for the location (could be replaced with reverse geocoding)
    const name = `Custom (${lat.toFixed(4)}, ${lon.toFixed(4)})`

    // Create bounds around the point (approximately 10km box)
    const bounds = {
      north: lat + 0.1,
      south: lat - 0.1,
      east: lon + 0.1,
      west: lon - 0.1,
    }

    onRegionChange({
      name,
      lat,
      lon,
      bounds,
    })
  }

  // Function to handle preset region selection
  const selectPresetRegion = (region: Region) => {
    onRegionChange(region)
  }

  // Preset regions
  const PRESET_REGIONS = [
    {
      name: "New York, NY",
      lat: 40.7128,
      lon: -74.006,
      bounds: { north: 40.8, south: 40.6, east: -73.9, west: -74.1 },
    },
    {
      name: "Los Angeles, CA",
      lat: 34.0522,
      lon: -118.2437,
      bounds: { north: 34.2, south: 33.9, east: -118.1, west: -118.4 },
    },
    {
      name: "Phoenix, AZ",
      lat: 33.4484,
      lon: -112.074,
      bounds: { north: 33.6, south: 33.3, east: -111.9, west: -112.2 },
    },
    {
      name: "Miami, FL",
      lat: 25.7617,
      lon: -80.1918,
      bounds: { north: 25.9, south: 25.6, east: -80.0, west: -80.3 },
    },
    {
      name: "Chicago, IL",
      lat: 41.8781,
      lon: -87.6298,
      bounds: { north: 42.0, south: 41.7, east: -87.5, west: -87.8 },
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {PRESET_REGIONS.map((region) => (
          <Button
            key={region.name}
            variant={selectedRegion.name === region.name ? "default" : "outline"}
            size="sm"
            onClick={() => selectPresetRegion(region)}
            className="flex items-center gap-1"
          >
            <MapPin className="h-3 w-3" />
            {region.name}
          </Button>
        ))}
      </div>

      <Card className="p-0 overflow-hidden">
        <div ref={mapContainer} className="w-full h-[300px]" />
      </Card>

      <div className="text-sm text-gray-500">
        Click on the map to select a region or drag the marker to adjust the location.
      </div>
    </div>
  )
}
