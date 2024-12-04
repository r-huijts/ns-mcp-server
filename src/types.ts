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

export interface GetDisruptionsArgs {
  isActive?: boolean;
  type?: DisruptionType;
}

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