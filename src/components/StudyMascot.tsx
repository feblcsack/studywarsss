"use client";
import { motion } from "framer-motion";

export default function Mascot() {
  return (
    <motion.div
      className="flex flex-col items-center justify-center"
      animate={{
        y: [0, -10, 0], // animasi naik turun
        rotate: [0, 5, -5, 0], // goyang dikit
      }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="text-6xl">🤖</div>
      <p className="mt-2 text-sm text-slate-400">Your Study Buddy</p>
    </motion.div>
  );
}
