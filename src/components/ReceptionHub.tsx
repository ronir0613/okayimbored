import React from 'react';
import { motion } from 'framer-motion';
import { PixelCat } from './LivingCats/PixelCat';

export function ReceptionHub() {
  const wings = [
    {
      title: "Public Wing",
      description: "Calm everyday spaces.",
      rooms: [
        { name: "Lobby", path: "/lobby" },
        { name: "Notice Board", path: "/notices" },
        { name: "Lost & Found", path: "/lost-and-found" }
      ]
    },
    {
      title: "Communication Wing",
      description: "Voices, broadcasts, and music.",
      rooms: [
        { name: "Telephone Room", path: "/telephone" },
        { name: "Radio Room", path: "/radio" },
        { name: "Record Player", path: "/record-player" }
      ]
    },
    {
      title: "Forgotten Wing",
      description: "History and storage.",
      rooms: [
        { name: "Archive", path: "/archive" },
        { name: "Maintenance", path: "/maintenance" },
        { name: "Basement", path: "/basement" }
      ]
    },
    {
      title: "Reflection Wing",
      description: "Quiet moments.",
      rooms: [
        { name: "Window", path: "/window" },
        { name: "Rooftop", path: "/rooftop" },
        { name: "Tonight Logbook", path: "/tonight" }
      ]
    }
  ];

  return (
    <div className="relative w-full max-w-4xl min-h-[70vh] flex flex-col justify-center items-center z-10 font-serif">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 3 }}
        className="text-center mb-16"
      >
        <h1 className="text-[10px] uppercase tracking-[0.4em] text-white/50 mb-2">Building Directory</h1>
        <div className="w-12 h-[1px] bg-white/10 mx-auto"></div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-24 gap-y-16 w-full px-8">
        {wings.map((wing, i) => (
          <motion.div 
            key={wing.title}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1 + (i * 0.2), duration: 2 }}
            className="flex flex-col items-center md:items-start"
          >
            <h2 className="text-[11px] uppercase tracking-[0.3em] text-white/40 mb-1">{wing.title}</h2>
            <p className="text-[10px] text-white/20 italic mb-6">{wing.description}</p>
            <div className="flex flex-col gap-4 items-center md:items-start w-full">
              {wing.rooms.map((room) => (
                <a 
                  key={room.name}
                  href={room.path}
                  className="text-[13px] tracking-widest text-white/60 hover:text-white transition-colors duration-500 cursor-pointer group flex items-center gap-3"
                >
                  <span className="w-1 h-1 rounded-full bg-white/10 group-hover:bg-white/50 transition-colors"></span>
                  {room.name}
                </a>
              ))}
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 3, duration: 4 }}
        className="absolute bottom-0 right-[15%] w-16 h-16 opacity-40 hover:opacity-100 transition-opacity"
      >
        <PixelCat state="sleeping" />
      </motion.div>
    </div>
  );
}
