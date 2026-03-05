import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeftRight,
  ChevronDown,
  ChevronUp,
  Dna,
  GitBranch,
  Loader2,
  Pill,
  Search,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import type {
  DiseaseResultWithLiterature,
  ExtendedDrug,
  ExtendedPathway,
} from "../services/diseaseSearch";
import { searchDiseaseFromAPIs } from "../services/diseaseSearch";
import { ConfidenceBar } from "./ConfidenceBar";

interface CompareModalProps {
  open: boolean;
  onClose: () => void;
  primaryResult: DiseaseResultWithLiterature;
}

const COMPARE_INITIAL = 4;

export function CompareModal({
  open,
  onClose,
  primaryResult,
}: CompareModalProps) {
  const [compareQuery, setCompareQuery] = useState("");
  const [compareResult, setCompareResult] =
    useState<DiseaseResultWithLiterature | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [showAllPathways, setShowAllPathways] = useState(false);
  const [showAllDrugs, setShowAllDrugs] = useState(false);

  async function handleCompareSearch() {
    const q = compareQuery.trim();
    if (!q) return;
    setIsSearching(true);
    setSearchError("");
    setCompareResult(null);
    setShowAllPathways(false);
    setShowAllDrugs(false);
    try {
      const result = await searchDiseaseFromAPIs(q);
      setCompareResult(result);
    } catch (err) {
      setSearchError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setIsSearching(false);
    }
  }

  function handleClose() {
    setCompareQuery("");
    setCompareResult(null);
    setSearchError("");
    setIsSearching(false);
    onClose();
  }

  const primaryPathways = primaryResult.pathways as ExtendedPathway[];
  const primaryDrugs = primaryResult.drugs as ExtendedDrug[];
  const comparePathways = (compareResult?.pathways ?? []) as ExtendedPathway[];
  const compareDrugs = (compareResult?.drugs ?? []) as ExtendedDrug[];

  const shownPathways = showAllPathways
    ? Math.max(primaryPathways.length, comparePathways.length)
    : COMPARE_INITIAL;
  const shownDrugs = showAllDrugs
    ? Math.max(primaryDrugs.length, compareDrugs.length)
    : COMPARE_INITIAL;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent
        data-ocid="compare.dialog"
        className="max-w-5xl w-full p-0 overflow-hidden"
        style={{
          background: "oklch(0.07 0.02 270)",
          border: "1px solid oklch(0.82 0.17 198 / 0.25)",
          maxHeight: "90vh",
        }}
      >
        {/* Header */}
        <DialogHeader
          className="px-6 pt-5 pb-4 border-b"
          style={{ borderColor: "oklch(0.82 0.17 198 / 0.12)" }}
        >
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <ArrowLeftRight
                className="w-4 h-4"
                style={{ color: "oklch(0.82 0.17 198)" }}
              />
              <DialogTitle
                className="font-display text-base font-semibold"
                style={{ color: "oklch(0.92 0.04 240)" }}
              >
                Disease Comparison
              </DialogTitle>
            </div>
            <button
              type="button"
              data-ocid="compare.close_button"
              onClick={handleClose}
              className="p-1.5 rounded-lg transition-all"
              style={{ color: "oklch(0.55 0.06 260)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "oklch(0.85 0.04 240)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.color =
                  "oklch(0.55 0.06 260)";
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </DialogHeader>

        <div
          className="overflow-y-auto"
          style={{ maxHeight: "calc(90vh - 80px)" }}
        >
          {/* Search bar for second disease */}
          <div
            className="px-6 py-4 border-b"
            style={{ borderColor: "oklch(0.82 0.17 198 / 0.08)" }}
          >
            <p
              className="text-xs mb-2"
              style={{ color: "oklch(0.55 0.06 260)" }}
            >
              Enter a second disease to compare against{" "}
              <strong style={{ color: "oklch(0.82 0.17 198)" }}>
                {primaryResult.diseaseName}
              </strong>
            </p>
            <div className="flex gap-2">
              <div
                className="flex items-center gap-2 flex-1 px-3 py-2 rounded-xl"
                style={{
                  background: "oklch(0.10 0.03 270)",
                  border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                }}
              >
                <Search
                  className="w-4 h-4 flex-shrink-0"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                />
                <input
                  data-ocid="compare.search_input"
                  type="text"
                  placeholder="e.g. Parkinson's Disease, Asthma…"
                  value={compareQuery}
                  onChange={(e) => setCompareQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCompareSearch()}
                  className="flex-1 bg-transparent text-sm outline-none"
                  style={{ color: "oklch(0.88 0.04 240)" }}
                />
              </div>
              <button
                type="button"
                data-ocid="compare.submit_button"
                onClick={handleCompareSearch}
                disabled={isSearching || !compareQuery.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-40"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.9), oklch(0.55 0.22 295 / 0.9))",
                  color: "oklch(0.08 0.02 270)",
                }}
              >
                {isSearching ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Search className="w-4 h-4" />
                )}
                Compare
              </button>
            </div>
            {searchError && (
              <p
                className="mt-2 text-xs"
                style={{ color: "oklch(0.65 0.22 25)" }}
              >
                {searchError}
              </p>
            )}
          </div>

          {/* Comparison grid */}
          <div className="px-6 py-5 space-y-6">
            {/* Column headers */}
            <div className="grid grid-cols-2 gap-4">
              {/* Primary disease column header */}
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background:
                    "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.08), oklch(0.55 0.22 295 / 0.08))",
                  border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                }}
              >
                <p
                  className="text-xs mb-0.5"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  Disease A
                </p>
                <p
                  className="font-display font-bold text-sm"
                  style={{ color: "oklch(0.92 0.04 240)" }}
                >
                  {primaryResult.diseaseName}
                </p>
                <p
                  className="text-xs mt-1"
                  style={{ color: "oklch(0.55 0.06 260)" }}
                >
                  {primaryPathways.length} pathways · {primaryDrugs.length}{" "}
                  drugs
                </p>
              </div>

              {/* Compare disease column header */}
              <div
                className="rounded-xl p-3 text-center"
                style={{
                  background: compareResult
                    ? "linear-gradient(135deg, oklch(0.75 0.20 155 / 0.08), oklch(0.72 0.20 170 / 0.08))"
                    : "oklch(0.10 0.02 270 / 0.5)",
                  border: compareResult
                    ? "1px solid oklch(0.75 0.20 155 / 0.2)"
                    : "1px dashed oklch(0.82 0.17 198 / 0.15)",
                }}
              >
                {compareResult ? (
                  <>
                    <p
                      className="text-xs mb-0.5"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      Disease B
                    </p>
                    <p
                      className="font-display font-bold text-sm"
                      style={{ color: "oklch(0.92 0.04 240)" }}
                    >
                      {compareResult.diseaseName}
                    </p>
                    <p
                      className="text-xs mt-1"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      {comparePathways.length} pathways · {compareDrugs.length}{" "}
                      drugs
                    </p>
                  </>
                ) : isSearching ? (
                  <div className="flex flex-col items-center gap-2 py-1">
                    <Loader2
                      className="w-5 h-5 animate-spin"
                      style={{ color: "oklch(0.82 0.17 198)" }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      Searching…
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-1 py-1">
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.45 0.06 260)" }}
                    >
                      Disease B
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "oklch(0.35 0.04 260)" }}
                    >
                      Search above to compare
                    </p>
                  </div>
                )}
              </div>
            </div>

            <AnimatePresence>
              {primaryPathways.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Pathways section */}
                  <div className="flex items-center gap-2">
                    <Dna
                      className="w-4 h-4"
                      style={{ color: "oklch(0.82 0.17 198)" }}
                    />
                    <h3
                      className="font-display font-semibold text-sm"
                      style={{ color: "oklch(0.85 0.06 240)" }}
                    >
                      Pathways
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {Array.from({
                      length: Math.min(
                        shownPathways,
                        Math.max(
                          primaryPathways.length,
                          comparePathways.length,
                        ),
                      ),
                    }).map((_, i) => {
                      const pPathway = primaryPathways[i];
                      const cPathway = comparePathways[i];
                      return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: comparison row by index
                        <div key={i} className="grid grid-cols-2 gap-3">
                          {/* Primary pathway */}
                          <PathwayCompareCell pathway={pPathway} />
                          {/* Compare pathway */}
                          <PathwayCompareCell
                            pathway={cPathway}
                            variant="secondary"
                            empty={!compareResult && !isSearching}
                            loading={isSearching}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {Math.max(primaryPathways.length, comparePathways.length) >
                    COMPARE_INITIAL && (
                    <button
                      type="button"
                      data-ocid="compare.pathways.show_more_button"
                      onClick={() => setShowAllPathways((p) => !p)}
                      className="flex items-center gap-1.5 mx-auto text-xs font-medium py-1.5 px-4 rounded-lg transition-all"
                      style={{
                        color: "oklch(0.82 0.17 198)",
                        background: "oklch(0.82 0.17 198 / 0.06)",
                        border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                      }}
                    >
                      {showAllPathways ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {showAllPathways
                        ? "Show fewer pathways"
                        : "Show all pathways"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {primaryDrugs.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-3"
                >
                  {/* Drugs section */}
                  <div className="flex items-center gap-2">
                    <Pill
                      className="w-4 h-4"
                      style={{ color: "oklch(0.75 0.15 295)" }}
                    />
                    <h3
                      className="font-display font-semibold text-sm"
                      style={{ color: "oklch(0.85 0.06 240)" }}
                    >
                      Drug Recommendations
                    </h3>
                  </div>
                  <div className="space-y-2">
                    {Array.from({
                      length: Math.min(
                        shownDrugs,
                        Math.max(primaryDrugs.length, compareDrugs.length),
                      ),
                    }).map((_, i) => {
                      const pDrug = primaryDrugs[i];
                      const cDrug = compareDrugs[i];
                      return (
                        // biome-ignore lint/suspicious/noArrayIndexKey: comparison row by index
                        <div key={i} className="grid grid-cols-2 gap-3">
                          <DrugCompareCell drug={pDrug} />
                          <DrugCompareCell
                            drug={cDrug}
                            variant="secondary"
                            empty={!compareResult && !isSearching}
                            loading={isSearching}
                          />
                        </div>
                      );
                    })}
                  </div>
                  {Math.max(primaryDrugs.length, compareDrugs.length) >
                    COMPARE_INITIAL && (
                    <button
                      type="button"
                      data-ocid="compare.drugs.show_more_button"
                      onClick={() => setShowAllDrugs((p) => !p)}
                      className="flex items-center gap-1.5 mx-auto text-xs font-medium py-1.5 px-4 rounded-lg transition-all"
                      style={{
                        color: "oklch(0.75 0.15 295)",
                        background: "oklch(0.55 0.22 295 / 0.06)",
                        border: "1px solid oklch(0.55 0.22 295 / 0.2)",
                      }}
                    >
                      {showAllDrugs ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {showAllDrugs ? "Show fewer drugs" : "Show all drugs"}
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Stats comparison */}
            {compareResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl p-4 space-y-3"
                style={{
                  background: "oklch(0.10 0.02 270 / 0.6)",
                  border: "1px solid oklch(0.82 0.17 198 / 0.1)",
                }}
              >
                <p
                  className="text-xs font-semibold"
                  style={{ color: "oklch(0.65 0.06 260)" }}
                >
                  Summary Comparison
                </p>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  {[
                    {
                      label: "Pathways",
                      a: primaryPathways.length,
                      b: comparePathways.length,
                    },
                    {
                      label: "Proteins",
                      a: primaryResult.proteins.length,
                      b: compareResult.proteins.length,
                    },
                    {
                      label: "Drugs",
                      a: primaryDrugs.length,
                      b: compareDrugs.length,
                    },
                  ].map((stat) => (
                    <div key={stat.label} className="space-y-1">
                      <p style={{ color: "oklch(0.45 0.06 260)" }}>
                        {stat.label}
                      </p>
                      <div className="flex items-center justify-center gap-2">
                        <span
                          className="font-mono font-bold"
                          style={{ color: "oklch(0.82 0.17 198)" }}
                        >
                          {stat.a}
                        </span>
                        <span style={{ color: "oklch(0.35 0.04 260)" }}>
                          vs
                        </span>
                        <span
                          className="font-mono font-bold"
                          style={{ color: "oklch(0.75 0.20 155)" }}
                        >
                          {stat.b}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

type CellVariant = "primary" | "secondary";

const CELL_STYLES: Record<
  CellVariant,
  { bg: string; border: string; badgeBg: string; badgeColor: string }
> = {
  primary: {
    bg: "oklch(0.10 0.03 198 / 0.3)",
    border: "1px solid oklch(0.82 0.17 198 / 0.15)",
    badgeBg: "oklch(0.82 0.17 198 / 0.1)",
    badgeColor: "oklch(0.82 0.17 198)",
  },
  secondary: {
    bg: "oklch(0.10 0.03 155 / 0.3)",
    border: "1px solid oklch(0.75 0.20 155 / 0.15)",
    badgeBg: "oklch(0.75 0.20 155 / 0.1)",
    badgeColor: "oklch(0.75 0.20 155)",
  },
};

const DRUG_CELL_STYLES: Record<CellVariant, { bg: string; border: string }> = {
  primary: {
    bg: "oklch(0.10 0.03 295 / 0.25)",
    border: "1px solid oklch(0.55 0.22 295 / 0.15)",
  },
  secondary: {
    bg: "oklch(0.10 0.03 155 / 0.25)",
    border: "1px solid oklch(0.75 0.20 155 / 0.15)",
  },
};

interface PathwayCompareCellProps {
  pathway?: ExtendedPathway;
  variant?: CellVariant;
  empty?: boolean;
  loading?: boolean;
}

function PathwayCompareCell({
  pathway,
  variant = "primary",
  empty = false,
  loading = false,
}: PathwayCompareCellProps) {
  const styles = CELL_STYLES[variant];
  if (loading) {
    return (
      <div
        className="rounded-lg p-3 flex items-center justify-center"
        style={{
          background: "oklch(0.09 0.02 270 / 0.5)",
          border: "1px dashed oklch(0.82 0.17 198 / 0.1)",
          minHeight: "60px",
        }}
      >
        <Loader2
          className="w-4 h-4 animate-spin"
          style={{ color: "oklch(0.55 0.06 260)" }}
        />
      </div>
    );
  }
  if (!pathway) {
    return (
      <div
        className="rounded-lg p-3 flex items-center justify-center"
        style={{
          background: "oklch(0.09 0.02 270 / 0.5)",
          border: "1px dashed oklch(0.82 0.17 198 / 0.08)",
          minHeight: "60px",
        }}
      >
        {!empty && (
          <GitBranch
            className="w-4 h-4 opacity-15"
            style={{ color: "oklch(0.55 0.06 260)" }}
          />
        )}
      </div>
    );
  }
  const score = Number(pathway.confidenceScore);
  return (
    <div
      className="rounded-lg p-3 space-y-1.5"
      style={{ background: styles.bg, border: styles.border }}
    >
      <p
        className="text-xs font-medium leading-snug line-clamp-2"
        style={{ color: "oklch(0.88 0.04 240)" }}
      >
        {pathway.name}
      </p>
      {pathway.keggId && (
        <span
          className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded"
          style={{ background: styles.badgeBg, color: styles.badgeColor }}
        >
          {pathway.keggId}
        </span>
      )}
      <ConfidenceBar score={score} size="sm" />
    </div>
  );
}

interface DrugCompareCellProps {
  drug?: ExtendedDrug;
  variant?: CellVariant;
  empty?: boolean;
  loading?: boolean;
}

function DrugCompareCell({
  drug,
  variant = "primary",
  empty = false,
  loading = false,
}: DrugCompareCellProps) {
  const styles = DRUG_CELL_STYLES[variant];
  if (loading) {
    return (
      <div
        className="rounded-lg p-3 flex items-center justify-center"
        style={{
          background: "oklch(0.09 0.02 270 / 0.5)",
          border: "1px dashed oklch(0.82 0.17 198 / 0.1)",
          minHeight: "60px",
        }}
      >
        <Loader2
          className="w-4 h-4 animate-spin"
          style={{ color: "oklch(0.55 0.06 260)" }}
        />
      </div>
    );
  }
  if (!drug) {
    return (
      <div
        className="rounded-lg p-3 flex items-center justify-center"
        style={{
          background: "oklch(0.09 0.02 270 / 0.5)",
          border: "1px dashed oklch(0.55 0.22 295 / 0.08)",
          minHeight: "60px",
        }}
      >
        {!empty && (
          <Pill
            className="w-4 h-4 opacity-15"
            style={{ color: "oklch(0.55 0.06 260)" }}
          />
        )}
      </div>
    );
  }
  const score = Number(drug.confidenceScore);
  const s = drug.approvalStatus.toLowerCase();
  const statusColor = s.includes("approved")
    ? "oklch(0.75 0.20 155)"
    : s.includes("trial")
      ? "oklch(0.88 0.18 85)"
      : "oklch(0.6 0.06 260)";
  const statusBg = s.includes("approved")
    ? "oklch(0.75 0.20 155 / 0.12)"
    : s.includes("trial")
      ? "oklch(0.88 0.18 85 / 0.12)"
      : "oklch(0.6 0.06 260 / 0.12)";
  return (
    <div
      className="rounded-lg p-3 space-y-1.5"
      style={{ background: styles.bg, border: styles.border }}
    >
      <p
        className="text-xs font-medium leading-snug"
        style={{ color: "oklch(0.88 0.04 240)" }}
      >
        {drug.name}
      </p>
      <span
        className="inline-block text-[10px] px-1.5 py-0.5 rounded"
        style={{ color: statusColor, background: statusBg }}
      >
        {drug.approvalStatus}
      </span>
      <ConfidenceBar score={score} size="sm" />
    </div>
  );
}
