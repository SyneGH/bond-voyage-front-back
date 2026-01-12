import axios from "axios";
import { FaqEntry } from "@prisma/client";
import { prisma } from "@/config/database";
import { AppError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";

// Define the Action interface for type safety
interface ChatAction {
  label: string;
  action: string; // The URL path or action key
  type: "NAVIGATION" | "QUERY"; // NAVIGATION = Redirect, QUERY = Pre-fill chat
}

type GeminiContent = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash-lite-preview-09-2025";

function requireGeminiKey() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AppError(
      HTTP_STATUS.NOT_IMPLEMENTED,
      "Gemini API key is not configured"
    );
  }
  return apiKey;
}

async function callGemini(prompt: string) {
  const apiKey = requireGeminiKey();

  const response = await axios.post<GeminiContent>(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    {
      contents: [
        {
          parts: [{ text: prompt }],
        },
      ],
    }
  );

  const text =
    response.data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text || "")
      .join("") || "";

  return text.trim();
}

function extractJson<T>(text: string, fallback: T): T {
  try {
    return JSON.parse(text) as T;
  } catch (e) {
    const match = text.match(/\{[\s\S]*\}/);
    if (match) {
      try {
        return JSON.parse(match[0]) as T;
      } catch (err) {
        return fallback;
      }
    }
  }
  return fallback;
}

// === ROAMAN TYPES & HELPERS ===

interface RoamanPreferences {
  destination?: string;
  startDate?: string;
  endDate?: string;
  travelers?: number;
  tourType?: "JOINER" | "PRIVATE";
  budget?: number;
  pace?: string;
  travelPace?: string;
  preferences?: string[];
  selectedDay?: number;
  currentDayActivities?: any[];
  totalDays?: number;
}

interface RoamanActivityOutput {
  order: number;
  time: string;
  title: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  description: string;
  iconKey: string;
}

interface RoamanDayOutput {
  dayNumber: number;
  date: string | null;
  title: string;
  activities: RoamanActivityOutput[];
}

interface RoamanDraftOutput {
  type: "SMART_TRIP";
  destination: string;
  startDate: string | null;
  endDate: string | null;
  travelers: number;
  days: RoamanDayOutput[];
}

interface RoamanResponseData {
  message: string;
  draft: RoamanDraftOutput;
}

