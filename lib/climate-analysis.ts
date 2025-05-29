import type { Region, ClimateData, HazardAnalysis, YearlyHazardData, HazardEvent } from "./types"

// Generate realistic mock weather data
export function generateMockWeatherData(region: Region, startYear: number, endYear: number): ClimateData[] {
  const data: ClimateData[] = []

  // Base climate parameters based on latitude (simplified)
  const baseTemp = 20 - Math.abs(region.lat - 30) * 0.5 // Warmer near 30°N
  const tempVariation = 15 + Math.abs(region.lat) * 0.2

  for (let year = startYear; year <= endYear; year++) {
    for (let month = 0; month < 12; month++) {
      const daysInMonth = new Date(year, month + 1, 0).getDate()

      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dayOfYear = Math.floor((date.getTime() - new Date(year, 0, 0).getTime()) / (1000 * 60 * 60 * 24))

        // Seasonal temperature variation
        const seasonalTemp = baseTemp + tempVariation * Math.sin((dayOfYear / 365) * 2 * Math.PI - Math.PI / 2)

        // Add climate change trend (warming)
        const climateChangeEffect = (year - 1990) * 0.02

        // Random daily variation
        const dailyVariation = (Math.random() - 0.5) * 10

        // Regional adjustments
        const coastalEffect = region.name.includes("Miami") ? -2 : 0
        const desertEffect = region.name.includes("Phoenix") ? 5 : 0
        const urbanHeatIsland = region.name.includes("New York") || region.name.includes("Los Angeles") ? 1 : 0

        const temperature =
          seasonalTemp + climateChangeEffect + dailyVariation + coastalEffect + desertEffect + urbanHeatIsland

        data.push({
          date: date.toISOString().split("T")[0],
          temperature: Math.round(temperature * 10) / 10,
          humidity: Math.max(20, Math.min(95, 60 + (Math.random() - 0.5) * 40)),
          precipitation: Math.random() < 0.15 ? Math.random() * 25 : 0,
          windSpeed: Math.max(0, 5 + (Math.random() - 0.5) * 10),
          pressure: 1013 + (Math.random() - 0.5) * 30,
        })
      }
    }
  }

  return data
}

// Detect heatwave events
function detectHeatwaves(data: ClimateData[], region: Region): HazardEvent[] {
  const events: HazardEvent[] = []

  // Calculate 95th percentile temperature for the region
  const temperatures = data.map((d) => d.temperature).sort((a, b) => a - b)
  const percentile95Index = Math.floor(temperatures.length * 0.95)
  const threshold = temperatures[percentile95Index]

  let currentEvent: { start: number; temps: number[] } | null = null

  data.forEach((day, index) => {
    if (day.temperature > threshold) {
      if (!currentEvent) {
        currentEvent = { start: index, temps: [day.temperature] }
      } else {
        currentEvent.temps.push(day.temperature)
      }
    } else {
      if (currentEvent && currentEvent.temps.length >= 3) {
        // Heatwave detected (3+ consecutive days above threshold)
        const startDate = data[currentEvent.start].date
        const endDate = data[currentEvent.start + currentEvent.temps.length - 1].date
        const duration = currentEvent.temps.length
        const maxTemp = Math.max(...currentEvent.temps)
        const avgTemp = currentEvent.temps.reduce((sum, temp) => sum + temp, 0) / currentEvent.temps.length
        const intensity = Math.min(10, Math.max(1, (maxTemp - threshold) / 2)) // Scale 1-10

        events.push({
          startDate,
          endDate,
          duration,
          intensity,
          maxTemperature: maxTemp,
          avgTemperature: avgTemp,
        })
      }
      currentEvent = null
    }
  })

  return events
}

// Detect drought events
function detectDroughts(data: ClimateData[]): HazardEvent[] {
  const events: HazardEvent[] = []

  // Calculate 30-day rolling precipitation
  const rollingPrecip: number[] = []
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - 29)
    const sum = data.slice(start, i + 1).reduce((total, day) => total + day.precipitation, 0)
    rollingPrecip.push(sum)
  }

  // Find 10th percentile as drought threshold
  const sortedPrecip = [...rollingPrecip].sort((a, b) => a - b)
  const threshold = sortedPrecip[Math.floor(sortedPrecip.length * 0.1)]

  let currentEvent: { start: number; values: number[] } | null = null

  rollingPrecip.forEach((precip, index) => {
    if (precip < threshold) {
      if (!currentEvent) {
        currentEvent = { start: index, values: [precip] }
      } else {
        currentEvent.values.push(precip)
      }
    } else {
      if (currentEvent && currentEvent.values.length >= 30) {
        const startDate = data[currentEvent.start].date
        const endDate = data[currentEvent.start + currentEvent.values.length - 1].date
        const duration = currentEvent.values.length
        const minPrecip = Math.min(...currentEvent.values)
        const intensity = Math.min(10, Math.max(1, ((threshold - minPrecip) / threshold) * 10))

        events.push({
          startDate,
          endDate,
          duration,
          intensity,
        })
      }
      currentEvent = null
    }
  })

  return events
}

