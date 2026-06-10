import { listProducts } from "@/lib/products-db";
import ArchiveClient from "./ArchiveClient";

export const dynamic = "force-dynamic";

export default async function ArchivePage() {
  return <ArchiveClient products={await listProducts()} />;
}
