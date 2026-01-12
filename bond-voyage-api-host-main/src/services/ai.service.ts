import { GoogleGenAI } from "@google/genai";

interface ItineraryInput {
  destination: string;
  startDate: Date;
  endDate: Date;
  travelers?: number;
  budget?: number;
  preferences?: string[];
}

// 1. Schema Definition (Strict JSON Mode)
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
            items: { type: "STRING" },
          },
        },
        required: ["day", "title", "activities"],
      },
    },
  },
  required: ["days"],
};

export const AiService = {
  async generateItinerary(input: ItineraryInput) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY missing. Using fallback template.");
      return this.buildFallbackItinerary(input);
    }

    const client = new GoogleGenAI({ apiKey });

    // Calculate duration (inclusive of start/end dates)
    const duration =
      Math.ceil(
        (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1;

    // 2. Philippines-Only Prompt
    const prompt = `
      You are a local travel expert for the **Philippines**. 
      Your task is to generate a travel itinerary strictly for locations within the Philippines.

      **Request Details:**
      - Destination: ${input.destination}
      - Duration: ${duration} Days
      - Travelers: ${input.travelers || 2}
      - Preferences: ${input.preferences?.join(", ") || "General sightseeing, Local food"}

      **Strict Constraints:**
      1. **Geographic Lock:** If the destination "${input.destination}" is NOT in the Philippines, DO NOT generate a trip. Instead, return a single-day itinerary with the title "Location Unavailable" and one activity: "BondVoyage currently only specializes in Philippine destinations."
      2. **Structure:** Provide exactly ${duration} days.
      3. **Content Style:** - Titles should be short and catchy (e.g., "Island Hopping", "Historical Walk").
         - Activities must be specific real-world locations or experiences in ${input.destination}.
         - Keep a balanced pace (Morning, Afternoon, Evening).

      Output must follow the provided JSON schema exactly.
    `;

    try {
      const response = await client.models.generateContent({
        model: "gemini-2.5-flash-lite",
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }],
          },
        ],
        config: {
          responseMimeType: "application/json",
          responseSchema: itinerarySchema,
        },
      });

      // 3. Handle Response
      const responseText = response.text;
      
      if (!responseText) {
        throw new Error("Empty response from AI");
      }

      const data = JSON.parse(responseText);

      // 4. Post-process: Map AI days to Real Calendar Dates
      return (data.days || []).map((day: any, index: number) => {
        const dayDate = new Date(input.startDate);
        dayDate.setDate(dayDate.getDate() + index);

        return {
          ...day,
          day: index + 1, // Ensure day numbers are sequential 1..N
          date: dayDate.toISOString().split("T")[0],
        };
      });

    } catch (error) {
      console.error("AI Generation Failed:", error);
      // Fail gracefully to the old logic if AI is down or errors out
      return this.buildFallbackItinerary(input);
    }
  },

  // Fallback Logic (Original Template Rotator)
  buildFallbackItinerary(input: ItineraryInput) {
    const MS_PER_DAY = 24 * 60 * 60 * 1000;
    const totalDays =
      Math.floor(
        (new Date(input.endDate).getTime() - new Date(input.startDate).getTime()) /
          MS_PER_DAY
      ) + 1;

    const templates = [
      { title: "Arrival & Orientation", activities: ["Check-in to accommodation", "Relaxing neighborhood walk", "Welcome dinner at a local restaurant"] },
      { title: "City Highlights", activities: ["Visit main historical landmarks", "Shopping at local markets", "Sunset view"] },
      { title: "Nature & Culture", activities: ["Morning nature trek or beach visit", "Museum tour", "Free time for leisure"] },
    ];

    return Array.from({ length: totalDays }).map((_, index) => ({
      day: index + 1,
      date: new Date(new Date(input.startDate).getTime() + index * MS_PER_DAY)
        .toISOString()
        .split("T")[0],
      title: `${input.destination}: ${templates[index % 3].title}`,
      activities: templates[index % 3].activities,
    }));
  },
};