import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ExternalLink,
  Microscope,
} from "lucide-react";
import { useState } from "react";
import type { ProteinTarget } from "../backend.d.ts";
import { ConfidenceBadge } from "./ConfidenceBar";

interface ProteinsTabProps {
  proteins: ProteinTarget[];
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

export function ProteinsTab({ proteins, isLoading }: ProteinsTabProps) {
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const sorted = [...proteins].sort((a, b) => {
    const diff = Number(a.confidenceScore) - Number(b.confidenceScore);
    return sortDir === "desc" ? -diff : diff;
  });

  const toggleSort = () => setSortDir((d) => (d === "desc" ? "asc" : "desc"));

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
            {sorted.map((protein, i) => (
              <tr
                key={protein.id}
                data-ocid={`protein.row.${i + 1}`}
                style={{
                  borderBottom:
                    i < sorted.length - 1
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
                <td className="px-4 py-3 max-w-[200px]">
                  <span
                    className="text-xs line-clamp-2"
                    style={{ color: "oklch(0.6 0.06 260)" }}
                    title={protein.function}
                  >
                    {protein.function || "—"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
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
  );
}
