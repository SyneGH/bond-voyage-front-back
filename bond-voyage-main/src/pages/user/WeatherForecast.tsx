import { useState, useEffect } from "react";
import {
  CloudRain,
  Search,
  Cloud,
  Sun,
  Wind,
  Droplets,
  Thermometer,
  Eye,
  Loader2,
  Gauge,
  Sunrise,
  Sunset,
  MapPin,
} from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { toast } from "sonner";
import { useWeather } from "../../hooks/useWeather";

// Location coordinates for popular cities
const locationCoordinates: Record<string, { lat: number; lng: number }> = {
  Manila: { lat: 14.5995, lng: 120.9842 },
  Cebu: { lat: 10.3157, lng: 123.8854 },
  Davao: { lat: 7.1907, lng: 125.4553 },
  Boracay: { lat: 11.9674, lng: 121.9248 },
  Palawan: { lat: 9.8349, lng: 118.7384 },
  Baguio: { lat: 16.4023, lng: 120.596 },
};

export function WeatherForecast() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Manila");
  const [coordinates, setCoordinates] = useState(locationCoordinates.Manila);

  // Fetch weather data using the custom hook
  const { data: weatherData, isLoading, error } = useWeather(coordinates);

  // Update coordinates when location changes
  useEffect(() => {
    const coords = locationCoordinates[selectedLocation];
    if (coords) {
      setCoordinates(coords);
    }
  }, [selectedLocation]);

  const popularLocations = [
    "Manila",
    "Cebu",
    "Davao",
    "Boracay",
    "Palawan",
    "Baguio",
  ];

  const handleSearch = () => {
    if (searchLocation.trim()) {
      const location = searchLocation.trim();
      const coords = locationCoordinates[location];

      if (coords) {
        toast.success("Weather updated!", {
          description: `Showing forecast for ${location}`,
        });
        setSelectedLocation(location);
        setCoordinates(coords);
      } else {
        toast.error("Location not found", {
          description:
            "Please select from popular locations or enter a valid city",
        });
      }
      setSearchLocation("");
    }
  };

  // Get weather icon based on condition
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case "clear":
        return Sun;
      case "clouds":
        return Cloud;
      case "rain":
      case "drizzle":
        return CloudRain;
      default:
        return Cloud;
    }
  };

  // Format temperature
  const formatTemp = (temp: number) => `${Math.round(temp)}°C`;

  // Format wind speed (convert m/s to km/h)
  const formatWind = (speed: number) => `${Math.round(speed * 3.6)} km/h`;

  // Format time from timestamp
  const formatTime = (timestamp: number, timezone: number) => {
    const date = new Date((timestamp + timezone) * 1000);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "UTC",
    });
  };

  // Get wind direction
  const getWindDirection = (deg: number) => {
    const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
    const index = Math.round(deg / 45) % 8;
    return directions[index];
  };

  // Generate 7-day forecast based on current weather (estimated)
  const generateForecast = (weather: typeof currentWeather) => {
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const months = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
    const currentDate = new Date();
    const baseTemp = weather.main.temp;

    const forecast = [];

    for (let i = 1; i <= 7; i++) {
      const futureDate = new Date(currentDate);
      futureDate.setDate(currentDate.getDate() + i);

      // Generate slight variations in temperature
      const tempVariation = (Math.random() - 0.5) * 4;
      const temp = Math.round(baseTemp + tempVariation);

      // Randomly assign weather conditions with some logic
      const conditions = [
        {
          name: "Sunny",
          icon: Sun,
          precipitation: Math.floor(Math.random() * 15),
        },
        {
          name: "Partly Cloudy",
          icon: Cloud,
          precipitation: Math.floor(Math.random() * 30) + 10,
        },
        {
          name: "Cloudy",
          icon: Cloud,
          precipitation: Math.floor(Math.random() * 40) + 20,
        },
        {
          name: "Rainy",
          icon: CloudRain,
          precipitation: Math.floor(Math.random() * 40) + 60,
        },
      ];

      // Bias towards current weather pattern
      let condition;
      if (weather.weather[0].main === "Rain") {
        condition = conditions[Math.random() > 0.3 ? 3 : 2];
      } else if (weather.weather[0].main === "Clear") {
        condition = conditions[Math.random() > 0.3 ? 0 : 1];
      } else {
        condition = conditions[Math.floor(Math.random() * conditions.length)];
      }

      forecast.push({
        day: days[futureDate.getDay()],
        date: `${months[futureDate.getMonth()]} ${futureDate.getDate()}`,
        temp: `${temp}°C`,
        condition: condition.name,
        icon: condition.icon,
        humidity: `${Math.floor(
          weather.main.humidity + (Math.random() - 0.5) * 10
        )}%`,
        wind: formatWind(weather.wind.speed + (Math.random() - 0.5) * 2),
        precipitation: `${condition.precipitation}%`,
      });
    }

    return forecast;
  };

  // Get current weather data
  const currentWeather = weatherData?.data;
  const CurrentWeatherIcon = currentWeather
    ? getWeatherIcon(currentWeather.weather[0].main)
    : Cloud;

  useEffect(() => {
    if (error) {
      toast.error("Failed to fetch weather data", {
        description: "Please try again later",
      });
    }
  }, [error]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <ContentCard title="Search Location" icon={Search}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                strokeWidth={2}
              />
              <input
                type="text"
                placeholder="Search for a location..."
                value={searchLocation}
                onChange={(e) => setSearchLocation(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="w-full pl-10 pr-4 py-3 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 rounded-xl transition-all shadow-md hover:shadow-lg whitespace-nowrap"
              style={{
                background:
                  "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                color: "white",
              }}
            >
              Search
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-muted-foreground">Popular:</span>
            {popularLocations.map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  setSelectedLocation(loc);
                  toast.info(`Switched to ${loc}`, {
                    description: "Weather forecast updated",
                  });
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedLocation === loc
                    ? "shadow-md"
                    : "bg-accent text-card-foreground hover:bg-accent/80"
                }`}
                style={
                  selectedLocation === loc
                    ? {
                        background:
                          "linear-gradient(135deg, var(--gradient-from), var(--gradient-to))",
                        color: "white",
                      }
                    : undefined
                }
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </ContentCard>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : currentWeather ? (
        <>
          {/* Location Info */}
          <ContentCard title="Location Details" icon={MapPin}>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 bg-accent/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">City</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {currentWeather.name}
                </p>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">Country</p>
                <p className="text-lg font-semibold text-card-foreground">
                  {currentWeather.sys.country}
                </p>
              </div>
              <div className="p-4 bg-accent/50 rounded-xl">
                <p className="text-sm text-muted-foreground mb-1">
                  Coordinates
                </p>
                <p className="text-lg font-semibold text-card-foreground">
                  {currentWeather.coord.lat.toFixed(4)}°,{" "}
                  {currentWeather.coord.lon.toFixed(4)}°
                </p>
              </div>
            </div>
          </ContentCard>

          {/* Current Weather Stats - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Thermometer}
              label="Temperature"
              value={formatTemp(currentWeather.main.temp)}
              trend={
                currentWeather.main.feels_like > currentWeather.main.temp
                  ? "up"
                  : "down"
              }
              change={Math.abs(
                Math.round(
                  ((currentWeather.main.feels_like - currentWeather.main.temp) /
                    currentWeather.main.temp) *
                    100
                )
              )}
              gradientFrom="#F97316"
              gradientTo="#EA580C"
              isLoading={isLoading}
            />
            <StatCard
              icon={Thermometer}
              label="Feels Like"
              value={formatTemp(currentWeather.main.feels_like)}
              trend={
                currentWeather.main.feels_like > currentWeather.main.temp
                  ? "up"
                  : "down"
              }
              gradientFrom="#EF4444"
              gradientTo="#DC2626"
              isLoading={isLoading}
            />
            <StatCard
              icon={Droplets}
              label="Humidity"
              value={`${currentWeather.main.humidity}%`}
              trend={currentWeather.main.humidity > 70 ? "up" : "down"}
              gradientFrom="#3B82F6"
              gradientTo="#2563EB"
              isLoading={isLoading}
            />
            <StatCard
              icon={Eye}
              label="Visibility"
              value={`${(currentWeather.visibility / 1000).toFixed(1)} km`}
              trend={currentWeather.visibility >= 10000 ? "up" : "down"}
              gradientFrom="#8B5CF6"
              gradientTo="#7C3AED"
              isLoading={isLoading}
            />
          </div>

          {/* Current Weather Stats - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <StatCard
              icon={Wind}
              label="Wind Speed"
              value={formatWind(currentWeather.wind.speed)}
              trend="up"
              gradientFrom="#10B981"
              gradientTo="#059669"
              isLoading={isLoading}
            />
            <StatCard
              icon={Gauge}
              label="Pressure"
              value={`${currentWeather.main.pressure} hPa`}
              trend={currentWeather.main.pressure > 1013 ? "up" : "down"}
              gradientFrom="#6366F1"
              gradientTo="#4F46E5"
              isLoading={isLoading}
            />
            <StatCard
              icon={Cloud}
              label="Cloudiness"
              value={`${currentWeather.clouds.all}%`}
              trend={currentWeather.clouds.all > 50 ? "up" : "down"}
              gradientFrom="#64748B"
              gradientTo="#475569"
              isLoading={isLoading}
            />
            {currentWeather.rain && (
              <StatCard
                icon={CloudRain}
                label="Rain (1h)"
                value={`${currentWeather.rain["1h"]} mm`}
                trend="up"
                gradientFrom="#0EA5E9"
                gradientTo="#0284C7"
                isLoading={isLoading}
              />
            )}
          </div>

          {/* Temperature Range */}
          <ContentCard title="Temperature Range" icon={Thermometer}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Thermometer
                      className="w-5 h-5 text-orange-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    Maximum
                  </span>
                </div>
                <p className="text-4xl text-card-foreground font-bold">
                  {formatTemp(currentWeather.main.temp_max)}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-blue-500/10 to-transparent border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <Thermometer
                      className="w-5 h-5 text-blue-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    Minimum
                  </span>
                </div>
                <p className="text-4xl text-card-foreground font-bold">
                  {formatTemp(currentWeather.main.temp_min)}
                </p>
              </div>
            </div>
          </ContentCard>

          {/* Sun Times */}
          <ContentCard title="Sunrise & Sunset" icon={Sunrise}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-6 bg-gradient-to-br from-yellow-500/10 to-transparent border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                    <Sunrise
                      className="w-5 h-5 text-yellow-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    Sunrise
                  </span>
                </div>
                <p className="text-3xl text-card-foreground font-bold">
                  {formatTime(
                    currentWeather.sys.sunrise,
                    currentWeather.timezone
                  )}
                </p>
              </div>
              <div className="p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-border rounded-xl">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Sunset
                      className="w-5 h-5 text-orange-500"
                      strokeWidth={2}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground font-medium">
                    Sunset
                  </span>
                </div>
                <p className="text-3xl text-card-foreground font-bold">
                  {formatTime(
                    currentWeather.sys.sunset,
                    currentWeather.timezone
                  )}
                </p>
              </div>
            </div>
          </ContentCard>

          {/* 7-Day Forecast */}
          <ContentCard title="7-Day Forecast" icon={CloudRain}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {generateForecast(currentWeather).map((day, index) => {
                const Icon = day.icon;
                return (
                  <div
                    key={index}
                    className="p-5 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/50 transition-all group"
                  >
                    <div className="text-center mb-4">
                      <p className="text-sm text-card-foreground mb-1">
                        {day.day}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {day.date}
                      </p>
                    </div>
                    <div className="flex items-center justify-center mb-4">
                      <Icon
                        className={`w-14 h-14 ${
                          day.condition === "Sunny"
                            ? "text-yellow-500"
                            : day.condition === "Rainy"
                            ? "text-blue-500"
                            : "text-gray-500"
                        } group-hover:scale-110 transition-transform`}
                        strokeWidth={1.5}
                      />
                    </div>
                    <p className="text-center text-3xl text-card-foreground mb-2">
                      {day.temp}
                    </p>
                    <p className="text-center text-xs text-muted-foreground mb-4">
                      {day.condition}
                    </p>
                    <div className="space-y-2 text-xs pt-4 border-t border-border">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Humidity:</span>
                        <span className="text-card-foreground">
                          {day.humidity}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Wind:</span>
                        <span className="text-card-foreground">{day.wind}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Rain:</span>
                        <span className="text-card-foreground">
                          {day.precipitation}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </ContentCard>

          {/* Current Weather Main Card */}
          <ContentCard
            title={`Current Weather in ${currentWeather.name}`}
            icon={Sun}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div
                className="p-8 rounded-2xl text-white shadow-lg"
                style={{
                  background: "linear-gradient(135deg, #3B82F6, #2563EB)",
                }}
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-sm opacity-90 mb-1">Right Now</p>
                    <h2 className="text-5xl mb-2">
                      {formatTemp(currentWeather.main.temp)}
                    </h2>
                    <p className="text-sm opacity-90 capitalize mb-1">
                      {currentWeather.weather[0].description}
                    </p>
                    <p className="text-xs opacity-75">
                      Feels like {formatTemp(currentWeather.main.feels_like)}
                    </p>
                  </div>
                  <CurrentWeatherIcon
                    className="w-20 h-20 opacity-80"
                    strokeWidth={1.5}
                  />
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t border-white/20">
                  <div>
                    <p className="opacity-75 mb-1">Humidity</p>
                    <p className="text-lg">{currentWeather.main.humidity}%</p>
                  </div>
                  <div>
                    <p className="opacity-75 mb-1">Wind</p>
                    <p className="text-lg">
                      {formatWind(currentWeather.wind.speed)}
                    </p>
                  </div>
                  <div>
                    <p className="opacity-75 mb-1">Clouds</p>
                    <p className="text-lg">{currentWeather.clouds.all}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge className="w-5 h-5 text-blue-500" strokeWidth={2} />
                    <span className="text-sm text-muted-foreground">
                      Pressure
                    </span>
                  </div>
                  <p className="text-2xl text-card-foreground font-semibold mb-1">
                    {currentWeather.main.pressure}
                  </p>
                  <p className="text-xs text-muted-foreground">hPa</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Wind className="w-5 h-5 text-green-500" strokeWidth={2} />
                    <span className="text-sm text-muted-foreground">
                      Wind Dir
                    </span>
                  </div>
                  <p className="text-2xl text-card-foreground font-semibold mb-1">
                    {getWindDirection(currentWeather.wind.deg)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {currentWeather.wind.deg}°
                  </p>
                </div>
                <div className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge
                      className="w-5 h-5 text-purple-500"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-muted-foreground">
                      Sea Level
                    </span>
                  </div>
                  <p className="text-2xl text-card-foreground font-semibold mb-1">
                    {currentWeather.main.sea_level}
                  </p>
                  <p className="text-xs text-muted-foreground">hPa</p>
                </div>
                <div className="p-5 bg-gradient-to-br from-orange-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
                  <div className="flex items-center gap-2 mb-3">
                    <Gauge
                      className="w-5 h-5 text-orange-500"
                      strokeWidth={2}
                    />
                    <span className="text-sm text-muted-foreground">
                      Ground Level
                    </span>
                  </div>
                  <p className="text-2xl text-card-foreground font-semibold mb-1">
                    {currentWeather.main.grnd_level}
                  </p>
                  <p className="text-xs text-muted-foreground">hPa</p>
                </div>
              </div>
            </div>
          </ContentCard>
        </>
      ) : (
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">No weather data available</p>
        </div>
      )}
    </div>
  );
}
