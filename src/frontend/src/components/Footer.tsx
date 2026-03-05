import { Heart } from "lucide-react";

export function Footer() {
  const year = new Date().getFullYear();
  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";
  const caffeineUrl = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(hostname)}`;

  return (
    <footer
      className="border-t mt-auto"
      style={{
        borderColor: "oklch(0.82 0.17 198 / 0.1)",
        background: "oklch(0.06 0.02 270 / 0.8)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p
          className="text-xs flex items-center gap-1.5"
          style={{ color: "oklch(0.45 0.06 260)" }}
        >
          © {year} Disease–Pathway–Drug Recommendation Platform
        </p>
        <div className="flex flex-col items-center sm:items-end gap-0.5">
          <p
            className="text-xs flex items-center gap-1.5"
            style={{ color: "oklch(0.45 0.06 260)" }}
          >
            Built with{" "}
            <Heart
              className="w-3 h-3 inline"
              style={{ color: "oklch(0.65 0.22 25)" }}
            />{" "}
            using{" "}
            <a
              href={caffeineUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="transition-colors duration-200"
              style={{ color: "oklch(0.82 0.17 198 / 0.7)" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.82 0.17 198)";
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.color =
                  "oklch(0.82 0.17 198 / 0.7)";
              }}
            >
              caffeine.ai
            </a>
          </p>
          <p
            style={{
              fontSize: "0.55rem",
              color: "oklch(0.55 0.12 198 / 0.5)",
              letterSpacing: "0.03em",
            }}
          >
            Created by Suhasini
          </p>
        </div>
      </div>
    </footer>
  );
}
