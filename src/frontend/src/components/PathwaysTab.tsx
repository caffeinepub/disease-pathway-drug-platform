import { Skeleton } from "@/components/ui/skeleton";
import { ExternalLink, GitBranch } from "lucide-react";
import type { Pathway } from "../backend.d.ts";
import { ConfidenceBar } from "./ConfidenceBar";

interface PathwaysTabProps {
  pathways: Pathway[];
  isLoading?: boolean;
}

function PathwayCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{
        background: "oklch(0.12 0.04 270 / 0.6)",
        border: "1px solid oklch(0.82 0.17 198 / 0.1)",
      }}
    >
      <Skeleton
        className="h-5 w-3/4"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-4 w-1/3"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-3 w-full"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-3 w-5/6"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-2 w-full"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
    </div>
  );
}

export function PathwaysTab({ pathways, isLoading }: PathwaysTabProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <PathwayCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!pathways.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        style={{ color: "oklch(0.5 0.06 260)" }}
      >
        <GitBranch className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-display font-semibold opacity-60">
          No pathways found
        </p>
        <p className="text-sm mt-2 opacity-40">Try a different disease name</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {pathways.map((pathway, i) => {
        const score = Number(pathway.confidenceScore);
        const accentColor =
          score >= 70
            ? "oklch(0.75 0.20 155)"
            : score >= 40
              ? "oklch(0.82 0.18 55)"
              : "oklch(0.65 0.22 25)";
        return (
          <div
            key={pathway.id}
            data-ocid={`pathway.card.${i + 1}`}
            className="glass-card glass-card-hover rounded-xl p-5 space-y-3 group overflow-hidden"
            style={{
              borderLeft: `2px solid ${accentColor.replace(")", " / 0.55)")}`,
            }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-display font-semibold text-sm leading-snug truncate"
                  style={{ color: "oklch(0.92 0.04 240)" }}
                  title={pathway.name}
                >
                  {pathway.name}
                </h3>
                <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                  {pathway.keggId && (
                    <span
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                      style={{
                        background: "oklch(0.82 0.17 198 / 0.1)",
                        color: "oklch(0.82 0.17 198)",
                        border: "1px solid oklch(0.82 0.17 198 / 0.25)",
                      }}
                    >
                      {pathway.keggId}
                    </span>
                  )}
                  {pathway.source && (
                    <span
                      className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                      style={{
                        background: "oklch(0.55 0.22 295 / 0.1)",
                        color: "oklch(0.75 0.15 295)",
                        border: "1px solid oklch(0.55 0.22 295 / 0.25)",
                      }}
                    >
                      {pathway.source}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Description */}
            {pathway.description && (
              <p
                className="text-xs leading-relaxed line-clamp-3"
                style={{ color: "oklch(0.65 0.06 260)" }}
              >
                {pathway.description}
              </p>
            )}

            {/* Confidence */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Confidence Score
                </span>
              </div>
              <ConfidenceBar score={score} />
            </div>

            {/* KEGG Link */}
            {pathway.keggId && (
              <a
                href={`https://www.kegg.jp/entry/${pathway.keggId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-medium mt-1 transition-all duration-200"
                style={{ color: "oklch(0.82 0.17 198 / 0.7)" }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.82 0.17 198)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLAnchorElement).style.color =
                    "oklch(0.82 0.17 198 / 0.7)";
                }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View in KEGG
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
