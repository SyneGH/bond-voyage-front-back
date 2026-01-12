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

  async roaman(prompt: string, preferences?: any) {
    // Define your company's official destinations here
    const officialDestinations = ["Cebu", "Palawan", "Bohol", "Siargao", "Bicol", "Baguio", "Ilocos", "Baguio"];

    const contextLines: string[] = [
      "You are Roaman, the professional and enthusiastic travel assistant for BondVoyage.",
      `SCOPE: You ONLY provide travel advice and itineraries for: [${officialDestinations.join(", ")}], and any point in the Philippines.`,
      "If a user asks about a destination outside this list, politely explain that we currently only service these specific areas.",
      "TONE: Be warm, professional, and slightly excited. Don't just say 'I generated this.'",
      "PERSONALIZATION: Use phrases like 'I've curated a special route just for you!', 'This looks like an incredible journey!', or 'I've handpicked some of my favorite spots in the area.'",
      "STRUCTURE: Return a friendly 'message' and a valid JSON 'draft' for a SMART_TRIP itinerary.",
      "CONTENT: For every day in the itinerary, you MUST provide at least 3 detailed activities with 'time', 'title', and 'location'.",
      "Return JSON with keys: 'message' (string) and 'draft' (object).",
      "Draft must include: type='SMART_TRIP', destination, travelers, and days[].",
      "If unsure about dates, set them to null and keep dayNumber ordering starting at 1."
    ];

    if (preferences) {
      contextLines.push(`User preferences: ${JSON.stringify(preferences)}`);
    }

    const fullPrompt = `
    ${contextLines.join("\n")}
    User prompt: ${prompt}
    Respond ONLY with a valid JSON object matching the format: {"message":"string", "draft":{...}}. 
    Do not wrap in markdown code blocks.`;
    
    const text = await callGemini(fullPrompt);

    const fallbackDraft = {
      message: "I've put together a starter draft for your Bond Voyage adventure!",
      draft: {
        type: "SMART_TRIP",
        destination: preferences?.destination || "Your Destination",
        startDate: preferences?.startDate || null,
        endDate: preferences?.endDate || null,
        travelers: preferences?.travelers || 1,
        days: [
          {
            dayNumber: 1,
            date: null,
            activities: [
              { time: "09:00", title: "Arrival & Welcome", location: "Airport/Terminal", order: 1 },
              { time: "12:00", title: "Local Lunch", location: "City Center", order: 2 },
              { time: "15:00", title: "Check-in & Relaxation", location: "Hotel", order: 3 }
            ],
          },
        ],
      },
    };

    return extractJson(text, fallbackDraft);
  },
};