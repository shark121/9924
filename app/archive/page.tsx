import { listProducts } from "@/lib/products-db";
import ArchiveClient from "./ArchiveClient";

export const dynamic = "force-dynamic";

export default function ArchivePage() {
  return <ArchiveClient products={listProducts()} />;
}
