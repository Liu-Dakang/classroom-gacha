import React, { useEffect } from 'react';
import { Sun, Heart, HelpingHand, Star } from 'lucide-react';

interface UniversalSalvationEffectProps {
  onComplete: () => void;
}

export default function UniversalSalvationEffect({ onComplete }: UniversalSalvationEffectProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onComplete();
    }, 4000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-amber-50/90 backdrop-blur-md animate-in fade-in duration-500">
      
      {/* Background Rays */}
      <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
         <div className="absolute w-[150vmax] h-[150vmax] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.2)_20deg,transparent_40deg,rgba(251,191,36,0.2)_60deg,transparent_80deg,rgba(251,191,36,0.2)_100deg,transparent_120deg,rgba(251,191,36,0.2)_140deg,transparent_160deg,rgba(251,191,36,0.2)_180deg,transparent_200deg,rgba(251,191,36,0.2)_220deg,transparent_240deg,rgba(251,191,36,0.2)_260deg,transparent_280deg,rgba(251,191,36,0.2)_300deg,transparent_320deg,rgba(251,191,36,0.2)_340deg,transparent_360deg)] animate-spin-slow opacity-60"></div>
         <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)]"></div>
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
             <Star 
                key={i}
                className="absolute text-yellow-400 fill-yellow-200 animate-float-up opacity-0"
                size={20 + Math.random() * 40}
                style={{
                    left: `${Math.random() * 100}%`,
                    bottom: '-10%',
                    animationDelay: `${Math.random() * 2}s`,
                    animationDuration: `${3 + Math.random() * 2}s`
                }}
             />
          ))}
      </div>

      <div className="relative flex flex-col items-center">
        
        {/* Main Icon */}
        <div className="relative z-10 mb-8 scale-150">
             <div className="absolute inset-0 bg-yellow-400 blur-[80px] rounded-full animate-pulse"></div>
             <div className="relative">
                 <Sun 
                    size={160} 
                    className="text-amber-500 drop-shadow-[0_0_30px_rgba(245,158,11,0.6)] animate-spin-slow-reverse" 
                    strokeWidth={1}
                 />
                 <HelpingHand 
                    size={80} 
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white drop-shadow-lg animate-bounce-gentle"
                 />
             </div>
        </div>

        {/* Text */}
        <div className="text-center z-20 space-y-4">
            <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 drop-shadow-xl animate-in slide-in-from-bottom-8 duration-700">
                普渡众生
            </h2>
            <div className="text-amber-700 font-mono tracking-[0.5em] uppercase text-sm animate-pulse font-bold">
                UNIVERSAL SALVATION
            </div>
        </div>

        {/* Description */}
        <div className="mt-10 bg-white/60 border-2 border-amber-400 px-10 py-5 rounded-full text-amber-800 font-black text-xl shadow-xl animate-in zoom-in-75 delay-300 flex items-center gap-4">
             <Heart className="fill-red-500 text-red-500 animate-beat" size={28} />
             全班全员 星级 +1
             <Heart className="fill-red-500 text-red-500 animate-beat" size={28} />
        </div>

      </div>

      <style>{`
        @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 20s linear infinite;
        }
        @keyframes spin-slow-reverse {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
        }
        .animate-spin-slow-reverse {
            animation: spin-slow-reverse 30s linear infinite;
        }
        @keyframes float-up {
            0% { transform: translateY(0) scale(0.5); opacity: 0; }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { transform: translateY(-100vh) scale(1); opacity: 0; }
        }
        .animate-float-up {
            animation: float-up 3s ease-in infinite forwards;
        }
        @keyframes beat {
            0%, 100% { transform: scale(1); }
            25% { transform: scale(1.2); }
        }
        .animate-beat {
            animation: beat 1s infinite;
        }
        @keyframes bounce-gentle {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50% { transform: translate(-50%, -60%) scale(1.05); }
        }
        .animate-bounce-gentle {
            animation: bounce-gentle 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
