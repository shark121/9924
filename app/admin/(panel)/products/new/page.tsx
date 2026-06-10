import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import ProductForm from "../ProductForm";

export const dynamic = "force-dynamic";

export default function NewProductPage() {
  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-neutral-500 hover:text-neutral-900"
      >
        <ArrowLeft size={15} /> Products
      </Link>
      <h1 className="mt-3 font-headline text-xl font-bold tracking-tight text-neutral-900">
        New product
      </h1>
      <div className="mt-6">
        <ProductForm />
      </div>
    </div>
  );
}
