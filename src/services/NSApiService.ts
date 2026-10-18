import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import axiosRetry from 'axios-retry';
import https from 'https';
import Bottleneck from 'bottleneck';
import {
  Disruption,
  GetDisruptionsArgs,
  TravelAdvice,
  GetTravelAdviceArgs,
  DeparturesResponse,
  GetDeparturesArgs,
  OVFietsResponse,
  GetOVFietsArgs,
  StationInfoArgs,
  StationInfoResponse,
  ArrivalsResponse,
  GetArrivalsArgs,
  PricesResponse,
  GetPricesArgs
} from '../types.js';

export class NSApiService {
  private axiosInstance: AxiosInstance;
  private requestLimiter: Bottleneck;
  private static readonly BASE_URL = process.env.NS_BASE_URL ?? 'https://gateway.apiportal.ns.nl';
  private static readonly DEFAULT_TIMEOUT = Number(process.env.NS_TIMEOUT_MS ?? 5000);
  private static readonly ENDPOINTS = {
    DISRUPTIONS: '/disruptions/v3',
    TRIPS: '/reisinformatie-api/api/v3/trips',
    DEPARTURES: '/reisinformatie-api/api/v2/departures',
    ARRIVALS: '/reisinformatie-api/api/v2/arrivals',
    PRICES: '/reisinformatie-api/api/v3/price',
    OVFIETS: '/places-api/v2/ovfiets',
    STATIONS: '/nsapp-stations/v3'
  } as const;

  constructor(apiKey: string) {
    const httpsAgent = new https.Agent({
      keepAlive: true,
      maxSockets: Number(process.env.NS_MAX_SOCKETS ?? 50),
      maxFreeSockets: Number(process.env.NS_MAX_FREE_SOCKETS ?? 10),
      timeout: NSApiService.DEFAULT_TIMEOUT,
    });

    this.axiosInstance = axios.create({
      baseURL: NSApiService.BASE_URL,
      timeout: NSApiService.DEFAULT_TIMEOUT,
      httpsAgent,
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });

    axiosRetry(this.axiosInstance, {
      retries: Number(process.env.NS_RETRY_COUNT ?? 2),
      retryDelay: axiosRetry.exponentialDelay,
      retryCondition: (error) => {
        return axiosRetry.isNetworkError(error) || axiosRetry.isRetryableError(error);
      },
    });

    this.requestLimiter = new Bottleneck({
      maxConcurrent: Number(process.env.NS_MAX_CONCURRENCY ?? 8),
      minTime: Number(process.env.NS_MIN_TIME_MS ?? 25),
    });
  }

  private async request<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    return this.requestLimiter.schedule(() =>
      this.axiosInstance.get<T>(url, config).then((response) => response.data)
    );
  }

  async getDisruptions(args: GetDisruptionsArgs): Promise<Disruption[]> {
    return this.request<Disruption[]>(NSApiService.ENDPOINTS.DISRUPTIONS, {
      params: {
        isActive: args.isActive,
        type: args.type,
      },
    });
  }

  async getTravelAdvice(args: GetTravelAdviceArgs): Promise<TravelAdvice[]> {
    return this.request<TravelAdvice[]>(NSApiService.ENDPOINTS.TRIPS, {
      params: {
        fromStation: args.fromStation,
        toStation: args.toStation,
        dateTime: args.dateTime,
        searchForArrival: args.searchForArrival,
      },
    });
  }

  async getDepartures(args: GetDeparturesArgs): Promise<DeparturesResponse> {
    return this.request<DeparturesResponse>(NSApiService.ENDPOINTS.DEPARTURES, {
      params: {
        station: args.station,
        dateTime: args.dateTime,
        maxJourneys: args.maxJourneys,
        lang: args.lang
      },
    });
  }

  async getOVFiets(args: GetOVFietsArgs): Promise<OVFietsResponse> {
    return this.request<OVFietsResponse>(NSApiService.ENDPOINTS.OVFIETS, {
      params: {
        station_code: args.stationCode
      }
    });
  }

  async getStationInfo(args: StationInfoArgs): Promise<StationInfoResponse> {
    return this.request<StationInfoResponse>(NSApiService.ENDPOINTS.STATIONS, {
      params: {
        q: args.query,
        includeNonPlannableStations: args.includeNonPlannableStations ?? false,
        limit: args.limit ?? 10
      }
    });
  }

  async getArrivals(args: GetArrivalsArgs): Promise<ArrivalsResponse> {
    return this.request<ArrivalsResponse>(NSApiService.ENDPOINTS.ARRIVALS, {
      params: {
        station: args.station,
        uicCode: args.uicCode,
        dateTime: args.dateTime,
        maxJourneys: args.maxJourneys,
        lang: args.lang
      },
    });
  }

  async getPrices(args: GetPricesArgs): Promise<PricesResponse> {
    return this.request<PricesResponse>(NSApiService.ENDPOINTS.PRICES, {
      params: {
        fromStation: args.fromStation,
        toStation: args.toStation,
        travelClass: args.travelClass,
        travelType: args.travelType,
        isJointJourney: args.isJointJourney,
        adults: args.adults,
        children: args.children,
        routeId: args.routeId,
        plannedDepartureTime: args.plannedDepartureTime,
        plannedArrivalTime: args.plannedArrivalTime
      },
    });
  }
}
