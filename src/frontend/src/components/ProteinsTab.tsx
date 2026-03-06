import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  ChevronUp,
  Download,
  ExternalLink,
  Microscope,
  Search,
} from "lucide-react";
import { useMemo, useState } from "react";

const INITIAL_SHOW_PROTEINS = 3;
import type { ExtendedProtein } from "../services/diseaseSearch";
import { ConfidenceBadge } from "./ConfidenceBar";

type ConfidenceFilter = "all" | "high" | "very_high";

interface ProteinsTabProps {
  proteins: ExtendedProtein[];
  isLoading?: boolean;
}

type SortDir = "asc" | "desc";

function ProteinRowSkeleton() {
  return (
    <tr style={{ borderBottom: "1px solid oklch(0.82 0.17 198 / 0.08)" }}>
      {Array.from({ length: 6 }).map((_, i) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton cells
        <td key={i} className="px-4 py-3">
          <Skeleton
            className="h-4"
            style={{
              background: "oklch(0.16 0.05 270)",
              width: i === 3 ? "100%" : "70%",
            }}
          />
        </td>
      ))}
    </tr>
  );
}

function exportProteinsCSV(proteins: ExtendedProtein[]) {
  const headers = [
    "Protein Name",
    "Gene",
    "UniProt ID",
    "Function",
    "Confidence Score",
  ];
  const rows = proteins.map((p) => [
    `"${p.name.replace(/"/g, '""')}"`,
    p.geneName || "",
    p.uniprotId || "",
    `"${(p.function || "").replace(/"/g, '""')}"`,
    String(Number(p.confidenceScore)),
  ]);
  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "proteins.csv";
  a.click();
  URL.revokeObjectURL(url);
}

const FUNCTION_TRUNCATE_LENGTH = 120;

