import { Request, Response } from "express";
import { ZodError } from "zod";
import { optimizeRouteDto } from "@/validators/route.dto";
import { AppError, createResponse, throwError } from "@/utils/responseHandler";
import { HTTP_STATUS } from "@/constants/constants";
import { GeoapifyService } from "@/services/geoapify.service";

const MAX_MATRIX_POINTS = 25;

export const RouteController = {
  // ---------------------------------------------------------
  // 1. CALCULATE (Lightweight, Default Automatic)
  // ---------------------------------------------------------
  calculate: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = optimizeRouteDto.parse(req.body);
      const activities = payload.activities;
      const mode = payload.mode ?? "drive";

      // Prepare coordinates for routing
      const coordsOnly = activities.map((a) => ({ lat: a.lat, lng: a.lng }));

      const routingResponse = await GeoapifyService.route(coordsOnly, mode);
      const routingFeature = (routingResponse as any)?.features?.[0];
      const routeGeometry = routingFeature?.geometry;
      const routeProps = routingFeature?.properties;

      if (!routeGeometry) {
        throwError(HTTP_STATUS.BAD_GATEWAY, "Routing service returned no geometry");
      }

      createResponse(res, HTTP_STATUS.OK, "Route calculated", {
        activities: activities,
        routeGeometry,
        totalDistance: routeProps?.distance ?? 0,
        totalTime: routeProps?.time ?? 0,
      });
    } catch (error) {
      handleRouteError(error);
    }
  },

  // ---------------------------------------------------------
  // 2. OPTIMIZE (Heavy, Button Click)
  // ---------------------------------------------------------
  optimize: async (req: Request, res: Response): Promise<void> => {
    try {
      const payload = optimizeRouteDto.parse(req.body);
      const activities = payload.activities;
      const mode = payload.mode ?? "drive";

      if (activities.length > MAX_MATRIX_POINTS) {
        throwError(
          HTTP_STATUS.BAD_REQUEST,
          `Too many activities. Maximum allowed is ${MAX_MATRIX_POINTS}.`
        );
      }

      // Validate coordinates
      for (const activity of activities) {
        if (typeof activity.lat !== "number" || typeof activity.lng !== "number") {
          throwError(
            HTTP_STATUS.BAD_REQUEST,
            `Invalid coordinates for activity: ${activity.id}`
          );
        }
      }

      const coordsOnly = activities.map((a) => ({ lat: a.lat, lng: a.lng }));

      // ========================================
      // STEP 1: Calculate ORIGINAL route
      // ========================================
      const originalRoutingResponse = await GeoapifyService.route(coordsOnly, mode);
      const originalFeature = (originalRoutingResponse as any)?.features?.[0];
      const originalRouteGeometry = originalFeature?.geometry;
      const originalDistance = originalFeature?.properties?.distance || 0; // meters
      const originalTime = originalFeature?.properties?.time || 0; // seconds

      // ========================================
      // STEP 2: Get route matrix and optimize
      // ========================================
      const matrix = await GeoapifyService.routeMatrix(coordsOnly, mode);
      const order = buildNearestNeighborOrder(matrix.times);
      const optimizedActivities = order.map((index) => activities[index]);

      const totalsFromMatrix = sumTotalsFromMatrix(
        order,
        matrix.distances,
        matrix.times
      );

      // ========================================
      // STEP 3: Calculate OPTIMIZED route geometry
      // ========================================
      const optimizedCoords = optimizedActivities.map((a) => ({ 
        lat: a.lat, 
        lng: a.lng 
      }));
      const optimizedRoutingResponse = await GeoapifyService.route(optimizedCoords, mode);
      const optimizedFeature = (optimizedRoutingResponse as any)?.features?.[0];
      const optimizedRouteGeometry = optimizedFeature?.geometry;
      const optimizedDistance = optimizedFeature?.properties?.distance || totalsFromMatrix.totalDistance;
      const optimizedTime = optimizedFeature?.properties?.time || totalsFromMatrix.totalTime;

      if (!optimizedRouteGeometry) {
        throwError(HTTP_STATUS.BAD_GATEWAY, "Geoapify routing response missing geometry");
      }

      // ========================================
      // STEP 4: Calculate savings
      // ========================================
      const distanceSaved = Math.max(0, originalDistance - optimizedDistance);
      const timeSaved = Math.max(0, originalTime - optimizedTime);

      // ========================================
      // STEP 5: Return comprehensive response
      // ========================================
      createResponse(res, HTTP_STATUS.OK, "Route optimized", {
        activities: optimizedActivities,
        routeGeometry: optimizedRouteGeometry,
        originalRouteGeometry: originalRouteGeometry,
        originalDistance: Math.round(originalDistance / 1000 * 10) / 10, // km, 1 decimal
        optimizedDistance: Math.round(optimizedDistance / 1000 * 10) / 10, // km, 1 decimal
        kilometerSaved: Math.round(distanceSaved / 1000 * 10) / 10, // km, 1 decimal
        totalTime: Math.round(optimizedTime / 60), // minutes
        timeSaved: Math.round(timeSaved / 60), // minutes
        matrixSummary: totalsFromMatrix,
      });
    } catch (error) {
      handleRouteError(error);
    }
  },
};

// --- Helpers ---

const handleRouteError = (error: unknown) => {
  if (error instanceof ZodError) {
    throwError(HTTP_STATUS.BAD_REQUEST, "Validation failed", error.errors);
  }
  if (error instanceof AppError) {
    throw error;
  }
  throwError(HTTP_STATUS.INTERNAL_SERVER_ERROR, "Route processing failed", error);
};

const buildNearestNeighborOrder = (times: Array<Array<number | null>>): number[] => {
  const total = times.length;
  if (total === 0) return [];
  if (total === 1) return [0];
  if (total === 2) return [0, 1];

  const startIndex = 0;
  const endIndex = total - 1;

  const remainingMiddle = new Set<number>();
  for (let i = 1; i < endIndex; i += 1) {
    remainingMiddle.add(i);
  }

  const order = [startIndex];
  while (remainingMiddle.size > 0) {
    const current = order[order.length - 1];
    let nextIndex: number | null = null;
    let bestTime = Number.POSITIVE_INFINITY;

    remainingMiddle.forEach((candidate) => {
      const time = times[current]?.[candidate];
      if (typeof time === "number" && time < bestTime) {
        bestTime = time;
        nextIndex = candidate;
      }
    });

    if (nextIndex === null) {
      const iter = remainingMiddle.values().next();
      if (iter.done || typeof iter.value !== "number") {
        break;
      }
      nextIndex = iter.value;
    }

    remainingMiddle.delete(nextIndex);
    order.push(nextIndex);
  }

  order.push(endIndex);
  return order;
};

const sumTotalsFromMatrix = (
  order: number[],
  distances: Array<Array<number | null>>,
  times: Array<Array<number | null>>
) => {
  return order.reduce(
    (totals, index, position) => {
      if (position === 0) return totals;
      const prevIndex = order[position - 1];
      const distance = distances[prevIndex]?.[index];
      const time = times[prevIndex]?.[index];
      return {
        totalDistance: totals.totalDistance + (typeof distance === "number" ? distance : 0),
        totalTime: totals.totalTime + (typeof time === "number" ? time : 0),
      };
    },
    { totalDistance: 0, totalTime: 0 }
  );
};