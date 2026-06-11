import { randomUUID } from "node:crypto";
import { query } from "@/lib/db";
import { SEED_PRODUCTS, type Product, type ProductCategory } from "@/lib/data";

// Neon Postgres-backed product catalog. Prices are stored as INTEGER cents to
// match the orders table; the public `Product` type keeps `price` in dollars, so
// storefront consumers see the same shape as before. `images`/`sizes` are stored
// as JSON-encoded text arrays.

export interface ProductRow {
  id: string;
  sku: string;
  name: string;
  price_cents: number;
  description: string;
  images: string; // JSON string[]
  sizes: string; // JSON string[]
  unavailable_sizes: string; // JSON string[] — subset of sizes that is sold out
  category: string;
  collection: string;
  archived: number; // 0 | 1
  created_at: string;
  updated_at: string;
}

let _ready: Promise<void> | null = null;

function ensure(): Promise<void> {
  if (!_ready) {
    _ready = (async () => {
      await query(`
        CREATE TABLE IF NOT EXISTS products (
          id           text PRIMARY KEY,
          sku          text NOT NULL,
          name         text NOT NULL,
          price_cents  integer NOT NULL,
          description  text NOT NULL DEFAULT '',
          images       text NOT NULL DEFAULT '[]',
          sizes        text NOT NULL DEFAULT '[]',
          unavailable_sizes text NOT NULL DEFAULT '[]',
          category     text NOT NULL,
          collection   text NOT NULL,
          archived     integer NOT NULL DEFAULT 0,
          created_at   text NOT NULL,
          updated_at   text NOT NULL
        )
      `);
      // Migrate tables created before sold-out tracking existed.
      await query(
        `ALTER TABLE products ADD COLUMN IF NOT EXISTS unavailable_sizes text NOT NULL DEFAULT '[]'`
      );
      await seedProductsIfEmpty();
    })();
  }
  return _ready;
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
    unavailableSizes: parseList(row.unavailable_sizes),
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
  unavailableSizes: string[];
  category: ProductCategory;
  collection: string;
}

/** Seed the catalog from lib/data.ts the first time the table is empty. */
export async function seedProductsIfEmpty(): Promise<void> {
  const rows = await query<{ c: string }>(`SELECT COUNT(*)::int AS c FROM products`);
  if (Number(rows[0]?.c ?? 0) > 0) return;

  const now = new Date().toISOString();
  for (const p of SEED_PRODUCTS) {
    await query(
      `INSERT INTO products (
         id, sku, name, price_cents, description, images, sizes, unavailable_sizes,
         category, collection, archived, created_at, updated_at
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,$11,$12)
       ON CONFLICT (id) DO NOTHING`,
      [
        p.id,
        p.sku,
        p.name,
        Math.round(p.price * 100),
        p.description,
        JSON.stringify(p.images),
        JSON.stringify(p.sizes),
        JSON.stringify(p.unavailableSizes ?? []),
        p.category,
        p.collection,
        now,
        now,
      ]
    );
  }
}

/** All products, newest first. Excludes archived unless asked. */
export async function listProducts(opts?: {
  includeArchived?: boolean;
}): Promise<Product[]> {
  await ensure();
  const where = opts?.includeArchived ? "" : "WHERE archived = 0";
  const rows = await query<ProductRow>(
    `SELECT * FROM products ${where} ORDER BY created_at DESC`
  );
  return rows.map(rowToProduct);
}

export interface AdminProduct extends Product {
  archived: boolean;
}

/** All products including archived, with the archived flag — for the admin UI. */
export async function listProductsAdmin(): Promise<AdminProduct[]> {
  await ensure();
  const rows = await query<ProductRow>(
    `SELECT * FROM products ORDER BY created_at DESC`
  );
  return rows.map((r) => ({ ...rowToProduct(r), archived: r.archived === 1 }));
}

export async function getProduct(id: string): Promise<Product | null> {
  await ensure();
  const rows = await query<ProductRow>(`SELECT * FROM products WHERE id = $1`, [
    id,
  ]);
  return rows[0] ? rowToProduct(rows[0]) : null;
}

/** Distinct collections across active products, in first-seen order. */
export async function getCollections(): Promise<string[]> {
  return [...new Set((await listProducts()).map((p) => p.collection))];
}

export async function getProductsByCollection(): Promise<
  Record<string, Product[]>
> {
  return (await listProducts()).reduce<Record<string, Product[]>>((acc, p) => {
    (acc[p.collection] ??= []).push(p);
    return acc;
  }, {});
}

async function skuExists(sku: string, exceptId?: string): Promise<boolean> {
  const rows = await query<{ id: string }>(
    `SELECT id FROM products WHERE sku = $1`,
    [sku]
  );
  return !!rows[0] && rows[0].id !== exceptId;
}

export async function createProduct(input: ProductInput): Promise<Product> {
  await ensure();
  if (await skuExists(input.sku))
    throw new Error(`SKU "${input.sku}" already exists`);
  const id = `prod_${randomUUID().slice(0, 8)}`;
  const now = new Date().toISOString();
  await query(
    `INSERT INTO products (
       id, sku, name, price_cents, description, images, sizes, unavailable_sizes,
       category, collection, archived, created_at, updated_at
     ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,0,$11,$12)`,
    [
      id,
      input.sku,
      input.name,
      Math.round(input.price * 100),
      input.description ?? "",
      JSON.stringify(input.images),
      JSON.stringify(input.sizes),
      JSON.stringify(input.unavailableSizes),
      input.category,
      input.collection,
      now,
      now,
    ]
  );
  return (await getProduct(id))!;
}

export async function updateProduct(
  id: string,
  input: ProductInput
): Promise<Product> {
  await ensure();
  if (!(await getProduct(id))) throw new Error("Product not found");
  if (await skuExists(input.sku, id))
    throw new Error(`SKU "${input.sku}" already exists`);
  await query(
    `UPDATE products SET
       sku = $1, name = $2, price_cents = $3, description = $4, images = $5,
       sizes = $6, unavailable_sizes = $7, category = $8, collection = $9,
       updated_at = $10
     WHERE id = $11`,
    [
      input.sku,
      input.name,
      Math.round(input.price * 100),
      input.description ?? "",
      JSON.stringify(input.images),
      JSON.stringify(input.sizes),
      JSON.stringify(input.unavailableSizes),
      input.category,
      input.collection,
      new Date().toISOString(),
      id,
    ]
  );
  return (await getProduct(id))!;
}

/** Soft delete: orders and in-flight carts may still reference the product. */
export async function archiveProduct(id: string, archived = true): Promise<void> {
  await ensure();
  await query(
    `UPDATE products SET archived = $1, updated_at = $2 WHERE id = $3`,
    [archived ? 1 : 0, new Date().toISOString(), id]
  );
}
