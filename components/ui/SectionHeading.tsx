"use client";

import { motion } from "framer-motion";
import { fadeInUp } from "@/lib/animations";

interface SectionHeadingProps {
  label?: string;
  title: string;
  description?: string;
  align?: "center" | "left";
}

export default function SectionHeading({
  label,
  title,
  description,
  align = "center",
}: SectionHeadingProps) {
  const alignClass = align === "center" ? "text-center mx-auto" : "text-left";

  return (
    <motion.div {...fadeInUp} className={`max-w-3xl mb-14 ${alignClass}`}>
      {label && (
        <span className="inline-block text-[#E7B548] text-sm font-semibold uppercase tracking-widest mb-3">
          {label}
        </span>
      )}
      <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
        {title}
      </h2>
      {description && (
        <p className="text-gray-300 text-lg leading-relaxed">{description}</p>
      )}
    </motion.div>
  );
}
