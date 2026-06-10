import { listProducts } from "@/lib/products-db";
import StoreClient from "./StoreClient";

export const dynamic = "force-dynamic";

export default async function StorePage() {
  return <StoreClient products={await listProducts()} />;
}
