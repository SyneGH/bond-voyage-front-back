import { useState } from "react";
import {
  Sparkles,
  MapPin,
  Calendar,
  Users,
  Heart,
  Utensils,
  Camera,
  Waves,
  Mountain,
  Palmtree,
  Loader2,
  Check,
  Plane,
  Hotel,
  Car,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ContentCard } from "../../components/ContentCard";
import { toast } from "sonner@2.0.3";
import { useBookings } from "../../components/BookingContext";
import { ConfirmationModal } from "../../components/ConfirmationModal";
import { FAQAssistant } from "../../components/FAQAssistant";

export function SmartTrip() {
  const navigate = useNavigate();
  const { addUserTravel, moveUserTravelToPending } = useBookings();
  const [step, setStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedTrip, setGeneratedTrip] = useState<any>(null);
  const [savedTripId, setSavedTripId] = useState<string | null>(null);
  const [showRegenerateModal, setShowRegenerateModal] = useState(false);

  const [formData, setFormData] = useState({
    destination: "",
    startDate: "",
    endDate: "",
    travelers: "0",
    budget: "",
    preferences: [] as string[],
    accommodationType: "hotel",
    travelPace: "",
  });

  const preferenceOptions = [
    { id: "beach", label: "Beach & Islands", icon: Waves },
    { id: "mountain", label: "Mountains & Hiking", icon: Mountain },
    { id: "culture", label: "Culture & Heritage", icon: Camera },
    { id: "food", label: "Food & Cuisine", icon: Utensils },
    { id: "adventure", label: "Adventure Sports", icon: Palmtree },
    { id: "relaxation", label: "Relaxation & Spa", icon: Heart },
  ];

  const handlePreferenceToggle = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      preferences: prev.preferences.includes(id)
        ? prev.preferences.filter((p) => p !== id)
        : [...prev.preferences, id],
    }));
  };

  const calculateDaysAndNights = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const days =
      Math.ceil(
        (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
      ) + 1;
    const nights = days - 1;
    return { days, nights };
  };

  const handleSaveToTravels = () => {
    // Generate unique ID
    const newTripId = `TP-${Date.now().toString().slice(-6)}`;

    // Calculate date range string
    const startDate = new Date(formData.startDate);
    const endDate = new Date(formData.endDate);
    const dateRange = `${startDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })} – ${endDate.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    })}`;

    // Create new travel with full itinerary structure
    const newTravel = {
      id: newTripId,
      destination: formData.destination,
      startDate: formData.startDate,
      endDate: formData.endDate,
      travelers: parseInt(formData.travelers),
      budget: formData.budget
        ? `₱${parseInt(formData.budget).toLocaleString()}`
        : generatedTrip?.totalCost || "₱0",
      status: "in-progress" as const,
      bookingType: "Customized" as const,
      bookingSource: "Generated" as const,
      ownership: "owned" as const,
      owner: "Maria Santos",
      collaborators: [],
      createdOn: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
      itinerary: generatedTrip?.itinerary || [],
    };

    // Add to context
    addUserTravel(newTravel);

    // Store the ID for navigation
    setSavedTripId(newTripId);

    toast.success("Trip saved to your travels!", {
      description: "Redirecting to In Progress tab...",
    });

    // Navigate to UserTravels after a short delay
    setTimeout(() => {
      navigate("/user/travels", {
        state: { scrollToId: newTripId, tab: "in-progress" },
      });
    }, 800);
  };

  const handleGenerate = () => {
    if (!formData.destination || !formData.startDate || !formData.endDate) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { days, nights } = calculateDaysAndNights(
      formData.startDate,
      formData.endDate
    );

    setIsGenerating(true);

    setTimeout(() => {
      // Generate itinerary based on calculated days
      const generatedItinerary = Array.from({ length: days }, (_, index) => {
        const dayNum = index + 1;

        if (dayNum === 1) {
          return {
            day: dayNum,
            title: "Arrival & Beach Exploration",
            activities: [
              {
                time: "10:00 AM",
                icon: Plane,
                title: "Arrival at Airport",
                description: "Meet and greet with tour guide",
                location: formData.destination,
              },
              {
                time: "12:00 PM",
                icon: Car,
                title: "Transfer to Hotel",
                description: "Scenic drive to beachfront resort",
                location: `${formData.destination} City Center`,
              },
              {
                time: "2:00 PM",
                icon: Hotel,
                title: "Check-in at Resort",
                description: "Settle in at beachfront resort",
                location: "Beachfront Resort",
              },
              {
                time: "6:00 PM",
                icon: Camera,
                title: "Sunset Beach Walk",
                description: "Enjoy the sunset view at the beach",
                location: "Main Beach",
              },
              {
                time: "8:00 PM",
                icon: Utensils,
                title: "Welcome Dinner",
                description: "Fresh seafood at local restaurant",
                location: "Seaside Restaurant",
              },
            ],
          };
        } else if (dayNum === days) {
          return {
            day: dayNum,
            title: "Departure & Last Moments",
            activities: [
              {
                time: "7:00 AM",
                icon: Utensils,
                title: "Sunrise Breakfast",
                description: "Final breakfast with ocean view",
                location: "Resort Restaurant",
              },
              {
                time: "9:00 AM",
                icon: Camera,
                title: "Last-minute Shopping",
                description: "Pick up souvenirs and local products",
                location: "Souvenir Shop",
              },
              {
                time: "12:00 PM",
                icon: Car,
                title: "Airport Transfer",
                description: "Transfer to airport for departure",
                location: "Airport",
              },
            ],
          };
        } else if (dayNum === 2) {
          return {
            day: dayNum,
            title: "Island Hopping Adventure",
            activities: [
              {
                time: "7:00 AM",
                icon: Utensils,
                title: "Breakfast",
                description: "Breakfast at hotel",
                location: "Resort",
              },
              {
                time: "9:00 AM",
                icon: Waves,
                title: "Visit Secret Lagoon",
                description: "Explore the beautiful hidden lagoon",
                location: "Secret Lagoon",
              },
              {
                time: "11:00 AM",
                icon: Camera,
                title: "Snorkeling at Coral Reefs",
                description: "Discover underwater marine life",
                location: "Coral Garden",
              },
              {
                time: "1:00 PM",
                icon: Utensils,
                title: "Beach BBQ Lunch",
                description: "Delicious BBQ lunch on the beach",
                location: "Paradise Beach",
              },
              {
                time: "5:00 PM",
                icon: Camera,
                title: "Sunset Viewing Point",
                description: "Panoramic sunset view",
                location: "Hilltop Viewpoint",
              },
            ],
          };
        } else if (dayNum === 3) {
          return {
            day: dayNum,
            title: "Cultural & Nature Experience",
            activities: [
              {
                time: "7:00 AM",
                icon: Mountain,
                title: "Mountain Hiking Tour",
                description: "Trek through scenic mountain trails",
                location: "Mountain Trail",
              },
              {
                time: "11:00 AM",
                icon: Camera,
                title: "Visit Local Village",
                description: "Experience local culture and traditions",
                location: "Traditional Village",
              },
              {
                time: "2:00 PM",
                icon: Utensils,
                title: "Traditional Cooking Class",
                description: "Learn to cook local delicacies",
                location: "Cultural Center",
              },
              {
                time: "7:00 PM",
                icon: Camera,
                title: "Night Market Exploration",
                description: "Browse local crafts and street food",
                location: "Night Market",
              },
            ],
          };
        } else {
          return {
            day: dayNum,
            title: "Relaxation & Spa Day",
            activities: [
              {
                time: "7:00 AM",
                icon: Heart,
                title: "Morning Yoga Session",
                description: "Beachside yoga and meditation",
                location: "Resort Beach",
              },
              {
                time: "10:00 AM",
                icon: Heart,
                title: "Traditional Filipino Massage",
                description: "Relaxing spa treatment",
                location: "Resort Spa",
              },
              {
                time: "2:00 PM",
                icon: Waves,
                title: "Pool Time & Leisure",
                description: "Free time to relax by the pool",
                location: "Resort Pool",
              },
              {
                time: "7:00 PM",
                icon: Utensils,
                title: "Fine Dining Experience",
                description: "Gourmet dinner at resort restaurant",
                location: "Fine Dining Restaurant",
              },
            ],
          };
        }
      });

      setGeneratedTrip({
        title: `${formData.destination}`,
        duration: `${days} ${days > 1 ? "Days" : "Day"}, ${nights} ${
          nights > 1 ? "Nights" : "Night"
        }`,
        totalCost: "₱" + (parseInt(formData.budget) || 45000).toLocaleString(),
        itinerary: generatedItinerary,
        inclusions: [
          `${nights} ${nights > 1 ? "nights" : "night"} accommodation`,
          "Daily breakfast",
          "Airport transfers",
          "Island hopping tour",
          "Entrance fees",
          "Tour guide services",
        ],
      });
      setIsGenerating(false);
      setStep(2);
    }, 3000);
  };

  const handleRegenerateTrip = () => {
    setShowRegenerateModal(false);
    setStep(1);
    setGeneratedTrip(null);
    setFormData({
      destination: "",
      startDate: "",
      endDate: "",
      travelers: "0",
      budget: "",
      preferences: [],
      accommodationType: "hotel",
      travelPace: "",
    });
  };

  return (
    <div className="space-y-6">
      {step === 1 && (
        <>
          {/* Trip Details Form */}
          <ContentCard title="Trip Details" icon={MapPin}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Destination <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    type="text"
                    placeholder="e.g., Palawan, Boracay, Cebu"
                    value={formData.destination}
                    onChange={(e) =>
                      setFormData({ ...formData, destination: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Budget (PHP)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    ₱
                  </span>
                  <input
                    type="number"
                    placeholder="Total budget for all travelers"
                    value={formData.budget}
                    onChange={(e) =>
                      setFormData({ ...formData, budget: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Start Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) =>
                      setFormData({ ...formData, startDate: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) =>
                      setFormData({ ...formData, endDate: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Number of Travelers
                </label>
                <div className="relative">
                  <Users
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"
                    strokeWidth={2}
                  />
                  <input
                    type="number"
                    min="1"
                    placeholder="e.g., 2"
                    value={formData.travelers}
                    onChange={(e) =>
                      setFormData({ ...formData, travelers: e.target.value })
                    }
                    className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm mb-2 text-card-foreground">
                  Travel Pace
                </label>
                <select
                  value={formData.travelPace}
                  onChange={(e) =>
                    setFormData({ ...formData, travelPace: e.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-card border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary appearance-none transition-all"
                >
                  <option value="">Choose your own pace</option>
                  <option value="relaxed">Relaxed - Lots of free time</option>
                  <option value="moderate">
                    Moderate - Balanced itinerary
                  </option>
                  <option value="packed">Packed - See everything</option>
                </select>
              </div>
            </div>
          </ContentCard>

          {/* Preferences */}
          <ContentCard title="Your Preferences" icon={Heart}>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {preferenceOptions.map((pref) => {
                const Icon = pref.icon;
                const isSelected = formData.preferences.includes(pref.id);
                return (
                  <button
                    key={pref.id}
                    onClick={() => handlePreferenceToggle(pref.id)}
                    className={`p-5 border-2 rounded-xl transition-all duration-200 ${
                      isSelected
                        ? "border-primary shadow-md"
                        : "border-border hover:border-primary/50 hover:shadow-sm"
                    }`}
                    style={
                      isSelected
                        ? {
                            background:
                              "linear-gradient(135deg, var(--primary-rgb-10), transparent)",
                          }
                        : undefined
                    }
                  >
                    <Icon
                      className={`w-7 h-7 mx-auto mb-2 ${
                        isSelected ? "text-primary" : "text-muted-foreground"
                      } transition-colors`}
                      strokeWidth={2}
                    />
                    <p
                      className={`text-sm text-center ${
                        isSelected ? "text-primary" : "text-card-foreground"
                      } transition-colors`}
                    >
                      {pref.label}
                    </p>
                    {isSelected && (
                      <div className="mt-2 flex justify-center">
                        <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                          <Check
                            className="w-3 h-3 text-white"
                            strokeWidth={3}
                          />
                        </div>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </ContentCard>

          {/* Generate Button */}
          <div className="flex justify-end">
            <button
              onClick={handleGenerate}
              disabled={isGenerating}
              className="px-8 py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                background: isGenerating
                  ? "#9CA3AF"
                  : "linear-gradient(135deg, #0A7AFF, #14B8A6)",
                color: "white",
              }}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" strokeWidth={2} />
                  Generating Your Perfect Trip...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" strokeWidth={2} />
                  Generate Itinerary
                </>
              )}
            </button>
          </div>
        </>
      )}

      {step === 2 && generatedTrip && (
        <>
          {/* Generated Trip Header */}
          <div
            className="rounded-2xl p-6 sm:p-8 text-white shadow-lg"
            style={{
              background: "linear-gradient(135deg, #10B981, #059669)",
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Sparkles className="w-6 h-6" />
                  <span className="text-sm opacity-90">AI Generated</span>
                </div>
                <h2 className="text-2xl mb-2">{generatedTrip.title}</h2>
                <p className="text-white/90">{generatedTrip.duration}</p>
                <p className="text-xs text-white/70 mt-3 italic">
                  💡 You can edit this generated trip once you add this to
                  Travels
                </p>
              </div>
              <div className="text-right">
                <p className="text-sm text-white/80 mb-1">Total Cost</p>
                <p className="text-3xl">{generatedTrip.totalCost}</p>
              </div>
            </div>
          </div>

          {/* Itinerary */}
          <ContentCard title="Your Itinerary" icon={Calendar}>
            <div className="space-y-4">
              {generatedTrip.itinerary.map((day: any, index: number) => (
                <div
                  key={index}
                  className="border border-border rounded-xl p-5 hover:border-primary/50 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white shadow-md">
                      <span className="text-lg">{day.day}</span>
                    </div>
                    <h3 className="text-base text-card-foreground flex-1">
                      {day.title}
                    </h3>
                  </div>
                  <div className="space-y-3">
                    {day.activities.map((activity: any, i: number) => {
                      const ActivityIcon = activity.icon;
                      return (
                        <div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-lg bg-accent/50 hover:bg-accent transition-colors"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white flex-shrink-0 shadow-sm">
                            <ActivityIcon className="w-5 h-5" strokeWidth={2} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-primary">
                                {activity.time}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                •
                              </span>
                              <span className="text-xs text-muted-foreground truncate">
                                {activity.location}
                              </span>
                            </div>
                            <h4 className="text-sm text-card-foreground mb-1">
                              {activity.title}
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              {activity.description}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Inclusions */}
          <ContentCard title="Package Inclusions" icon={Check}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {generatedTrip.inclusions.map((item: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                >
                  <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
                    <Check
                      className="w-4 h-4 text-green-500"
                      strokeWidth={2.5}
                    />
                  </div>
                  <span className="text-sm text-card-foreground">{item}</span>
                </div>
              ))}
            </div>
          </ContentCard>

          {/* Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Generate Another Trip Button */}
            <button
              onClick={() => setShowRegenerateModal(true)}
              className="px-6 py-3 border-2 border-border rounded-xl hover:bg-accent hover:border-primary/50 transition-all text-center flex items-center justify-center"
            >
              Generate Another Trip
            </button>

            {/* Save to My Travels Button */}
            <button
              onClick={handleSaveToTravels}
              className="px-6 py-3 rounded-xl transition-all shadow-lg hover:shadow-xl flex items-center justify-center"
              style={{
                background: "linear-gradient(135deg, #0A7AFF, #14B8A6)",
                color: "white",
              }}
            >
              Save to My Travels
            </button>
          </div>
        </>
      )}

      {/* Regenerate Trip Confirmation Modal */}
      <ConfirmationModal
        open={showRegenerateModal}
        onOpenChange={setShowRegenerateModal}
        title="Generate Another Trip"
        description="This will discard your current generated trip"
        icon={<AlertTriangle className="w-5 h-5 text-white" />}
        iconGradient="bg-gradient-to-br from-[#FF9500] to-[#FF6B00]"
        iconShadow="shadow-[#FF9500]/20"
        contentGradient="bg-gradient-to-br from-[rgba(255,149,0,0.05)] to-transparent"
        contentBorder="border-[rgba(255,149,0,0.2)]"
        content={
          <div className="text-card-foreground space-y-3">
            <p className="mb-3">
              Are you sure you want to generate another trip? Your current
              itinerary will be discarded and cannot be recovered.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Trip:</span>
                <span className="font-medium">{generatedTrip?.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Duration:</span>
                <span className="font-medium">{generatedTrip?.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="font-medium">{generatedTrip?.totalCost}</span>
              </div>
            </div>
            <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg">
              <p className="text-xs text-amber-600 dark:text-amber-400">
                💡 Tip: You can save this trip to "My Travels" before generating
                a new one to keep it for later.
              </p>
            </div>
          </div>
        }
        onConfirm={handleRegenerateTrip}
        onCancel={() => setShowRegenerateModal(false)}
        confirmText="Yes, Generate New Trip"
        cancelText="Keep This Trip"
        confirmVariant="default"
      />

      <FAQAssistant />
    </div>
  );
}