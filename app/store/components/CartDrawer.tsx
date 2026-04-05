"use client";

import { useCartStore } from "@/store/cartStore";
import { products as allProducts } from "@/lib/data";
import { motion, AnimatePresence } from "framer-motion";
import { X, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CartDrawer() {
  const { isOpen, closeCart, items, updateQuantity, removeItem, getCartTotal } =
    useCartStore();
  const router = useRouter();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 z-50 bg-black/10 cursor-pointer"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 250 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-[#f9f9f9] z-50 flex flex-col pt-20 border-l border-black/5"
          >
            {/* Header */}
            <div className="absolute top-0 left-0 w-full flex items-center justify-between px-8 py-6 bg-[#f9f9f9] z-10 border-b border-black/5">
              <h2 className="font-label text-[10px] font-black uppercase tracking-[0.3em]">
                CART_CONTENTS
              </h2>
              <button
                onClick={closeCart}
                className="text-black hover:opacity-50 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-8">
              {items.length === 0 ? (
                <div className="flex-1 flex items-center justify-center">
                  <span className="font-label text-[10px] text-neutral-400 uppercase tracking-[0.3em]">
                    NO_UNITS_SELECTED
                  </span>
                </div>
              ) : (
                items.map((item) => {
                  const liveProduct = allProducts.find(p => p.id === item.product.id) ?? item.product;
                  return (
                  <div
                    key={`${item.product.id}-${item.size}`}
                    className="flex gap-4"
                  >
                    <div className="w-20 h-24 bg-surface-container-low relative overflow-hidden shrink-0">
                      <Image
                        src={liveProduct.images[0]}
                        alt={liveProduct.name}
                        fill
                        className="object-contain p-2"
                        sizes="80px"
                      />
                    </div>
                    <div className="flex-1 flex flex-col justify-between py-1">
                      <div>
                        <div className="flex justify-between items-start gap-4">
                          <h3 className="font-headline text-xs font-bold uppercase tracking-tight leading-tight">
                            {item.product.name}
                          </h3>
                          <span className="font-headline text-xs font-bold shrink-0">
                            ${item.product.price}
                          </span>
                        </div>
                        <p className="font-label text-[9px] text-neutral-500 mt-1 uppercase tracking-widest">
                          SIZE: {item.size}
                        </p>
                      </div>
                      <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-3 border border-black/10 px-3 py-1.5">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity - 1
                              )
                            }
                            className="text-neutral-400 hover:text-black transition-colors"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="font-label text-xs tabular-nums w-4 text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.size,
                                item.quantity + 1
                              )
                            }
                            className="text-neutral-400 hover:text-black transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.size)}
                          className="font-label text-[9px] text-neutral-400 hover:text-black uppercase tracking-widest transition-colors"
                        >
                          REMOVE
                        </button>
                      </div>
                    </div>
                  </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="border-t border-black/5 px-8 py-6 bg-[#f9f9f9]">
                <div className="flex items-center justify-between mb-6">
                  <span className="font-label text-[10px] font-black uppercase tracking-[0.3em]">
                    SUBTOTAL
                  </span>
                  <span className="font-headline font-bold text-sm">
                    ${getCartTotal()}
                  </span>
                </div>
                <button
                  onClick={() => { closeCart(); router.push("/checkout"); }}
                  className="w-full bg-primary text-on-primary py-5 font-headline font-bold uppercase tracking-widest text-xs hover:bg-primary-container transition-colors"
                >
                  CHECKOUT
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
