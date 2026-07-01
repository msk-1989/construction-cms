import { NextResponse } from 'next/server'

// Mock weather data for construction site
export async function GET() {
  const forecast = [
    { date: '2025-01-13', day: 'Monday', tempHigh: 32, tempLow: 22, condition: 'Sunny', humidity: 45, windSpeed: 12, precipitation: 0, suitableForWork: true },
    { date: '2025-01-14', day: 'Tuesday', tempHigh: 30, tempLow: 21, condition: 'Partly Cloudy', humidity: 55, windSpeed: 15, precipitation: 10, suitableForWork: true },
    { date: '2025-01-15', day: 'Wednesday', tempHigh: 28, tempLow: 20, condition: 'Cloudy', humidity: 65, windSpeed: 18, precipitation: 30, suitableForWork: true },
    { date: '2025-01-16', day: 'Thursday', tempHigh: 26, tempLow: 19, condition: 'Light Rain', humidity: 78, windSpeed: 22, precipitation: 70, suitableForWork: false },
    { date: '2025-01-17', day: 'Friday', tempHigh: 29, tempLow: 21, condition: 'Partly Cloudy', humidity: 50, windSpeed: 10, precipitation: 15, suitableForWork: true },
    { date: '2025-01-18', day: 'Saturday', tempHigh: 33, tempLow: 23, condition: 'Sunny', humidity: 40, windSpeed: 8, precipitation: 0, suitableForWork: true },
    { date: '2025-01-19', day: 'Sunday', tempHigh: 31, tempLow: 22, condition: 'Sunny', humidity: 42, windSpeed: 11, precipitation: 5, suitableForWork: true },
  ]

  return NextResponse.json({
    success: true,
    data: {
      location: 'Mumbai, India',
      current: {
        temperature: 31,
        feelsLike: 34,
        condition: 'Sunny',
        humidity: 48,
        windSpeed: 14,
        windDirection: 'SW',
        visibility: 10,
        uvIndex: 7,
      },
      forecast,
      alerts: [
        {
          type: 'HEAT',
          severity: 'MODERATE',
          message: 'High temperature expected on Saturday. Ensure adequate hydration breaks for workers.',
        },
      ],
    },
  })
}