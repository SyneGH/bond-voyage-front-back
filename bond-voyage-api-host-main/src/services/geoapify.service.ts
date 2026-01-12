import axios from "axios";
import { HTTP_STATUS } from "@/constants/constants";
import { throwError } from "@/utils/responseHandler";
import { TTLCache } from "@/utils/ttlCache";

type Coordinate = { lat: number; lng: number };

type MatrixCell = {
  distance?: number;
  time?: number;
  duration?: number;
};

const GEOAPIFY_BASE_URL = "https://api.geoapify.com/v1";
const AUTOCOMPLETE_TTL_MS = 5 * 60 * 1000;
const MATRIX_TTL_MS = 10 * 60 * 1000;

const geoapifyClient = axios.create({
  baseURL: GEOAPIFY_BASE_URL,
  timeout: 15000,
});

export class GeoapifyService {
  private static autocompleteCache = new TTLCache<unknown[]>();
  private static matrixCache = new TTLCache<{
    distances: Array<Array<number | null>>;
    times: Array<Array<number | null>>;
    raw: unknown;
  }>();

  private static getApiKey(): string {
    const apiKey = process.env.GEOAPIFY_API_KEY;
    if (!apiKey) {
      throwError(
        HTTP_STATUS.INTERNAL_SERVER_ERROR,
        "GEOAPIFY_API_KEY is required for this endpoint"
      );
    }
    return apiKey!;
  }

  static async autocomplete(text: string, limit = 3): Promise<unknown[]> {
    const apiKey = this.getApiKey();
    // Optional: Add filter to cache key if you plan to make it dynamic later
    const cacheKey = `autocomplete:ph:${text}:${limit}`; 
    const cached = this.autocompleteCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await geoapifyClient.get("/geocode/autocomplete", {
      params: {
        text,
        limit,
        apiKey,
        // Restrict results to Philippines (ISO 3166-1 alpha-2 code 'ph')
        filter: "countrycode:ph", 
      },
    });

    const features = Array.isArray(response.data?.features)
      ? response.data.features
      : [];

    this.autocompleteCache.set(cacheKey, features, AUTOCOMPLETE_TTL_MS);
    return features;
  }

  static async getCoordinates(text: string): Promise<Coordinate> {
    const apiKey = this.getApiKey();
    
    // We use the search endpoint to find the best match for a location string
    const response = await geoapifyClient.get("/geocode/search", {
      params: {
        text,
        limit: 1,
        apiKey,
        filter: "countrycode:ph", // Restrict results to Philippines
      },
    });

    const feature = response.data?.features?.[0];

    if (!feature || !feature.properties) {
      // Return a default or throw based on your preference. 
      // Throwing ensures we don't route to 0,0 (Atlantic Ocean).
      throwError(HTTP_STATUS.BAD_REQUEST, `Could not find coordinates for: ${text}`);
    }

    return {
      lat: feature.properties.lat,
      lng: feature.properties.lon, // Geoapify returns 'lon', we map to 'lng'
    };
  }

  static async routeMatrix(
    points: Coordinate[],
    mode = "drive"
  ): Promise<{
    distances: Array<Array<number | null>>;
    times: Array<Array<number | null>>;
    raw: unknown;
  }> {
    const apiKey = this.getApiKey();
    const payload = points.map((point) => [point.lng, point.lat]);
    const cacheKey = `matrix:${mode}:${JSON.stringify(payload)}`;
    const cached = this.matrixCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    const response = await geoapifyClient.post(
      "/routematrix",
      {
        mode,
        sources: payload,
        targets: payload,
      },
      {
        params: { apiKey },
      }
    );

    const matrix: MatrixCell[][] | undefined =
      response.data?.sources_to_targets ?? response.data?.matrix;

    if (!Array.isArray(matrix)) {
      throwError(
        HTTP_STATUS.BAD_GATEWAY,
        "Unexpected Geoapify route matrix response"
      );
    }
    const matrixSafe = matrix as MatrixCell[][];

    const distances = matrixSafe.map((row) =>
      Array.isArray(row)
        ? row.map((cell) =>
            typeof cell?.distance === "number" ? cell.distance : null
          )
        : []
    );

    const times = matrixSafe.map((row) =>
      Array.isArray(row)
        ? row.map((cell) => {
            if (typeof cell?.time === "number") return cell.time;
            if (typeof cell?.duration === "number") return cell.duration;
            return null;
          })
        : []
    );

    const normalized = {
      distances,
      times,
      raw: response.data,
    };

    this.matrixCache.set(cacheKey, normalized, MATRIX_TTL_MS);
    return normalized;
  }

  static async route(points: Coordinate[], mode = "drive"): Promise<unknown> {
    const apiKey = this.getApiKey();
    const waypoints = points.map((point) => `${point.lat},${point.lng}`).join("|");

    const response = await geoapifyClient.get("/routing", {
      params: {
        waypoints,
        mode,
        apiKey,
      },
    });

    return response.data;
  }
}