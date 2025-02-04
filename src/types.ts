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

// Add these new interfaces after the existing ones

export interface DepartureProduct {
  number: string;
  categoryCode: string;
  shortCategoryName: string;
  longCategoryName: string;
  operatorName: string;
  operatorCode: string;
  type: string;
}

export interface RouteStation {
  uicCode: string;
  mediumName: string;
}

export interface Departure {
  direction: string;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack?: string;
  actualTrack?: string;
  product: DepartureProduct;
  trainCategory: string;
  cancelled: boolean;
  routeStations: RouteStation[];
  messages: string[];
  departureStatus: string;
}

export interface DeparturesResponse {
  payload: {
    source: string;
    departures: Departure[];
  };
}

export interface GetDeparturesArgs {
  station: string;
  dateTime?: string;
  maxJourneys?: number;
  lang?: string;
}

export function isValidDeparturesArgs(args: unknown): args is GetDeparturesArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;

  // Required station field
  if (typeof typedArgs.station !== "string") {
    return false;
  }

  // Optional fields
  if (typedArgs.dateTime !== undefined && typeof typedArgs.dateTime !== "string") {
    return false;
  }

  if (typedArgs.maxJourneys !== undefined && typeof typedArgs.maxJourneys !== "number") {
    return false;
  }

  if (typedArgs.lang !== undefined && typeof typedArgs.lang !== "string") {
    return false;
  }

  return true;
}

export interface OpeningHours {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  closesNextDay: boolean;
}

export interface OVFietsLocation {
  distance?: number;
  name: string;
  stationCode: string;
  lat: number;
  lng: number;
  open: string;
  description: string;
  openingHours: OpeningHours[];
  extra: {
    serviceType: string;
    rentalBikes: string;
    locationCode: string;
    type: string;
  };
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
}

export interface OVFietsResponse {
  payload: {
    locations: OVFietsLocation[];
  }[];
}

export interface GetOVFietsArgs {
  stationCode: string;
}

export function isValidOVFietsArgs(args: unknown): args is GetOVFietsArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;
  return typeof typedArgs.stationCode === "string";
}

export interface StationInfoArgs {
  query: string;
  includeNonPlannableStations?: boolean;
  limit?: number;
}

export function isValidStationInfoArgs(args: any): args is StationInfoArgs {
  return (
    typeof args === 'object' &&
    typeof args.query === 'string' &&
    (args.includeNonPlannableStations === undefined || typeof args.includeNonPlannableStations === 'boolean') &&
    (args.limit === undefined || (typeof args.limit === 'number' && args.limit >= 1 && args.limit <= 50))
  );
}

export interface StationId {
  uicCode: string;
  evaCode: string;
  cdCode: number;
  code: string;
}

export interface StationNames {
  long: string;
  medium: string;
  short: string;
  synonyms: string[];
}

export interface StationLocation {
  lat: number;
  lng: number;
}

export interface NearbyMeLocationId {
  value: string;
  type: string;
}

export interface Station {
  id: StationId;
  stationType: string;
  names: StationNames;
  location: StationLocation;
  tracks: string[];
  hasKnownFacilities: boolean;
  availableForAccessibleTravel: boolean;
  hasTravelAssistance: boolean;
  areTracksIndependentlyAccessible: boolean;
  isBorderStop: boolean;
  country: string;
  radius: number;
  approachingRadius: number;
  startDate: string;
  nearbyMeLocationId: NearbyMeLocationId;
}

export interface StationInfoResponse {
  payload: Station[];
}

export interface RecognizableDestination {
  code: string;
  name: string;
}

export interface ArrivalProduct {
  number: string;
  categoryCode: string;
  shortCategoryName: string;
  longCategoryName: string;
  operatorName: string;
  operatorCode: string;
  type: string;
}

export interface ArrivalMessage {
  message: string;
  style: string;
}

export interface Arrival {
  origin: string;
  recognizableDestination?: RecognizableDestination;
  name: string;
  plannedDateTime: string;
  plannedTimeZoneOffset: number;
  actualDateTime: string;
  actualTimeZoneOffset: number;
  plannedTrack?: string;
  actualTrack?: string;
  product: ArrivalProduct;
  trainCategory: string;
  cancelled: boolean;
  messages: ArrivalMessage[];
  arrivalStatus: string;
}

export interface ArrivalsResponse {
  payload: {
    source: string;
    arrivals: Arrival[];
  };
}

