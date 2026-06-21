"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

interface SizeChartModalProps {
  open: boolean;
  onClose: () => void;
}

const charts = [
  { label: "USA", src: "/size-chart-usa.jpg" },
  { label: "UK", src: "/size-chart-uk.jpg" },
];

export default function SizeChartModal({ open, onClose }: SizeChartModalProps) {
  const [tab, setTab] = useState(0);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="relative bg-white max-w-lg w-full rounded-sm overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute top-3 right-3 z-10 text-black/60 hover:text-black transition-colors"
              aria-label="Close size chart"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Tabs */}
            <div className="flex border-b border-black/10">
              {charts.map((c, i) => (
                <button
                  key={c.label}
                  onClick={() => setTab(i)}
                  className={`flex-1 py-3 font-headline text-xs font-black uppercase tracking-widest transition-colors ${
                    tab === i
                      ? "border-b-2 border-black text-black"
                      : "text-black/40 hover:text-black/70"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Both images rendered; only the active one is visible */}
            {charts.map((c, i) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={c.src}
                src={c.src}
                alt={`Size chart — ${c.label}`}
                className={`w-full h-auto block ${i === tab ? "" : "hidden"}`}
              />
            ))}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
