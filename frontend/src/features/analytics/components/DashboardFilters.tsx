type DashboardFiltersProps = {
  status: string;
  category: string;
  customer: string;
  statusOptions: string[];
  categoryOptions: string[];
  customerOptions: string[];
  onStatusChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
  onCustomerChange: (value: string) => void;
};

function renderOption(value: string): string {
  return value === "ALL" ? "All" : value;
}

export function DashboardFilters({
  status,
  category,
  customer,
  statusOptions,
  categoryOptions,
  customerOptions,
  onStatusChange,
  onCategoryChange,
  onCustomerChange,
}: DashboardFiltersProps) {
  return (
    <section className="mt-6 grid gap-3 rounded-2xl border border-slate-800 bg-slate-900 p-4 md:grid-cols-3">
      <label className="space-y-1 text-sm">
        <span className="text-slate-400">Order Status</span>
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {renderOption(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-slate-400">Product Category</span>
        <select
          value={category}
          onChange={(event) => onCategoryChange(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
        >
          {categoryOptions.map((option) => (
            <option key={option} value={option}>
              {renderOption(option)}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-1 text-sm">
        <span className="text-slate-400">Customer Domain</span>
        <select
          value={customer}
          onChange={(event) => onCustomerChange(event.target.value)}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-100 outline-none focus:border-slate-500"
        >
          {customerOptions.map((option) => (
            <option key={option} value={option}>
              {renderOption(option)}
            </option>
          ))}
        </select>
      </label>
    </section>
  );
}
