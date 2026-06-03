"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Product } from "@/lib/data";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/cartStore";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
}

export default function ProductModal({ product, onClose }: ProductModalProps) {
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [currentImageIdx, setCurrentImageIdx] = useState(0);
  const addItem = useCartStore((state) => state.addItem);
  const openCart = useCartStore((state) => state.openCart);

  // reset state whenever a new product is opened
  useEffect(() => {
    setSelectedSize("");
    setCurrentImageIdx(0);
  }, [product?.id]);

  const handleAddToCart = () => {
    if (!product || !selectedSize) return;
    addItem(product, selectedSize);
    onClose();
    // Auto-open the cart on desktop only; on mobile it must be tapped open.
    const isDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (isDesktop) setTimeout(() => openCart(), 300);
  };

  const next = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    setCurrentImageIdx((i) => (i === product.images.length - 1 ? 0 : i + 1));
  };

  const prev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!product) return;
    setCurrentImageIdx((i) => (i === 0 ? product.images.length - 1 : i - 1));
  };

  return (
    <AnimatePresence>
      {product && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
          className="fixed inset-0 z-50 bg-[#f9f9f9] flex flex-col md:flex-row overflow-y-auto overflow-x-hidden font-body"
        >
          <button
            onClick={onClose}
            className="fixed md:absolute top-4 right-4 sm:top-6 sm:right-6 z-50 text-black hover:opacity-50 transition-opacity bg-[#f9f9f9]/80 md:bg-transparent rounded-full p-2 md:p-0"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Canvas */}
          <div className="relative w-full md:w-2/3 h-[55vh] sm:h-[60vh] md:h-screen bg-surface-container-low flex items-center justify-center overflow-hidden select-none shrink-0">
            <AnimatePresence mode="popLayout">
              <motion.div
                key={currentImageIdx}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative w-full h-full"
              >
                <Image
                  src={product.images[currentImageIdx]}
                  alt={`${product.name} view ${currentImageIdx + 1}`}
                  fill
                  className="object-contain mix-blend-multiply p-8 sm:p-12 md:p-16"
                  priority
                />
              </motion.div>
            </AnimatePresence>

            {/* Prev / Next */}
            {product.images.length > 1 && (
              <div className="absolute inset-0 flex items-center justify-between px-2 sm:px-4 pointer-events-none">
                <button
                  onClick={prev}
                  className="pointer-events-auto p-3 sm:p-4 text-black hover:opacity-50 transition-opacity"
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
                <button
                  onClick={next}
                  className="pointer-events-auto p-3 sm:p-4 text-black hover:opacity-50 transition-opacity"
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
            )}

            {/* Dot indicators */}
            {product.images.length > 1 && (
              <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2">
                {product.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIdx(i); }}
                    className={`w-1.5 h-1.5 rounded-full transition-all duration-200 ${
                      i === currentImageIdx ? "bg-black scale-125" : "bg-black/25 hover:bg-black/50"
                    }`}
                    aria-label={`Go to image ${i + 1}`}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right: Product Details */}
          <div className="w-full md:w-1/3 md:h-screen bg-[#f9f9f9] p-6 sm:p-8 md:p-12 lg:p-16 flex flex-col justify-center border-t md:border-t-0 md:border-l border-black/5">
            <motion.div
              initial={{ y: 16, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.15, duration: 0.4 }}
            >
              <h1 className="font-headline text-2xl sm:text-3xl font-black uppercase tracking-tight mb-2">
                {product.name}
              </h1>
              <p className="font-headline font-bold text-lg sm:text-xl mb-6 sm:mb-8">
                ${product.price.toFixed(2)}
              </p>

              <p className="font-body text-sm text-on-surface-variant mb-8 sm:mb-10 max-w-sm leading-relaxed">
                {product.description}
              </p>

              <div className="mb-6 sm:mb-8">
                <div className="font-label text-[9px] font-black uppercase tracking-[0.3em] mb-3 sm:mb-4 text-neutral-500">
                  SELECT SIZE
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`h-11 w-11 flex items-center justify-center font-label text-xs font-bold border transition-all ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-black/10 hover:border-black text-black"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className="w-full bg-primary text-on-primary py-4 sm:py-5 font-headline font-bold uppercase tracking-widest text-sm transition-all hover:bg-primary-container disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedSize ? "ADD TO CART" : "SELECT SIZE"}
              </button>

              {/* Image counter */}
              {product.images.length > 1 && (
                <p className="font-label text-[9px] text-neutral-400 tracking-widest uppercase mt-6 text-center">
                  VIEW {currentImageIdx + 1} / {product.images.length}
                </p>
              )}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
