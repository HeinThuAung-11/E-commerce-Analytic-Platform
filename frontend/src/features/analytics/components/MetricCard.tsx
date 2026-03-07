type MetricCardProps = {
  label: string;
  value: string | number;
  isLoading: boolean;
  hint: string;
};

export function MetricCard({ label, value, isLoading, hint }: MetricCardProps) {
  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5" title={hint}>
      <p className="text-sm text-slate-400">{label}</p>
      {isLoading ? (
        <div className="mt-3 h-8 w-28 animate-pulse rounded-md bg-slate-800" />
      ) : (
        <p className="mt-3 text-2xl font-semibold">{value}</p>
      )}
      <p className="mt-2 text-xs text-slate-500">{hint}</p>
    </article>
  );
}
