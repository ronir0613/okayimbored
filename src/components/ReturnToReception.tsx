import React from 'react';
import { motion } from 'framer-motion';

interface Props {
  backUrl?: string;
  backText?: string;
}

export function ReturnToReception({ backUrl = "/lobby", backText = "← Return Back" }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 2, duration: 2 }}
      className="fixed top-8 left-8 z-[100]"
    >
      <a 
        href={backUrl}
        className="text-[10px] uppercase tracking-widest text-white/30 hover:text-white/70 transition-colors duration-500 cursor-pointer drop-shadow-md"
      >
        {backText}
      </a>
    </motion.div>
  );
}
