import { Button } from "@/components/ui/button";
import { ChevronDown, Search, Sparkles } from "lucide-react";
import { useEffect, useRef, useState } from "react";

interface SearchBarProps {
  suggestions: string[];
  isSearching: boolean;
  onSearch: (disease: string) => void;
  initialValue?: string;
}

const QUICK_DISEASES = [
  "Type 2 Diabetes",
  "Alzheimer's Disease",
  "Hypertension",
  "Cancer",
  "COVID-19",
];

export function SearchBar({
  suggestions,
  isSearching,
  onSearch,
  initialValue = "",
}: SearchBarProps) {
  const [value, setValue] = useState(initialValue);
  const [showDropdown, setShowDropdown] = useState(false);
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setValue(initialValue);
  }, [initialValue]);

  const filtered =
    value.length >= 1
      ? suggestions
          .filter((s) => s.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 8)
      : [];

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (value.trim()) {
      setShowDropdown(false);
      onSearch(value.trim());
    }
  }

  function handleSelect(disease: string) {
    setValue(disease);
    setShowDropdown(false);
    onSearch(disease);
  }

  // Close dropdown on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search form */}
      <form onSubmit={handleSubmit} className="relative">
        <div
          className="relative rounded-2xl transition-all duration-300"
          style={{
            background: "oklch(0.10 0.03 270 / 0.8)",
            border: `1px solid ${focused ? "oklch(0.82 0.17 198 / 0.6)" : "oklch(0.82 0.17 198 / 0.2)"}`,
            boxShadow: focused
              ? "0 0 30px oklch(0.82 0.17 198 / 0.2), 0 0 60px oklch(0.55 0.22 295 / 0.1)"
              : "0 0 15px oklch(0.82 0.17 198 / 0.08)",
          }}
        >
          <div className="flex items-center gap-3 p-2 pl-4">
            <Search
              className="w-5 h-5 flex-shrink-0 transition-colors duration-300"
              style={{
                color: focused ? "oklch(0.82 0.17 198)" : "oklch(0.5 0.06 260)",
              }}
            />
            <input
              ref={inputRef}
              data-ocid="search.input"
              type="text"
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setFocused(true);
                if (filtered.length > 0) setShowDropdown(true);
              }}
              onBlur={() => setFocused(false)}
              onKeyDown={(e) => {
                if (e.key === "Escape") setShowDropdown(false);
              }}
              placeholder="Enter a disease name (e.g., Type 2 Diabetes)..."
              className="flex-1 bg-transparent text-base font-sans outline-none placeholder:text-muted-foreground/50"
              style={{ color: "oklch(0.94 0.03 240)", minWidth: 0 }}
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            {filtered.length > 0 && showDropdown && (
              <ChevronDown
                className="w-4 h-4 flex-shrink-0"
                style={{ color: "oklch(0.5 0.06 260)" }}
              />
            )}
            <Button
              type="submit"
              data-ocid="search.submit_button"
              disabled={isSearching || !value.trim()}
              className="flex-shrink-0 rounded-xl px-5 py-2 font-semibold text-sm flex items-center gap-2 transition-all duration-200"
              style={{
                background:
                  "linear-gradient(135deg, oklch(0.82 0.17 198 / 0.9), oklch(0.55 0.22 295 / 0.9))",
                color: "oklch(0.08 0.02 270)",
                boxShadow: "0 0 15px oklch(0.82 0.17 198 / 0.3)",
              }}
            >
              {isSearching ? (
                <>
                  <div
                    className="w-4 h-4 rounded-full border-2 border-t-transparent animate-spin"
                    style={{
                      borderColor: "oklch(0.08 0.02 270 / 0.3)",
                      borderTopColor: "oklch(0.08 0.02 270)",
                    }}
                  />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Analyze
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Autocomplete dropdown */}
        {showDropdown && filtered.length > 0 && (
          <div
            ref={dropdownRef}
            className="absolute top-full left-0 right-0 mt-2 rounded-xl overflow-hidden z-50"
            style={{
              background: "oklch(0.10 0.04 270 / 0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid oklch(0.82 0.17 198 / 0.25)",
              boxShadow: "0 8px 32px oklch(0.04 0.015 270 / 0.8)",
            }}
          >
            {filtered.map((disease, i) => (
              <button
                key={disease}
                type="button"
                onMouseDown={() => handleSelect(disease)}
                className="w-full text-left px-4 py-3 text-sm flex items-center gap-3 transition-colors duration-150"
                style={{
                  color: "oklch(0.85 0.04 240)",
                  borderBottom:
                    i < filtered.length - 1
                      ? "1px solid oklch(0.82 0.17 198 / 0.08)"
                      : "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "oklch(0.82 0.17 198 / 0.08)";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.82 0.17 198)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background =
                    "transparent";
                  (e.currentTarget as HTMLButtonElement).style.color =
                    "oklch(0.85 0.04 240)";
                }}
              >
                <Search className="w-3.5 h-3.5 opacity-50 flex-shrink-0" />
                {disease}
              </button>
            ))}
          </div>
        )}
      </form>

      {/* Quick chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-4">
        {QUICK_DISEASES.map((disease) => (
          <button
            key={disease}
            type="button"
            onClick={() => handleSelect(disease)}
            className="px-4 py-1.5 rounded-full text-xs font-medium transition-all duration-200"
            style={{
              background: "oklch(0.14 0.05 270 / 0.6)",
              border: "1px solid oklch(0.82 0.17 198 / 0.2)",
              color: "oklch(0.75 0.10 240)",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.82 0.17 198 / 0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.82 0.17 198 / 0.5)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "oklch(0.82 0.17 198)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.background =
                "oklch(0.14 0.05 270 / 0.6)";
              (e.currentTarget as HTMLButtonElement).style.borderColor =
                "oklch(0.82 0.17 198 / 0.2)";
              (e.currentTarget as HTMLButtonElement).style.color =
                "oklch(0.75 0.10 240)";
            }}
          >
            {disease}
          </button>
        ))}
      </div>
    </div>
  );
}