function ProteinFunctionCell({ text }: { text: string }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = text.length > FUNCTION_TRUNCATE_LENGTH;

  if (!text) return <span className="text-xs opacity-30">—</span>;

  return (
    <div className="text-xs" style={{ color: "oklch(0.72 0.06 260)" }}>
      <span>
        {isLong && !expanded
          ? `${text.slice(0, FUNCTION_TRUNCATE_LENGTH).trimEnd()}…`
          : text}
      </span>
      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
          className="ml-1.5 text-xs font-medium underline underline-offset-2 transition-opacity hover:opacity-100"
          style={{ color: "oklch(0.82 0.17 198)", opacity: 0.85 }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
}

export function ProteinsTab({ proteins, isLoading }: ProteinsTabProps) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [showAllProteins, setShowAllProteins] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [confidenceFilter, setConfidenceFilter] =
    useState<ConfidenceFilter>("all");

  const sortedAndFiltered = useMemo(() => {
    let result = [...proteins].sort((a, b) => {
      const diff = Number(a.confidenceScore) - Number(b.confidenceScore);
      return sortDir === "desc" ? -diff : diff;
    });
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.geneName?.toLowerCase().includes(q) ||
          p.uniprotId?.toLowerCase().includes(q),
      );
    }
    if (confidenceFilter === "high") {
      result = result.filter((p) => Number(p.confidenceScore) >= 70);
    } else if (confidenceFilter === "very_high") {
      result = result.filter((p) => Number(p.confidenceScore) >= 90);
    }
    return result;
  }, [proteins, sortDir, searchQuery, confidenceFilter]);

  const displayed = showAllProteins
    ? sortedAndFiltered
    : sortedAndFiltered.slice(0, INITIAL_SHOW_PROTEINS);
  const hasMoreProteins = sortedAndFiltered.length > INITIAL_SHOW_PROTEINS;

  const toggleSort = () => {
    setSortDir((d) => (d === "desc" ? "asc" : "desc"));
    setShowAllProteins(false);
  };

  if (isLoading) {
    return (
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.82 0.17 198 / 0.12)" }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                background: "oklch(0.10 0.03 270)",
                borderBottom: "1px solid oklch(0.82 0.17 198 / 0.15)",
              }}
            >
              {[
                "Protein",
                "Gene",
                "UniProt",
                "Pathway",
                "Function",
                "Score",
              ].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 5 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              <ProteinRowSkeleton key={i} />
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (!proteins.length) {
    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        style={{ color: "oklch(0.5 0.06 260)" }}
      >
        <Microscope className="w-12 h-12 mb-4 opacity-30" />
        <p className="text-lg font-display font-semibold opacity-60">
          No protein targets found
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
            border: "1px solid oklch(0.75 0.20 155 / 0.18)",
          }}
        >
          <Search
            className="w-3.5 h-3.5 flex-shrink-0"
            style={{ color: "oklch(0.55 0.06 260)" }}
          />
          <input
            data-ocid="proteins.search_input"
            type="text"
            placeholder="Filter proteins by name or gene…"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowAllProteins(false);
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
              data-ocid={`proteins.confidence_filter.${f === "all" ? "1" : f === "high" ? "2" : "3"}`}
              onClick={() => {
                setConfidenceFilter(f);
                setShowAllProteins(false);
              }}
              className="px-2.5 py-1 rounded-md text-xs font-medium transition-all duration-150"
              style={{
                background:
                  confidenceFilter === f
                    ? "oklch(0.75 0.20 155 / 0.18)"
                    : "transparent",
                color:
                  confidenceFilter === f
                    ? "oklch(0.75 0.20 155)"
                    : "oklch(0.5 0.06 260)",
                border:
                  confidenceFilter === f
                    ? "1px solid oklch(0.75 0.20 155 / 0.3)"
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
          data-ocid="proteins.export_button"
          onClick={() => exportProteinsCSV(sortedAndFiltered)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150"
          style={{
            background: "oklch(0.75 0.20 155 / 0.08)",
            color: "oklch(0.75 0.20 155)",
            border: "1px solid oklch(0.75 0.20 155 / 0.25)",
          }}
          title="Export visible proteins as CSV"
        >
          <Download className="w-3.5 h-3.5" />
          Export CSV
        </button>

        {/* Result count */}
        <span
          className="text-xs ml-auto"
          style={{ color: "oklch(0.45 0.06 260)" }}
        >
          {sortedAndFiltered.length} of {proteins.length}
        </span>
      </div>

      {/* No filter results */}
      {sortedAndFiltered.length === 0 && (
        <div
          data-ocid="proteins.empty_state"
          className="flex flex-col items-center justify-center py-10 text-center rounded-xl"
          style={{
            color: "oklch(0.5 0.06 260)",
            border: "1px dashed oklch(0.75 0.20 155 / 0.15)",
          }}
        >
          <Search className="w-8 h-8 mb-3 opacity-25" />
          <p className="text-sm opacity-60">No proteins match your filter</p>
          <button
            type="button"
            onClick={() => {
              setSearchQuery("");
              setConfidenceFilter("all");
            }}
            className="mt-2 text-xs underline opacity-50 hover:opacity-80"
            style={{ color: "oklch(0.75 0.20 155)" }}
          >
            Clear filters
          </button>
        </div>
      )}

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: "1px solid oklch(0.82 0.17 198 / 0.12)" }}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr
                style={{
                  background: "oklch(0.10 0.03 270)",
                  borderBottom: "1px solid oklch(0.82 0.17 198 / 0.15)",
                }}
              >
                <th
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Protein Name
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Gene
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  UniProt ID
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Function
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Links
                </th>
                <th
                  className="px-4 py-3 text-left text-xs font-semibold cursor-pointer select-none"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                  onClick={toggleSort}
                  onKeyDown={(e) => e.key === "Enter" && toggleSort()}
                >
                  <span className="inline-flex items-center gap-1">
                    Score
                    {sortDir === "desc" ? (
                      <ArrowDown className="w-3 h-3" />
                    ) : sortDir === "asc" ? (
                      <ArrowUp className="w-3 h-3" />
                    ) : (
                      <ArrowUpDown className="w-3 h-3" />
                    )}
                  </span>
                </th>
              </tr>
            </thead>
            <tbody>
              {displayed.map((protein, i) => (
                <tr
                  key={protein.id}
                  data-ocid={`protein.row.${i + 1}`}
                  style={{
                    borderBottom:
                      i < sortedAndFiltered.length - 1
                        ? "1px solid oklch(0.82 0.17 198 / 0.07)"
                        : "none",
                    background: "oklch(0.10 0.025 270 / 0.3)",
                    transition: "background 0.2s",
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "oklch(0.82 0.17 198 / 0.04)";
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLTableRowElement).style.background =
                      "oklch(0.10 0.025 270 / 0.3)";
                  }}
                >
                  <td className="px-4 py-3">
                    <span
                      className="font-medium text-sm"
                      style={{ color: "oklch(0.88 0.04 240)" }}
                    >
                      {protein.name}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="font-mono text-xs"
                      style={{ color: "oklch(0.75 0.15 295)" }}
                    >
                      {protein.geneName}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {protein.uniprotId ? (
                      <span
                        className="font-mono text-xs"
                        style={{ color: "oklch(0.82 0.17 198)" }}
                      >
                        {protein.uniprotId}
                      </span>
                    ) : (
                      <span className="text-xs opacity-30">—</span>
                    )}
                  </td>
                  <td
                    className="px-4 py-3"
                    style={{ minWidth: "220px", maxWidth: "340px" }}
                  >
                    <ProteinFunctionCell text={protein.function || ""} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      {protein.uniprotId && (
                        <a
                          href={`https://www.uniprot.org/uniprotkb/${protein.uniprotId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.75 0.20 155 / 0.1)",
                            color: "oklch(0.75 0.20 155)",
                            border: "1px solid oklch(0.75 0.20 155 / 0.3)",
                          }}
                          title="View on UniProt"
                        >
                          <ExternalLink className="w-3 h-3" />
                          UniProt
                        </a>
                      )}
                      {protein.geneName && (
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/gene/?term=${encodeURIComponent(protein.geneName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.88 0.18 85 / 0.1)",
                            color: "oklch(0.88 0.18 85)",
                            border: "1px solid oklch(0.88 0.18 85 / 0.3)",
                          }}
                          title="View on NCBI"
                        >
                          <ExternalLink className="w-3 h-3" />
                          NCBI
                        </a>
                      )}
                      {protein.geneName && (
                        <a
                          href={`https://string-db.org/cgi/network?identifier=${encodeURIComponent(protein.geneName)}&species=9606`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.85 0.18 60 / 0.1)",
                            color: "oklch(0.85 0.18 60)",
                            border: "1px solid oklch(0.85 0.18 60 / 0.3)",
                          }}
                          title="View interactions on STRING"
                        >
                          <ExternalLink className="w-3 h-3" />
                          STRING
                        </a>
                      )}
                      {protein.geneName && (
                        <a
                          href={`https://thebiogrid.org/search.php?search=${encodeURIComponent(protein.geneName)}&organism=9606`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.70 0.18 185 / 0.1)",
                            color: "oklch(0.70 0.18 185)",
                            border: "1px solid oklch(0.70 0.18 185 / 0.3)",
                          }}
                          title="View interactions on BioGRID"
                        >
                          <ExternalLink className="w-3 h-3" />
                          BioGRID
                        </a>
                      )}
                      {/* OMIM — for human genes */}
                      {protein.omimId ? (
                        <a
                          href={`https://www.omim.org/entry/${protein.omimId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.72 0.18 30 / 0.1)",
                            color: "oklch(0.82 0.18 30)",
                            border: "1px solid oklch(0.72 0.18 30 / 0.3)",
                          }}
                          title="View on OMIM"
                        >
                          <ExternalLink className="w-3 h-3" />
                          OMIM
                        </a>
                      ) : protein.geneName &&
                        !protein.geneName.startsWith("HCV") &&
                        !protein.geneName.startsWith("HBV") &&
                        !protein.geneName.startsWith("HIV") ? (
                        <a
                          href={`https://www.omim.org/search/?index=entry&search=${encodeURIComponent(protein.geneName)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.72 0.18 30 / 0.1)",
                            color: "oklch(0.82 0.18 30)",
                            border: "1px solid oklch(0.72 0.18 30 / 0.3)",
                          }}
                          title="Search on OMIM"
                        >
                          <ExternalLink className="w-3 h-3" />
                          OMIM
                        </a>
                      ) : null}
                      {/* DisGeNET */}
                      {protein.geneName &&
                        !protein.geneName.startsWith("HCV") &&
                        !protein.geneName.startsWith("HBV") &&
                        !protein.geneName.startsWith("HIV") && (
                          <a
                            href={`https://www.disgenet.org/gene/${encodeURIComponent(protein.geneName)}/summary/`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                            style={{
                              background: "oklch(0.68 0.20 320 / 0.1)",
                              color: "oklch(0.78 0.18 320)",
                              border: "1px solid oklch(0.68 0.20 320 / 0.3)",
                            }}
                            title="View gene-disease associations on DisGeNET"
                          >
                            <ExternalLink className="w-3 h-3" />
                            DisGeNET
                          </a>
                        )}
                      {/* NCBI Protein — for viral proteins */}
                      {protein.ncbiProteinId && (
                        <a
                          href={`https://www.ncbi.nlm.nih.gov/protein/${protein.ncbiProteinId}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium transition-all"
                          style={{
                            background: "oklch(0.88 0.18 85 / 0.1)",
                            color: "oklch(0.88 0.18 85)",
                            border: "1px solid oklch(0.88 0.18 85 / 0.3)",
                          }}
                          title="View on NCBI Protein"
                        >
                          <ExternalLink className="w-3 h-3" />
                          NCBI Protein
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <ConfidenceBadge score={Number(protein.confidenceScore)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {hasMoreProteins && (
        <button
          type="button"
          data-ocid="proteins.show_more_button"
          onClick={() => setShowAllProteins((p) => !p)}
          className="flex items-center gap-2 mx-auto px-5 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
          style={{
            background: "oklch(0.75 0.20 155 / 0.08)",
            color: "oklch(0.75 0.20 155)",
            border: "1px solid oklch(0.75 0.20 155 / 0.25)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.75 0.20 155 / 0.15)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background =
              "oklch(0.75 0.20 155 / 0.08)";
          }}
        >
          {showAllProteins ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show fewer proteins
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show all {sortedAndFiltered.length} protein targets
            </>
          )}
        </button>
      )}
    </div>
  );
}
