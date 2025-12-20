import axios from "axios";

export const ChatbotService = {
  respondRoameo(message: string) {
    const normalized = message.toLowerCase();

    if (normalized.includes("booking")) {
      return "To create a booking, choose a destination, select dates, and save your itinerary as a draft before submitting.";
    }
    if (normalized.includes("payment")) {
      return "You can submit your payment proof from your booking details page under the Payments section.";
    }
    if (normalized.includes("collabor")) {
      return "Share your booking ID with collaborators. They can edit the itinerary while the booking is still in draft.";
    }
    if (normalized.includes("refund")) {
      return "For refund requests, please contact support via the inquiries page so an admin can assist you.";
    }

    return "Hi! I can help with bookings, payments, and collaboration. Ask me anything about the Bond Voyage system.";
  },

  async respondRoaman(message: string, context?: string | null) {
    const apiKey = process.env.GEMINI_API_KEY;
    const model = process.env.GEMINI_MODEL || "gemini-1.5-flash";

    if (!apiKey) {
      throw new Error("GEMINI_KEY_MISSING");
    }

    const prompt = context ? `${context}\n\nUser: ${message}` : message;

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        contents: [
          {
            parts: [{ text: prompt }],
          },
        ],
      }
    );

    return response.data;
  },
};
