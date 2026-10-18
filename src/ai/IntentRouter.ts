export type Intent =
  | "disruptions"
  | "departures"
  | "arrivals"
  | "prices"
  | "travel-advice"
  | "station-info"
  | "unknown";

export class IntentRouter {
  static detect(query: string): Intent {
    const q = String(query || "").toLowerCase();

    if (
      /delay|delays|storing|disruption|maintenance|onderhoud|vertraging|uitval|problemen|storing/i.test(q)
    ) {
      return "disruptions";
    }

    if (
      /vertrek|departures|afvaart|from .* to|van .* naar|trein .* vertrekt|hoe laat.*vertrek/i.test(q)
    ) {
      return "departures";
    }

    if (
      /aankomst|arrivals|ankomsttijd|binnenkomen|welke trein komt|komt.*aan/i.test(q)
    ) {
      return "arrivals";
    }

    if (
      /prijs|fare|ticket|tarief|kosten|hoe duur|goedekoop|kaartje/i.test(q)
    ) {
      return "prices";
    }

    if (
      /reisadvies|route|travel advice|beste route|alternatief|reistijd|route advice|welke route/i.test(q)
    ) {
      return "travel-advice";
    }

    if (
      /station|stations|platform|ovfiets|ov-fiets|toilet|toegankelijk|accessibility|informatie/i.test(q)
    ) {
      return "station-info";
    }

    return "unknown";
  }
}
