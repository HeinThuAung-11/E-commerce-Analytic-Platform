type DashboardHeaderProps = {
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  lastUpdatedAt: string | null;
  isDemoMode: boolean;
};

export function DashboardHeader({
  onLogout,
  isLoggingOut,
  lastUpdatedAt,
  isDemoMode,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold tracking-tight">Analytics Dashboard</h1>
          {isDemoMode ? (
            <span className="rounded-full border border-emerald-400/40 bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-emerald-200">
              Demo Mode
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-sm text-slate-400">
          Snapshot of revenue performance, order health, and product movement.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          Last updated: {lastUpdatedAt ?? "Loading..."}
        </p>
      </div>
      <button
        type="button"
        onClick={onLogout}
        disabled={isLoggingOut}
        className="rounded-xl border border-slate-700 px-4 py-2 text-sm text-slate-200 transition hover:border-slate-500 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isLoggingOut ? "Signing Out..." : isDemoMode ? "Exit Demo" : "Sign Out"}
      </button>
    </header>
  );
}
