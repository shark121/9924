import { getCollections, getProductsByCollection } from "@/lib/products-db";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default async function CollectionsPage() {
  const [collections, productsByCollection] = await Promise.all([
    getCollections(),
    getProductsByCollection(),
  ]);
  return (
    <CollectionsClient
      collections={collections}
      productsByCollection={productsByCollection}
    />
  );
}