export interface GetArrivalsArgs {
  station?: string;
  uicCode?: string;
  dateTime?: string;
  maxJourneys?: number;
  lang?: string;
}

export function isValidArrivalsArgs(args: unknown): args is GetArrivalsArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;

  // Either station or uicCode must be provided
  if (!typedArgs.station && !typedArgs.uicCode) {
    return false;
  }

  // Check station: should be undefined or string
  if (typedArgs.station !== undefined && typeof typedArgs.station !== "string") {
    return false;
  }

  // Check uicCode: should be undefined or string
  if (typedArgs.uicCode !== undefined && typeof typedArgs.uicCode !== "string") {
    return false;
  }

  // Check dateTime: should be undefined or string
  if (typedArgs.dateTime !== undefined && typeof typedArgs.dateTime !== "string") {
    return false;
  }

  // Check maxJourneys: should be undefined or number between 1 and 100
  if (typedArgs.maxJourneys !== undefined) {
    if (typeof typedArgs.maxJourneys !== "number" || 
        typedArgs.maxJourneys < 1 || 
        typedArgs.maxJourneys > 100) {
      return false;
    }
  }

  // Check lang: should be undefined or 'nl' or 'en'
  if (typedArgs.lang !== undefined) {
    if (typeof typedArgs.lang !== "string" || !["nl", "en"].includes(typedArgs.lang)) {
      return false;
    }
  }

  return true;
}

export interface PriceValidity {
  label: string;
  value: string;
}

export interface Price {
  totalPriceInCents: number;
  pricePerAdultInCents: number;
  discountInCents: number;
  operatorName: string;
  discountType: string;
  travelClass: 'FIRST_CLASS' | 'SECOND_CLASS';
  displayName: string;
  conditionsHeader: string;
  productId: string;
  isBestOption: boolean;
  pricePerChildInCents: number;
  validity: PriceValidity;
  conditionsList: string[];
}

export interface PricesResponse {
  payload: {
    prices: Price[];
  };
}

export interface GetPricesArgs {
  fromStation?: string;
  toStation?: string;
  travelClass?: 'FIRST_CLASS' | 'SECOND_CLASS';
  travelType?: 'single' | 'return';
  isJointJourney?: boolean;
  adults?: number;
  children?: number;
  routeId?: string;
  plannedDepartureTime?: string;
  plannedArrivalTime?: string;
}

export function isValidPricesArgs(args: unknown): args is GetPricesArgs {
  if (!args || typeof args !== "object") {
    return false;
  }

  const typedArgs = args as Record<string, unknown>;

  // Check station fields: should be undefined or string
  if (typedArgs.fromStation !== undefined && typeof typedArgs.fromStation !== "string") {
    return false;
  }
  if (typedArgs.toStation !== undefined && typeof typedArgs.toStation !== "string") {
    return false;
  }

  // Check travelClass: should be undefined or one of the allowed values
  if (typedArgs.travelClass !== undefined && 
      !["FIRST_CLASS", "SECOND_CLASS"].includes(typedArgs.travelClass as string)) {
    return false;
  }

  // Check travelType: should be undefined or one of the allowed values
  if (typedArgs.travelType !== undefined && 
      !["single", "return"].includes(typedArgs.travelType as string)) {
    return false;
  }

  // Check isJointJourney: should be undefined or boolean
  if (typedArgs.isJointJourney !== undefined && typeof typedArgs.isJointJourney !== "boolean") {
    return false;
  }

  // Check adults: should be undefined or integer
  if (typedArgs.adults !== undefined && 
      (typeof typedArgs.adults !== "number" || !Number.isInteger(typedArgs.adults))) {
    return false;
  }

  // Check children: should be undefined or integer
  if (typedArgs.children !== undefined && 
      (typeof typedArgs.children !== "number" || !Number.isInteger(typedArgs.children))) {
    return false;
  }

  // Check routeId: should be undefined or string
  if (typedArgs.routeId !== undefined && typeof typedArgs.routeId !== "string") {
    return false;
  }

  // Check time fields: should be undefined or string
  if (typedArgs.plannedDepartureTime !== undefined && typeof typedArgs.plannedDepartureTime !== "string") {
    return false;
  }
  if (typedArgs.plannedArrivalTime !== undefined && typeof typedArgs.plannedArrivalTime !== "string") {
    return false;
  }

  return true;
}