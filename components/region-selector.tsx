"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { MapPin, Search } from "lucide-react"
import type { Region } from "@/lib/types"

interface RegionSelectorProps {
  selectedRegion: Region
  onRegionChange: (region: Region) => void
}

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

export default function RegionSelector({ selectedRegion, onRegionChange }: RegionSelectorProps) {
  const [customCoords, setCustomCoords] = useState({
    lat: selectedRegion.lat,
    lon: selectedRegion.lon,
  })

  const handlePresetSelect = (region: Region) => {
    onRegionChange(region)
  }

  const handleCustomCoords = () => {
    const customRegion: Region = {
      name: `Custom (${customCoords.lat.toFixed(2)}, ${customCoords.lon.toFixed(2)})`,
      lat: customCoords.lat,
      lon: customCoords.lon,
      bounds: {
        north: customCoords.lat + 0.1,
        south: customCoords.lat - 0.1,
        east: customCoords.lon + 0.1,
        west: customCoords.lon - 0.1,
      },
    }
    onRegionChange(customRegion)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start">
          <MapPin className="h-4 w-4 mr-2" />
          {selectedRegion.name}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="start">
        <div className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Preset Regions</h4>
            <div className="space-y-1">
              {PRESET_REGIONS.map((region) => (
                <Button
                  key={region.name}
                  variant={selectedRegion.name === region.name ? "default" : "ghost"}
                  className="w-full justify-start"
                  onClick={() => handlePresetSelect(region)}
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  {region.name}
                </Button>
              ))}
            </div>
          </div>

          <div className="border-t pt-4">
            <h4 className="font-medium mb-2">Custom Coordinates</h4>
            <div className="space-y-2">
              <div>
                <Label htmlFor="lat">Latitude</Label>
                <Input
                  id="lat"
                  type="number"
                  step="0.0001"
                  value={customCoords.lat}
                  onChange={(e) =>
                    setCustomCoords((prev) => ({
                      ...prev,
                      lat: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="40.7128"
                />
              </div>
              <div>
                <Label htmlFor="lon">Longitude</Label>
                <Input
                  id="lon"
                  type="number"
                  step="0.0001"
                  value={customCoords.lon}
                  onChange={(e) =>
                    setCustomCoords((prev) => ({
                      ...prev,
                      lon: Number.parseFloat(e.target.value) || 0,
                    }))
                  }
                  placeholder="-74.0060"
                />
              </div>
              <Button onClick={handleCustomCoords} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                Use Custom Location
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
