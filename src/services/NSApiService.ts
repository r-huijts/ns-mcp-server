import axios, { AxiosInstance } from 'axios';
import { 
  Disruption, 
  GetDisruptionsArgs, 
  TravelAdvice, 
  GetTravelAdviceArgs,
  DeparturesResponse,
  GetDeparturesArgs,
  OVFietsResponse,
  GetOVFietsArgs
} from '../types.js';

export class NSApiService {
  private axiosInstance: AxiosInstance;
  private static readonly BASE_URL = 'https://gateway.apiportal.ns.nl';
  private static readonly ENDPOINTS = {
    DISRUPTIONS: '/disruptions/v3',
    TRIPS: '/reisinformatie-api/api/v3/trips',
    DEPARTURES: '/reisinformatie-api/api/v2/departures',
    OVFIETS: '/places-api/v2/ovfiets'
  } as const;

  constructor(apiKey: string) {
    this.axiosInstance = axios.create({
      baseURL: NSApiService.BASE_URL,
      headers: {
        'Ocp-Apim-Subscription-Key': apiKey,
      },
    });
  }

  async getDisruptions(args: GetDisruptionsArgs): Promise<Disruption[]> {
    const response = await this.axiosInstance.get<Disruption[]>(
      NSApiService.ENDPOINTS.DISRUPTIONS,
      {
        params: {
          isActive: args.isActive,
          type: args.type,
        },
      }
    );
    return response.data;
  }

  async getTravelAdvice(args: GetTravelAdviceArgs): Promise<TravelAdvice[]> {
    const response = await this.axiosInstance.get<TravelAdvice[]>(
      NSApiService.ENDPOINTS.TRIPS,
      {
        params: {
          fromStation: args.fromStation,
          toStation: args.toStation,
          dateTime: args.dateTime,
          searchForArrival: args.searchForArrival,
        },
      }
    );
    return response.data;
  }

  async getDepartures(args: GetDeparturesArgs): Promise<DeparturesResponse> {
    const response = await this.axiosInstance.get<DeparturesResponse>(
      NSApiService.ENDPOINTS.DEPARTURES,
      {
        params: {
          station: args.station,
          dateTime: args.dateTime,
          maxJourneys: args.maxJourneys,
          lang: args.lang
        },
      }
    );
    return response.data;
  }

  async getOVFiets(args: GetOVFietsArgs): Promise<OVFietsResponse> {
    const response = await this.axiosInstance.get<OVFietsResponse>(
      NSApiService.ENDPOINTS.OVFIETS,
      {
        params: {
          station_code: args.stationCode
        }
      }
    );
    return response.data;
  }
} 