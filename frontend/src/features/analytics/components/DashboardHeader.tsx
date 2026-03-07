type DashboardHeaderProps = {
  onLogout: () => Promise<void>;
  isLoggingOut: boolean;
  lastUpdatedAt: string | null;
};

export function DashboardHeader({
  onLogout,
  isLoggingOut,
  lastUpdatedAt,
}: DashboardHeaderProps) {
  return (
    <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics Dashboard</h1>
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
        {isLoggingOut ? "Signing Out..." : "Sign Out"}
      </button>
    </header>
  );
}
