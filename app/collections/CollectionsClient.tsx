"use client";

import { Product } from "@/lib/data";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import CartDrawer from "@/app/store/components/CartDrawer";
import ProductModal from "@/app/store/components/ProductModal";
import Image from "next/image";
import { useState } from "react";

const COLLECTION_META: Record<
  string,
  { subtitle: string; description: string; year: string }
> = {
  REPUBLIC_SERIES: {
    subtitle: "PHASE 01 / LIMITED RELEASE / 2026",
    description:
      "An evolving collection inspired by football culture, movement and modern identity. The Republic Series brings together timeless silhouettes, refined sportswear influences and contemporary essentials designed for everyday wear. Created to move across cities, seasons and generations. Limited release.",
    year: "2026",
  },
};

export default function CollectionsClient({
  collections,
  productsByCollection,
}: {
  collections: string[];
  productsByCollection: Record<string, Product[]>;
}) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="bg-[#f9f9f9] font-body text-on-surface antialiased min-h-screen">
      <SiteNav />
      <CartDrawer />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <main className="pt-24 md:pt-32 max-w-[1920px] mx-auto pb-20 md:pb-32">
        {/* Page header */}
        <header className="px-4 sm:px-6 md:px-12 mb-12 md:mb-24 border-b border-black/5 pb-8 md:pb-12">
          <span className="font-label text-[10px] sm:text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4 block">
            ALL COLLECTIONS / {collections.length} SERIES
          </span>
          <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-primary">
            COLLECTIONS
          </h1>
        </header>

        {/* One section per collection */}
        {collections.map((col) => {
          const meta = COLLECTION_META[col];
          const items = productsByCollection[col];
          const totalUnits = items.length;

          return (
            <section key={col} className="mb-20 md:mb-32">
              {/* Collection hero */}
              <div className="px-4 sm:px-6 md:px-12 mb-10 md:mb-16">
                <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-8 border-b border-black/5 pb-8 md:pb-12">
                  <div className="max-w-2xl">
                    {meta && (
                      <span className="font-label text-[10px] sm:text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4 block">
                        {meta.subtitle}
                      </span>
                    )}
                    <h2 className="font-headline text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter leading-none uppercase text-primary mb-4 md:mb-6">
                      {col.replace(/_/g, " ")}
                    </h2>
                    {meta && (
                      <p className="font-body text-sm md:text-base leading-relaxed text-on-surface-variant max-w-lg">
                        {meta.description}
                      </p>
                    )}
                  </div>
                  <div className="text-right hidden md:block mt-8 md:mt-0 shrink-0">
                    <p className="font-label text-[10px] tracking-widest text-neutral-500 uppercase mb-1">
                      UNITS IN SERIES
                    </p>
                    <p className="font-headline text-5xl font-black tracking-tighter">
                      {String(totalUnits).padStart(2, "0")}
                    </p>
                    {meta && (
                      <p className="font-label text-[10px] tracking-widest text-neutral-400 uppercase mt-2">
                        SEASON {meta.year}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Horizontal scroll strip — first image of each product as a panoramic preview */}
              <div className="mb-10 md:mb-16 overflow-x-auto scrollbar-none">
                <div
                  className="flex gap-3 sm:gap-4 px-4 sm:px-6 md:px-12"
                  style={{ width: "max-content" }}
                >
                  {items.map((product) => (
                    <div
                      key={`strip-${product.id}`}
                      onClick={() => setSelectedProduct(product)}
                      className="cursor-pointer group shrink-0 w-[180px] sm:w-[220px] md:w-[260px]"
                    >
                      <div className="aspect-square bg-surface-container-low relative overflow-hidden group-hover:bg-surface-container transition-colors">
                        <Image
                          src={product.images[0]}
                          alt={product.name}
                          fill
                          className="object-contain mix-blend-multiply transition-transform duration-700 group-hover:scale-105 p-6"
                          sizes="260px"
                        />
                      </div>
                      <p className="font-label text-[9px] text-neutral-400 tracking-widest uppercase mt-2 truncate">
                        {product.name}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Product grid */}
              <div className="px-4 sm:px-6 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-12 gap-y-12 md:gap-y-16">
                {items.map((product) => (
                  <div
                    key={product.id}
                    className="group cursor-pointer"
                    onClick={() => setSelectedProduct(product)}
                  >
                    <div className="aspect-[4/5] bg-surface-container-low mb-4 md:mb-5 overflow-hidden relative transition-colors group-hover:bg-surface-container">
                      <Image
                        src={product.images[0]}
                        alt={product.name}
                        fill
                        className="object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110 p-6 md:p-8"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                      {/* image count badge */}
                      {product.images.length > 1 && (
                        <span className="absolute bottom-3 right-3 font-label text-[9px] tracking-widest bg-black/5 text-neutral-500 px-2 py-1 uppercase">
                          {product.images.length} VIEWS
                        </span>
                      )}
                    </div>
                    <div className="flex justify-between items-start gap-3">
                      <div className="min-w-0">
                        <h3 className="font-headline font-bold text-sm md:text-base uppercase tracking-tight">
                          {product.name}
                        </h3>
                      </div>
                      <span className="font-headline font-bold text-sm md:text-base shrink-0">
                        ${product.price.toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>

      <SiteFooter />
    </div>
  );
}
