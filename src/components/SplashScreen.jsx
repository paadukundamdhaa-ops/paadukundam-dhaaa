import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Music, Mic2, Headphones, Radio, Play, Disc } from 'lucide-react';

const ICONS = [Music, Mic2, Headphones, Radio, Play, Disc];
const SYMBOL_COUNT = 40; // Number of falling symbols

export default function SplashScreen({ onComplete }) {
  const [symbols, setSymbols] = useState([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Generate random properties for the falling symbols
    const generatedSymbols = Array.from({ length: SYMBOL_COUNT }).map((_, i) => {
      const Icon = ICONS[Math.floor(Math.random() * ICONS.length)];
      return {
        id: i,
        Icon,
        left: `${Math.random() * 100}vw`,
        size: Math.random() * 24 + 16, // Size between 16 and 40
        delay: Math.random() * 2, // Start falling anytime in first 2 seconds
        duration: Math.random() * 2 + 3, // Fall lasts 3 to 5 seconds
        opacity: Math.random() * 0.5 + 0.1, // Opacity between 0.1 and 0.6
      };
    });
    setSymbols(generatedSymbols);

    // Trigger exit animation
    const exitTimer = setTimeout(() => {
      setIsVisible(false);
    }, 4000); 

    // Call onComplete after exit animation finishes
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 4800);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] bg-[#0a0a0a] flex items-center justify-center overflow-hidden"
        >
        {/* Falling Symbols Background */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {symbols.map((symbol) => (
            <motion.div
              key={symbol.id}
              initial={{ y: '-10vh', rotate: 0, opacity: 0 }}
              animate={{ 
                y: '110vh', 
                rotate: 360, 
                opacity: [0, symbol.opacity, symbol.opacity, 0] 
              }}
              transition={{
                duration: symbol.duration,
                delay: symbol.delay,
                ease: "linear",
              }}
              className="absolute text-primary"
              style={{ left: symbol.left }}
            >
              <symbol.Icon size={symbol.size} strokeWidth={1.5} />
            </motion.div>
          ))}
        </div>

        {/* Central Glowing Content */}
        <div className="relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ scale: 0.5, opacity: 0, filter: "blur(20px)" }}
            animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            className="relative"
          >
            {/* Glow Effect */}
            <div className="absolute inset-0 bg-primary opacity-20 blur-[100px] rounded-full scale-150 animate-pulse"></div>
            
            <img 
              src="/images/LOGO __ Option 01.png" 
              alt="Paadukundam Dhaa Logo" 
              className="h-24 md:h-32 lg:h-40 object-contain relative z-10 drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]"
            />
          </motion.div>
          
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 1.5 }}
            className="mt-8 overflow-hidden"
          >
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1.5, delay: 1.8, ease: "circOut" }}
              className="h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent"
            />
            <p className="text-gray-400 font-medium tracking-[0.3em] uppercase text-xs md:text-sm mt-4 text-center">
              The Rhythm of Life
            </p>
          </motion.div>
        </div>
      </motion.div>
      )}
    </AnimatePresence>
  );
}
