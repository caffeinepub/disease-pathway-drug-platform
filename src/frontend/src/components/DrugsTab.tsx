import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Pill,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_SHOW_DRUGS = 3;
import type { ExtendedDrug } from "../services/diseaseSearch";
import { ConfidenceBar } from "./ConfidenceBar";

type ConfidenceFilter = "all" | "high" | "very_high";

interface DrugsTabProps {
  drugs: ExtendedDrug[];
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

function exportDrugsCSV(drugs: ExtendedDrug[]) {
  const headers = [
    "Drug Name",
    "Approval Status",
    "Target Protein",
    "Mechanism of Action",
    "DrugBank ID",
    "PubChem ID",
    "ChEMBL ID",
    "Confidence Score",
  ];
  const rows = drugs.map((d) => [
    `"${d.name.replace(/"/g, '""')}"`,
    `"${d.approvalStatus.replace(/"/g, '""')}"`,
    d.targetProteinId || "",
    `"${(d.mechanismOfAction || "").replace(/"/g, '""')}"`,
    d.drugbankId || "",
    d.pubchemId || "",
    d.chemblId || "",
    String(Number(d.confidenceScore)),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "drugs.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function DrugsTab({ drugs, isLoading }: DrugsTabProps) {
  const [showMoa, setShowMoa] = useState<string | null>(null);
  const [showAllDrugs, setShowAllDrugs] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("all");

  const sortedAndFiltered = useMemo(() => {
    let result = [...drugs].sort(
      (a, b) => Number(b.confidenceScore) - Number(a.confidenceScore),
    );
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (d) =>
          d.name.toLowerCase().includes(q) ||
          d.approvalStatus?.toLowerCase().includes(q) ||
          d.mechanismOfAction?.toLowerCase().includes(q),
      );
    }
    if (confidenceFilter === "high") {
      result = result.filter((d) => Number(d.confidenceScore) >= 70);
    } else if (confidenceFilter === "very_high") {
      result = result.filter((d) => Number(d.confidenceScore) >= 90);
    }
    return result;
  }, [drugs, searchQuery, confidenceFilter]);

  const displayed = showAllDrugs
    ? sortedAndFiltered
    : sortedAndFiltered.slice(0, INITIAL_SHOW_DRUGS);
  const hasMoreDrugs = sortedAndFiltered.length > INITIAL_SHOW_DRUGS;

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

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-1.5 rounded-lg"
          style={{
            background: "oklch(0.10 0.03 270 / 0.7)",
            border: "1px solid oklch(0.55 0.22 295 / 0.18)",
          }}
        >
          <Search
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.55 0.06 260)" }}
          />
          <input
            data-ocid="drugs.search_input"
            type="text"
            placeholder="Filter drugs by name or mechanism…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAllDrugs(false);
            }}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "oklch(0.85 0.04 240)" }}
          />
        </div>

        {/* Confidence filter */}
        <div
          className="flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: "oklch(0.10 0.03 270)" }}
        >
          {(["all", "high", "very_high"] as ConfidenceFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              data-ocid={`drugs.confidence_filter.${f === "all" ? "1" : f === "high" ? "2" : "3"}`}
              onClick={() => {
                setConfidenceFilter(f);
                setShowAllDrugs(false);
              }}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                background:
                  confidenceFilter === f
                    ? "oklch(0.55 0.22 295 / 0.18)"
                    : "transparent",
                color:
                  confidenceFilter === f
                    ? "oklch(0.75 0.15 295)"
                    : "oklch(0.5 0.06 260)",
                border:
                  confidenceFilter === f
                    ? "1px solid oklch(0.55 0.22 295 / 0.3)"
                    : "1px solid transparent",
              }}
            >
              {f === "all" ? "All" : f === "high" ? "≥70%" : "≥90%"}
            </button>
          ))}
        </div>

        {/* Export CSV */}
        <button
          type="button"
          data-ocid="drugs.export_button"
          onClick={() => exportDrugsCSV(sortedAndFiltered)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: "oklch(0.55 0.22 295 / 0.08)",
            color: "oklch(0.75 0.15 295)",
            border: "1px solid oklch(0.55 0.22 295 / 0.25)",
          }}
          title="Export visible drugs as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>

        {/* Result count */}
        <span
          className="text-xs ml-auto"
          style={{ color: "oklch(0.45 0.06 260)" }}
        >
          {sortedAndFiltered.length} of {drugs.length}
        </span>
      </div>

      {/* No filter results */}
      {sortedAndFiltered.length === 0 && (
        <div
          data-ocid="drugs.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center rounded-xl"
          style={{
            color: "oklch(0.5 0.06 260)",
            border: "1px dashed oklch(0.55 0.22 295 / 0.15)",
          }}
        >
          <Search className="w-8 h-8 mb-3 opacity-25" />
          <p className="text-sm opacity-60">No drugs match your filter</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setConfidenceFilter("all");
            }}
            className="mt-2 text-xs underline opacity-50 hover:opacity-80"
            style={{ color: "oklch(0.75 0.15 295)" }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {displayed.map((drug, i) => {
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
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
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
                {drug.pubchemId && drug.pubchemId !== "0" && (
                  <a
                    href={`https://pubchem.ncbi.nlm.nih.gov/compound/${drug.pubchemId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
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
                {drug.chemblId && (
                  <a
                    href={`https://www.ebi.ac.uk/chembl/compound_report_card/${drug.chemblId}/`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.72 0.20 170 / 0.12)",
                      color: "oklch(0.72 0.20 170)",
                      border: "1px solid oklch(0.72 0.20 170 / 0.3)",
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    ChEMBL
                  </a>
                )}
                {/* TTD — only shown when no DrugBank or ChEMBL link is available, as a fallback */}
                {!drug.drugbankId && !drug.chemblId && (
                  <a
                    href={`https://db.idrblab.net/ttd/search/ttd/target?query=${encodeURIComponent(drug.name)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.68 0.18 280 / 0.12)",
                      color: "oklch(0.68 0.18 280)",
                      border: "1px solid oklch(0.68 0.18 280 / 0.3)",
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    TTD
                  </a>
                )}
                {/* FDA/EMA/ClinicalTrials fallback — shown for biologics & gene therapies without a small-mol ID */}
                {drug.fdaLabel &&
                  !drug.drugbankId &&
                  !drug.chemblId &&
                  (!drug.pubchemId || drug.pubchemId === "0") && (
                    <a
                      href={drug.fdaLabel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                      style={{
                        background: "oklch(0.82 0.18 55 / 0.12)",
                        color: "oklch(0.82 0.18 55)",
                        border: "1px solid oklch(0.82 0.18 55 / 0.3)",
                      }}
                    >
                      <ExternalLink className="w-3 h-3" />
                      FDA / Trial
                    </a>
                  )}
                {/* Also show FDA label link for approved biologics that also have DrugBank */}
                {drug.fdaLabel && (drug.drugbankId || drug.chemblId) && (
                  <a
                    href={drug.fdaLabel}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.82 0.18 55 / 0.08)",
                      color: "oklch(0.78 0.15 55)",
                      border: "1px solid oklch(0.82 0.18 55 / 0.2)",
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    FDA Label
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasMoreDrugs && (
        <button
          type="button"
          data-ocid="drugs.show_more_button"
          onClick={() => setShowAllDrugs((p) => !p)}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "oklch(0.55 0.22 295 / 0.08)",
            color: "oklch(0.75 0.15 295)",
            border: "1px solid oklch(0.55 0.22 295 / 0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.22 295 / 0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.55 0.22 295 / 0.08)";
          }}
        >
          {showAllDrugs ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show fewer drugs
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {sortedAndFiltered.length} drug recommendations
            </>
          )}
        </button>
      )}
    </div>
  );
}
