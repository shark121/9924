"use client";

import { products, Product } from "@/lib/data";
import SiteNav from "@/app/components/SiteNav";
import CartDrawer from "@/app/store/components/CartDrawer";
import ProductModal from "@/app/store/components/ProductModal";
import Image from "next/image";
import { useState } from "react";

const CATEGORY_LABELS: Record<string, string> = {
  core_struct: "CORE_STRUCT",
  stretch_knit: "STRETCH_KNIT",
  off_road_v1: "OFF_ROAD_V1",
};

export default function ArchivePage() {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <div className="bg-[#f9f9f9] font-body text-on-surface antialiased min-h-screen">
      <SiteNav />
      <CartDrawer />
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />

      <main className="pt-32 px-12 max-w-[1920px] mx-auto pb-32">

        {/* Header */}
        <header className="mb-24 border-b border-black/5 pb-12">
          <div className="flex flex-col md:flex-row justify-between items-end">
            <div>
              <span className="font-label text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4 block">
                FIELD_RECORD / SEASON 2024
              </span>
              <h1 className="font-headline text-8xl font-black tracking-tighter leading-[0.9] uppercase text-primary">
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
              className="group grid grid-cols-12 gap-8 items-center py-8 border-b border-black/5 cursor-pointer hover:bg-surface-container-low transition-colors px-4 -mx-4"
            >
              {/* Index */}
              <div className="col-span-1 hidden md:block">
                <span className="font-label text-[10px] text-neutral-400 tracking-widest">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </div>

              {/* Image */}
              <div className="col-span-3 md:col-span-2">
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
              <div className="col-span-6 md:col-span-4">
                <h2 className="font-headline font-bold text-xl uppercase tracking-tight group-hover:text-black transition-colors">
                  {product.name}
                </h2>
                <p className="font-label text-[10px] text-neutral-400 tracking-widest uppercase mt-1">
                  ID: {product.sku}
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
                  {product.collection}
                </span>
              </div>

              {/* Price + arrow */}
              <div className="col-span-3 md:col-span-2 text-right flex items-center justify-end gap-4">
                <span className="font-headline font-bold text-lg">
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

      {/* Footer */}
      <footer className="bg-neutral-100 py-16">
        <div className="flex flex-col md:flex-row justify-between items-center px-12 w-full max-w-[1920px] mx-auto">
          <div className="text-lg font-bold text-black font-headline uppercase mb-8 md:mb-0">
            INDUSTRIAL_FOOTWEAR_DIV
          </div>
          <div className="flex gap-12 font-label text-[10px] tracking-widest uppercase mb-8 md:mb-0">
            {["TERMS", "SHIPPING", "PRIVACY", "CONTACT"].map((link) => (
              <a key={link} href="#" className="text-neutral-400 hover:text-black transition-all">
                {link}
              </a>
            ))}
          </div>
          <div className="font-label text-[10px] tracking-widest uppercase text-neutral-400">
            ©2024 INDUSTRIAL FOOTWEAR DIVISION. ALL RIGHTS RESERVED.
          </div>
        </div>
      </footer>
    </div>
  );
}
