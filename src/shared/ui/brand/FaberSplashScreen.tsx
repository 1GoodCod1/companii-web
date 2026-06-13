import { useEffect, useReducer, useRef } from 'react';
import { m } from 'framer-motion';
import { FaberLogo } from './FaberLogo';

type FaberSplashScreenProps = {
  onComplete: () => void;
};

type SplashState = 'visible' | 'fading' | 'complete';

type SplashAction = { type: 'FADE' } | { type: 'COMPLETE' };

function splashReducer(state: SplashState, action: SplashAction): SplashState {
  switch (action.type) {
    case 'FADE':
      return state === 'visible' ? 'fading' : state;
    case 'COMPLETE':
      return state === 'fading' ? 'complete' : state;
    default:
      return state;
  }
}

export function FaberSplashScreen({ onComplete }: FaberSplashScreenProps) {
  const [state, dispatch] = useReducer(splashReducer, 'visible');
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    sessionStorage.setItem('faber_splash_played', 'true');
  }, []);

  useEffect(() => {
    const fadeTimer = setTimeout(() => dispatch({ type: 'FADE' }), 2000);
    const completeTimer = setTimeout(() => dispatch({ type: 'COMPLETE' }), 2650);

    return () => {
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []);

  useEffect(() => {
    if (state === 'complete') {
      onCompleteRef.current();
    }
  }, [state]);

  const isFadingOut = state === 'fading' || state === 'complete';

  return (
    <m.div
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
      <div className="absolute size-[400px] rounded-full bg-[#e6ad44]/15 blur-[80px] pointer-events-none" />
      <div className="absolute size-[300px] rounded-full bg-[#c2593f]/10 blur-[60px] pointer-events-none translate-x-12 translate-y-12" />

      <div className="relative flex flex-col items-center gap-6">
        {/* LOGO ASSEMBLY & INTERACTIVE DRAW ANIMATION */}
        <m.div
          initial={{ opacity: 0, scale: 0.7, rotate: -25 }}
          animate={{ 
            opacity: 1, 
            scale: [0.7, 1.05, 1], 
            rotate: [-25, 5, 0],
            transition: { duration: 1.4, ease: [0.16, 1, 0.3, 1] } 
          }}
        >
          <FaberLogo size="xl" showText={false} />
        </m.div>
        <div className="overflow-hidden py-2 text-center">
          <m.div
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
              <m.div 
                initial={{ width: 0 }}
                animate={{ 
                  width: '100%', 
                  transition: { delay: 0.8, duration: 1.2, ease: 'easeInOut' } 
                }}
                className="h-[1.5px] bg-gradient-to-r from-[#e6ad44] via-[#c2593f] to-[#3f3f46] rounded-full mx-auto"
              />
              
              <m.span 
                initial={{ opacity: 0 }}
                animate={{ 
                  opacity: 1, 
                  transition: { delay: 1, duration: 0.6 } 
                }}
                className="text-[10px] font-black text-slate-400 uppercase tracking-[0.25em] leading-none mt-2 block"
              >
                Field Service CRM · SaaS Platform
              </m.span>
            </div>
          </m.div>
        </div>
      </div>
      <m.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.6 }}
        transition={{ delay: 1.2, duration: 0.8 }}
        className="absolute bottom-10 text-[9px] font-bold text-slate-450 uppercase tracking-widest"
      >
        Secured Enterprise Operational Platform · Moldova
      </m.div>
    </m.div>
  );
}
