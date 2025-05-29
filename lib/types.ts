export interface Region {
  name: string
  lat: number
  lon: number
  bounds: {
    north: number
    south: number
    east: number
    west: number
  }
}

export interface ClimateData {
  date: string
  temperature: number
  humidity: number
  precipitation: number
  windSpeed: number
  pressure: number
}

export interface YearlyHazardData {
  year: number
  frequency: number
  intensity: number
  duration: number
}

export interface HazardAnalysis {
  totalEvents: number
  averageIntensity: number
  averageDuration: number
  trendDirection: "increasing" | "decreasing" | "stable"
  trendMagnitude: number
  yearlyData: YearlyHazardData[]
}

export interface HazardEvent {
  startDate: string
  endDate: string
  duration: number
  intensity: number
  maxTemperature?: number
  minTemperature?: number
  avgTemperature?: number
}
