import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getProduct } from "@/lib/products-db";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default async function EditProductPage(props: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await props.params;
  const product = getProduct(id);
  if (!product) notFound();

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={15} /> Products
      </Link>
      <h1 className="mt-3 font-headline text-xl font-bold tracking-tight text-neutral-900">
        Edit · {product.name}
      </h1>
      <div className="mt-6">
        <ProductForm product={product} />
      </div>
    </div>
  );
}
