function localize(value: unknown, lang?: string): string | undefined {
    if (typeof value === "string") return value.trim() || undefined;
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;

    const translations = value as Record<string, unknown>;
    const locale = lang?.toLowerCase().replaceAll("_", "-") ?? "";
    const entries = Object.entries(translations);
    const candidates = [
        entries.find(([key]) => key.toLowerCase().replaceAll("_", "-") === locale)?.[1],
        translations[locale.split("-")[0]],
        ...Object.values(translations),
    ];
    return candidates.find(
        (candidate): candidate is string =>
            typeof candidate === "string" && candidate.trim().length > 0,
    )?.trim();
}

// Both legacy history entries and current API responses use this formatter.
// Keep the original object in VdsResult so changing language remains possible.
export function getLocalizedDocumentType(value: unknown, lang?: string): string | undefined {
    if (value && typeof value === "object" && !Array.isArray(value)) {
        const document = value as Record<string, unknown>;
        if ("nomDuTypeDocument" in document || "descriptionDuTypeDocument" in document) {
            const name = localize(document.nomDuTypeDocument, lang);
            const description = localize(document.descriptionDuTypeDocument, lang);
            return [...new Set([name, description].filter(Boolean))].join(" — ") || undefined;
        }
    }
    return localize(value, lang);
}
