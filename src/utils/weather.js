// Map WMO weather codes to descriptions and conditions
const weatherCodeMap = {
  0: { description: 'clear sky', condition: 'clear' },
  1: { description: 'mainly clear', condition: 'clear' },
  2: { description: 'partly cloudy', condition: 'cloud' },
  3: { description: 'overcast', condition: 'cloud' },
  45: { description: 'foggy', condition: 'fog' },
  48: { description: 'depositing rime fog', condition: 'fog' },
  51: { description: 'light drizzle', condition: 'rain' },
  53: { description: 'moderate drizzle', condition: 'rain' },
  55: { description: 'dense drizzle', condition: 'rain' },
  56: { description: 'light freezing drizzle', condition: 'rain' },
  57: { description: 'dense freezing drizzle', condition: 'rain' },
  61: { description: 'slight rain', condition: 'rain' },
  63: { description: 'moderate rain', condition: 'rain' },
  65: { description: 'heavy rain', condition: 'rain' },
  66: { description: 'light freezing rain', condition: 'rain' },
  67: { description: 'heavy freezing rain', condition: 'rain' },
  71: { description: 'slight snow', condition: 'snow' },
  73: { description: 'moderate snow', condition: 'snow' },
  75: { description: 'heavy snow', condition: 'snow' },
  77: { description: 'snow grains', condition: 'snow' },
  80: { description: 'slight rain showers', condition: 'rain' },
  81: { description: 'moderate rain showers', condition: 'rain' },
  82: { description: 'violent rain showers', condition: 'rain' },
  85: { description: 'slight snow showers', condition: 'snow' },
  86: { description: 'heavy snow showers', condition: 'snow' },
  95: { description: 'thunderstorm', condition: 'rain' },
  96: { description: 'thunderstorm with slight hail', condition: 'rain' },
  99: { description: 'thunderstorm with heavy hail', condition: 'rain' },
};

export async function fetchWeather(city) {
  try {
    // Step 1: Geocode city name to get coordinates
    const geoRes = await fetch(
      `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`
    );

    if (!geoRes.ok) {
      throw new Error(`Geocoding API error: ${geoRes.status} ${geoRes.statusText}`);
    }

    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      throw new Error(`City "${city}" not found.`);
    }

    const { latitude, longitude, timezone } = geoData.results[0];

    // Step 2: Get weather data using coordinates
    const weatherRes = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code&temperature_unit=celsius`
    );

    if (!weatherRes.ok) {
      throw new Error(`Weather API error: ${weatherRes.status} ${weatherRes.statusText}`);
    }

    const weatherData = await weatherRes.json();
    const current = weatherData.current;
    const weatherCode = current.weather_code;
    const weatherInfo = weatherCodeMap[weatherCode] || { description: 'unknown', condition: 'clear' };

    // Use timezone from geocoding, weather API, or fallback to UTC
    const cityTimezone = timezone || weatherData.timezone || 'UTC';

    return {
      temperature: Math.round(current.temperature_2m),
      condition: weatherInfo.condition,
      description: weatherInfo.description,
      weatherCode: weatherCode,
      timezone: cityTimezone,
    };
  } catch (error) {
    console.error('Weather API error:', error);
    throw error;
  }
}