function buildRoamanSystemPrompt(
  officialDestinations: string[],
  preferences?: RoamanPreferences
): string {
  const pace = preferences?.pace || preferences?.travelPace || "moderate";
  const destination = preferences?.destination || "the Philippines";
  const travelers = preferences?.travelers || 1;
  const startDate = preferences?.startDate || null;
  const endDate = preferences?.endDate || null;
  const userPrefs = preferences?.preferences || [];

  return `You are **Roaman**, the itinerary generator for the BondVoyage backend.

### Goal
Generate a **SMART_TRIP itinerary draft** compatible with the booking flow structure. Return ONLY valid JSON—no markdown, explanations, or trailing text.

### Hard Requirements
1. **Return valid JSON only.**
2. The response must have this exact shape:
   { "message": "friendly assistant message", "draft": { ... } }

3. \`draft.type\` MUST be \`"SMART_TRIP"\`.
4. \`draft.days\` MUST contain **at least 1 day**.
5. Each day MUST include:
   - \`dayNumber\` (integer, starting at 1 - NOT "day", use "dayNumber")
   - \`date\` (string YYYY-MM-DD or null)
   - \`title\` (string, catchy day title like "Island Hopping Adventure")
   - \`activities\` (array with at least 4 items)
6. **Each day MUST contain at least 4 activities**.
7. Each activity MUST include ALL fields:
   - \`order\` (integer, sequential starting at 1, resets each day)
   - \`time\` (string \`HH:MM\` 24-hour)
   - \`title\` (string, descriptive activity name)
   - \`locationName\` (string, Geoapify-style: "Place Name, Street, City, Province, Philippines")
   - \`coordinates\` (object with \`lat\` and \`lng\` as realistic numbers)
   - \`description\` (string, 1-2 sentences)
   - \`iconKey\` (one of: sightseeing, food, beach, nature, culture, adventure, shopping, relaxation, transport, museum, cafe, nightlife, hiking)

8. If startDate provided, compute each day's date as startDate + (dayNumber - 1).
9. If startDate is null, set date: null for each day.
10. Avoid placeholders like "Airport" or "Hotel" unless explicitly requested.
11. Activities must be destination-relevant, varied, and time-ordered.

### SCOPE
You ONLY provide travel advice for: [${officialDestinations.join(", ")}], and any point in the Philippines.
If asked about destinations outside the Philippines, explain BondVoyage only covers Philippine destinations.

### TONE
Be warm and enthusiastic. Use phrases like "I've curated a special route!", "This looks incredible!", "I've handpicked my favorite spots."

### Pace Guidelines
| Pace | Activities/Day |
|------|----------------|
| relaxed | 4 |
| moderate | 4-5 |
| packed | 5-7 |
| own_pace | 4-5 |

### Current Context
- Destination: ${destination}
- Start Date: ${startDate || "Not specified"}
- End Date: ${endDate || "Not specified"}
- Travelers: ${travelers}
- Pace: ${pace}
- Preferences: ${userPrefs.length > 0 ? userPrefs.join(", ") : "General sightseeing"}

### Example Output Structure
{
  "message": "I've curated a special route for your Cebu adventure!",
  "draft": {
    "type": "SMART_TRIP",
    "destination": "Cebu",
    "startDate": "2025-03-01",
    "endDate": "2025-03-03",
    "travelers": 2,
    "days": [
      {
        "dayNumber": 1,
        "date": "2025-03-01",
        "title": "Cebu City Historical Tour",
        "activities": [
          {
            "order": 1,
            "time": "09:00",
            "title": "Visit Magellan's Cross",
            "locationName": "Magellan's Cross, P. Burgos St, Cebu City, Cebu, Philippines",
            "coordinates": { "lat": 10.2934, "lng": 123.9021 },
            "description": "Start your day at this historic landmark marking Magellan's arrival in 1521.",
            "iconKey": "culture"
          }
        ]
      }
    ]
  }
}`;
}

function buildRoamanFallback(preferences?: RoamanPreferences): RoamanResponseData {
  const destination = preferences?.destination || "Cebu";
  const travelers = preferences?.travelers || 1;
  const startDate = preferences?.startDate || null;
  
  const dayDate = startDate || null;
  const endDate = startDate || null;

  // Base coordinates for Cebu (default)
  const baseCoords = { lat: 10.3157, lng: 123.8854 };

  return {
    message: "I've put together a starter draft for your BondVoyage adventure! Feel free to customize it to your liking.",
    draft: {
      type: "SMART_TRIP",
      destination,
      startDate,
      endDate,
      travelers,
      days: [
        {
          dayNumber: 1,
          date: dayDate,
          title: `${destination} Highlights`,
          activities: [
            {
              order: 1,
              time: "09:00",
              title: "Morning City Exploration",
              locationName: `City Center, ${destination}, Philippines`,
              coordinates: { lat: baseCoords.lat + 0.001, lng: baseCoords.lng + 0.001 },
              description: "Start your day exploring the heart of the city and its local attractions.",
              iconKey: "sightseeing",
            },
            {
              order: 2,
              time: "12:00",
              title: "Local Cuisine Experience",
              locationName: `Local Restaurant, ${destination}, Philippines`,
              coordinates: { lat: baseCoords.lat + 0.002, lng: baseCoords.lng - 0.001 },
              description: "Enjoy authentic local dishes and experience the regional flavors.",
              iconKey: "food",
            },
            {
              order: 3,
              time: "14:30",
              title: "Cultural Heritage Visit",
              locationName: `Heritage Site, ${destination}, Philippines`,
              coordinates: { lat: baseCoords.lat - 0.001, lng: baseCoords.lng + 0.002 },
              description: "Discover the rich cultural heritage and history of the area.",
              iconKey: "culture",
            },
            {
              order: 4,
              time: "17:00",
              title: "Sunset & Evening Leisure",
              locationName: `Waterfront Area, ${destination}, Philippines`,
              coordinates: { lat: baseCoords.lat + 0.003, lng: baseCoords.lng + 0.003 },
              description: "Relax and enjoy the sunset views before dinner.",
              iconKey: "relaxation",
            },
          ],
        },
      ],
    },
  };
}

