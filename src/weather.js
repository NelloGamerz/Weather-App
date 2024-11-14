import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const API_KEY = '303323be09266cdaa4cc8ca1c45c13ae'; // Replace with your actual API key

const WeatherIcon = ({ condition }) => {
  const getIcon = (condition) => {
    switch (condition.toLowerCase()) {
      case 'clear': return '☀️';
      case 'clouds': return '☁️';
      case 'rain': return '🌧️';
      case 'snow': return '❄️';
      case 'thunderstorm': return '⛈️';
      case 'drizzle': return '🌦️';
      case 'mist':
      case 'smoke':
      case 'haze':
      case 'dust':
      case 'fog':
        return '🌫️';
      default: return '☀️';
    }
  };
  return <span className="text-4xl">{getIcon(condition)}</span>;
};

const RainDrop = ({ delay = 0 }) => (
  <motion.div
    className="absolute bg-blue-400 rounded-full w-1 h-3"
    initial={{ top: "-10%", opacity: 1 }}
    animate={{ top: "110%", opacity: 0 }}
    transition={{
      duration: 1,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    style={{ left: `${Math.random() * 100}%` }}
  />
);

const SnowFlake = ({ delay = 0 }) => (
  <motion.div
    className="absolute text-white text-2xl"
    initial={{ top: "-10%", opacity: 1 }}
    animate={{
      top: "110%",
      opacity: 0,
      rotate: 360,
      x: Math.random() * 100 - 50
    }}
    transition={{
      duration: 5,
      repeat: Infinity,
      delay,
      ease: "linear"
    }}
    style={{ left: `${Math.random() * 100}%` }}
  >
    ❄
  </motion.div>
);

const AnimatedBackground = ({ condition }) => {
  const getGradient = (condition) => {
    switch (condition?.toLowerCase()) {
        case 'clear':
    return ['#1B263B', '#3B5998']; // Dark navy and muted indigo, representing a clear night sky

  case 'clouds':
    return ['#2E3B4E', '#4C5A69']; // Deep charcoal grey and slate, for an overcast feel

  case 'rain':
    return ['#1F2A3C', '#3E5871']; // Dark teal blue and muted blue-grey for rainy vibes

  case 'drizzle':
    return ['#2A3D4C', '#4A6578']; // Deep blue-grey and soft muted teal for light rain

  case 'thunderstorm':
    return ['#2B303A', '#4A5368']; // Charcoal grey and dark muted blue, giving a stormy appearance

  case 'snow':
    return ['#3C4A56', '#5C6B78']; // Steel blue and dark slate grey, reflecting a cold, snowy environment

  case 'mist':
  case 'smoke':
  case 'haze':
  case 'dust':
  case 'fog':
    return ['#39424E', '#53606F']; // Dark foggy grey and soft blue-grey for misty weather

  default:
    return ['#2D3E50', '#44596C']; // Deep blue-grey and muted navy as a fallback
    }
  };

  const [color1, color2] = getGradient(condition);

  return (
    <div className="absolute inset-0 overflow-hidden">
      <div
        className="absolute inset-0 animate-gradient-x"
        style={{
          background: `linear-gradient(-45deg, ${color1}, ${color2}, ${color1})`,
          backgroundSize: '400% 400%',
          animation: 'gradient 15s ease infinite',
        }}
      />
      {(condition === 'rain' || condition === 'drizzle') && (
        <>{[...Array(50)].map((_, i) => <RainDrop key={i} delay={i * 0.1} />)}</>
      )}
      {condition === 'snow' && (
        <>{[...Array(30)].map((_, i) => <SnowFlake key={i} delay={i * 0.2} />)}</>
      )}
    </div>
  );
};

export default function ModernWeatherDashboard() {
  const [city, setCity] = useState('');
  const [loading, setLoading] = useState(false);
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  const fetchWeatherData = async (cityName) => {
    setLoading(true);
    setError(null);
    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${cityName}&units=metric&appid=${API_KEY}`),
        fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&units=metric&appid=${API_KEY}`)
      ]);

      if (!currentResponse.ok || !forecastResponse.ok) {
        throw new Error('Failed to fetch weather data');
      }

      const currentData = await currentResponse.json();
      const forecastData = await forecastResponse.json();

      setWeather({
        current: {
          temp: Math.round(currentData.main.temp),
          condition: currentData.weather[0].main,
          description: currentData.weather[0].description,
          humidity: currentData.main.humidity,
          windSpeed: Math.round(currentData.wind.speed * 3.6),
          feelsLike: Math.round(currentData.main.feels_like),
        },
        forecast: forecastData.list
          .filter((item, index) => index % 8 === 0)
          .slice(0, 5)
          .map((item) => ({
            day: new Date(item.dt * 1000).toLocaleString('en-us', { weekday: 'short' }),
            temp: Math.round(item.main.temp),
            condition: item.weather[0].main,
          })),
      });
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError('Failed to fetch weather data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (city.trim()) {
      fetchWeatherData(city);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 overflow-hidden relative">
      <AnimatedBackground condition={weather?.current?.condition} />
      <div className="w-full max-w-4xl z-10">
        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 text-center drop-shadow-lg"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          SkyCast
        </motion.h1>
        <div className="bg-white bg-opacity-10 backdrop-blur-md rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl">
          <form onSubmit={handleSearch} className="mb-6 sm:mb-8">
            <div className="relative">
              <input
                type="text"
                placeholder="Enter city name"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-4 sm:px-6 py-3 sm:py-4 rounded-full bg-white bg-opacity-20 backdrop-blur-md text-white placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-white text-base sm:text-lg"
                aria-label="City name"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white hover:text-blue-200 transition-colors"
                aria-label="Search"
              >
                🔍
              </button>
            </div>
          </form>

          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-white text-center"
              >
                <div className="animate-spin rounded-full h-12 w-12 sm:h-16 sm:w-16 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-lg sm:text-xl">Fetching weather data...</p>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-center mb-4"
            >
              {error}
            </motion.p>
          )}

          <AnimatePresence>
            {weather && !loading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-white mb-8 sm:mb-12">
                  <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8">
                    <div className="text-center sm:text-left mb-4 sm:mb-0">
                      <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-2">Current Weather</h2>
                      <p className="text-xl sm:text-2xl text-gray-200 capitalize">{weather.current.description}</p>
                    </div>
                    <div className="flex items-center">
                      <WeatherIcon condition={weather.current.condition} />
                      <p className="text-5xl sm:text-6xl md:text-7xl font-bold ml-4">{weather.current.temp}°C</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { icon: '💧', title: 'Humidity', value: `${weather.current.humidity}%` },
                      { icon: '💨', title: 'Wind Speed', value: `${weather.current.windSpeed} km/h` },
                      { icon: '🌡️', title: 'Feels Like', value: `${weather.current.feelsLike}°C` },
                    ].map((item, index) => (
                      <motion.div
                        key={index}
                        className="bg-white bg-opacity-20 rounded-2xl p-4 flex items-center justify-between"
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: "spring", stiffness: 300 }}
                      >
                        <div className="flex items-center">
                          <span className="text-2xl mr-3">{item.icon}</span>
                          <p className="text-base sm:text-lg">{item.title}</p>
                        </div>
                        <p className="text-xl sm:text-2xl font-semibold">{item.value}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl sm:text-3xl font-semibold text-white mb-4 sm:mb-6">5-Day Forecast</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {weather.forecast.map((day, index) => (
                      <motion.div
                        key={day.day}
                        className="bg-white bg-opacity-20 rounded-2xl p-3 sm:p-4 text-center text-white"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                        whileHover={{ scale: 1.05 }}
                      >
                        <p className="font-semibold text-base sm:text-lg mb-2">{day.day}</p>
                        <WeatherIcon condition={day.condition} />
                        <p className="text-xl sm:text-2xl font-bold mt-2">{day.temp}°C</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}