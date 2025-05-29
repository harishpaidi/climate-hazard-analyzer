"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapPin, TrendingUp, Download } from "lucide-react"
import MapboxRegionSelector from "@/components/mapbox-region-selector"
import TrendChart from "@/components/trend-chart"
import HazardMap from "@/components/hazard-map"
import InsightsSummary from "@/components/insights-summary"
import { analyzeClimateHazards, generateMockWeatherData } from "@/lib/climate-analysis"
import type { ClimateData, HazardAnalysis, Region } from "@/lib/types"

export default function ClimateHazardAnalyzer() {
  const [selectedRegion, setSelectedRegion] = useState<Region>({
    name: "New York, NY",
    lat: 40.7128,
    lon: -74.006,
    bounds: {
      north: 40.8,
      south: 40.6,
      east: -73.9,
      west: -74.1,
    },
  })

  const [timeRange, setTimeRange] = useState({
    startYear: 1990,
    endYear: 2020,
  })

  const [hazardType, setHazardType] = useState("heatwave")
  const [climateData, setClimateData] = useState<ClimateData[]>([])
  const [analysis, setAnalysis] = useState<HazardAnalysis | null>(null)
  const [loading, setLoading] = useState(false)

  const analyzeData = async () => {
    setLoading(true)
    try {
      // Generate mock weather data for the selected region and time range
      const weatherData = generateMockWeatherData(selectedRegion, timeRange.startYear, timeRange.endYear)

      setClimateData(weatherData)

      // Analyze climate hazards
      const hazardAnalysis = analyzeClimateHazards(weatherData, hazardType)
      setAnalysis(hazardAnalysis)
    } catch (error) {
      console.error("Error analyzing climate data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    analyzeData()
  }, [selectedRegion, timeRange, hazardType])

  const exportData = (format: "csv" | "pdf") => {
    if (!analysis) return

    if (format === "csv") {
      const csvData = analysis.yearlyData
        .map((item) => `${item.year},${item.frequency},${item.intensity},${item.duration}`)
        .join("\n")

      const blob = new Blob([`Year,Frequency,Intensity,Duration\n${csvData}`], { type: "text/csv" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `climate-hazard-analysis-${selectedRegion.name}-${timeRange.startYear}-${timeRange.endYear}.csv`
      a.click()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold text-gray-900">Climate Hazard Trend Analyzer</h1>
          <p className="text-lg text-gray-600">
            Analyze historical weather patterns and visualize climate hazard trends
          </p>
        </div>

        {/* Controls */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Analysis Configuration
            </CardTitle>
            <CardDescription>Select your region, time range, and hazard type to begin analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              {/* Region Selection with Mapbox */}
              <div className="space-y-2">
                <Label>Geographic Region</Label>
                <MapboxRegionSelector selectedRegion={selectedRegion} onRegionChange={setSelectedRegion} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Time Range */}
                <div className="space-y-2">
                  <Label>Time Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Start Year"
                      value={timeRange.startYear}
                      onChange={(e) =>
                        setTimeRange((prev) => ({
                          ...prev,
                          startYear: Number.parseInt(e.target.value) || 1990,
                        }))
                      }
                      min="1950"
                      max="2023"
                    />
                    <Input
                      type="number"
                      placeholder="End Year"
                      value={timeRange.endYear}
                      onChange={(e) =>
                        setTimeRange((prev) => ({
                          ...prev,
                          endYear: Number.parseInt(e.target.value) || 2020,
                        }))
                      }
                      min="1950"
                      max="2023"
                    />
                  </div>
                </div>

                {/* Hazard Type */}
                <div className="space-y-2">
                  <Label>Hazard Type</Label>
                  <Select value={hazardType} onValueChange={setHazardType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="heatwave">Heatwave (Default)</SelectItem>
                      <SelectItem value="drought">Drought</SelectItem>
                      <SelectItem value="heavy_rainfall">Heavy Rainfall</SelectItem>
                      <SelectItem value="cold_wave">Cold Wave</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={analyzeData} disabled={loading}>
                {loading ? "Analyzing..." : "Analyze Climate Data"}
              </Button>
              {analysis && (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => exportData("csv")}>
                    <Download className="h-4 w-4 mr-2" />
                    Export CSV
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        {analysis && (
          <Tabs defaultValue="trends" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="trends">Trend Analysis</TabsTrigger>
              <TabsTrigger value="map">Geographic View</TabsTrigger>
              <TabsTrigger value="insights">Key Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="trends" className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Key Metrics */}
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.totalEvents}</div>
                    <p className="text-xs text-muted-foreground">
                      {timeRange.startYear} - {timeRange.endYear}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Trend Direction</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center gap-2">
                      <TrendingUp
                        className={`h-4 w-4 ${
                          analysis.trendDirection === "increasing"
                            ? "text-red-500"
                            : analysis.trendDirection === "decreasing"
                              ? "text-green-500"
                              : "text-gray-500"
                        }`}
                      />
                      <span className="text-2xl font-bold capitalize">{analysis.trendDirection}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {analysis.trendMagnitude > 0 ? "+" : ""}
                      {analysis.trendMagnitude.toFixed(1)}% change
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium">Avg. Duration</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{analysis.averageDuration.toFixed(1)} days</div>
                    <p className="text-xs text-muted-foreground">Per event</p>
                  </CardContent>
                </Card>
              </div>

              {/* Trend Chart */}
              <Card>
                <CardHeader>
                  <CardTitle>Climate Hazard Trends Over Time</CardTitle>
                  <CardDescription>
                    Frequency, intensity, and duration of {hazardType} events in {selectedRegion.name}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TrendChart data={analysis.yearlyData} hazardType={hazardType} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="map">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>Spatial analysis of climate hazards in the selected region</CardDescription>
                </CardHeader>
                <CardContent>
                  <HazardMap region={selectedRegion} hazardData={analysis.yearlyData} hazardType={hazardType} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="insights">
              <InsightsSummary
                analysis={analysis}
                region={selectedRegion}
                timeRange={timeRange}
                hazardType={hazardType}
              />
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  )
}
