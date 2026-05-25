"use client";

import { products, Product, ProductCategory } from "@/lib/data";
import StoreHeader from "./components/StoreHeader";
import CartDrawer from "./components/CartDrawer";
import ProductModal from "./components/ProductModal";
import SiteFooter from "@/app/components/SiteFooter";
import { useState, useMemo } from "react";
import Image from "next/image";

const PAGE_SIZE = 4;

const filters: { id: "all" | ProductCategory; label: string }[] = [
  { id: "all", label: "ALL UNITS" },
  { id: "polo", label: "POLO" },
  { id: "track_suit", label: "TRACK SUIT" },
  { id: "rugby_shirt", label: "RUGBY SHIRT" },
];

export default function StorePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeFilter, setActiveFilter] = useState<"all" | ProductCategory>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const filtered = useMemo(
    () =>
      activeFilter === "all"
        ? products
        : products.filter((p) => p.category === activeFilter),
    [activeFilter]
  );

  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  function handleFilterChange(id: "all" | ProductCategory) {
    setActiveFilter(id);
    setVisibleCount(PAGE_SIZE);
  }

  return (
    <div className="bg-[#f9f9f9] font-body text-on-surface antialiased">
      <StoreHeader />
      <CartDrawer />
      <ProductModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />

      <main className="pt-24 md:pt-32 px-4 sm:px-6 md:px-12 max-w-[1920px] mx-auto min-h-screen">

        {/* Manifesto Header */}
        <header className="mb-16 md:mb-24">
          <div className="flex flex-col md:flex-row justify-between md:items-end gap-8 border-b border-black/5 pb-8 md:pb-12">
            <div className="max-w-2xl">
              <span className="font-label text-[10px] sm:text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4 block">
                THE OSAGYEFO EDIT
              </span>
              <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-primary mb-6 md:mb-8">
                REPUBLIC<br />SERIES
              </h1>
              <p className="font-body text-base md:text-lg leading-relaxed text-on-surface-variant max-w-lg">
                The Baker Boy Polo is more than a garment — it is a symbol of vision, leadership, and cultural pride. Featuring a bold tribute to Kwame Nkrumah, this piece draws from the spirit of independence and the courage to define a new path. Limited release.
              </p>
            </div>
            <div className="text-right hidden md:block">
              <div className="font-label text-xs tracking-widest text-neutral-500 mb-2 uppercase">
                Drop Info
              </div>
              <div className="font-label text-sm font-bold uppercase">Legacy is not inherited</div>
              <div className="font-label text-sm font-bold uppercase">but carried</div>
              <div className="font-label text-sm font-bold uppercase">Limited Release / 2026</div>
            </div>
          </div>
        </header>

        {/* Filters */}
        <div className="flex flex-wrap gap-x-6 gap-y-3 sm:gap-8 mb-10 md:mb-16 font-label text-[10px] tracking-[0.2em] uppercase border-b border-black/5 pb-6 md:pb-8">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => handleFilterChange(f.id)}
              className={
                activeFilter === f.id
                  ? "text-black font-black border-b border-black pb-1"
                  : "text-neutral-400 hover:text-black transition-colors"
              }
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Product Grid */}
        {visible.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6 md:gap-x-12 gap-y-16 md:gap-y-24">
            {visible.map((product) => (
              <div
                key={product.id}
                className="group cursor-pointer"
                onClick={() => setSelectedProduct(product)}
              >
                <div className="aspect-[4/5] bg-surface-container-low mb-4 md:mb-6 overflow-hidden flex items-center justify-center transition-colors group-hover:bg-surface-container relative">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-multiply transform transition-transform duration-700 group-hover:scale-110 p-6 md:p-8"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </div>
                <div className="flex justify-between items-start gap-3">
                  <div className="min-w-0">
                    <h3 className="font-headline font-bold text-base md:text-lg uppercase tracking-tight">
                      {product.name}
                    </h3>
                  </div>
                  <span className="font-headline font-bold text-base md:text-lg shrink-0">
                    ${product.price.toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center py-32">
            <span className="font-label text-[10px] tracking-widest uppercase text-neutral-400">
              COMING SOON
            </span>
          </div>
        )}

        {/* Load More */}
        {hasMore && (
          <div className="mt-16 md:mt-32 flex flex-col items-center gap-6 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
              className="bg-primary text-on-primary px-8 sm:px-12 py-4 sm:py-5 text-xs sm:text-sm font-headline font-bold uppercase tracking-widest hover:bg-primary-container transition-colors"
            >
              LOAD MORE UNITS
            </button>
          </div>
        )}
      </main>

      <div className="mt-16 md:mt-32">
        <SiteFooter />
      </div>
    </div>
  );
}
