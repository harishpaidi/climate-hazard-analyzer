"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { TrendingUp, TrendingDown, AlertTriangle, Info, Calendar, MapPin } from "lucide-react"
import type { HazardAnalysis, Region } from "@/lib/types"

interface InsightsSummaryProps {
  analysis: HazardAnalysis
  region: Region
  timeRange: { startYear: number; endYear: number }
  hazardType: string
}

export default function InsightsSummary({ analysis, region, timeRange, hazardType }: InsightsSummaryProps) {
  const formatHazardType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  const getTrendIcon = () => {
    if (analysis.trendDirection === "increasing") {
      return <TrendingUp className="h-5 w-5 text-red-500" />
    } else if (analysis.trendDirection === "decreasing") {
      return <TrendingDown className="h-5 w-5 text-green-500" />
    }
    return <Info className="h-5 w-5 text-gray-500" />
  }

  const getRiskLevel = () => {
    if (analysis.averageIntensity >= 6) return { level: "Very High", color: "destructive" }
    if (analysis.averageIntensity >= 4) return { level: "High", color: "destructive" }
    if (analysis.averageIntensity >= 2) return { level: "Medium", color: "default" }
    return { level: "Low", color: "secondary" }
  }

  const riskLevel = getRiskLevel()

  // Generate key insights
  const insights = [
    `${formatHazardType(hazardType)} events have ${analysis.trendDirection} by ${Math.abs(analysis.trendMagnitude).toFixed(1)}% in ${region.name} since ${timeRange.startYear}.`,
    `The average duration of ${hazardType} events is ${analysis.averageDuration.toFixed(1)} days.`,
    `Peak activity occurred in ${
      analysis.yearlyData.reduce((max, current) => (current.frequency > max.frequency ? current : max)).year
    } with ${
      analysis.yearlyData.reduce((max, current) => (current.frequency > max.frequency ? current : max)).frequency
    } events.`,
    `Current risk level is assessed as ${riskLevel.level.toLowerCase()} based on recent intensity patterns.`,
  ]

  // Statistical analysis
  const recentYears = analysis.yearlyData.slice(-5)
  const earlierYears = analysis.yearlyData.slice(0, 5)
  const recentAvg = recentYears.reduce((sum, data) => sum + data.frequency, 0) / recentYears.length
  const earlierAvg = earlierYears.reduce((sum, data) => sum + data.frequency, 0) / earlierYears.length
  const changePercent = ((recentAvg - earlierAvg) / earlierAvg) * 100

  return (
    <div className="space-y-6">
      {/* Executive Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {getTrendIcon()}
            Executive Summary
          </CardTitle>
          <CardDescription>
            Climate hazard analysis for {region.name} ({timeRange.startYear}-{timeRange.endYear})
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{analysis.totalEvents}</div>
              <div className="text-sm text-gray-600">Total Events</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {analysis.trendDirection === "increasing" ? "+" : analysis.trendDirection === "decreasing" ? "-" : ""}
                {Math.abs(analysis.trendMagnitude).toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600">Trend Change</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <Badge variant={riskLevel.color as any} className="text-lg px-3 py-1">
                {riskLevel.level} Risk
              </Badge>
            </div>
          </div>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Key Finding:</strong> {insights[0]}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Detailed Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Temporal Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Recent vs. Historical Comparison</h4>
              <p className="text-sm text-gray-600">
                Recent 5-year average: <span className="font-medium">{recentAvg.toFixed(1)} events/year</span>
              </p>
              <p className="text-sm text-gray-600">
                Earlier 5-year average: <span className="font-medium">{earlierAvg.toFixed(1)} events/year</span>
              </p>
              <p className="text-sm">
                <span className={`font-medium ${changePercent > 0 ? "text-red-600" : "text-green-600"}`}>
                  {changePercent > 0 ? "+" : ""}
                  {changePercent.toFixed(1)}% change
                </span>{" "}
                in recent years
              </p>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Event Characteristics</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Average intensity: {analysis.averageIntensity.toFixed(1)}/10</li>
                <li>• Average duration: {analysis.averageDuration.toFixed(1)} days</li>
                <li>
                  • Most active year:{" "}
                  {
                    analysis.yearlyData.reduce((max, current) => (current.frequency > max.frequency ? current : max))
                      .year
                  }
                </li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Regional Context
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <h4 className="font-medium">Location Details</h4>
              <p className="text-sm text-gray-600">
                Coordinates: {region.lat.toFixed(4)}°N, {Math.abs(region.lon).toFixed(4)}°W
              </p>
              <p className="text-sm text-gray-600">
                Analysis area:{" "}
                {(
                  (region.bounds.north - region.bounds.south) *
                  (region.bounds.east - region.bounds.west) *
                  111 *
                  111
                ).toFixed(0)}{" "}
                km²
              </p>
            </div>

            <div className="border-t pt-3">
              <h4 className="font-medium mb-2">Climate Factors</h4>
              <ul className="text-sm space-y-1 text-gray-600">
                <li>• Urban heat island effects may amplify trends</li>
                <li>• Regional climate patterns influence frequency</li>
                <li>• Elevation: ~{Math.abs(region.lat * 10).toFixed(0)}m (estimated)</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Insights List */}
      <Card>
        <CardHeader>
          <CardTitle>Key Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {insights.map((insight, index) => (
              <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-sm">{insight}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Recommendations</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Monitor trends closely for early warning systems</li>
              <li>• Consider infrastructure adaptations for increasing hazard frequency</li>
              <li>• Implement community preparedness programs</li>
              <li>• Regular updates to risk assessments recommended</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
