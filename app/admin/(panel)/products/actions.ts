"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin-session";
import {
  createProduct,
  updateProduct,
  archiveProduct,
  type ProductInput,
} from "@/lib/products-db";
import type { ProductCategory } from "@/lib/data";

export type ProductFormState = { error?: string };

const CATEGORIES: ProductCategory[] = ["polo", "track_suit", "rugby_shirt"];

function revalidateStorefront() {
  revalidatePath("/store");
  revalidatePath("/collections");
  revalidatePath("/archive");
  revalidatePath("/admin/products");
}

function parseForm(formData: FormData): ProductInput | { error: string } {
  const name = String(formData.get("name") ?? "").trim();
  const sku = String(formData.get("sku") ?? "").trim();
  const category = String(formData.get("category") ?? "") as ProductCategory;
  const collection = String(formData.get("collection") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const price = Number(formData.get("price"));
  const sizes = String(formData.get("sizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const unavailableRaw = String(formData.get("unavailableSizes") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  // Only sold-out sizes that are actually part of the size run, deduped.
  const unavailableSizes = [...new Set(unavailableRaw)].filter((s) =>
    sizes.includes(s)
  );
  const images = String(formData.get("images") ?? "")
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean);

  if (!name) return { error: "Name is required" };
  if (!sku) return { error: "SKU is required" };
  if (!CATEGORIES.includes(category)) return { error: "Pick a valid category" };
  if (!collection) return { error: "Collection is required" };
  if (!Number.isFinite(price) || price < 0)
    return { error: "Price must be a positive number" };
  if (!sizes.length) return { error: "Add at least one size" };
  if (!images.length) return { error: "Add at least one image URL" };

  return {
    name,
    sku,
    category,
    collection,
    description,
    price,
    sizes,
    unavailableSizes,
    images,
  };
}

export async function createProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  try {
    await createProduct(parsed);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not create product" };
  }
  revalidateStorefront();
  redirect("/admin/products");
}

export async function updateProductAction(
  _prev: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!id) return { error: "Missing product id" };
  const parsed = parseForm(formData);
  if ("error" in parsed) return { error: parsed.error };
  try {
    await updateProduct(id, parsed);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update product" };
  }
  revalidateStorefront();
  redirect("/admin/products");
}

export async function archiveProductAction(formData: FormData): Promise<void> {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const archived = String(formData.get("archived") ?? "") === "true";
  if (id) await archiveProduct(id, archived);
  revalidateStorefront();
}
