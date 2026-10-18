import { NSApiService } from "../services/NSApiService.js";
import { IntentRouter } from "./IntentRouter.js";
import { QueryNormalizer } from "./QueryNormalizer.js";
import { ResponseSummarizer } from "./ResponseSummarizer.js";

export class ToolOrchestrator {
  constructor(private readonly nsApiService: NSApiService) {}

  async handle(query: string): Promise<{ intent: string; data: unknown; summary: string }> {
    const intent = IntentRouter.detect(query);
    const normalizedQuery = String(query || "").trim();

    try {
      let data: unknown;

      switch (intent) {
        case "disruptions": {
          data = await this.nsApiService.getDisruptions({ isActive: true });
          break;
        }

        case "departures": {
          const station = QueryNormalizer.normalizeStationName(
            QueryNormalizer.extractStation(normalizedQuery) ?? "ut"
          );

          data = await this.nsApiService.getDepartures({
            station,
            dateTime: new Date().toISOString(),
            maxJourneys: 6,
            lang: "en",
          });
          break;
        }

        case "arrivals": {
          const station = QueryNormalizer.normalizeStationName(
            QueryNormalizer.extractStation(normalizedQuery) ?? "ut"
          );

          data = await this.nsApiService.getArrivals({
            station,
            dateTime: new Date().toISOString(),
            maxJourneys: 6,
            lang: "en",
          });
          break;
        }

        case "prices": {
          const route = QueryNormalizer.extractRoute(normalizedQuery);

          data = await this.nsApiService.getPrices({
            fromStation: QueryNormalizer.normalizeStationName(route.from) ?? "ams",
            toStation: QueryNormalizer.normalizeStationName(route.to) ?? "rtd",
            travelClass: "2e",
            travelType: "single",
            adults: 1,
            children: 0,
            isJointJourney: false,
          });
          break;
        }

        case "travel-advice": {
          const route = QueryNormalizer.extractRoute(normalizedQuery);

          data = await this.nsApiService.getTravelAdvice({
            fromStation: QueryNormalizer.normalizeStationName(route.from) ?? "ams",
            toStation: QueryNormalizer.normalizeStationName(route.to) ?? "rtd",
            dateTime: new Date().toISOString(),
            searchForArrival: false,
          });
          break;
        }

        case "station-info": {
          const station = QueryNormalizer.normalizeStationName(
            QueryNormalizer.extractStation(normalizedQuery) ?? "ut"
          );

          data = await this.nsApiService.getStationInfo({
            query: station,
            includeNonPlannableStations: true,
            limit: 5,
          });
          break;
        }

        default:
          data = {
            message:
              "I can help with departures, disruptions, station info, ticket prices, and route advice. Try: 'What trains leave from Utrecht in the next hour?'",
          };
          break;
      }

      return {
        intent,
        data,
        summary: ResponseSummarizer.summarize(data, intent),
      };
    } catch (error) {
      return {
        intent,
        data: { error: error instanceof Error ? error.message : String(error) },
        summary:
          error instanceof Error
            ? `Error while fetching NS data: ${error.message}`
            : "An unexpected error occurred while fetching travel information.",
      };
    }
  }
}