// Detect heavy rainfall events
function detectHeavyRainfall(data: ClimateData[]): HazardEvent[] {
  const events: HazardEvent[] = []

  // Calculate 95th percentile precipitation
  const precipitations = data
    .filter((d) => d.precipitation > 0)
    .map((d) => d.precipitation)
    .sort((a, b) => a - b)
  if (precipitations.length === 0) return events

  const threshold = precipitations[Math.floor(precipitations.length * 0.95)]

  let currentEvent: { start: number; values: number[] } | null = null

  data.forEach((day, index) => {
    if (day.precipitation > threshold) {
      if (!currentEvent) {
        currentEvent = { start: index, values: [day.precipitation] }
      } else {
        currentEvent.values.push(day.precipitation)
      }
    } else {
      if (currentEvent && currentEvent.values.length >= 1) {
        const startDate = data[currentEvent.start].date
        const endDate = data[currentEvent.start + currentEvent.values.length - 1].date
        const duration = currentEvent.values.length
        const maxPrecip = Math.max(...currentEvent.values)
        const intensity = Math.min(10, Math.max(1, (maxPrecip / threshold) * 5))

        events.push({
          startDate,
          endDate,
          duration,
          intensity,
        })
      }
      currentEvent = null
    }
  })

  return events
}

// Detect cold wave events
function detectColdWaves(data: ClimateData[]): HazardEvent[] {
  const events: HazardEvent[] = []

  // Calculate 5th percentile temperature
  const temperatures = data.map((d) => d.temperature).sort((a, b) => a - b)
  const threshold = temperatures[Math.floor(temperatures.length * 0.05)]

  let currentEvent: { start: number; temps: number[] } | null = null

  data.forEach((day, index) => {
    if (day.temperature < threshold) {
      if (!currentEvent) {
        currentEvent = { start: index, temps: [day.temperature] }
      } else {
        currentEvent.temps.push(day.temperature)
      }
    } else {
      if (currentEvent && currentEvent.temps.length >= 3) {
        const startDate = data[currentEvent.start].date
        const endDate = data[currentEvent.start + currentEvent.temps.length - 1].date
        const duration = currentEvent.temps.length
        const minTemp = Math.min(...currentEvent.temps)
        const intensity = Math.min(10, Math.max(1, (threshold - minTemp) / 5))

        events.push({
          startDate,
          endDate,
          duration,
          intensity,
        })
      }
      currentEvent = null
    }
  })

  return events
}

// Main analysis function
export function analyzeClimateHazards(data: ClimateData[], hazardType: string): HazardAnalysis {
  let events: HazardEvent[] = []

  // Detect events based on hazard type
  switch (hazardType) {
    case "heatwave":
      events = detectHeatwaves(data, { name: "", lat: 0, lon: 0, bounds: { north: 0, south: 0, east: 0, west: 0 } })
      break
    case "drought":
      events = detectDroughts(data)
      break
    case "heavy_rainfall":
      events = detectHeavyRainfall(data)
      break
    case "cold_wave":
      events = detectColdWaves(data)
      break
    default:
      events = detectHeatwaves(data, { name: "", lat: 0, lon: 0, bounds: { north: 0, south: 0, east: 0, west: 0 } })
  }

  // Group events by year
  const yearlyData: YearlyHazardData[] = []
  const years = [...new Set(data.map((d) => new Date(d.date).getFullYear()))].sort()

  years.forEach((year) => {
    const yearEvents = events.filter((event) => new Date(event.startDate).getFullYear() === year)

    const frequency = yearEvents.length
    const avgIntensity =
      yearEvents.length > 0 ? yearEvents.reduce((sum, event) => sum + event.intensity, 0) / yearEvents.length : 0
    const avgDuration =
      yearEvents.length > 0 ? yearEvents.reduce((sum, event) => sum + event.duration, 0) / yearEvents.length : 0

    yearlyData.push({
      year,
      frequency,
      intensity: Math.round(avgIntensity * 10) / 10,
      duration: Math.round(avgDuration * 10) / 10,
    })
  })

  // Calculate trends using linear regression
  const frequencies = yearlyData.map((d) => d.frequency)
  const n = frequencies.length
  const sumX = yearlyData.reduce((sum, d, i) => sum + i, 0)
  const sumY = frequencies.reduce((sum, freq) => sum + freq, 0)
  const sumXY = yearlyData.reduce((sum, d, i) => sum + i * d.frequency, 0)
  const sumXX = yearlyData.reduce((sum, d, i) => sum + i * i, 0)

  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX)
  const initialFreq = frequencies[0] || 1
  const finalFreq = frequencies[frequencies.length - 1] || 1
  const trendMagnitude = ((finalFreq - initialFreq) / initialFreq) * 100

  let trendDirection: "increasing" | "decreasing" | "stable" = "stable"
  if (Math.abs(trendMagnitude) > 5) {
    trendDirection = trendMagnitude > 0 ? "increasing" : "decreasing"
  }

  return {
    totalEvents: events.length,
    averageIntensity:
      events.length > 0
        ? Math.round((events.reduce((sum, event) => sum + event.intensity, 0) / events.length) * 10) / 10
        : 0,
    averageDuration:
      events.length > 0
        ? Math.round((events.reduce((sum, event) => sum + event.duration, 0) / events.length) * 10) / 10
        : 0,
    trendDirection,
    trendMagnitude: Math.round(trendMagnitude * 10) / 10,
    yearlyData,
  }
}
