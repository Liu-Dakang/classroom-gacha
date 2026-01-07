import React, { useEffect } from 'react';
import { Crown, Flag, Sparkles } from 'lucide-react';

interface LegionGloryEffectProps {
    onComplete: () => void;
}

export default function LegionGloryEffect({ onComplete }: LegionGloryEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-amber-950/90 backdrop-blur-sm animate-in fade-in duration-500">

            {/* Radiant Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(251,191,36,0.2)_20deg,transparent_40deg)] animate-spin-slow"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[conic-gradient(from_180deg,transparent_0deg,rgba(251,191,36,0.2)_20deg,transparent_40deg)] animate-spin-slow" style={{ animationDirection: 'reverse' }}></div>
            </div>

            <div className="relative flex flex-col items-center">

                {/* Main Icon Group */}
                <div className="relative z-10 mb-8">
                    <div className="absolute inset-0 bg-yellow-500 blur-[60px] rounded-full animate-pulse"></div>
                    <div className="relative flex items-center justify-center">
                        <Flag
                            size={150}
                            className="text-yellow-100 drop-shadow-[0_0_20px_rgba(234,179,8,0.8)] -rotate-12 transform origin-bottom-right"
                            strokeWidth={1.5}
                        />
                        <Crown
                            size={100}
                            className="absolute -top-10 -right-10 text-amber-300 drop-shadow-lg animate-bounce"
                            strokeWidth={2}
                            fill="rgba(252, 211, 77, 0.5)"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-yellow-200 via-amber-400 to-yellow-600 drop-shadow-[0_2px_10px_rgba(234,179,8,0.5)] animate-in slide-in-from-top-12 duration-700">
                        军团荣耀
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-amber-200/80 font-mono tracking-[0.5em] uppercase">
                        <span className="w-8 h-[1px] bg-amber-500"></span>
                        LEGION GLORY
                        <span className="w-8 h-[1px] bg-amber-500"></span>
                    </div>
                </div>

                {/* Effect Description */}
                <div className="mt-10 bg-black/60 border border-amber-500/50 px-10 py-4 rounded-full backdrop-blur text-yellow-400 font-bold text-xl shadow-[0_0_30px_rgba(234,179,8,0.3)] animate-in slide-in-from-bottom-8 delay-300 duration-500 flex items-center gap-3">
                    <Sparkles className="animate-spin-slow text-yellow-200" size={20} />
                    同宿舍全员 星级 +1
                    <Sparkles className="animate-spin-slow text-yellow-200" size={20} />
                </div>

            </div>

            <style>{`
        @keyframes spin-slow {
            from { transform: translate(-50%, -50%) rotate(0deg); }
            to { transform: translate(-50%, -50%) rotate(360deg); }
        }
        .animate-spin-slow {
            animation: spin-slow 10s linear infinite;
        }
      `}</style>
        </div>
    );
}
