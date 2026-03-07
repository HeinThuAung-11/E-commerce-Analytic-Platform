import type { RevenueRange } from "../analytics.service";

type RevenueRangeSelectorProps = {
  ranges: RevenueRange[];
  selectedRange: RevenueRange;
  onSelect: (range: RevenueRange) => void;
};

export function RevenueRangeSelector({
  ranges,
  selectedRange,
  onSelect,
}: RevenueRangeSelectorProps) {
  return (
    <div className="mt-6">
      <p className="mb-2 text-xs uppercase tracking-wide text-slate-500">Analysis Window</p>
      <div className="flex flex-wrap gap-2">
        {ranges.map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => onSelect(range)}
            className={`rounded-xl px-3 py-1.5 text-sm transition ${
              selectedRange === range
                ? "bg-brand-600 text-white"
                : "border border-slate-700 text-slate-300 hover:border-slate-500"
            }`}
          >
            {range}
          </button>
        ))}
      </div>
    </div>
  );
}