// === POST-PROCESSING FOR ROAMAN ===

function normalizeRoamanResponse(
  raw: any,
  preferences?: RoamanPreferences
): RoamanResponseData {
  const destination = preferences?.destination || raw?.draft?.destination || "Philippines";
  const travelers = preferences?.travelers || raw?.draft?.travelers || 1;
  const startDate = preferences?.startDate || raw?.draft?.startDate || null;
  const endDate = preferences?.endDate || raw?.draft?.endDate || null;

  // Default message if missing
  const message = raw?.message || "I've put together an itinerary for your adventure!";

  // Normalize days array
  const rawDays = raw?.draft?.days || [];
  const normalizedDays: RoamanDayOutput[] = rawDays.map((day: any, dayIndex: number) => {
    // Handle both 'day' and 'dayNumber' field names
    const dayNumber = day.dayNumber || day.day || dayIndex + 1;
    
    // Calculate date if startDate is provided
    let date: string | null = null;
    if (startDate) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + dayIndex);
      date = d.toISOString().split("T")[0];
    } else {
      date = day.date || null;
    }

    // Generate day title if missing
    const title = day.title || `Day ${dayNumber}: ${destination} Adventure`;

    // Normalize activities
    const activities: RoamanActivityOutput[] = (day.activities || []).map((act: any, actIndex: number) => {
      // Fix malformed coordinates (Gemini sometimes outputs wrong keys)
      let lat = act.coordinates?.lat ?? act.lat ?? 10.3157;
      let lng = act.coordinates?.lng ?? act.lng ?? 123.8854;

      // Handle case where Gemini outputs numeric keys like "2" instead of "lng"
      if (act.coordinates && typeof act.coordinates === "object") {
        const coordKeys = Object.keys(act.coordinates);
        for (const key of coordKeys) {
          if (key === "lat") lat = act.coordinates[key];
          else if (key === "lng") lng = act.coordinates[key];
          else if (!isNaN(Number(key)) || key === "lon" || key === "long") {
            // Numeric key or alternate lng name - assume it's longitude
            lng = act.coordinates[key];
          }
        }
      }

      return {
        order: act.order || actIndex + 1,
        time: act.time || "09:00",
        title: act.title || "Activity",
        locationName: act.locationName || act.location || `${destination}, Philippines`,
        coordinates: { lat: Number(lat), lng: Number(lng) },
        description: act.description || "Explore this location.",
        iconKey: act.iconKey || "sightseeing",
      };
    });

    return {
      dayNumber,
      date,
      title,
      activities,
    };
  });

  return {
    message,
    draft: {
      type: "SMART_TRIP",
      destination,
      startDate,
      endDate,
      travelers,
      days: normalizedDays,
    },
  };
}

// NEW: Helper function to determine actions based on user query
function determineActions(question: string): ChatAction[] {
  const lowerQ = question.toLowerCase();
  const actions: ChatAction[] = [];

  // Weather Logic
  if (lowerQ.includes("weather") || lowerQ.includes("forecast") || lowerQ.includes("rain") || lowerQ.includes("sunny")) {
    actions.push({
      label: "Check Weather",
      action: "/user/weather",
      type: "NAVIGATION",
    });
  }

  // Booking Logic
  if (lowerQ.includes("book") || lowerQ.includes("reservation") || lowerQ.includes("ticket")) {
    actions.push({
      label: "My Bookings",
      action: "/user/bookings",
      type: "NAVIGATION",
    });
    actions.push({
      label: "New Booking",
      action: "/user/standard-itinerary",
      type: "NAVIGATION",
    });
  }

  // Feedback Logic
  if (lowerQ.includes("feedback") || lowerQ.includes("review") || lowerQ.includes("rate") || lowerQ.includes("complain")) {
    actions.push({
      label: "Give Feedback",
      action: "/user/feedback",
      type: "NAVIGATION",
    });
    actions.push({
      label: "My Feedback",
      action: "view my feedback", // Frontend can intercept this specific string if needed
      type: "QUERY",
    });
  }

  // Profile/Account Logic
  if (lowerQ.includes("profile") || lowerQ.includes("account") || lowerQ.includes("password") || lowerQ.includes("email")) {
    actions.push({
      label: "Edit Profile",
      action: "/user/profile/edit",
      type: "NAVIGATION",
    });
  }

  // Creation/Planning Logic
  if (lowerQ.includes("create") || lowerQ.includes("plan") || lowerQ.includes("build") || lowerQ.includes("itinerary")) {
    actions.push({
      label: "Create New Travel",
      action: "/user/create-new-travel",
      type: "NAVIGATION",
    });
    actions.push({
      label: "Use Smart Trip AI",
      action: "/user/smart-trip",
      type: "NAVIGATION",
    });
  }

  return actions;
}

