interface ConfidenceBarProps {
  score: number; // 0-100
  showLabel?: boolean;
  size?: "sm" | "md";
}

export function ConfidenceBar({
  score,
  showLabel = true,
  size = "md",
}: ConfidenceBarProps) {
  const clampedScore = Math.min(100, Math.max(0, score));

  const colorClass =
    clampedScore >= 70
      ? "confidence-bar-fill-high"
      : clampedScore >= 40
        ? "confidence-bar-fill-mid"
        : "confidence-bar-fill-low";

  const labelColor =
    clampedScore >= 70
      ? "oklch(0.75 0.20 155)"
      : clampedScore >= 40
        ? "oklch(0.82 0.18 55)"
        : "oklch(0.65 0.22 25)";

  const barHeight = size === "sm" ? "h-1" : "h-1.5";
  const glowColor =
    clampedScore >= 70
      ? "oklch(0.75 0.20 155 / 0.6)"
      : clampedScore >= 40
        ? "oklch(0.82 0.18 55 / 0.5)"
        : "oklch(0.65 0.22 25 / 0.5)";

  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`flex-1 rounded-full overflow-hidden ${barHeight}`}
        style={{
          background: "oklch(0.14 0.04 270)",
          boxShadow: "inset 0 1px 2px oklch(0.04 0.015 270 / 0.8)",
        }}
      >
        <div
          className={`${barHeight} rounded-full ${colorClass} transition-all duration-700`}
          style={{
            width: `${clampedScore}%`,
            boxShadow: `0 0 6px ${glowColor}`,
          }}
        />
      </div>
      {showLabel && (
        <span
          className="text-xs font-mono font-semibold min-w-[36px] text-right tabular-nums"
          style={{ color: labelColor }}
        >
          {clampedScore}%
        </span>
      )}
    </div>
  );
}

interface ConfidenceBadgeProps {
  score: number;
}

export function ConfidenceBadge({ score }: ConfidenceBadgeProps) {
  const clampedScore = Math.min(100, Math.max(0, score));

  const style =
    clampedScore >= 70
      ? {
          background: "oklch(0.75 0.20 155 / 0.15)",
          border: "1px solid oklch(0.75 0.20 155 / 0.4)",
          color: "oklch(0.75 0.20 155)",
        }
      : clampedScore >= 40
        ? {
            background: "oklch(0.82 0.18 55 / 0.15)",
            border: "1px solid oklch(0.82 0.18 55 / 0.4)",
            color: "oklch(0.82 0.18 55)",
          }
        : {
            background: "oklch(0.65 0.22 25 / 0.15)",
            border: "1px solid oklch(0.65 0.22 25 / 0.4)",
            color: "oklch(0.65 0.22 25)",
          };

  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold"
      style={style}
    >
      {clampedScore}%
    </span>
  );
}
