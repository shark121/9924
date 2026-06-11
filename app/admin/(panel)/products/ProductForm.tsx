"use client";

import { useActionState } from "react";
import type { Product } from "@/lib/data";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "./actions";
import ImageManager from "./ImageManager";
import SizeEditor from "./SizeEditor";

const CATEGORIES = [
  { value: "polo", label: "Polo" },
  { value: "track_suit", label: "Track suit" },
  { value: "rugby_shirt", label: "Rugby shirt" },
];

const inputCls =
  "rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm outline-none focus:border-neutral-500";
const labelCls = "text-[10px] uppercase tracking-[0.14em] text-neutral-400";

export default function ProductForm({ product }: { product?: Product }) {
  const action = product ? updateProductAction : createProductAction;
  const [state, formAction, pending] = useActionState<
    ProductFormState,
    FormData
  >(action, {});

  return (
    <form action={formAction} className="flex max-w-2xl flex-col gap-4">
      {product && <input type="hidden" name="id" value={product.id} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Name</span>
          <input name="name" defaultValue={product?.name ?? ""} className={inputCls} />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>SKU</span>
          <input name="sku" defaultValue={product?.sku ?? ""} className={inputCls} />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Price (USD)</span>
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            defaultValue={product ? product.price : ""}
            className={inputCls}
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Category</span>
          <select
            name="category"
            defaultValue={product?.category ?? "polo"}
            className={inputCls}
          >
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Collection</span>
          <input
            name="collection"
            defaultValue={product?.collection ?? ""}
            placeholder="REPUBLIC_SERIES"
            className={inputCls}
          />
        </label>
      </div>

      <div className="flex flex-col gap-2">
        <span className={labelCls}>Sizes</span>
        <SizeEditor
          initialSizes={product?.sizes}
          initialUnavailable={product?.unavailableSizes}
        />
      </div>

      <div className="flex flex-col gap-1">
        <span className={labelCls}>Images</span>
        <ImageManager initial={product?.images ?? []} />
      </div>

      <label className="flex flex-col gap-1">
        <span className={labelCls}>Description</span>
        <textarea
          name="description"
          rows={5}
          defaultValue={product?.description ?? ""}
          className={inputCls}
        />
      </label>

      {state.error && (
        <p className="text-sm text-red-600" role="alert">
          {state.error}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-neutral-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-neutral-800 disabled:opacity-60"
        >
          {pending ? "Saving…" : product ? "Save changes" : "Create product"}
        </button>
      </div>
    </form>
  );
}
