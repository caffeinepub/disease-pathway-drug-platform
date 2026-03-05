import { Skeleton } from "@/components/ui/skeleton";
import {
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  GitBranch,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { ExtendedPathway } from "../services/diseaseSearch";
import { ConfidenceBar } from "./ConfidenceBar";

const INITIAL_SHOW = 3;

type ConfidenceFilter = "all" | "high" | "very_high";

interface PathwaysTabProps {
  pathways: ExtendedPathway[];
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

function exportPathwaysCSV(pathways: ExtendedPathway[]) {
  const headers = [
    "Name",
    "KEGG ID",
    "Reactome ID",
    "WikiPathways ID",
    "Source",
    "Description",
    "Confidence Score",
  ];
  const rows = pathways.map((p) => [
    `"${p.name.replace(/"/g, '""')}"`,
    p.keggId || "",
    p.reactomeId || "",
    p.wikiPathwaysId || "",
    `"${(p.source || "").replace(/"/g, '""')}"`,
    `"${(p.description || "").replace(/"/g, '""')}"`,
    String(Number(p.confidenceScore)),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "pathways.csv";
  a.click();
  URL.revokeObjectURL(url);
}

export function PathwaysTab({ pathways, isLoading }: PathwaysTabProps) {
  const [showAll, setShowAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("all");

  const filtered = useMemo(() => {
    let result = pathways;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.keggId?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q),
      );
    }
    if (confidenceFilter === "high") {
      result = result.filter((p) => Number(p.confidenceScore) >= 70);
    } else if (confidenceFilter === "very_high") {
      result = result.filter((p) => Number(p.confidenceScore) >= 90);
    }
    return result;
  }, [pathways, searchQuery, confidenceFilter]);

  const displayed = showAll ? filtered : filtered.slice(0, INITIAL_SHOW);
  const hasMore = filtered.length > INITIAL_SHOW;

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
    <div className="space-y-4">
      {/* Toolbar: search + confidence filter + export */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Search input */}
        <div
          className="flex items-center gap-2 flex-1 min-w-[180px] px-3 py-1.5 rounded-lg"
          style={{
            background: "oklch(0.10 0.03 270 / 0.7)",
            border: "1px solid oklch(0.82 0.17 198 / 0.18)",
          }}
        >
          <Search
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.55 0.06 260)" }}
          />
          <input
            data-ocid="pathways.search_input"
            type="text"
            placeholder="Filter pathways…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAll(false);
            }}
            className="flex-1 bg-transparent text-xs outline-none"
            style={{ color: "oklch(0.85 0.04 240)" }}
          />
        </div>

        {/* Confidence filter buttons */}
        <div
          className="flex items-center gap-1 rounded-lg p-0.5"
          style={{ background: "oklch(0.10 0.03 270)" }}
        >
          {(["all", "high", "very_high"] as ConfidenceFilter[]).map((f) => (
            <button
              key={f}
              type="button"
              data-ocid={`pathways.confidence_filter.${f === "all" ? "1" : f === "high" ? "2" : "3"}`}
              onClick={() => {
                setConfidenceFilter(f);
                setShowAll(false);
              }}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                background:
                  confidenceFilter === f
                    ? "oklch(0.82 0.17 198 / 0.18)"
                    : "transparent",
                color:
                  confidenceFilter === f
                    ? "oklch(0.82 0.17 198)"
                    : "oklch(0.5 0.06 260)",
                border:
                  confidenceFilter === f
                    ? "1px solid oklch(0.82 0.17 198 / 0.3)"
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
          data-ocid="pathways.export_button"
          onClick={() => exportPathwaysCSV(filtered)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: "oklch(0.75 0.20 155 / 0.08)",
            color: "oklch(0.75 0.20 155)",
            border: "1px solid oklch(0.75 0.20 155 / 0.25)",
          }}
          title="Export visible pathways as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>

        {/* Result count */}
        <span
          className="text-xs ml-auto"
          style={{ color: "oklch(0.45 0.06 260)" }}
        >
          {filtered.length} of {pathways.length}
        </span>
      </div>

      {/* No results for filter */}
      {filtered.length === 0 && (
        <div
          data-ocid="pathways.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center rounded-xl"
          style={{
            color: "oklch(0.5 0.06 260)",
            border: "1px dashed oklch(0.82 0.17 198 / 0.15)",
          }}
        >
          <Search className="w-8 h-8 mb-3 opacity-25" />
          <p className="text-sm opacity-60">No pathways match your filter</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setConfidenceFilter("all");
            }}
            className="mt-2 text-xs underline opacity-50 hover:opacity-80"
            style={{ color: "oklch(0.82 0.17 198)" }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayed.map((pathway, i) => {
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
                    {pathway.reactomeId && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          background: "oklch(0.75 0.18 40 / 0.1)",
                          color: "oklch(0.75 0.18 40)",
                          border: "1px solid oklch(0.75 0.18 40 / 0.25)",
                        }}
                      >
                        {pathway.reactomeId}
                      </span>
                    )}
                    {pathway.wikiPathwaysId && (
                      <span
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono"
                        style={{
                          background: "oklch(0.65 0.20 145 / 0.1)",
                          color: "oklch(0.65 0.20 145)",
                          border: "1px solid oklch(0.65 0.20 145 / 0.25)",
                        }}
                      >
                        {pathway.wikiPathwaysId}
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

              {/* Database Links */}
              <div className="flex flex-wrap gap-2 pt-1">
                {pathway.keggId && (
                  <a
                    href={`https://www.kegg.jp/entry/${pathway.keggId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.82 0.17 198 / 0.08)",
                      color: "oklch(0.82 0.17 198 / 0.8)",
                      border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.82 0.17 198)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.82 0.17 198 / 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.82 0.17 198 / 0.8)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.82 0.17 198 / 0.08)";
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    KEGG
                  </a>
                )}
                {pathway.reactomeId && (
                  <a
                    href={`https://reactome.org/content/detail/${pathway.reactomeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.75 0.18 40 / 0.08)",
                      color: "oklch(0.75 0.18 40 / 0.8)",
                      border: "1px solid oklch(0.75 0.18 40 / 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.75 0.18 40)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.75 0.18 40 / 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.75 0.18 40 / 0.8)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.75 0.18 40 / 0.08)";
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    Reactome
                  </a>
                )}
                {pathway.wikiPathwaysId && (
                  <a
                    href={`https://www.wikipathways.org/pathways/${pathway.wikiPathwaysId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-200"
                    style={{
                      background: "oklch(0.65 0.20 145 / 0.08)",
                      color: "oklch(0.65 0.20 145 / 0.8)",
                      border: "1px solid oklch(0.65 0.20 145 / 0.2)",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.65 0.20 145)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.65 0.20 145 / 0.15)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLAnchorElement).style.color =
                        "oklch(0.65 0.20 145 / 0.8)";
                      (e.currentTarget as HTMLAnchorElement).style.background =
                        "oklch(0.65 0.20 145 / 0.08)";
                    }}
                  >
                    <ExternalLink className="w-3 h-3" />
                    WikiPathways
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
      {hasMore && (
        <button
          type="button"
          data-ocid="pathways.show_more_button"
          onClick={() => setShowAll((p) => !p)}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "oklch(0.82 0.17 198 / 0.08)",
            color: "oklch(0.82 0.17 198)",
            border: "1px solid oklch(0.82 0.17 198 / 0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.82 0.17 198 / 0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.82 0.17 198 / 0.08)";
          }}
        >
          {showAll ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show fewer pathways
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {filtered.length} pathways
            </>
          )}
        </button>
      )}
    </div>
  );
}
