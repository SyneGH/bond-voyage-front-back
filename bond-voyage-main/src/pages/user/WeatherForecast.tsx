import { useState } from "react";
import { CloudRain, Search, Cloud, Sun, Wind, Droplets, Thermometer, Eye } from "lucide-react";
import { ContentCard } from "../../components/ContentCard";
import { StatCard } from "../../components/StatCard";
import { toast } from "sonner@2.0.3";

export function WeatherForecast() {
  const [searchLocation, setSearchLocation] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("Manila");

  const forecast = [
    { day: "Monday", date: "Dec 2", temp: "28°C", condition: "Partly Cloudy", icon: Cloud, humidity: "75%", wind: "12 km/h", precipitation: "20%" },
    { day: "Tuesday", date: "Dec 3", temp: "30°C", condition: "Sunny", icon: Sun, humidity: "70%", wind: "10 km/h", precipitation: "10%" },
    { day: "Wednesday", date: "Dec 4", temp: "27°C", condition: "Rainy", icon: CloudRain, humidity: "85%", wind: "15 km/h", precipitation: "80%" },
    { day: "Thursday", date: "Dec 5", temp: "29°C", condition: "Partly Cloudy", icon: Cloud, humidity: "72%", wind: "11 km/h", precipitation: "15%" },
    { day: "Friday", date: "Dec 6", temp: "31°C", condition: "Sunny", icon: Sun, humidity: "68%", wind: "9 km/h", precipitation: "5%" },
    { day: "Saturday", date: "Dec 7", temp: "28°C", condition: "Cloudy", icon: Cloud, humidity: "78%", wind: "13 km/h", precipitation: "25%" },
    { day: "Sunday", date: "Dec 8", temp: "29°C", condition: "Partly Cloudy", icon: Cloud, humidity: "74%", wind: "10 km/h", precipitation: "18%" }
  ];

  const popularLocations = ["Manila", "Cebu", "Davao", "Boracay", "Palawan", "Baguio"];

  const handleSearch = () => {
    if (searchLocation.trim()) {
      toast.success("Weather updated!", {
        description: `Showing forecast for ${searchLocation}`
      });
      setSelectedLocation(searchLocation);
      setSearchLocation("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Search */}
      <ContentCard title="Search Location" icon={Search}>
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" strokeWidth={2} />
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
                background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                color: 'white'
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
                    description: "Weather forecast updated"
                  });
                }}
                className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                  selectedLocation === loc
                    ? "shadow-md"
                    : "bg-accent text-card-foreground hover:bg-accent/80"
                }`}
                style={selectedLocation === loc ? {
                  background: 'linear-gradient(135deg, var(--gradient-from), var(--gradient-to))',
                  color: 'white'
                } : undefined}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>
      </ContentCard>

      {/* Current Weather Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 sm:gap-6">
        <StatCard
          icon={Thermometer}
          label="Temperature"
          value="28°C"
          trend="Feels like 30°C"
          trendUp={true}
        />
        <StatCard
          icon={Droplets}
          label="Humidity"
          value="75%"
          trend="Moderate"
          trendUp={false}
        />
        <StatCard
          icon={Wind}
          label="Wind Speed"
          value="12 km/h"
          trend="Light breeze"
          trendUp={false}
        />
        <StatCard
          icon={Eye}
          label="Visibility"
          value="10 km"
          trend="Excellent"
          trendUp={true}
        />
      </div>

      {/* Current Weather */}
      <ContentCard title={`Current Weather in ${selectedLocation}`} icon={Sun}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            className="p-8 rounded-2xl text-white shadow-lg"
            style={{
              background: 'linear-gradient(135deg, #3B82F6, #2563EB)'
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm opacity-90 mb-1">Today</p>
                <h2 className="text-5xl mb-2">28°C</h2>
                <p className="text-sm opacity-90">Partly Cloudy</p>
              </div>
              <Cloud className="w-20 h-20 opacity-80" strokeWidth={1.5} />
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm pt-4 border-t border-white/20">
              <div>
                <p className="opacity-75 mb-1">Humidity</p>
                <p className="text-lg">75%</p>
              </div>
              <div>
                <p className="opacity-75 mb-1">Wind</p>
                <p className="text-lg">12 km/h</p>
              </div>
              <div>
                <p className="opacity-75 mb-1">Rain</p>
                <p className="text-lg">20%</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="p-5 bg-gradient-to-br from-blue-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Droplets className="w-5 h-5 text-blue-500" strokeWidth={2} />
                <span className="text-sm text-muted-foreground">Humidity</span>
              </div>
              <p className="text-3xl text-card-foreground">75%</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-green-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-5 h-5 text-green-500" strokeWidth={2} />
                <span className="text-sm text-muted-foreground">Wind Speed</span>
              </div>
              <p className="text-3xl text-card-foreground">12 km/h</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-purple-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <CloudRain className="w-5 h-5 text-purple-500" strokeWidth={2} />
                <span className="text-sm text-muted-foreground">Precipitation</span>
              </div>
              <p className="text-3xl text-card-foreground">20%</p>
            </div>
            <div className="p-5 bg-gradient-to-br from-orange-500/10 to-transparent border border-border rounded-xl hover:border-primary/50 transition-all">
              <div className="flex items-center gap-2 mb-3">
                <Eye className="w-5 h-5 text-orange-500" strokeWidth={2} />
                <span className="text-sm text-muted-foreground">Visibility</span>
              </div>
              <p className="text-3xl text-card-foreground">10 km</p>
            </div>
          </div>
        </div>
      </ContentCard>

      {/* 7-Day Forecast */}
      <ContentCard title="7-Day Forecast" icon={CloudRain}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {forecast.map((day, index) => {
            const Icon = day.icon;
            return (
              <div 
                key={index} 
                className="p-5 bg-card border border-border rounded-xl hover:shadow-lg hover:border-primary/50 transition-all group"
              >
                <div className="text-center mb-4">
                  <p className="text-sm text-card-foreground mb-1">{day.day}</p>
                  <p className="text-xs text-muted-foreground">{day.date}</p>
                </div>
                <div className="flex items-center justify-center mb-4">
                  <Icon className={`w-14 h-14 ${
                    day.condition === "Sunny" ? "text-yellow-500" :
                    day.condition === "Rainy" ? "text-blue-500" :
                    "text-gray-500"
                  } group-hover:scale-110 transition-transform`} strokeWidth={1.5} />
                </div>
                <p className="text-center text-3xl text-card-foreground mb-2">{day.temp}</p>
                <p className="text-center text-xs text-muted-foreground mb-4">{day.condition}</p>
                <div className="space-y-2 text-xs pt-4 border-t border-border">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Humidity:</span>
                    <span className="text-card-foreground">{day.humidity}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Wind:</span>
                    <span className="text-card-foreground">{day.wind}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rain:</span>
                    <span className="text-card-foreground">{day.precipitation}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </ContentCard>
    </div>
  );
}
