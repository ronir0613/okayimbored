import { motion, AnimatePresence } from 'framer-motion';

export type StickerConfig = {
  id: string;
  imagePath: string; // e.g., '/stickers/angry-cat.png'
  text?: string;
  position: { left: string; top: string };
  rotation?: number;
};

export function Stickers({ activeStickers }: { activeStickers: StickerConfig[] }) {
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      <AnimatePresence>
        {activeStickers.map((sticker) => (
          <motion.div
            key={sticker.id}
            initial={{ opacity: 0, scale: 0.8, rotate: (sticker.rotation || 0) - 10 }}
            animate={{ opacity: 1, scale: 1, rotate: sticker.rotation || 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.5 } }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="absolute flex flex-col items-center"
            style={{ 
              left: sticker.position.left, 
              top: sticker.position.top,
              transform: `translate(-50%, -50%)`, // Center at coordinates
            }}
          >
            <img 
              src={sticker.imagePath} 
              alt="sticker" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain drop-shadow-xl opacity-80"
              onError={(e) => {
                // Hide if image fails to load (since they are user-provided later)
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            {sticker.text && (
              <motion.div 
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="mt-3 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/10 text-[10px] sm:text-xs text-white/70 whitespace-nowrap shadow-lg"
              >
                {sticker.text}
              </motion.div>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
