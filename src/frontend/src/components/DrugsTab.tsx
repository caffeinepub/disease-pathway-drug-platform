import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown, ChevronUp, ExternalLink, Pill } from "lucide-react";
import { useState } from "react";
import type { DrugRecommendation } from "../backend.d.ts";
import { ConfidenceBar } from "./ConfidenceBar";

interface DrugsTabProps {
  drugs: DrugRecommendation[];
  isLoading?: boolean;
}

function getApprovalStyle(status: string) {
  const s = status.toLowerCase();
  if (s.includes("approved") || s.includes("fda")) {
    return {
      background: "oklch(0.75 0.20 155 / 0.12)",
      color: "oklch(0.75 0.20 155)",
      border: "1px solid oklch(0.75 0.20 155 / 0.35)",
    };
  }
  if (s.includes("trial") || s.includes("clinical")) {
    return {
      background: "oklch(0.82 0.18 55 / 0.12)",
      color: "oklch(0.88 0.18 85)",
      border: "1px solid oklch(0.88 0.18 85 / 0.35)",
    };
  }
  return {
    background: "oklch(0.5 0.06 260 / 0.12)",
    color: "oklch(0.65 0.06 260)",
    border: "1px solid oklch(0.5 0.06 260 / 0.35)",
  };
}

function DrugCardSkeleton() {
  return (
    <div
      className="rounded-xl p-5 space-y-3"
      style={{
        background: "oklch(0.12 0.04 270 / 0.6)",
        border: "1px solid oklch(0.82 0.17 198 / 0.1)",
      }}
    >
      <Skeleton
        className="h-5 w-2/3"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-4 w-1/4"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-3 w-full"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-3 w-4/5"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <Skeleton
        className="h-2 w-full"
        style={{ background: "oklch(0.16 0.05 270)" }}
      />
      <div className="flex gap-2">
        <Skeleton
          className="h-7 w-20"
          style={{ background: "oklch(0.16 0.05 270)" }}
        />
        <Skeleton
          className="h-7 w-20"
          style={{ background: "oklch(0.16 0.05 270)" }}
        />
      </div>
    </div>
  );
}

