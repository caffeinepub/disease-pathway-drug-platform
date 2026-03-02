import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import { toast } from "sonner";
import type { DiseaseResult } from "./backend.d.ts";
import { DatabasesPage } from "./components/DatabasesPage";
import { Footer } from "./components/Footer";
import { HeroSection } from "./components/HeroSection";
import { HistoryPage } from "./components/HistoryPage";
import { Navbar } from "./components/Navbar";
import { ResultsPanel } from "./components/ResultsPanel";
import { StarField } from "./components/StarField";
import {
  useDatabaseStatus,
  useSearchDisease,
  useSearchHistory,
  useSuggestedDiseases,
} from "./hooks/useQueries";

type Page = "home" | "search" | "databases" | "history";

export default function App() {
  const [currentPage, setCurrentPage] = useState<Page>("home");
  const [searchResult, setSearchResult] = useState<DiseaseResult | null>(null);
  const [lastDisease, setLastDisease] = useState<string>("");

  const { data: dbStatus, isLoading: dbLoading } = useDatabaseStatus();
  const { data: suggestions = [] } = useSuggestedDiseases();
  const { data: history = [], isLoading: historyLoading } = useSearchHistory();
  const searchMutation = useSearchDisease();

  function handleSearch(disease: string) {
    setLastDisease(disease);
    setCurrentPage("search");
    setSearchResult(null);

    searchMutation.mutate(disease, {
      onSuccess: (data) => {
        setSearchResult(data);
        toast.success(`Analysis complete for "${disease}"`, {
          description: `Found ${data.pathways.length} pathways, ${data.proteins.length} proteins, ${data.drugs.length} drugs`,
        });
      },
      onError: (err) => {
        toast.error("Analysis failed", {
          description:
            err.message || "Could not complete the analysis. Please try again.",
        });
      },
    });
  }

  function handleNavigate(page: Page) {
    setCurrentPage(page);
    if (page === "home") {
      setSearchResult(null);
      setLastDisease("");
      searchMutation.reset();
    }
  }

  function handleBack() {
    setCurrentPage("home");
    setSearchResult(null);
    searchMutation.reset();
  }

  function handleSearchFromHistory(disease: string) {
    setCurrentPage("search");
    handleSearch(disease);
  }

  return (
    <div
      className="min-h-screen flex flex-col relative"
      style={{ background: "oklch(0.04 0.015 270)" }}
    >
      {/* Animated star field background */}
      <StarField />

      {/* Navigation */}
      <Navbar currentPage={currentPage} onNavigate={handleNavigate} />

      {/* Main content */}
      <main className="content-layer flex-1 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Home page */}
          {currentPage === "home" && (
            <HeroSection
              suggestions={suggestions}
              isSearching={searchMutation.isPending}
              dbStatus={dbStatus}
              dbLoading={dbLoading}
              history={history}
              historyLoading={historyLoading}
              onSearch={handleSearch}
            />
          )}

          {/* Search / Results page */}
          {currentPage === "search" && (
            <div className="py-8">
              {/* Search bar at top of results */}
              {!searchMutation.isPending && (
                <div className="mb-8 max-w-2xl">
                  <div
                    className="rounded-2xl p-4"
                    style={{
                      background: "oklch(0.10 0.03 270 / 0.6)",
                      border: "1px solid oklch(0.82 0.17 198 / 0.15)",
                      backdropFilter: "blur(12px)",
                    }}
                  >
                    <p
                      className="text-xs mb-2"
                      style={{ color: "oklch(0.55 0.06 260)" }}
                    >
                      Search another disease
                    </p>
                    <div className="flex gap-2">
                      <input
                        data-ocid="search.input"
                        type="text"
                        defaultValue={lastDisease}
                        key={lastDisease}
                        placeholder="Enter disease name..."
                        className="flex-1 bg-transparent text-sm outline-none px-3 py-2 rounded-xl"
                        style={{
                          background: "oklch(0.08 0.02 270)",
                          border: "1px solid oklch(0.82 0.17 198 / 0.2)",
                          color: "oklch(0.88 0.04 240)",
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            const val = (
                              e.target as HTMLInputElement
                            ).value.trim();
                            if (val) handleSearch(val);
                          }
                        }}
                      />
                      <button
                        type="button"
                        data-ocid="search.submit_button"
                        onClick={(e) => {
                          const input = e.currentTarget
                            .previousElementSibling as HTMLInputElement;
                          if (input?.value?.trim())
                            handleSearch(input.value.trim());
                        }}
                        className="px-4 py-2 rounded-xl text-sm font-semibold transition-all"
                        style={{
                          background:
                            "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.9), oklch(0.55 0.22 295 / 0.9))",
                          color: "oklch(0.08 0.02 270)",
                        }}
                        disabled={searchMutation.isPending}
                      >
                        Analyze
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <ResultsPanel
                result={searchResult}
                isLoading={searchMutation.isPending}
                error={searchMutation.error}
                onBack={handleBack}
              />
            </div>
          )}

          {/* Databases page */}
          {currentPage === "databases" && (
            <div className="py-8">
              <DatabasesPage />
            </div>
          )}

          {/* History page */}
          {currentPage === "history" && (
            <div className="py-8">
              <HistoryPage
                history={history}
                isLoading={historyLoading}
                onSearchAgain={handleSearchFromHistory}
              />
            </div>
          )}
        </div>
      </main>

      <div className="content-layer">
        <Footer />
      </div>

      <Toaster
        theme="dark"
        toastOptions={{
          style: {
            background: "oklch(0.12 0.04 270)",
            border: "1px solid oklch(0.82 0.17 198 / 0.25)",
            color: "oklch(0.92 0.04 240)",
          },
        }}
      />
    </div>
  );
}
