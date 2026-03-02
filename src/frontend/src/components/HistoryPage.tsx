import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight, Clock, FlaskConical, History } from "lucide-react";
import type { SearchHistoryEntry } from "../backend.d.ts";

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
    <div className="space-y-8">
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
          Search History
        </h2>
        <p className="text-sm" style={{ color: "oklch(0.6 0.06 260)" }}>
          Previous disease analyses stored in this session
        </p>
      </div>

      {/* Empty state */}
      {!history.length && (
        <div
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
    </div>
  );
}
