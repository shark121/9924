import { Product } from "@/lib/data";

// Sizing guidance shown under Republic Series products. Kept in one place so the
// copy stays consistent across the store grid, collections grid and the modal.
export default function SizingNote({
  product,
  className = "",
}: {
  product: Product;
  className?: string;
}) {
  if (product.collection !== "REPUBLIC_SERIES") return null;
  return (
    <p
      className={`font-body text-[11px] leading-snug text-neutral-500 ${className}`}
    >
      <span className="font-semibold text-neutral-700">Sizing:</span> Runs
      slightly oversized. If you prefer a more fitted look, size down.
    </p>
  );
}
