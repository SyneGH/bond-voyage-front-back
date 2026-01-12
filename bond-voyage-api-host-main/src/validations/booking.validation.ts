import Joi from "joi";

const BookingType = ["STANDARD", "CUSTOMIZED", "REQUESTED"] as const;
const TourType = ["JOINER", "PRIVATE"] as const;
const BookingStatus = [
  "DRAFT",
  "PENDING",
  "CONFIRMED",
  "REJECTED",
  "COMPLETED",
  "CANCELLED",
] as const;

const activitySchema = Joi.object({
  time: Joi.string().required(),
  title: Joi.string().required(),
  description: Joi.string().allow("", null),
  location: Joi.string().allow("", null),
  icon: Joi.string().allow("", null),
  order: Joi.number().integer().min(0).required(),
});

const itineraryDaySchema = Joi.object({
  dayNumber: Joi.number().integer().min(1).required(),
  date: Joi.date().iso().allow(null),
  activities: Joi.array().items(activitySchema).min(1).required(),
});

// CREATE
export const createBookingSchema = Joi.object({
  destination: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  travelers: Joi.number().integer().min(1).required(),
  totalPrice: Joi.number().min(0).required(),

  type: Joi.string().valid(...BookingType).required(),
  tourType: Joi.string().valid(...TourType).required(),

  itinerary: Joi.array().items(itineraryDaySchema).min(1).required(),
});

// UPDATE ITINERARY (no type/tourType)
export const updateItinerarySchema = Joi.object({
  destination: Joi.string().required(),
  startDate: Joi.date().iso().required(),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required(),
  travelers: Joi.number().integer().min(1).required(),
  totalPrice: Joi.number().min(0).required(),

  itinerary: Joi.array().items(itineraryDaySchema).min(1).required(),
});

// ADMIN STATUS UPDATE
export const updateStatusSchema = Joi.object({
  status: Joi.string().valid(...BookingStatus).required(),
  rejectionReason: Joi.when("status", {
    is: "REJECTED",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
  rejectionResolution: Joi.when("status", {
    is: "REJECTED",
    then: Joi.string().required(),
    otherwise: Joi.forbidden(),
  }),
});
