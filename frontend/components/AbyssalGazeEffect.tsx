import React, { useState, useEffect } from 'react';
import { Eye, Ghost, Dna } from 'lucide-react';

interface AbyssalGazeEffectProps {
    onComplete: (success: boolean) => void;
}

export default function AbyssalGazeEffect({ onComplete }: AbyssalGazeEffectProps) {
    const [stage, setStage] = useState<'judging' | 'success' | 'fail'>('judging');

    useEffect(() => {
        // Determine result immediately but show it later
        const roll = Math.random();
        const isSuccess = roll < 0.3; // 30% chance

        const judgeTimer = setTimeout(() => {
            setStage(isSuccess ? 'success' : 'fail');
        }, 2500);

        const closeTimer = setTimeout(() => {
            onComplete(isSuccess);
        }, 4500);

        return () => {
            clearTimeout(judgeTimer);
            clearTimeout(closeTimer);
        };
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/98 animate-in fade-in duration-1000">

            {/* Dynamic Background */}
            <div className="absolute inset-0 overflow-hidden">
                <div className={`absolute inset-0 transition-colors duration-1000 ${stage === 'judging' ? 'bg-purple-950/20' :
                        stage === 'success' ? 'bg-amber-900/40' : 'bg-red-950/40'
                    }`}></div>
                {/* Spirals */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200vmax] h-[200vmax] bg-[conic-gradient(from_0deg,transparent,rgba(88,28,135,0.2),transparent)] animate-spin-slow opacity-50"></div>
            </div>

            <div className="relative z-20 flex flex-col items-center">

                {/* The Eye */}
                <div className="relative mb-8 scale-150">
                    <div className={`absolute inset-0 blur-[100px] rounded-full transition-colors duration-500 ${stage === 'judging' ? 'bg-purple-600' :
                            stage === 'success' ? 'bg-amber-500' : 'bg-red-600'
                        }`}></div>

                    <div className={`transition-all duration-500 transform ${stage === 'judging' ? 'animate-pulse' : 'scale-125'}`}>
                        {stage === 'judging' && (
                            <Eye size={180} className="text-purple-200 drop-shadow-[0_0_50px_rgba(168,85,247,0.8)] animate-float" />
                        )}
                        {stage === 'success' && (
                            <div className="relative">
                                <Eye size={180} className="text-amber-200 drop-shadow-[0_0_50px_rgba(251,191,36,0.8)]" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-6xl animate-ping">✨</span>
                                </div>
                            </div>
                        )}
                        {stage === 'fail' && (
                            <Eye size={180} className="text-red-900 fill-black drop-shadow-[0_0_50px_rgba(220,38,38,0.8)] animate-pulse" />
                        )}
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-6 h-32 flex flex-col justify-center">
                    {stage === 'judging' && (
                        <>
                            <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 tracking-wider animate-pulse">
                                深渊凝视...
                            </h2>
                            <div className="text-purple-400 font-mono tracking-[0.2em] text-sm opacity-80">
                                THE ABYSS JUDGES YOU
                            </div>
                        </>
                    )}

                    {stage === 'success' && (
                        <div className="animate-in zoom-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-6xl font-black text-amber-400 drop-shadow-[0_0_15px_rgba(245,158,11,0.8)] uppercase">
                                天选之人
                            </h2>
                            <div className="mt-2 text-amber-200 text-2xl font-bold tracking-widest border-t border-b border-amber-500/50 py-1">
                                +3 STARS
                            </div>
                        </div>
                    )}

                    {stage === 'fail' && (
                        <div className="animate-in zoom-in slide-in-from-bottom-4 duration-300">
                            <h2 className="text-6xl font-black text-red-600 drop-shadow-[0_0_15px_rgba(220,38,38,0.8)] uppercase">
                                被吞噬
                            </h2>
                            <div className="mt-2 text-red-400 text-xl font-bold tracking-widest line-through decoration-red-500 decoration-4">
                                STARS RESET TO 0
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
