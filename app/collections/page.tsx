import { getCollections, getProductsByCollection } from "@/lib/products-db";
import CollectionsClient from "./CollectionsClient";

export const dynamic = "force-dynamic";

export default function CollectionsPage() {
  return (
    <CollectionsClient
      collections={getCollections()}
      productsByCollection={getProductsByCollection()}
    />
  );
}
