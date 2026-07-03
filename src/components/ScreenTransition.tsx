import { motion } from 'framer-motion';
import type { ReactNode } from 'react';

interface ScreenTransitionProps {
  children: ReactNode;
  keyId: string | number;
}

export function ScreenTransition({ children, keyId }: ScreenTransitionProps) {
  return (
    <motion.div
      key={keyId}
      initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }}
      transition={{ 
        duration: 0.6, 
        ease: [0.22, 1, 0.36, 1],
      }}
      className="w-full flex flex-col items-center justify-center text-center"
    >
      {children}
    </motion.div>
  );
}
