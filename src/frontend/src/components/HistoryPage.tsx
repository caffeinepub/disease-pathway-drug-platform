import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronRight,
  Clock,
  FlaskConical,
  History,
  Search,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type { SearchHistoryEntry } from "../backend.d.ts";

const FAVORITES_KEY = "dpdp_favorites";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

interface HistoryPageProps {
  history: SearchHistoryEntry[];
  isLoading: boolean;
  onSearchAgain: (disease: string) => void;
}

function formatTimestamp(ts: bigint) {
  try {
    // Motoko timestamps are in nanoseconds
    const ms = Number(ts) / 1_000_000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "Unknown date";
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "Unknown date";
  }
}

export function HistoryPage({
  history,
  isLoading,
  onSearchAgain,
}: HistoryPageProps) {
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);

  // Re-read favorites from storage on mount (since they can be updated from other pages)
  useEffect(() => {
    setFavorites(loadFavorites());
  }, []);

  function removeFavorite(name: string) {
    try {
      const updated = favorites.filter((f) => f !== name);
      setFavorites(updated);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    } catch {
      // storage unavailable
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="text-center space-y-3">
          <Skeleton
            className="h-9 w-48 mx-auto"
            style={{ background: "oklch(0.16 0.05 270)" }}
          />
          <Skeleton
            className="h-4 w-64 mx-auto"
            style={{ background: "oklch(0.16 0.05 270)" }}
          />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }, (_, i) => `skel-${i}`).map((k) => (
            <Skeleton
              key={k}
              className="h-20 w-full rounded-xl"
              style={{ background: "oklch(0.12 0.04 270)" }}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div className="text-center space-y-3">
        <h2
          className="font-display text-3xl font-bold"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.82 0.17 198), oklch(0.55 0.22 295))",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          History & Favorites
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.6 0.06 260)" }}>
          Saved searches and favorited diseases
        </p>
      </div>

      {/* ─── Favorites section ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Star
            className="w-4 h-4"
            style={{ color: "oklch(0.88 0.18 85)" }}
            fill="oklch(0.88 0.18 85)"
          />
          <h3
            className="font-display font-semibold text-base"
            style={{ color: "oklch(0.88 0.06 240)" }}
          >
            Favorites
          </h3>
          {favorites.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono"
              style={{
                background: "oklch(0.88 0.18 85 / 0.15)",
                color: "oklch(0.88 0.18 85)",
                border: "1px solid oklch(0.88 0.18 85 / 0.3)",
              }}
            >
              {favorites.length}
            </span>
          )}
        </div>

        {favorites.length === 0 ? (
          <div
            data-ocid="favorites.empty_state"
            className="flex flex-col items-center justify-center py-10 text-center rounded-2xl"
            style={{
              background: "oklch(0.10 0.03 270 / 0.4)",
              border: "1px dashed oklch(0.88 0.18 85 / 0.15)",
            }}
          >
            <Star
              className="w-10 h-10 mb-3 opacity-25"
              style={{ color: "oklch(0.88 0.18 85)" }}
            />
            <p
              className="font-display text-sm font-semibold opacity-50"
              style={{ color: "oklch(0.75 0.06 260)" }}
            >
              No favorites yet
            </p>
            <p
              className="text-xs mt-1 opacity-35"
              style={{ color: "oklch(0.6 0.06 260)" }}
            >
              Star a disease in the results panel to save it here
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {favorites.map((name, i) => (
              <div
                key={name}
                data-ocid={`favorites.item.${i + 1}`}
                className="rounded-xl p-4 flex items-center gap-3 transition-all duration-200"
                style={{
                  background: "oklch(0.10 0.035 270 / 0.6)",
                  border: "1px solid oklch(0.88 0.18 85 / 0.2)",
                  backdropFilter: "blur(8px)",
                }}
              >
                {/* Star icon */}
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.88 0.18 85 / 0.12)",
                    border: "1px solid oklch(0.88 0.18 85 / 0.25)",
                  }}
                >
                  <Star
                    className="w-4 h-4"
                    style={{ color: "oklch(0.88 0.18 85)" }}
                    fill="oklch(0.88 0.18 85)"
                  />
                </div>

                {/* Name */}
                <span
                  className="flex-1 min-w-0 font-medium text-sm truncate"
                  style={{ color: "oklch(0.88 0.04 240)" }}
                  title={name}
                >
                  {name}
                </span>

                {/* Actions */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <button
                    type="button"
                    data-ocid={`favorites.search_button.${i + 1}`}
                    onClick={() => onSearchAgain(name)}
                    title="Search again"
                    className="p-1.5 rounded-lg transition-all"
                    style={{
                      color: "oklch(0.82 0.17 198 / 0.7)",
                      background: "oklch(0.82 0.17 198 / 0.08)",
                      border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "oklch(0.82 0.17 198)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.82 0.17 198 / 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "oklch(0.82 0.17 198 / 0.7)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.82 0.17 198 / 0.08)";
                    }}
                  >
                    <Search className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    data-ocid={`favorites.delete_button.${i + 1}`}
                    onClick={() => removeFavorite(name)}
                    title="Remove from favorites"
                    className="p-1.5 rounded-lg transition-all"
                    style={{
                      color: "oklch(0.65 0.22 25 / 0.6)",
                      background: "oklch(0.65 0.22 25 / 0.06)",
                      border: "1px solid oklch(0.65 0.22 25 / 0.15)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "oklch(0.65 0.22 25)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.65 0.22 25 / 0.12)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLButtonElement).style.color =
                        "oklch(0.65 0.22 25 / 0.6)";
                      (e.currentTarget as HTMLButtonElement).style.background =
                        "oklch(0.65 0.22 25 / 0.06)";
                    }}
                  >
                    <Star className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Divider */}
      <div
        className="border-t"
        style={{ borderColor: "oklch(0.82 0.17 198 / 0.1)" }}
      />

      {/* ─── Search History section ─── */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <History
            className="w-4 h-4"
            style={{ color: "oklch(0.82 0.17 198)" }}
          />
          <h3
            className="font-display font-semibold text-base"
            style={{ color: "oklch(0.88 0.06 240)" }}
          >
            Search History
          </h3>
          {history.length > 0 && (
            <span
              className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono"
              style={{
                background: "oklch(0.82 0.17 198 / 0.12)",
                color: "oklch(0.82 0.17 198)",
                border: "1px solid oklch(0.82 0.17 198 / 0.25)",
              }}
            >
              {history.length}
            </span>
          )}
        </div>

        {/* Empty state */}
        {!history.length && (
          <div
            data-ocid="history.empty_state"
            className="flex flex-col items-center justify-center py-20 text-center rounded-2xl"
            style={{
              background: "oklch(0.10 0.03 270 / 0.5)",
              border: "1px solid oklch(0.82 0.17 198 / 0.1)",
            }}
          >
            <History
              className="w-16 h-16 mb-4 opacity-20"
              style={{ color: "oklch(0.82 0.17 198)" }}
            />
            <p
              className="font-display text-lg font-semibold opacity-50"
              style={{ color: "oklch(0.75 0.06 260)" }}
            >
              No searches yet
            </p>
            <p
              className="text-sm mt-2 opacity-40"
              style={{ color: "oklch(0.6 0.06 260)" }}
            >
              Analyze a disease to see it here
            </p>
          </div>
        )}

        {/* History list */}
        {history.length > 0 && (
          <div className="space-y-3">
            {history.map((entry, i) => (
              <button
                key={entry.diseaseName}
                type="button"
                data-ocid={`history.item.${i + 1}`}
                onClick={() => onSearchAgain(entry.diseaseName)}
                className="w-full text-left rounded-xl p-4 flex items-center gap-4 transition-all duration-200 group"
                style={{
                  background: "oklch(0.10 0.035 270 / 0.6)",
                  border: "1px solid oklch(0.82 0.17 198 / 0.12)",
                  backdropFilter: "blur(8px)",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.12 0.045 270 / 0.8)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.82 0.17 198 / 0.3)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.10 0.035 270 / 0.6)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.82 0.17 198 / 0.12)";
                }}
              >
                {/* Icon */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "oklch(0.82 0.17 198 / 0.1)",
                    border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                  }}
                >
                  <FlaskConical
                    className="w-5 h-5"
                    style={{ color: "oklch(0.82 0.17 198)" }}
                  />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="font-semibold text-sm truncate"
                      style={{ color: "oklch(0.88 0.04 240)" }}
                    >
                      {entry.diseaseName}
                    </h3>
                    {favorites.includes(entry.diseaseName) && (
                      <Star
                        className="w-3 h-3 flex-shrink-0"
                        style={{ color: "oklch(0.88 0.18 85)" }}
                        fill="oklch(0.88 0.18 85)"
                      />
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      <span style={{ color: "oklch(0.82 0.17 198)" }}>
                        {Number(entry.pathwaysFound)}
                      </span>{" "}
                      pathways
                    </span>
                    <span
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      <span style={{ color: "oklch(0.75 0.20 155)" }}>
                        {Number(entry.drugsFound)}
                      </span>{" "}
                      drugs
                    </span>
                    <span
                      className="flex items-center gap-1 text-xs"
                      style={{ color: "oklch(0.45 0.06 260)" }}
                    >
                      <Clock className="w-3 h-3" />
                      {formatTimestamp(entry.timestamp)}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  style={{ color: "oklch(0.82 0.17 198 / 0.5)" }}
                />
              </button>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