export function DrugsTab({ drugs, isLoading }: DrugsTabProps) {
  const [showMoa, setShowMoa] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          <DrugCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (!drugs.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        style={{ color: "oklch(0.5 0.06 260)" }}
      >
        <Pill className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-display font-semibold opacity-60">
          No drug recommendations found
        </p>
        <p className="text-sm mt-2 opacity-40">Try a different disease name</p>
      </div>
    );
  }

  // Sort by confidence score descending
  const sorted = [...drugs].sort(
    (a, b) => Number(b.confidenceScore) - Number(a.confidenceScore),
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {sorted.map((drug, i) => {
        const approvalStyle = getApprovalStyle(drug.approvalStatus);
        const score = Number(drug.confidenceScore);
        const moaExpanded = showMoa === drug.id;

        // Top 3 drugs get a rank glow treatment
        const rankStyle =
          i === 0
            ? {
                borderColor: "oklch(0.88 0.18 85 / 0.45)",
                boxShadow:
                  "0 0 18px oklch(0.88 0.18 85 / 0.12), 0 4px 20px oklch(0.04 0.015 270 / 0.7), 0 1px 0 oklch(0.88 0.18 85 / 0.10) inset",
              }
            : i === 1
              ? {
                  borderColor: "oklch(0.78 0.08 240 / 0.35)",
                  boxShadow:
                    "0 0 14px oklch(0.78 0.08 240 / 0.10), 0 4px 20px oklch(0.04 0.015 270 / 0.7), 0 1px 0 oklch(0.78 0.08 240 / 0.08) inset",
                }
              : i === 2
                ? {
                    borderColor: "oklch(0.65 0.12 55 / 0.30)",
                    boxShadow:
                      "0 0 12px oklch(0.65 0.12 55 / 0.08), 0 4px 20px oklch(0.04 0.015 270 / 0.7), 0 1px 0 oklch(0.65 0.12 55 / 0.06) inset",
                  }
                : {};

        return (
          <div
            key={drug.id}
            data-ocid={`drug.card.${i + 1}`}
            className="glass-card glass-card-hover rounded-xl p-5 space-y-3 flex flex-col relative"
            style={rankStyle}
          >
            {/* Rank badge for top 3 */}
            {i < 3 && (
              <div
                className="absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center text-[0.6rem] font-black font-mono"
                style={{
                  background:
                    i === 0
                      ? "linear-gradient(135deg, oklch(0.88 0.18 85), oklch(0.78 0.15 65))"
                      : i === 1
                        ? "linear-gradient(135deg, oklch(0.78 0.08 240), oklch(0.65 0.06 240))"
                        : "linear-gradient(135deg, oklch(0.65 0.12 55), oklch(0.55 0.10 45))",
                  color: "oklch(0.08 0.02 270)",
                  boxShadow:
                    i === 0 ? "0 0 8px oklch(0.88 0.18 85 / 0.6)" : "none",
                }}
              >
                {i + 1}
              </div>
            )}
            {/* Drug name + approval */}
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3
                  className="font-display font-semibold text-sm leading-snug"
                  style={{ color: "oklch(0.92 0.04 240)" }}
                >
                  {drug.name}
                </h3>
              </div>
              <span
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium flex-shrink-0 whitespace-nowrap"
                style={approvalStyle}
              >
                {drug.approvalStatus}
              </span>
            </div>

            {/* Target protein */}
            {drug.targetProteinId && (
              <div>
                <span
                  className="text-xs"
                  style={{ color: "oklch(0.5 0.06 260)" }}
                >
                  Target:{" "}
                </span>
                <span
                  className="text-xs font-mono"
                  style={{ color: "oklch(0.75 0.15 295)" }}
                >
                  {drug.targetProteinId}
                </span>
              </div>
            )}

            {/* Mechanism of Action */}
            {drug.mechanismOfAction && (
              <div className="flex-1">
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => setShowMoa(moaExpanded ? null : drug.id)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className="text-xs font-semibold"
                      style={{ color: "oklch(0.6 0.10 240)" }}
                    >
                      Mechanism of Action
                    </span>
                    {moaExpanded ? (
                      <ChevronUp
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "oklch(0.6 0.10 240)" }}
                      />
                    ) : (
                      <ChevronDown
                        className="w-3.5 h-3.5 flex-shrink-0"
                        style={{ color: "oklch(0.6 0.10 240)" }}
                      />
                    )}
                  </div>
                </button>
                <p
                  className="text-xs leading-relaxed mt-1.5 transition-all duration-200"
                  style={{
                    color: "oklch(0.65 0.06 260)",
                    display: "-webkit-box",
                    WebkitLineClamp: moaExpanded ? "unset" : "3",
                    WebkitBoxOrient: "vertical",
                    overflow: moaExpanded ? "visible" : "hidden",
                  }}
                >
                  {drug.mechanismOfAction}
                </p>
              </div>
            )}

            {/* Confidence */}
            <div className="space-y-1">
              <span
                className="text-xs"
                style={{ color: "oklch(0.5 0.06 260)" }}
              >
                Confidence
              </span>
              <ConfidenceBar score={score} size="sm" />
            </div>

            {/* External links */}
            <div className="flex flex-wrap gap-2 pt-1">
              {drug.drugbankId && (
                <a
                  href={`https://go.drugbank.com/drugs/${drug.drugbankId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: "oklch(0.55 0.22 295 / 0.12)",
                    color: "oklch(0.75 0.15 295)",
                    border: "1px solid oklch(0.55 0.22 295 / 0.3)",
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  DrugBank
                </a>
              )}
              {drug.pubchemId && (
                <a
                  href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                  style={{
                    background: "oklch(0.60 0.22 330 / 0.12)",
                    color: "oklch(0.75 0.15 330)",
                    border: "1px solid oklch(0.60 0.22 330 / 0.3)",
                  }}
                >
                  <ExternalLink className="w-3 h-3" />
                  PubChem
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
