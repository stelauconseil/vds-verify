export type HistoryFilter = "all" | "pinned" | "review";
export type SearchableHistoryEntry = {
    timestamp: string;
    pinned?: boolean;
    data: {
        header?: unknown;
        data?: unknown;
        signer?: unknown;
        sign_is_valid?: boolean;
    };
};

const normalize = (value: string) =>
    value.normalize("NFD").replace(/\p{M}/gu, "").toLocaleLowerCase();

function searchableText(value: unknown): string {
    if (typeof value === "string") return value.length > 2000 ? "" : value;
    if (typeof value === "number") return String(value);
    if (Array.isArray(value)) return value.map(searchableText).join(" ");
    if (value && typeof value === "object") {
        return Object.values(value).map(searchableText).join(" ");
    }
    return "";
}

export function filterHistory<T extends SearchableHistoryEntry>(
    entries: T[],
    query: string,
    filter: HistoryFilter,
    locale: string,
): T[] {
    const terms = normalize(query).trim().split(/\s+/).filter(Boolean);
    return entries
        .filter((entry) => {
            if (filter === "pinned" && !entry.pinned) return false;
            // Match the result screen: a verified signature needs both validity and signer details.
            if (
                filter === "review" &&
                entry.data.sign_is_valid === true &&
                entry.data.signer
            )
                return false;
            if (!terms.length) return true;
            const date = new Date(entry.timestamp);
            const text = normalize(
                [
                    entry.timestamp,
                    Number.isNaN(date.getTime())
                        ? ""
                        : date.toLocaleDateString(locale),
                    searchableText(entry.data.header),
                    searchableText(entry.data.data),
                    searchableText(entry.data.signer),
                ].join(" "),
            );
            return terms.every((term) => text.includes(term));
        })
        .sort((a, b) => {
            const pinnedOrder =
                Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
            return (
                pinnedOrder ||
                (Date.parse(b.timestamp) || 0) - (Date.parse(a.timestamp) || 0)
            );
        });
}
