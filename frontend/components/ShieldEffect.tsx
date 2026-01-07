import React, { useEffect } from 'react';
import { Shield, Sparkles } from 'lucide-react';

interface ShieldEffectProps {
    onComplete: () => void;
}

export default function ShieldEffect({ onComplete }: ShieldEffectProps) {
    useEffect(() => {
        // Play for 3 seconds then close
        const timer = setTimeout(() => {
            onComplete();
        }, 3000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/90 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center justify-center scale-150">

                {/* Outer Ring */}
                <div className="absolute inset-0 w-96 h-96 border-4 border-blue-500/30 rounded-full animate-[spin_5s_linear_infinite] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2 mask-image-radial-gradient"></div>
                <div className="absolute inset-0 w-80 h-80 border-2 border-cyan-400/50 rounded-full animate-[spin_8s_linear_infinite_reverse] -translate-x-1/2 -translate-y-1/2 top-1/2 left-1/2"></div>

                {/* Shield Glow */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[80px] rounded-full animate-pulse"></div>

                {/* Main Shield Icon */}
                <div className="relative z-10 animate-bounce-custom transform transition-all">
                    <Shield
                        size={180}
                        className="text-blue-400 drop-shadow-[0_0_30px_rgba(59,130,246,0.8)] fill-blue-500/20"
                        strokeWidth={1.5}
                    />

                    {/* Central Sparkle */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-white animate-ping opacity-75">
                        <Sparkles size={100} />
                    </div>

                    {/* Shimmer Effect */}
                    <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-50 pointer-events-none">
                        <div className="w-[200%] h-full bg-gradient-to-r from-transparent via-white/40 to-transparent skew-x-[-25deg] -translate-x-full animate-shine-swipe" />
                    </div>
                </div>

                {/* Text */}
                <div className="mt-12 text-center z-20 space-y-2">
                    <h2 className="text-5xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-blue-300 drop-shadow-[0_2px_10px_rgba(59,130,246,0.8)] animate-in slide-in-from-bottom-8 fade-in duration-500">
                        绝对防御！
                    </h2>
                    <p className="text-blue-200 text-sm font-mono tracking-[0.5em] animate-in fade-in delay-200">
                        ABSOLUTE DEFENSE
                    </p>
                </div>

            </div>

            <style>{`
        @keyframes shine-swipe {
            0% { transform: translateX(-150%) skewX(-25deg); }
            50% { transform: translateX(150%) skewX(-25deg); }
            100% { transform: translateX(150%) skewX(-25deg); }
        }
        .animate-shine-swipe {
            animation: shine-swipe 2s ease-in-out infinite;
        }
        @keyframes bounce-custom {
            0%, 100% { transform: scale(1); filter: brightness(1); }
            50% { transform: scale(1.05); filter: brightness(1.2); }
        }
        .animate-bounce-custom {
            animation: bounce-custom 2s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
