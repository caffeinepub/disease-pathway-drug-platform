import { ChevronRight, Clock, History, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { DatabaseStatus, SearchHistoryEntry } from "../backend.d.ts";
import { DatabaseStatusBar } from "./DatabaseStatusBar";
import { SearchBar } from "./SearchBar";

interface HeroSectionProps {
  suggestions: string[];
  isSearching: boolean;
  dbStatus: DatabaseStatus | undefined;
  dbLoading: boolean;
  history: SearchHistoryEntry[];
  historyLoading: boolean;
  onSearch: (disease: string) => void;
  initialValue?: string;
}

function formatTimestampShort(ts: bigint) {
  try {
    const ms = Number(ts) / 1_000_000;
    const date = new Date(ms);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return "";
  }
}

export function HeroSection({
  suggestions,
  isSearching,
  dbStatus,
  dbLoading,
  history,
  historyLoading,
  onSearch,
  initialValue,
}: HeroSectionProps) {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col justify-center relative">
      {/* Nebula blobs */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.55 0.22 295 / 0.12) 0%, transparent 70%)",
          filter: "blur(40px)",
          animation: "nebula-float 25s ease-in-out infinite",
        }}
      />
      <div
        className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.82 0.17 198 / 0.10) 0%, transparent 70%)",
          filter: "blur(50px)",
          animation: "nebula-float 30s ease-in-out infinite reverse",
        }}
      />
      <div
        className="absolute top-1/2 right-1/3 w-64 h-64 rounded-full pointer-events-none"
        style={{
          background:
            "radial-gradient(circle, oklch(0.60 0.22 330 / 0.08) 0%, transparent 70%)",
          filter: "blur(45px)",
          animation: "nebula-float 35s ease-in-out infinite",
          animationDelay: "5s",
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 py-16 space-y-12">
        {/* Title block */}
        <motion.div
          className="text-center space-y-6"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          {/* Badge — shimmer pill */}
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full hero-badge"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Sparkles className="w-3 h-3" />
            AI-Powered Bioinformatics Platform
          </motion.div>

          {/* Main title — cinematic two-line treatment */}
          <div className="space-y-1">
            <h1>
              {/* Line 1: heavy, tight, glowing */}
              <span className="block hero-title-primary">
                Disease–Pathway–Drug
              </span>
              {/* Line 2: light weight, wide tracking, gradient */}
              <span className="block hero-title-gradient mt-1">
                Recommendation Platform
              </span>
            </h1>
          </div>

          {/* Tagline — slightly larger, better contrast */}
          <p
            className="text-sm sm:text-base max-w-xl mx-auto leading-relaxed tracking-wide"
            style={{ color: "oklch(0.62 0.06 260)" }}
          >
            Biological pathway analysis connecting diseases to targeted
            therapies via{" "}
            <span style={{ color: "oklch(0.82 0.17 198)", fontWeight: 600 }}>
              KEGG
            </span>
            {" · "}
            <span style={{ color: "oklch(0.75 0.20 155)", fontWeight: 600 }}>
              UniProt
            </span>
            {" · "}
            <span style={{ color: "oklch(0.75 0.15 295)", fontWeight: 600 }}>
              DrugBank
            </span>
            {" · "}
            <span style={{ color: "oklch(0.88 0.18 85)", fontWeight: 600 }}>
              NCBI
            </span>
          </p>
        </motion.div>

        {/* Search bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
        >
          <SearchBar
            suggestions={suggestions}
            isSearching={isSearching}
            onSearch={onSearch}
            initialValue={initialValue}
          />
          {/* Database status */}
          <DatabaseStatusBar status={dbStatus} isLoading={dbLoading} />
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-3 gap-4 max-w-lg mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          {[
            {
              label: "Curated Databases",
              value: "5+",
              color: "oklch(0.82 0.17 198)",
              glow: "oklch(0.82 0.17 198 / 0.4)",
            },
            {
              label: "Pathway Maps",
              value: "550K+",
              color: "oklch(0.75 0.20 155)",
              glow: "oklch(0.75 0.20 155 / 0.35)",
            },
            {
              label: "Drug Compounds",
              value: "14K+",
              color: "oklch(0.65 0.22 295)",
              glow: "oklch(0.65 0.22 295 / 0.35)",
            },
          ].map(({ label, value, color, glow }) => (
            <div
              key={label}
              className="text-center px-4 py-3 rounded-xl"
              style={{
                background: "oklch(0.10 0.035 270 / 0.5)",
                border: `1px solid ${color.replace(")", " / 0.15)")}`,
              }}
            >
              <div
                className="font-display font-black mb-0.5 tabular-nums"
                style={{
                  fontSize: "clamp(1.4rem, 3.5vw, 2rem)",
                  color,
                  textShadow: `0 0 20px ${glow}`,
                  letterSpacing: "-0.02em",
                }}
              >
                {value}
              </div>
              <div
                className="text-xs font-medium tracking-wide uppercase"
                style={{
                  color: "oklch(0.48 0.05 260)",
                  letterSpacing: "0.08em",
                }}
              >
                {label}
              </div>
            </div>
          ))}
        </motion.div>

        {/* Recent searches */}
        {(historyLoading || history.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <History
                className="w-4 h-4"
                style={{ color: "oklch(0.5 0.06 260)" }}
              />
              <span
                className="text-xs font-medium"
                style={{ color: "oklch(0.5 0.06 260)" }}
              >
                Recent Searches
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {historyLoading
                ? Array.from({ length: 3 }, (_, i) => `skel-${i}`).map((k) => (
                    <div
                      key={k}
                      className="h-8 w-32 rounded-xl animate-pulse"
                      style={{ background: "oklch(0.14 0.05 270)" }}
                    />
                  ))
                : history.slice(0, 5).map((entry) => (
                    <button
                      key={entry.diseaseName}
                      type="button"
                      onClick={() => onSearch(entry.diseaseName)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200"
                      style={{
                        background: "oklch(0.12 0.04 270 / 0.7)",
                        border: "1px solid oklch(0.82 0.17 198 / 0.15)",
                        color: "oklch(0.7 0.08 260)",
                      }}
                      onMouseEnter={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "oklch(0.82 0.17 198 / 0.4)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.82 0.17 198)";
                      }}
                      onMouseLeave={(e) => {
                        (
                          e.currentTarget as HTMLButtonElement
                        ).style.borderColor = "oklch(0.82 0.17 198 / 0.15)";
                        (e.currentTarget as HTMLButtonElement).style.color =
                          "oklch(0.7 0.08 260)";
                      }}
                    >
                      <Clock className="w-3 h-3 opacity-60" />
                      {entry.diseaseName}
                      <span className="opacity-40">
                        {formatTimestampShort(entry.timestamp)}
                      </span>
                      <ChevronRight className="w-3 h-3 opacity-40" />
                    </button>
                  ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
