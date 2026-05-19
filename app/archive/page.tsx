"use client";

import { products, Product } from "@/lib/data";
import SiteNav from "@/app/components/SiteNav";
import SiteFooter from "@/app/components/SiteFooter";
import CartDrawer from "@/app/store/components/CartDrawer";
import ProductModal from "@/app/store/components/ProductModal";
import Image from "next/image";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  core_struct: "CORE STRUCT",
  stretch_knit: "STRETCH KNIT",
  off_road_v1: "OFF ROAD V1",
  polo: "POLO",
  track_suit: "TRACK SUIT",
  rugby_shirt: "RUGBY SHIRT",
};

export default function ArchivePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="bg-[#f9f9f9] font-body text-on-surface antialiased min-h-screen">
      <SiteNav />
      <CartDrawer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      <main className="pt-24 md:pt-32 px-4 sm:px-6 md:px-12 max-w-[1920px] mx-auto pb-20 md:pb-32">

        {/* Header */}
        <header className="mb-12 md:mb-24 border-b border-black/5 pb-8 md:pb-12">
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6">
            <div>
              <span className="font-label text-[10px] sm:text-xs tracking-[0.3em] uppercase text-neutral-400 mb-3 sm:mb-4 block">
                FIELD RECORD / SEASON 2024
              </span>
              <h1 className="font-headline text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tighter leading-[0.9] uppercase text-primary">
                ARCHIVE
              </h1>
            </div>
            <div className="text-right hidden md:block mt-8 md:mt-0">
              <p className="font-label text-[10px] tracking-widest text-neutral-500 uppercase mb-1">
                TOTAL UNITS ON RECORD
              </p>
              <p className="font-headline text-5xl font-black tracking-tighter">
                {String(products.length).padStart(2, "0")}
              </p>
            </div>
          </div>
        </header>

        {/* Manifest list */}
        <div className="space-y-0">
          {products.map((product, index) => (
            <div
              key={product.id}
              onClick={() => setSelectedProduct(product)}
              className="group flex md:grid md:grid-cols-12 gap-4 md:gap-8 items-center py-5 md:py-8 border-b border-black/5 cursor-pointer hover:bg-surface-container-low transition-colors px-2 sm:px-4 -mx-2 sm:-mx-4"
            >
              {/* Index */}
              <div className="md:col-span-1 hidden md:block">
                <span className="font-label text-[10px] text-neutral-400 tracking-widest">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Image */}
              <div className="w-20 sm:w-24 shrink-0 md:w-auto md:col-span-2">
                <div className="aspect-square bg-surface-container relative overflow-hidden">
                  <Image
                    src={product.images[0]}
                    alt={product.name}
                    fill
                    className="object-contain mix-blend-multiply grayscale group-hover:grayscale-0 transition-all duration-500 p-3"
                    sizes="120px"
                  />
                </div>
              </div>

              {/* Name + SKU */}
              <div className="flex-1 min-w-0 md:col-span-4">
                <h2 className="font-headline font-bold text-base sm:text-lg md:text-xl uppercase tracking-tight group-hover:text-black transition-colors">
                  {product.name}
                </h2>
                <p className="font-label text-[10px] text-neutral-400 tracking-widest uppercase mt-1 md:hidden">
                  {CATEGORY_LABELS[product.category]} · {product.collection.replace(/_/g, " ")}
                </p>
              </div>

              {/* Category */}
              <div className="col-span-3 hidden md:block">
                <span className="font-label text-[10px] tracking-[0.2em] uppercase text-neutral-500 border border-neutral-200 px-3 py-1.5 inline-block">
                  {CATEGORY_LABELS[product.category]}
                </span>
              </div>

              {/* Collection */}
              <div className="col-span-2 hidden md:block">
                <span className="font-label text-[10px] tracking-widest uppercase text-neutral-400">
                  {product.collection.replace(/_/g, " ")}
                </span>
              </div>

              {/* Price + arrow */}
              <div className="shrink-0 md:col-span-2 text-right flex items-center justify-end gap-4">
                <span className="font-headline font-bold text-base sm:text-lg">
                  ${product.price.toFixed(2)}
                </span>
                <span className="text-neutral-300 group-hover:text-black group-hover:translate-x-1 transition-all duration-200 hidden md:block">
                  →
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
