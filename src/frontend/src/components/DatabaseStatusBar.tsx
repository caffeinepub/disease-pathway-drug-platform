import { Wifi } from "lucide-react";

const DB_LIST: {
  label: string;
  color: string;
}[] = [
  { label: "KEGG", color: "oklch(0.82 0.17 198)" },
  { label: "UniProt", color: "oklch(0.75 0.20 155)" },
  { label: "DrugBank", color: "oklch(0.55 0.22 295)" },
  { label: "NCBI", color: "oklch(0.88 0.18 85)" },
  { label: "PubChem", color: "oklch(0.60 0.22 330)" },
  { label: "PubMed", color: "oklch(0.72 0.18 45)" },
];

// All databases are always online — curated KB + NCBI eutils are always available
export function DatabaseStatusBar() {
  return (
    <div className="flex flex-wrap justify-center gap-2 mt-4">
      {DB_LIST.map(({ label, color }) => (
        <div
          key={label}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
          style={{
            background: "oklch(0.08 0.02 270 / 0.8)",
            border: `1px solid ${color.replace(")", " / 0.3)")}`,
            color,
          }}
        >
          <Wifi className="w-3 h-3" />
          {label}
          <span
            className="w-1.5 h-1.5 rounded-full"
            style={{
              background: color,
              boxShadow: `0 0 6px ${color}`,
            }}
          />
        </div>
      ))}

      {/* Additional databases badge — always shown as online */}
      <div
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium"
        style={{
          background: "oklch(0.08 0.02 270 / 0.8)",
          border: "1px solid oklch(0.75 0.20 155 / 0.3)",
          color: "oklch(0.75 0.20 155)",
        }}
      >
        <Wifi className="w-3 h-3" />8 Additional DBs
        <span
          className="w-1.5 h-1.5 rounded-full"
          style={{
            background: "oklch(0.75 0.20 155)",
            boxShadow: "0 0 6px oklch(0.75 0.20 155)",
          }}
        />
      </div>
    </div>
  );
}
