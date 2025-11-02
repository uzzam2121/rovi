import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Cloud, CloudRain, Sun, Wind, Snowflake, Droplets } from 'lucide-react';
import { fetchWeather } from '../utils/weather';

export default function WeatherWidget({ city, onCityChange, onTimezoneChange }) {
  const [weather, setWeather] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (city) {
      fetchWeatherData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city]);

  const fetchWeatherData = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchWeather(city);
      setWeather(data);
      if (data.timezone && onTimezoneChange) {
        onTimezoneChange(data.timezone);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch weather');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWeatherIcon = () => {
    if (!weather) return <Sun className="w-6 h-6" />;
    const condition = weather.condition;
    if (condition === 'rain') return <CloudRain className="w-6 h-6" />;
    if (condition === 'snow') return <Snowflake className="w-6 h-6" />;
    if (condition === 'cloud') return <Cloud className="w-6 h-6" />;
    if (condition === 'fog') return <Droplets className="w-6 h-6" />;
    return <Sun className="w-6 h-6" />;
  };

  const formatWeatherDisplay = () => {
    if (!weather) return 'N/A';
    return `${weather.temperature}°C and ${weather.description}`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg p-4 text-white shadow-lg shadow-yellow-600/30 w-full border border-yellow-600/30"
      style={{ backgroundColor: '#0C090A' }}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {getWeatherIcon()}
          <div className="flex-1">
            <h3 className="font-semibold text-lg">Weather</h3>
            {loading ? (
              <p className="text-sm opacity-90">Loading...</p>
            ) : error ? (
              <p className="text-sm opacity-90">{error}</p>
            ) : (
              <p className="text-sm opacity-90">{formatWeatherDisplay()}</p>
            )}
          </div>
        </div>
        <div className="shrink-0">
          <input
            type="text"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                fetchWeatherData();
              }
            }}
            placeholder="Enter city"
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-md px-3 py-1 text-sm text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 w-32"
          />
        </div>
      </div>
    </motion.div>
  );
}
