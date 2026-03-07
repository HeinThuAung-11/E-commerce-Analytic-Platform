import type { ProductItem } from "../analytics.service";
import { formatCurrency } from "../formatters";

type ProductsListPanelProps = {
  products: ProductItem[];
  isLoading: boolean;
};

export function ProductsListPanel({ products, isLoading }: ProductsListPanelProps) {
  const previewProducts = products.slice(0, 8);

  return (
    <article className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <h2 className="text-lg font-semibold">Products</h2>
      <ul className="mt-4 space-y-3">
        {isLoading
          ? Array.from({ length: 6 }).map((_, index) => (
              <li key={`product-skeleton-${index}`} className="rounded-xl border border-slate-800 p-3">
                <div className="h-4 w-1/2 animate-pulse rounded bg-slate-800" />
                <div className="mt-2 h-3 w-2/3 animate-pulse rounded bg-slate-800" />
              </li>
            ))
          : null}
        {previewProducts.map((product) => (
          <li key={product.id} className="rounded-xl border border-slate-800 p-3">
            <p className="text-sm font-medium">
              {product.name} <span className="text-xs text-slate-500">({product.sku})</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">
              {product.category} · Stock {product.stock} · {formatCurrency(product.price)}
            </p>
          </li>
        ))}
        {!isLoading && products.length === 0 ? (
          <li className="text-sm text-slate-400">No products available.</li>
        ) : null}
      </ul>
    </article>
  );
}
