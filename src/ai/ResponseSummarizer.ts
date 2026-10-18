export class ResponseSummarizer {
  static summarize(payload: unknown, intent: string): string {
    if (!payload) return "No data found.";

    // disruptions: often an array with descriptive fields
    if (intent === "disruptions") {
      const list = Array.isArray(payload) ? payload : (payload as any).data ?? [];
      if (!Array.isArray(list) || list.length === 0) {
        return "There are no active disruptions at the moment.";
      }

      return list
        .slice(0, 5)
        .map((item: any) => {
          const title = item.title ?? item.header ?? "NS disruption";
          const summary = item.summary ?? item.description ?? item.message ?? "No detail provided.";
          return `• ${title}: ${summary}`;
        })
        .join("\n");
    }

    // departures / arrivals: return concise summary if possible
    if (intent === "departures" || intent === "arrivals") {
      try {
        const payloadObj = payload as any;
        const journeys = payloadObj.payload ?? payloadObj.journeys ?? payloadObj;
        // Try to produce a compact readable snippet
        if (Array.isArray(journeys) && journeys.length > 0) {
          return journeys
            .slice(0, 6)
            .map((j: any) => {
              const when = j.plannedDateTime ?? j.time ?? j.actualTime ?? j.expectedDepartureTime ?? j.plannedTime ?? "";
              const line = j.product?.name ?? j.product?.number ?? j.train ?? j.service ?? j.line ?? "";
              const dest = j.destination ?? j.to ?? (j.locations ? j.locations[0]?.name : "");
              const delay = j.delay ? ` (${j.delay} min delay)` : "";
              return `• ${when} — ${line} → ${dest}${delay}`.trim();
            })
            .join("\n");
        }
      } catch {
        // fallthrough
      }
      return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    }

    // prices, travel-advice, station-info: keep structured but readable
    if (intent === "prices" || intent === "travel-advice" || intent === "station-info") {
      try {
        const obj = payload as any;
        if (obj?.prices && Array.isArray(obj.prices)) {
          return obj.prices
            .slice(0, 6)
            .map((p: any) => `• ${p.type ?? p.name ?? "Price"}: ${p.amount ?? p.fare ?? JSON.stringify(p)}`)
            .join("\n");
        }

        if (obj?.trips && Array.isArray(obj.trips)) {
          return obj.trips
            .slice(0, 3)
            .map((t: any) => {
              const duration = t.duration ?? "";
              const transfers = t.transfers != null ? `, ${t.transfers} transfers` : "";
              const summary = t.summary ?? `${t.from ?? ""} → ${t.to ?? ""}`;
              return `• ${summary} (${duration}${transfers})`;
            })
            .join("\n");
        }
      } catch {
        // fallthrough
      }
      return typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    }

    // default: pretty-print
    try {
      return typeof payload === "string" ? payload : JSON.stringify(payload, null, 2);
    } catch {
      return "Unable to summarize payload.";
    }
  }
}
