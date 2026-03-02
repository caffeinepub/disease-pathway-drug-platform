import { Loader2, Wifi, WifiOff } from "lucide-react";
import type { DatabaseStatus } from "../backend.d.ts";

interface DatabaseStatusBarProps {
  status: DatabaseStatus | undefined;
  isLoading: boolean;
}

const DB_LIST: { key: keyof DatabaseStatus; label: string; color: string }[] = [
  { key: "kegg", label: "KEGG", color: "oklch(0.82 0.17 198)" },
  { key: "uniprot", label: "UniProt", color: "oklch(0.75 0.20 155)" },
  { key: "drugbank", label: "DrugBank", color: "oklch(0.55 0.22 295)" },
  { key: "ncbi", label: "NCBI", color: "oklch(0.88 0.18 85)" },
  { key: "pubchem", label: "PubChem", color: "oklch(0.60 0.22 330)" },
];

export function DatabaseStatusBar({
  status,
  isLoading,
}: DatabaseStatusBarProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {DB_LIST.map(({ key, label, color }) => {
        const online = status?.[key];
        return (
          <div
            key={key}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
            style={{
              background: isLoading
                ? "oklch(0.16 0.05 270 / 0.6)"
                : online
                  ? "oklch(0.08 0.02 270 / 0.8)"
                  : "oklch(0.16 0.05 270 / 0.6)",
              border: `1px solid ${isLoading ? "oklch(0.4 0.05 260 / 0.3)" : online ? `${color} / 0.3` : "oklch(0.65 0.22 25 / 0.3)"}`,
              borderColor: isLoading
                ? "oklch(0.4 0.05 260 / 0.3)"
                : online
                  ? `${color.replace(")", " / 0.3)")}`
                  : "oklch(0.65 0.22 25 / 0.3)",
              color: isLoading
                ? "oklch(0.6 0.06 260)"
                : online
                  ? color
                  : "oklch(0.65 0.22 25)",
            }}
          >
            {isLoading ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : online ? (
              <Wifi className="w-3 h-3" />
            ) : (
              <WifiOff className="w-3 h-3" />
            )}
            {label}
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{
                background: isLoading
                  ? "oklch(0.6 0.06 260)"
                  : online
                    ? color
                    : "oklch(0.65 0.22 25)",
                boxShadow: !isLoading && online ? `0 0 6px ${color}` : "none",
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
