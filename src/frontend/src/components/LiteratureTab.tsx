import { BookOpen, ExternalLink, Loader2 } from "lucide-react";
import type { PubMedArticle } from "../services/diseaseSearch";

interface LiteratureTabProps {
  articles: PubMedArticle[];
  isLoading: boolean;
  diseaseName?: string;
}

export function LiteratureTab({
  articles,
  isLoading,
  diseaseName,
}: LiteratureTabProps) {
  if (isLoading) {
    return (
      <div
        data-ocid="literature.loading_state"
        className="flex items-center justify-center py-16 gap-3"
        style={{ color: "oklch(0.6 0.06 260)" }}
      >
        <Loader2 className="w-5 h-5 animate-spin" />
        <span className="text-sm">Fetching PubMed articles...</span>
      </div>
    );
  }

  if (articles.length === 0) {
    return (
      <div
        data-ocid="literature.empty_state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
          style={{
            background: "oklch(0.72 0.18 45 / 0.1)",
            border: "1px solid oklch(0.72 0.18 45 / 0.3)",
          }}
        >
          <BookOpen
            className="w-7 h-7"
            style={{ color: "oklch(0.72 0.18 45)" }}
          />
        </div>
        <p
          className="text-sm font-medium mb-1"
          style={{ color: "oklch(0.75 0.04 240)" }}
        >
          No PubMed results found
        </p>
        <p className="text-xs" style={{ color: "oklch(0.5 0.06 260)" }}>
          Try searching for this disease directly on PubMed
        </p>
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(diseaseName ?? "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-medium transition-all"
          style={{
            background: "oklch(0.72 0.18 45 / 0.1)",
            color: "oklch(0.72 0.18 45)",
            border: "1px solid oklch(0.72 0.18 45 / 0.3)",
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Search PubMed
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <BookOpen
            className="w-4 h-4"
            style={{ color: "oklch(0.72 0.18 45)" }}
          />
          <span
            className="text-sm font-semibold"
            style={{ color: "oklch(0.85 0.04 240)" }}
          >
            PubMed Literature
          </span>
          <span
            className="px-2 py-0.5 rounded-full text-xs font-mono"
            style={{
              background: "oklch(0.72 0.18 45 / 0.15)",
              color: "oklch(0.72 0.18 45)",
              border: "1px solid oklch(0.72 0.18 45 / 0.3)",
            }}
          >
            {articles.length} articles
          </span>
        </div>
        <a
          href={`https://pubmed.ncbi.nlm.nih.gov/?term=${encodeURIComponent(diseaseName ?? "")}&sort=relevance`}
          target="_blank"
          rel="noopener noreferrer"
          data-ocid="literature.open_modal_button"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all"
          style={{
            background: "oklch(0.72 0.18 45 / 0.1)",
            color: "oklch(0.72 0.18 45)",
            border: "1px solid oklch(0.72 0.18 45 / 0.3)",
          }}
        >
          <ExternalLink className="w-3.5 h-3.5" />
          View all on PubMed
        </a>
      </div>

      {/* Articles list */}
      <div className="space-y-3" data-ocid="literature.list">
        {articles.map((article, idx) => (
          <ArticleCard key={article.pmid} article={article} rank={idx + 1} />
        ))}
      </div>
    </div>
  );
}

function ArticleCard({
  article,
  rank,
}: { article: PubMedArticle; rank: number }) {
  return (
    <div
      data-ocid={`literature.item.${rank}`}
      className="rounded-2xl p-5 space-y-3 transition-all duration-200"
      style={{
        background: "oklch(0.10 0.035 270 / 0.6)",
        border: "1px solid oklch(0.72 0.18 45 / 0.12)",
        backdropFilter: "blur(12px)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.72 0.18 45 / 0.35)";
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          "0 4px 20px oklch(0.72 0.18 45 / 0.08)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLDivElement).style.borderColor =
          "oklch(0.72 0.18 45 / 0.12)";
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Rank + PMID */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <span
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-mono font-bold"
            style={{
              background:
                rank <= 3
                  ? "oklch(0.72 0.18 45 / 0.25)"
                  : "oklch(0.20 0.04 270)",
              color: rank <= 3 ? "oklch(0.82 0.15 45)" : "oklch(0.55 0.06 260)",
            }}
          >
            {rank}
          </span>
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-semibold leading-snug hover:underline flex-1"
            style={{ color: "oklch(0.88 0.04 240)" }}
          >
            {article.title}
          </a>
        </div>
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0 flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs transition-all"
          style={{
            background: "oklch(0.72 0.18 45 / 0.1)",
            color: "oklch(0.72 0.18 45)",
            border: "1px solid oklch(0.72 0.18 45 / 0.25)",
          }}
        >
          <ExternalLink className="w-3 h-3" />
          PubMed
        </a>
      </div>

      {/* Metadata */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        {article.authors && (
          <span className="text-xs" style={{ color: "oklch(0.65 0.06 260)" }}>
            {article.authors}
          </span>
        )}
        {article.journal && (
          <span
            className="text-xs italic"
            style={{ color: "oklch(0.55 0.06 260)" }}
          >
            {article.journal}
          </span>
        )}
        {article.year && (
          <span
            className="px-2 py-0.5 rounded-md text-xs font-mono"
            style={{
              background: "oklch(0.15 0.04 270)",
              color: "oklch(0.72 0.18 45)",
            }}
          >
            {article.year}
          </span>
        )}
        <span
          className="px-2 py-0.5 rounded-md text-xs font-mono"
          style={{
            background: "oklch(0.15 0.04 270)",
            color: "oklch(0.55 0.06 260)",
          }}
        >
          PMID: {article.pmid}
        </span>
      </div>
    </div>
  );
}
