import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { FaberLogo } from './FaberLogo';

type FaberSplashScreenProps = {
  onComplete: () => void;
};

export function FaberSplashScreen({ onComplete }: FaberSplashScreenProps) {
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    sessionStorage.setItem('faber_splash_played', 'true');
    
    // Start fading out after 2000ms
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 2000);

    // Call onComplete to unmount after fade-out transition finishes (2000ms + 650ms = 2650ms)
    const completeTimer = setTimeout(() => {
      onComplete();
    }, 2650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ 
        opacity: isFadingOut ? 0 : 1,
        scale: isFadingOut ? 1.05 : 1,
        filter: isFadingOut ? 'blur(8px)' : 'blur(0px)'
      }}
      transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-[9999] bg-gradient-to-tr from-[#fafbfc] via-[#ffffff] to-[#fafbfc] flex flex-col items-center justify-center overflow-hidden"
    >
      {/* Soft, glowing decorative radial circles behind the logo */}
      <div className="absolute w-[400px] h-[400px] rounded-full bg-violet-100/30 blur-[80px] pointer-events-none" />
      <div className="absolute w-[300px] h-[300px] rounded-full bg-indigo-100/20 blur-[60px] pointer-events-none translate-x-12 translate-y-12" />

      <div className="relative flex flex-col items-center gap-6">
        {/* LOGO ASSEMBLY & INTERACTIVE DRAW ANIMATION */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
          animate={{ 
            opacity: 1, 
            scale: [0.7, 1.05, 1], 
            rotate: [-25, 5, 0],
            transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } 
          }}
        >
          {/* Renders the extra-large animated FaberLogo icon */}
          <FaberLogo size="xl" showText={false} />
        </motion.div>

        {/* BRAND NAME REVEAL ANIMATION */}
        <div className="overflow-hidden py-2 text-center">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              transition: { delay: 0.4, duration: 0.9, ease: [0.16, 1, 0.3, 1] }
            }}
            className="flex flex-col items-center"
          >
            <div className="flex items-baseline gap-1">
              <span className="font-black text-slate-900 tracking-tight text-4xl leading-none">
                Faber
              </span>
            </div>
            
            <div className="relative mt-2.5">
              {/* Micro-bar loader animation */}
              <motion.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: '100%', 
                  transition: { delay: 0.8, duration: 1.2, ease: 'easeInOut' } 
                }}
                className="h-[1.5px] bg-gradient-to-r from-violet-500 via-indigo-500 to-rose-400 rounded-full mx-auto" 
              />
              
              <motion.span 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  transition: { delay: 1, duration: 0.6 } 
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2 block"
              >
                Field Service CRM · SaaS Platform
              </motion.span>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Bottom copyright notice */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 text-[9px] font-bold text-slate-450 uppercase tracking-widest"
      >
        Secured Enterprise Operational Platform · Moldova
      </motion.div>
    </motion.div>
  );
}
