export class QueryNormalizer {
  static extractStation(query: string): string | null {
    const match = query.match(
      /(?:from|van|naar|to|towards|at|in)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{1,40})/i
    );

    if (!match) return null;

    const station = match[1].trim();
    return station.length > 0 ? station : null;
  }

  static extractRoute(query: string): { from: string | null; to: string | null } {
    const fromMatch = query.match(/(?:from|van)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{1,40})/i);
    const toMatch = query.match(/(?:to|naar)\s+([A-Za-zÀ-ÿ][A-Za-zÀ-ÿ\s-]{1,40})/i);

    return {
      from: fromMatch ? fromMatch[1].trim() : null,
      to: toMatch ? toMatch[1].trim() : null,
    };
  }

  static normalizeStationName(value: string | null | undefined): string | null {
    if (!value) return null;

    return value
      .trim()
      .replace(/\s+/g, " ")
      .replace(/\s+(station|centrale|centraal)$/i, "")
      .trim();
  }
}
