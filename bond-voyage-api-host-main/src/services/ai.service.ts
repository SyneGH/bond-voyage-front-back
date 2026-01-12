import { GoogleGenAI } from "@google/genai";
import { 
  PH_DESTINATION_COORDS, 
  SMART_TRIP_ICON_KEYS,
  type SmartTripIconKey 
} from "@/constants/smartTrip";

// === TYPES ===

interface ItineraryInput {
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers?: number;
  budget?: number;
  travelPace?: string;
  preferences?: string[];
}

interface ActivityOutput {
  order: number;
  time: string;
  title: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  description: string;
  iconKey: string;
}

interface DayOutput {
  day: number;
  date: string;
  title: string;
  activities: ActivityOutput[];
}

interface ItineraryMetadata {
  destination: string;
  startDate: string;
  endDate: string;
  travelers: number;
  budget: number | null;
  travelPace: string;
  preferences: string[];
}

interface GenerateItineraryResult {
  itinerary: DayOutput[];
  metadata: ItineraryMetadata;
}

// === GEMINI SCHEMA ===

const itinerarySchema = {
  type: "OBJECT",
  properties: {
    days: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "NUMBER" },
          title: { type: "STRING" },
          activities: {
            type: "ARRAY",
            items: {
              type: "OBJECT",
              properties: {
                order: { type: "NUMBER" },
                time: { type: "STRING" },
                title: { type: "STRING" },
                locationName: { type: "STRING" },
                lat: { type: "NUMBER" },
                lng: { type: "NUMBER" },
                description: { type: "STRING" },
                iconKey: { type: "STRING" },
              },
              required: ["order", "time", "title", "locationName", "lat", "lng", "description", "iconKey"],
            },
          },
        },
        required: ["day", "title", "activities"],
      },
    },
  },
  required: ["days"],
};

// === HELPERS ===

function getBaseCoords(destination: string): { lat: number; lng: number } {
  const key = destination.toLowerCase().split(",")[0].trim();
  return PH_DESTINATION_COORDS[key] || PH_DESTINATION_COORDS.manila;
}

function formatDateISO(date: Date): string {
  return date.toISOString().split("T")[0];
}

function calculateDuration(startDate: Date, endDate: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  return Math.floor((endDate.getTime() - startDate.getTime()) / MS_PER_DAY) + 1;
}

function mapPreferencesToIcons(preferences: string[]): SmartTripIconKey[] {
  const mapping: Record<string, SmartTripIconKey> = {
    beach: "beach",
    mountain: "hiking",
    culture: "culture",
    food: "food",
    adventure: "adventure",
    relaxation: "relaxation",
    shopping: "shopping",
    nature: "nature",
    nightlife: "nightlife",
  };
  
  return preferences
    .map(p => mapping[p.toLowerCase()])
    .filter((icon): icon is SmartTripIconKey => icon !== undefined);
}

function getActivitiesPerDay(travelPace?: string): number {
  switch (travelPace) {
    case "relaxed": return 4;
    case "moderate": return 5;
    case "packed": return 6;
    case "own_pace": return 4;
    default: return 4;
  }
}

// === MAIN SERVICE ===

