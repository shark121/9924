import { randomUUID } from "node:crypto";
import { getDb } from "@/lib/db";
import { SEED_PRODUCTS, type Product, type ProductCategory } from "@/lib/data";

// SQLite-backed product catalog. Prices are stored as INTEGER cents to match the
// orders table and avoid float drift; the public `Product` type keeps `price` in
// dollars (a number), so every storefront consumer sees the same shape it always
// did. `images` and `sizes` are JSON-encoded string arrays.

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  price_cents: number;
  description: string;
  images: string; // JSON string[]
  sizes: string; // JSON string[]
  category: string;
  collection: string;
  archived: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

let _ready = false;

function db() {
  const d = getDb();
  if (!_ready) {
    d.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id           TEXT PRIMARY KEY,
        sku          TEXT NOT NULL,
        name         TEXT NOT NULL,
        price_cents  INTEGER NOT NULL,
        description  TEXT NOT NULL DEFAULT '',
        images       TEXT NOT NULL DEFAULT '[]',
        sizes        TEXT NOT NULL DEFAULT '[]',
        category     TEXT NOT NULL,
        collection   TEXT NOT NULL,
        archived     INTEGER NOT NULL DEFAULT 0,
        created_at   TEXT NOT NULL,
        updated_at   TEXT NOT NULL
      )
    `);
    _ready = true;
    seedProductsIfEmpty();
  }
  return d;
}

function parseList(raw: string): string[] {
  try {
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return [];
  }
}

function rowToProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    price: row.price_cents / 100,
    description: row.description,
    images: parseList(row.images),
    sizes: parseList(row.sizes),
    category: row.category as ProductCategory,
    collection: row.collection,
  };
}

export interface ProductInput {
  sku: string;
  name: string;
  price: number; // dollars
  description?: string;
  images: string[];
  sizes: string[];
  category: ProductCategory;
  collection: string;
}

/** Seed the catalog from lib/data.ts the first time the table is empty. */
export function seedProductsIfEmpty(): void {
  const d = getDb();
  const { c } = d.prepare(`SELECT COUNT(*) AS c FROM products`).get() as {
    c: number;
  };
  if (c > 0) return;

  const now = new Date().toISOString();
  const insert = d.prepare(
    `INSERT INTO products (
       id, sku, name, price_cents, description, images, sizes,
       category, collection, archived, created_at, updated_at
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
  );
  for (const p of SEED_PRODUCTS) {
    insert.run(
      p.id,
      p.sku,
      p.name,
      Math.round(p.price * 100),
      p.description,
      JSON.stringify(p.images),
      JSON.stringify(p.sizes),
      p.category,
      p.collection,
      now,
      now
    );
  }
}

/** All products, newest first. Excludes archived unless asked. */
export function listProducts(opts?: { includeArchived?: boolean }): Product[] {
  const where = opts?.includeArchived ? "" : "WHERE archived = 0";
  return (
    db()
      .prepare(`SELECT * FROM products ${where} ORDER BY created_at DESC`)
      .all() as unknown as ProductRow[]
  ).map(rowToProduct);
}

export interface AdminProduct extends Product {
  archived: boolean;
}

/** All products including archived, with the archived flag — for the admin UI. */
export function listProductsAdmin(): AdminProduct[] {
  return (
    db()
      .prepare(`SELECT * FROM products ORDER BY created_at DESC`)
      .all() as unknown as ProductRow[]
  ).map((r) => ({ ...rowToProduct(r), archived: r.archived === 1 }));
}

export function getProduct(id: string): Product | null {
  const row = db()
    .prepare(`SELECT * FROM products WHERE id = ?`)
    .get(id) as ProductRow | undefined;
  return row ? rowToProduct(row) : null;
}

/** Distinct collections across active products, in first-seen order. */
export function getCollections(): string[] {
  return [...new Set(listProducts().map((p) => p.collection))];
}

export function getProductsByCollection(): Record<string, Product[]> {
  return listProducts().reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.collection] ??= []).push(p);
    return acc;
  }, {});
}

function skuExists(sku: string, exceptId?: string): boolean {
  const row = db()
    .prepare(`SELECT id FROM products WHERE sku = ?`)
    .get(sku) as { id: string } | undefined;
  return !!row && row.id !== exceptId;
}

export function createProduct(input: ProductInput): Product {
  if (skuExists(input.sku)) throw new Error(`SKU "${input.sku}" already exists`);
  const id = `prod_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  db()
    .prepare(
      `INSERT INTO products (
         id, sku, name, price_cents, description, images, sizes,
         category, collection, archived, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`
    )
    .run(
      id,
      input.sku,
      input.name,
      Math.round(input.price * 100),
      input.description ?? "",
      JSON.stringify(input.images),
      JSON.stringify(input.sizes),
      input.category,
      input.collection,
      now,
      now
    );
  return getProduct(id)!;
}

export function updateProduct(id: string, input: ProductInput): Product {
  if (!getProduct(id)) throw new Error("Product not found");
  if (skuExists(input.sku, id))
    throw new Error(`SKU "${input.sku}" already exists`);
  db()
    .prepare(
      `UPDATE products SET
         sku = ?, name = ?, price_cents = ?, description = ?, images = ?,
         sizes = ?, category = ?, collection = ?, updated_at = ?
       WHERE id = ?`
    )
    .run(
      input.sku,
      input.name,
      Math.round(input.price * 100),
      input.description ?? "",
      JSON.stringify(input.images),
      JSON.stringify(input.sizes),
      input.category,
      input.collection,
      new Date().toISOString(),
      id
    );
  return getProduct(id)!;
}

/** Soft delete: orders and in-flight carts may still reference the product. */
export function archiveProduct(id: string, archived = true): void {
  db()
    .prepare(`UPDATE products SET archived = ?, updated_at = ? WHERE id = ?`)
    .run(archived ? 1 : 0, new Date().toISOString(), id);
}
