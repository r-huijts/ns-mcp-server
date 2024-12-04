export interface Coordinate {
  lat: number;
  lng: number;
}

export interface Station {
  coordinate: Coordinate;
  countryCode: string;
  name: string;
  stationCode: string;
  uicCode: string;
}

export interface TitleSection {
  type: string;
  value: string;
}

export interface Phase {
  id: string;
  label: string;
}

export interface Impact {
  value: number;
}

export interface ExpectedDuration {
  description: string;
  endTime: string;
}

export interface Section {
  stations: Station[];
  direction: string;
}

export interface Consequence {
  section: Section;
  description: string;
  level: string;
}

export interface PublicationSection {
  section: Section;
  consequence: Consequence;
  sectionType: string;
}

export interface AdditionalTravelTime {
  label: string;
  shortLabel: string;
  minimumDurationInMinutes?: number;
  maximumDurationInMinutes: number;
}

export interface Situation {
  label: string;
}

export interface Cause {
  label: string;
}

export interface Timespan {
  start: string;
  end: string;
  period: string;
  situation: Situation;
  cause: Cause;
  additionalTravelTime?: AdditionalTravelTime;
  alternativeTransport?: {
    label: string;
    shortLabel: string;
  };
  advices: string[];
}

export interface AlternativeTransportLocation {
  station: Station;
  description: string;
}

export interface AlternativeTransport {
  location: AlternativeTransportLocation[];
  label: string;
  shortLabel: string;
}

export interface AlternativeTransportTimespan {
  start: string;
  end: string;
  alternativeTransport: AlternativeTransport;
}

export interface Disruption {
  type: string;
  id: string;
  title: string;
  isActive: boolean;
  topic?: string;
  local: boolean;
  description?: string;
  titleSections?: TitleSection[][];
  registrationTime: string;
  releaseTime: string;
  start: string;
  end: string;
  phase?: Phase;
  impact: Impact;
  expectedDuration?: ExpectedDuration;
  publicationSections: PublicationSection[];
  summaryAdditionalTravelTime?: AdditionalTravelTime;
  timespans: Timespan[];
  alternativeTransportTimespans: AlternativeTransportTimespan[];
}

export interface ApiResponse {
  contents: {
    uri: string;
    mimeType: string;
    text: string;
  }[];
} 

export type DisruptionType = "MAINTENANCE" | "DISRUPTION";

/**
 * Arguments for getting disruptions
 */
export interface GetDisruptionsArgs {
  isActive?: boolean;  // Filter for active disruptions only
  type?: DisruptionType;  // Type of disruption to filter for
}

/**
 * Type guard for disruption arguments
 */
export function isValidDisruptionsArgs(args: unknown): args is GetDisruptionsArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;

  // Check isActive: should be undefined or boolean
  if (typedArgs.isActive !== undefined && typeof typedArgs.isActive !== "boolean") {
    return false;
  }

  // Check type: should be undefined or one of the allowed values
  if (typedArgs.type !== undefined && 
      (typeof typedArgs.type !== "string" || 
       !["MAINTENANCE", "DISRUPTION"].includes(typedArgs.type))) {
    return false;
  }

  return true;
}

/**
 * Station information in travel advice
 */
export interface TravelAdviceStation {
  name: string;
  lng: number;
  lat: number;
  countryCode?: string;
  uicCode?: string;
  plannedDateTime: string;
  actualDateTime?: string;
  plannedTrack?: string;
  actualTrack?: string;
}

/**
 * Single leg of a journey (one train/segment)
 */
export interface TravelAdviceLeg {
  idx: string;
  name: string;
  direction?: string;  // Final destination of the train
  cancelled: boolean;
  origin: TravelAdviceStation;
  destination: TravelAdviceStation;
  product: {
    displayName: string;  // e.g. "Intercity"
    type: string;
    number: string;      // Train number
    operatorName: string; // e.g. "NS"
  };
  stops?: TravelAdviceStation[];  // Intermediate stops
}

/**
 * Complete trip from origin to destination
 */
export interface TravelAdviceTrip {
  uid: string;
  plannedDurationInMinutes: number;
  actualDurationInMinutes: number;
  status: string;
  legs: TravelAdviceLeg[];
  crowdForecast?: string;
  optimal: boolean;
}

/**
 * Complete travel advice response
 */
export interface TravelAdvice {
  source: string;
  trips: TravelAdviceTrip[];
}

/**
 * Arguments for getting travel advice
 */
export interface GetTravelAdviceArgs {
  fromStation: string;     // Departure station
  toStation: string;       // Destination station
  dateTime?: string;       // Optional departure/arrival time
  searchForArrival?: boolean;  // If true, dateTime is treated as arrival time
}

/**
 * Type guard for travel advice arguments
 */
export function isValidTravelAdviceArgs(args: unknown): args is GetTravelAdviceArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;

  // Required fields
  if (typeof typedArgs.fromStation !== "string" || typeof typedArgs.toStation !== "string") {
    return false;
  }

  // Optional fields
  if (typedArgs.dateTime !== undefined && typeof typedArgs.dateTime !== "string") {
    return false;
  }

  if (typedArgs.searchForArrival !== undefined && typeof typedArgs.searchForArrival !== "boolean") {
    return false;
  }

  return true;
}

// Add these new types for the track map feature

export interface TrackMapFeature {
  type: "Feature";
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
  properties: {
    stations: string[];
  };
}

export interface TrackMapResponse {
  type: "FeatureCollection";
  features: TrackMapFeature[];
}

export interface GetTrackMapArgs {
  stations: string[];
}

export function isValidTrackMapArgs(args: any): args is GetTrackMapArgs {
  return (
    typeof args === "object" &&
    args !== null &&
    Array.isArray(args.stations) &&
    args.stations.length > 0 &&
    args.stations.every((station: any) => typeof station === "string")
  );
}