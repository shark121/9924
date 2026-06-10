import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil } from "lucide-react";
import { listProductsAdmin } from "@/lib/products-db";
import { money } from "../_lib/format";
import { archiveProductAction } from "./actions";

export const dynamic = "force-dynamic";

export default function ProductsPage() {
  const products = listProductsAdmin();

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-xl font-bold tracking-tight text-neutral-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-neutral-500">
            {products.length} product{products.length === 1 ? "" : "s"}
          </p>
        </div>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          <Plus size={16} /> New product
        </Link>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {products.length ? (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-[10px] uppercase tracking-[0.12em] text-neutral-400">
                <th className="px-4 py-3 font-medium">Product</th>
                <th className="px-4 py-3 font-medium">SKU</th>
                <th className="px-4 py-3 font-medium">Collection</th>
                <th className="px-4 py-3 text-right font-medium">Price</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p.id}
                  className="border-b border-neutral-100 last:border-0 hover:bg-neutral-50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-neutral-100">
                        {p.images[0] && (
                          <Image
                            src={p.images[0]}
                            alt={p.name}
                            fill
                            className="object-contain mix-blend-multiply"
                            sizes="40px"
                          />
                        )}
                      </div>
                      <span className="font-medium text-neutral-900">
                        {p.name}
                      </span>
                      {p.archived && (
                        <span className="rounded bg-neutral-200 px-1.5 py-0.5 text-[10px] uppercase tracking-wide text-neutral-500">
                          Archived
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-neutral-500">
                    {p.sku}
                  </td>
                  <td className="px-4 py-3 text-neutral-500">{p.collection}</td>
                  <td className="px-4 py-3 text-right font-medium text-neutral-900">
                    {money(Math.round(p.price * 100))}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-3">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="flex items-center gap-1 text-xs text-neutral-500 hover:text-neutral-900"
                      >
                        <Pencil size={13} /> Edit
                      </Link>
                      <form action={archiveProductAction}>
                        <input type="hidden" name="id" value={p.id} />
                        <input
                          type="hidden"
                          name="archived"
                          value={(!p.archived).toString()}
                        />
                        <button
                          type="submit"
                          className="text-xs text-neutral-500 hover:text-neutral-900"
                        >
                          {p.archived ? "Restore" : "Archive"}
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="px-4 py-10 text-center text-sm text-neutral-400">
            No products yet.
          </p>
        )}
      </div>
    </div>
  );
}