export const AiService = {
  async generateItinerary(input: ItineraryInput): Promise<GenerateItineraryResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    const startDateStr = formatDateISO(input.startDate);
    const endDateStr = formatDateISO(input.endDate);
    const duration = calculateDuration(input.startDate, input.endDate);
    const travelPace = input.travelPace || "moderate";
    const preferences = input.preferences || [];
    const travelers = input.travelers || 2;
    const budget = input.budget || null;

    const metadata: ItineraryMetadata = {
      destination: input.destination,
      startDate: startDateStr,
      endDate: endDateStr,
      travelers,
      budget,
      travelPace,
      preferences,
    };

    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing. Using fallback template.");
      return {
        itinerary: this.buildFallbackItinerary(input, duration),
        metadata,
      };
    }

    const client = new GoogleGenAI({ apiKey });
    const activitiesPerDay = getActivitiesPerDay(travelPace);

    const prompt = `
You are a local travel expert for the **Philippines**.
Generate a travel itinerary strictly for locations within the Philippines.

**Request Details:**
- Destination: ${input.destination}
- Start Date: ${startDateStr}
- End Date: ${endDateStr}
- Duration: ${duration} Days
- Travelers: ${travelers}
- Travel Pace: ${travelPace}
- Preferences: ${preferences.length > 0 ? preferences.join(", ") : "General sightseeing, Local food"}
${budget ? `- Budget: ₱${budget.toLocaleString()}` : ""}

**Strict Requirements:**
1. If "${input.destination}" is NOT in the Philippines, return a single day with title "Location Unavailable" and one activity explaining BondVoyage only covers Philippine destinations.
2. Generate exactly ${duration} days.
3. Each day MUST have at least ${activitiesPerDay} activities (minimum 4).
4. Each activity MUST include:
   - order: sequential number starting at 1
   - time: "HH:MM" in 24-hour format
   - title: descriptive activity name
   - locationName: Geoapify-style formatted address (e.g., "Magellan's Cross, P. Burgos St, Cebu City, Cebu, Philippines")
   - lat: latitude coordinate (realistic for the destination)
   - lng: longitude coordinate (realistic for the destination)
   - description: 1-2 sentences describing the activity
   - iconKey: one of [sightseeing, food, beach, nature, culture, adventure, shopping, relaxation, transport, museum, cafe, nightlife, hiking]

5. Activities should be:
   - Destination-relevant real places
   - Varied (mix of culture, food, nature, etc.)
   - Ordered logically by time (morning to evening)
   - Appropriate for the travel pace

**Day Titles:** Short and catchy (e.g., "Island Hopping Adventure", "Cultural Heritage Walk")

Output must follow the provided JSON schema exactly.
    `;

    try {
      const response = await client.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-2.5-flash-lite-preview-06-2025",
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: itinerarySchema,
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      const data = JSON.parse(responseText);
      
      // Post-process: Add dates and restructure coordinates
      const itinerary: DayOutput[] = (data.days || []).map((day: any, index: number) => {
        const dayDate = new Date(input.startDate);
        dayDate.setDate(dayDate.getDate() + index);

        return {
          day: index + 1,
          date: formatDateISO(dayDate),
          title: day.title || `Day ${index + 1}`,
          activities: (day.activities || []).map((act: any, actIdx: number) => ({
            order: act.order || actIdx + 1,
            time: act.time || "09:00",
            title: act.title || "Activity",
            locationName: act.locationName || `${input.destination}, Philippines`,
            coordinates: {
              lat: act.lat || getBaseCoords(input.destination).lat,
              lng: act.lng || getBaseCoords(input.destination).lng,
            },
            description: act.description || "Explore this location.",
            iconKey: SMART_TRIP_ICON_KEYS.includes(act.iconKey) ? act.iconKey : "sightseeing",
          })),
        };
      });

      return { itinerary, metadata };

    } catch (error) {
      console.error("AI Generation Failed:", error);
      return {
        itinerary: this.buildFallbackItinerary(input, duration),
        metadata,
      };
    }
  },

  // === FALLBACK LOGIC ===

  buildFallbackItinerary(input: ItineraryInput, duration: number): DayOutput[] {
    const baseCoords = getBaseCoords(input.destination);
    const preferences = input.preferences || [];
    const prefIcons = mapPreferencesToIcons(preferences);
    const travelPace = input.travelPace || "moderate";
    const activitiesPerDay = getActivitiesPerDay(travelPace);

    // Activity templates with coordinates offset
    const activityTemplates: Array<{
      time: string;
      title: string;
      description: string;
      iconKey: SmartTripIconKey;
      latOffset: number;
      lngOffset: number;
    }> = [
      { time: "07:00", title: "Sunrise Breakfast", description: "Start your day with a delicious local breakfast while enjoying the morning atmosphere.", iconKey: "food", latOffset: 0.001, lngOffset: 0.001 },
      { time: "09:00", title: "Historical Landmark Visit", description: "Explore the rich history and cultural heritage of this iconic landmark.", iconKey: "culture", latOffset: 0.005, lngOffset: -0.002 },
      { time: "11:00", title: "Local Market Exploration", description: "Discover local crafts, souvenirs, and authentic products at this vibrant market.", iconKey: "shopping", latOffset: -0.003, lngOffset: 0.004 },
      { time: "12:30", title: "Traditional Lunch Experience", description: "Savor authentic local cuisine at a popular restaurant known for regional specialties.", iconKey: "food", latOffset: 0.002, lngOffset: 0.003 },
      { time: "14:30", title: "Nature & Scenic Views", description: "Take in breathtaking natural scenery and capture memorable photos.", iconKey: "nature", latOffset: 0.008, lngOffset: -0.005 },
      { time: "16:00", title: "Cultural Activity", description: "Immerse yourself in local traditions and cultural experiences.", iconKey: "culture", latOffset: -0.004, lngOffset: 0.006 },
      { time: "17:30", title: "Sunset Viewing", description: "Watch the beautiful sunset from a scenic viewpoint.", iconKey: "sightseeing", latOffset: 0.006, lngOffset: 0.002 },
      { time: "19:00", title: "Dinner & Evening Leisure", description: "Enjoy a relaxing dinner and explore the evening atmosphere.", iconKey: "food", latOffset: -0.002, lngOffset: -0.003 },
    ];

    // Beach-specific templates
    const beachTemplates: typeof activityTemplates = [
      { time: "08:00", title: "Beach Sunrise & Swim", description: "Start the day with a refreshing swim in crystal clear waters.", iconKey: "beach", latOffset: 0.002, lngOffset: 0.004 },
      { time: "10:00", title: "Island Hopping Tour", description: "Explore nearby islands with stunning beaches and snorkeling spots.", iconKey: "beach", latOffset: 0.015, lngOffset: 0.012 },
      { time: "13:00", title: "Beachside Seafood Lunch", description: "Fresh seafood grilled to perfection right on the beach.", iconKey: "food", latOffset: 0.003, lngOffset: 0.002 },
      { time: "15:00", title: "Water Sports Adventure", description: "Try kayaking, paddleboarding, or other exciting water activities.", iconKey: "adventure", latOffset: 0.001, lngOffset: 0.005 },
    ];

    // Use beach templates if beach preference is present
    const hasBeachPref = preferences.some(p => p.toLowerCase() === "beach");

    return Array.from({ length: duration }).map((_, dayIndex) => {
      const dayDate = new Date(input.startDate);
      dayDate.setDate(dayDate.getDate() + dayIndex);

      // Select templates based on day and preferences
      let templates = [...activityTemplates];
      if (hasBeachPref && dayIndex % 2 === 1) {
        templates = [...beachTemplates, ...activityTemplates.slice(4)];
      }

      // Generate day title
      const dayTitles = [
        `Arrival & ${input.destination} Exploration`,
        `${input.destination} Highlights`,
        "Island & Nature Adventure",
        "Cultural Heritage Day",
        "Leisure & Local Discovery",
        `Farewell ${input.destination}`,
      ];
      const title = dayTitles[dayIndex % dayTitles.length];

      // Generate activities for this day
      const activities: ActivityOutput[] = templates
        .slice(0, activitiesPerDay)
        .map((template, actIdx) => ({
          order: actIdx + 1,
          time: template.time,
          title: template.title,
          locationName: `${template.title.split(" ")[0]} Area, ${input.destination}, Philippines`,
          coordinates: {
            lat: baseCoords.lat + template.latOffset + (dayIndex * 0.002),
            lng: baseCoords.lng + template.lngOffset + (dayIndex * 0.001),
          },
          description: template.description,
          iconKey: prefIcons[actIdx % prefIcons.length] || template.iconKey,
        }));

      return {
        day: dayIndex + 1,
        date: formatDateISO(dayDate),
        title,
        activities,
      };
    });
  },
};