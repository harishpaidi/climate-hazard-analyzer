"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { YearlyHazardData } from "@/lib/types"

interface TrendChartProps {
  data: YearlyHazardData[]
  hazardType: string
}

export default function TrendChart({ data, hazardType }: TrendChartProps) {
  const formatHazardType = (type: string) => {
    return type
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ")
  }

  return (
    <Tabs defaultValue="frequency" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="frequency">Frequency</TabsTrigger>
        <TabsTrigger value="intensity">Intensity</TabsTrigger>
        <TabsTrigger value="duration">Duration</TabsTrigger>
      </TabsList>

      <TabsContent value="frequency" className="mt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, `${formatHazardType(hazardType)} Events`]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="frequency"
                stroke="#ef4444"
                strokeWidth={2}
                name={`${formatHazardType(hazardType)} Events`}
                dot={{ fill: "#ef4444", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="intensity" className="mt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [value, "Average Intensity"]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              <Bar dataKey="intensity" fill="#f59e0b" name="Average Intensity" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>

      <TabsContent value="duration" className="mt-4">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis />
              <Tooltip
                formatter={(value, name) => [`${value} days`, "Average Duration"]}
                labelFormatter={(label) => `Year: ${label}`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="duration"
                stroke="#10b981"
                strokeWidth={2}
                name="Average Duration (days)"
                dot={{ fill: "#10b981", strokeWidth: 2, r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