export const ChatbotService = {
  async roameo(question: string) {
    const faqs: FaqEntry[] = await prisma.faqEntry.findMany({
      where: { isActive: true },
      orderBy: [{ order: "asc" }, { createdAt: "desc" }],
      take: 5,
    });

    // Existing filter logic
    const sources: FaqEntry[] = faqs.filter((faq: FaqEntry) => {
      const queryWords = question.toLowerCase().replace(/[?]/g, '').split(' ').filter(w => w.length > 2);
      const faqText = (faq.question + " " + faq.answer).toLowerCase();
      
      const matches = queryWords.filter(word => faqText.includes(word));
      return matches.length >= 2; 
    });

    // NEW: Calculate actions before returning
    const suggestedActions = determineActions(question);

    if (sources.length === 0) {
      return {
        answer: "I'm not sure based on our official FAQs yet. Please contact support for help.",
        confidence: "low" as const,
        sources: [],
        actions: suggestedActions, // Return actions even if no FAQ found
      };
    }

    const context = (sources.length > 0 ? sources : faqs)
      .map(
        (entry: FaqEntry) =>
          `Q: ${entry.question}\nA: ${entry.answer}\nOrder: ${entry.order}`
      )
      .join("\n\n");

      const prompt = `You are Roameo, the friendly and professional travel assistant for Bond Voyage. 
      Your goal is to provide helpful, conversational support using ONLY the context provided below.

      Guidelines:
      1. Use a warm, welcoming tone (e.g., "Certainly!", "I'd be happy to help with that.").
      2. Refer to the company as "we" or "us" (e.g., "We can help you with...").
      3. If the answer is found in the context, rephrase it naturally so it doesn't look like a copy-paste.
      4. If the answer is NOT in the context, politely apologize and suggest they reach out to our human support team.
      5. Keep the response helpful but professional.

      Context:
      ${context}

      User question: ${question}

      Response:`;

    const text = await callGemini(prompt);

    const normalizedAnswer = text || "I don't have that info in our official FAQs yet.";
    const confidence = sources.length > 0 ? "high" : "medium";

    return {
      answer: normalizedAnswer,
      confidence,
      sources: (sources.length > 0 ? sources : []).map((faq: FaqEntry) => ({
        id: faq.id,
        question: faq.question,
        order: faq.order,
      })),
      actions: suggestedActions, // Include the actions in the final response
    };
  },

  async roaman(prompt: string, preferences?: RoamanPreferences): Promise<RoamanResponseData> {
    const officialDestinations = [
      "Cebu", "Palawan", "Bohol", "Siargao", "Bicol",
      "Baguio", "Ilocos", "Boracay", "Davao", "Manila"
    ];

    const systemPrompt = buildRoamanSystemPrompt(officialDestinations, preferences);
    const fullPrompt = `${systemPrompt}\n\nUser request: ${prompt}\n\nReturn JSON only.`;

    try {
      const text = await callGemini(fullPrompt);
      const rawResponse = extractJson<any>(text, {});
      
      if (!rawResponse || !rawResponse.draft?.days?.length) {
        // Fallback if Gemini returns invalid/empty response
        return buildRoamanFallback(preferences);
      }

      // Normalize the response to fix Gemini inconsistencies
      return normalizeRoamanResponse(rawResponse, preferences);
    } catch (error) {
      console.error("Roaman generation failed:", error);
      return buildRoamanFallback(preferences);
    }
  },
};