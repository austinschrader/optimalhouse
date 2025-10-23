import React, { useState } from "react";
import { Filter, MapPin, Heart, Shield, GraduationCap, Bus, Sun, Trees, Coffee, DollarSign, Users, Building } from "lucide-react";

type Scale = "global" | "cultural" | "city" | "neighborhood" | "local";
type FilterId = "family_friendly" | "safety" | "education" | "transport" | "weather" | "nature" | "culture" | "cost";

interface ScaleOption {
  id: Scale;
  label: string;
}

interface FilterOption {
  id: FilterId;
  label: string;
  icon: React.ReactNode;
}

interface RankingItem {
  name: string;
  score: number;
}

interface Rankings {
  global: RankingItem[];
  cities: RankingItem[];
}

const CityRankingMap = () => {
  const [selectedScale, setSelectedScale] = useState<Scale>("city");
  const [selectedFilters, setSelectedFilters] = useState<FilterId[]>(["family_friendly"]);

  const scales: ScaleOption[] = [
    { id: "global", label: "Global Regions" },
    { id: "cultural", label: "Cultural Regions" },
    { id: "city", label: "Cities" },
    { id: "neighborhood", label: "Neighborhoods" },
    { id: "local", label: "Local Spots" },
  ];

  const filters: FilterOption[] = [
    { id: "family_friendly", label: "Family Friendly", icon: <Users className="w-4 h-4" /> },
    { id: "safety", label: "Safety", icon: <Shield className="w-4 h-4" /> },
    { id: "education", label: "Education", icon: <GraduationCap className="w-4 h-4" /> },
    { id: "transport", label: "Transportation", icon: <Bus className="w-4 h-4" /> },
    { id: "weather", label: "Climate", icon: <Sun className="w-4 h-4" /> },
    { id: "nature", label: "Nature Access", icon: <Trees className="w-4 h-4" /> },
    { id: "culture", label: "Culture", icon: <Coffee className="w-4 h-4" /> },
    { id: "cost", label: "Cost of Living", icon: <DollarSign className="w-4 h-4" /> },
  ];

  const rankings: Rankings = {
    global: [
      { name: "Western Europe", score: 8.5 },
      { name: "North America", score: 8.2 },
      { name: "Oceania", score: 8.0 },
    ],
    cities: [
      { name: "Copenhagen", score: 9.2 },
      { name: "Vienna", score: 9.0 },
      { name: "Zurich", score: 8.9 },
    ],
  };

  const toggleFilter = (filterId: FilterId) => {
    setSelectedFilters((prev) => (prev.includes(filterId) ? prev.filter((f) => f !== filterId) : [...prev, filterId]));
  };

  return (
    <div className="h-screen flex bg-background text-foreground">
      {/* Left Sidebar */}
      <div className="w-64 border-r border-border p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <MapPin className="w-5 h-5 mr-2" />
            Scale
          </h2>
          <div className="space-y-2">
            {scales.map((scale) => (
              <button
                key={scale.id}
                onClick={() => setSelectedScale(scale.id)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedScale === scale.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}>
                {scale.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3 flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </h2>
          <div className="space-y-2">
            {filters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded transition-colors ${
                  selectedFilters.includes(filter.id) ? "bg-primary/10 text-primary" : "hover:bg-muted"
                }`}>
                <span className="flex items-center">
                  {filter.icon}
                  <span className="ml-2">{filter.label}</span>
                </span>
                {selectedFilters.includes(filter.id) && <Heart className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-3">Top Ranked</h2>
          <div className="space-y-3">
            {rankings[selectedScale === "city" ? "cities" : "global"].slice(0, 5).map((item, index) => (
              <div key={item.name} className="flex items-center justify-between p-2 bg-muted rounded">
                <span className="flex items-center">
                  <span className="w-6 text-muted-foreground">{index + 1}.</span>
                  {item.name}
                </span>
                <span className="text-primary font-medium">{item.score.toFixed(1)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Map Area */}
      <div className="flex-1 bg-muted/30 p-4">
        <div className="bg-background rounded-lg p-4 mb-4 flex items-center justify-between border border-border">
          <div className="flex items-center space-x-4">
            <Building className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-semibold">Global City Rankings</h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Zoom Level:</span>
          </div>
        </div>

        <div className="bg-background rounded-lg p-4 h-[calc(100vh-8rem)] border border-border">
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>Map visualization would render here with:</p>
            <ul className="list-disc ml-6">
              <li>Heat map overlay based on selected filters</li>
              <li>Color gradient showing ranking scores</li>
              <li>Zoom levels matching selected scale</li>
              <li>Interactive markers for detailed info</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CityRankingMap;
