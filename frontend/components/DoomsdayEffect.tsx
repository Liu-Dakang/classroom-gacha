import React, { useEffect } from 'react';
import { Flame, Skull, AlertTriangle } from 'lucide-react';

interface DoomsdayEffectProps {
    onComplete: () => void;
}

export default function DoomsdayEffect({ onComplete }: DoomsdayEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4500); // Slightly longer for maximum drama
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-red-950/95 backdrop-blur-md animate-in fade-in duration-300">

            {/* Background Flames/Chaos */}
            <div className="absolute inset-0 overflow-hidden opacity-50">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle,rgba(220,38,38,0.4)_0%,transparent_70%)] animate-pulse"></div>
                {[...Array(6)].map((_, i) => (
                    <Flame
                        key={i}
                        className="absolute text-orange-600 animate-bounce-slow opacity-30"
                        size={300 + Math.random() * 200}
                        style={{
                            bottom: '-10%',
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${2 + Math.random() * 3}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative z-10 scale-150 mb-8">
                    <div className="absolute inset-0 bg-red-600 blur-[80px] rounded-full animate-pulse"></div>
                    <div className="relative">
                        <Skull
                            size={180}
                            className="text-stone-300 drop-shadow-[0_0_25px_rgba(0,0,0,0.8)] animate-pulse"
                            strokeWidth={1.5}
                        />
                        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
                            <AlertTriangle size={80} className="text-yellow-500/80 animate-ping absolute -top-10" />
                        </div>
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-red-500 to-black drop-shadow-[0_4px_4px_rgba(0,0,0,1)] animate-in slide-in-from-bottom-12 duration-1000">
                        末日审判
                    </h2>
                    <p className="text-red-400 text-lg font-mono font-bold tracking-[0.8em] uppercase border-y-2 border-red-800 py-2 inline-block">
                        DOOMSDAY JUDGMENT
                    </p>
                </div>

                {/* Effect Description */}
                <div className="mt-12 bg-black/80 border-2 border-red-600 box-border px-8 py-4 rounded-xl backdrop-blur text-red-500 font-bold text-2xl shadow-[0_0_30px_rgba(220,38,38,0.5)] animate-in zoom-in-50 delay-700 duration-500 flex items-center gap-4">
                    <Flame className="animate-pulse" />
                    全班全员 星级 -1
                    <Flame className="animate-pulse" />
                </div>

            </div>

            <style>{`
        @keyframes bounce-slow {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-20px); }
        }
        .animate-bounce-slow {
            animation: bounce-slow 3s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
