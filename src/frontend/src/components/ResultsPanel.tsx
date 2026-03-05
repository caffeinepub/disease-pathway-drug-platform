import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertCircle,
  ArrowLeftRight,
  Atom,
  BookOpen,
  ChevronLeft,
  Dna,
  Info,
  Network,
  Pill,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import type {
  DiseaseResultWithLiterature,
  ExtendedDrug,
  ExtendedPathway,
} from "../services/diseaseSearch";
import { CompareModal } from "./CompareModal";
import { DrugsTab } from "./DrugsTab";
import { LiteratureTab } from "./LiteratureTab";
import { NetworkGraph } from "./NetworkGraph";
import { PathwaysTab } from "./PathwaysTab";
import { ProteinsTab } from "./ProteinsTab";

const FAVORITES_KEY = "dpdp_favorites";

function loadFavorites(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function saveFavorites(favs: string[]) {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
  } catch {
    // storage unavailable — fail silently
  }
}

interface ResultsPanelProps {
  result: DiseaseResultWithLiterature | null;
  isLoading: boolean;
  error: Error | null;
  onBack: () => void;
}

export function ResultsPanel({
  result,
  isLoading,
  error,
  onBack,
}: ResultsPanelProps) {
  const [activeTab, setActiveTab] = useState("pathways");
  const [favorites, setFavorites] = useState<string[]>(loadFavorites);
  const [compareOpen, setCompareOpen] = useState(false);

  // Sync favorites to localStorage whenever they change
  useEffect(() => {
    saveFavorites(favorites);
  }, [favorites]);

  function toggleFavorite(name: string) {
    setFavorites((prev) =>
      prev.includes(name) ? prev.filter((f) => f !== name) : [...prev, name],
    );
  }

  const isFavorited = result ? favorites.includes(result.diseaseName) : false;

  if (error) {
    return (
      <div
        data-ocid="results.error_state"
        className="flex flex-col items-center justify-center py-20 text-center max-w-md mx-auto"
      >
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
          style={{
            background: "oklch(0.65 0.22 25 / 0.1)",
            border: "1px solid oklch(0.65 0.22 25 / 0.3)",
          }}
        >
          <AlertCircle
            className="w-8 h-8"
            style={{ color: "oklch(0.65 0.22 25)" }}
          />
        </div>
        <h3
          className="font-display text-xl font-bold mb-2"
          style={{ color: "oklch(0.85 0.04 240)" }}
        >
          Analysis Failed
        </h3>
        <p className="text-sm mb-6" style={{ color: "oklch(0.55 0.06 260)" }}>
          {error.message ||
            "Could not retrieve data from biological databases. Please try again."}
        </p>
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all"
          style={{
            background: "oklch(0.65 0.22 25 / 0.15)",
            color: "oklch(0.75 0.15 25)",
            border: "1px solid oklch(0.65 0.22 25 / 0.35)",
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  const tabs = [
    {
      id: "pathways",
      label: "Pathways",
      icon: <Dna className="w-4 h-4" />,
      count: result?.pathways.length,
    },
    {
      id: "proteins",
      label: "Proteins",
      icon: <Atom className="w-4 h-4" />,
      count: result?.proteins.length,
    },
    {
      id: "drugs",
      label: "Drugs",
      icon: <Pill className="w-4 h-4" />,
      count: result?.drugs.length,
    },
    {
      id: "literature",
      label: "Literature",
      icon: <BookOpen className="w-4 h-4" />,
      count: result?.pubmedArticles?.length,
    },
    {
      id: "network",
      label: "Network",
      icon: <Network className="w-4 h-4" />,
      count: undefined,
    },
  ];

  return (
    <div className="space-y-6 animate-slide-up-fade">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium transition-colors duration-200"
          style={{ color: "oklch(0.6 0.06 260)" }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.82 0.17 198)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "oklch(0.6 0.06 260)";
          }}
        >
          <ChevronLeft className="w-4 h-4" />
          New Search
        </button>

        {result && !isLoading && (
          <div className="flex items-center gap-3 flex-wrap justify-end">
            <div className="text-right">
              <h2
                className="font-display text-xl font-bold"
                style={{ color: "oklch(0.92 0.04 240)" }}
              >
                {result.diseaseName}
              </h2>
              <p className="text-xs" style={{ color: "oklch(0.55 0.06 260)" }}>
                {result.pathways.length} pathways · {result.proteins.length}{" "}
                proteins · {result.drugs.length} drugs
              </p>
            </div>

            {/* Favorite toggle */}
            <button
              type="button"
              data-ocid="results.favorite_toggle"
              onClick={() => toggleFavorite(result.diseaseName)}
              title={isFavorited ? "Remove from favorites" : "Add to favorites"}
              className="flex items-center justify-center w-8 h-8 rounded-lg transition-all duration-200"
              style={{
                background: isFavorited
                  ? "oklch(0.88 0.18 85 / 0.15)"
                  : "oklch(0.10 0.02 270 / 0.6)",
                border: isFavorited
                  ? "1px solid oklch(0.88 0.18 85 / 0.4)"
                  : "1px solid oklch(0.82 0.17 198 / 0.15)",
                color: isFavorited
                  ? "oklch(0.88 0.18 85)"
                  : "oklch(0.5 0.06 260)",
              }}
              onMouseEnter={(e) => {
                if (!isFavorited) {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.88 0.18 85)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.88 0.18 85 / 0.3)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isFavorited) {
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.5 0.06 260)";
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    "oklch(0.82 0.17 198 / 0.15)";
                }
              }}
            >
              <Star
                className="w-4 h-4"
                fill={isFavorited ? "currentColor" : "none"}
              />
            </button>

            {/* Compare button */}
            <button
              type="button"
              data-ocid="results.compare_button"
              onClick={() => setCompareOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.12), oklch(0.55 0.22 295 / 0.12))",
                border: "1px solid oklch(0.82 0.17 198 / 0.25)",
                color: "oklch(0.82 0.17 198)",
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.2), oklch(0.55 0.22 295 / 0.2))";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.12), oklch(0.55 0.22 295 / 0.12))";
              }}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              Compare
            </button>

            <div
              className="px-3 py-1.5 rounded-lg text-xs font-mono font-semibold"
              style={{
                background: "oklch(0.82 0.17 198 / 0.1)",
                color: "oklch(0.82 0.17 198)",
                border: "1px solid oklch(0.82 0.17 198 / 0.3)",
              }}
            >
              Score: {Number(result.totalConfidence)}%
            </div>
          </div>
        )}
      </div>

      {/* Loading state */}
      {isLoading && (
        <div
          data-ocid="results.loading_state"
          className="flex flex-col items-center justify-center py-20 space-y-6"
        >
          {/* Galaxy spinner */}
          <div className="relative w-24 h-24">
            <div
              className="absolute inset-0 rounded-full border-2 border-transparent animate-spin-ring"
              style={{
                borderTopColor: "oklch(0.82 0.17 198)",
                borderRightColor: "oklch(0.82 0.17 198 / 0.3)",
              }}
            />
            <div
              className="absolute inset-3 rounded-full border-2 border-transparent"
              style={{
                borderTopColor: "oklch(0.55 0.22 295)",
                borderRightColor: "oklch(0.55 0.22 295 / 0.3)",
                animation: "spin-ring 1.8s linear infinite reverse",
              }}
            />
            <div
              className="absolute inset-6 rounded-full border-2 border-transparent animate-spin-ring"
              style={{
                borderTopColor: "oklch(0.75 0.20 155)",
                borderRightColor: "oklch(0.75 0.20 155 / 0.3)",
                animationDuration: "0.8s",
              }}
            />
            <div
              className="absolute inset-9 rounded-full"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.82 0.17 198 / 0.3), transparent)",
              }}
            />
          </div>
          <div className="text-center space-y-2">
            <p
              className="font-display font-semibold text-lg"
              style={{ color: "oklch(0.82 0.17 198)" }}
            >
              Querying biological databases...
            </p>
            <p className="text-sm" style={{ color: "oklch(0.5 0.06 260)" }}>
              Analyzing KEGG pathways · UniProt proteins · DrugBank compounds
            </p>
          </div>
        </div>
      )}

      {/* Confidence notice banner */}
      {result && !isLoading && (
        <div
          data-ocid="results.confidence_notice"
          className="flex items-start gap-3 px-4 py-3 rounded-xl text-xs"
          style={{
            background: "oklch(0.82 0.17 198 / 0.06)",
            border: "1px solid oklch(0.82 0.17 198 / 0.2)",
            color: "oklch(0.72 0.08 240)",
          }}
        >
          <Info
            className="w-4 h-4 flex-shrink-0 mt-0.5"
            style={{ color: "oklch(0.82 0.17 198)" }}
          />
          <span>
            <strong style={{ color: "oklch(0.88 0.10 220)" }}>
              Highest-confidence results displayed.
            </strong>{" "}
            The pathways, protein targets, and drug recommendations shown are
            ranked by confidence score derived from curated data across KEGG,
            UniProt, DrugBank, Reactome, ChEMBL, and PubMed. Results are sorted
            from highest to lowest confidence. Use the external database links
            on each card to explore the complete literature for each entry.
          </span>
        </div>
      )}

      {/* Results tabs */}
      {(result || isLoading) && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList
            className="flex gap-1 p-1 rounded-xl w-full sm:w-auto"
            style={{
              background: "oklch(0.10 0.03 270)",
              border: "1px solid oklch(0.82 0.17 198 / 0.15)",
            }}
          >
            {tabs.map((tab, idx) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                data-ocid={`results.tab.${idx + 1}`}
                className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex-1 sm:flex-none justify-center"
                style={{
                  color:
                    activeTab === tab.id
                      ? "oklch(0.92 0.04 240)"
                      : "oklch(0.55 0.06 260)",
                  background:
                    activeTab === tab.id
                      ? "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.2), oklch(0.55 0.22 295 / 0.2))"
                      : "transparent",
                }}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className="inline-flex items-center justify-center w-5 h-5 rounded-full text-xs font-mono"
                    style={{
                      background: "oklch(0.82 0.17 198 / 0.2)",
                      color: "oklch(0.82 0.17 198)",
                    }}
                  >
                    {tab.count}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="pathways" className="mt-4">
            <PathwaysTab
              pathways={(result?.pathways || []) as ExtendedPathway[]}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="proteins" className="mt-4">
            <ProteinsTab
              proteins={result?.proteins || []}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="drugs" className="mt-4">
            <DrugsTab
              drugs={(result?.drugs || []) as ExtendedDrug[]}
              isLoading={isLoading}
            />
          </TabsContent>
          <TabsContent value="literature" className="mt-4">
            <LiteratureTab
              articles={result?.pubmedArticles ?? []}
              isLoading={isLoading}
              diseaseName={result?.diseaseName}
            />
          </TabsContent>
          <TabsContent value="network" className="mt-4">
            {result && !isLoading ? (
              <NetworkGraph data={result} />
            ) : (
              <div
                className="flex items-center justify-center h-64"
                style={{ color: "oklch(0.5 0.06 260)" }}
              >
                <Network className="w-8 h-8 opacity-30" />
              </div>
            )}
          </TabsContent>
        </Tabs>
      )}

      {/* Compare Modal */}
      {result && (
        <CompareModal
          open={compareOpen}
          onClose={() => setCompareOpen(false)}
          primaryResult={result}
        />
      )}
    </div>
  );
}
