import React, { useEffect } from 'react';
import { Sparkles, Droplets, CheckCircle2 } from 'lucide-react';

interface PurificationEffectProps {
    onComplete: () => void;
}

export default function PurificationEffect({ onComplete }: PurificationEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-cyan-50/80 backdrop-blur-md animate-in fade-in duration-500">

            {/* Background Ripples */}
            <div className="absolute inset-0 overflow-hidden flex items-center justify-center pointer-events-none">
                <div className="w-[100vmax] h-[100vmax] rounded-full border-[100px] border-cyan-200/20 animate-ping opacity-20" style={{ animationDuration: '3s' }}></div>
                <div className="absolute w-[80vmax] h-[80vmax] rounded-full border-[80px] border-blue-200/20 animate-ping delay-700 opacity-20" style={{ animationDuration: '3s' }}></div>
            </div>

            <div className="relative z-20 flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative mb-8 scale-150">
                    <div className="absolute inset-0 bg-cyan-400 blur-[60px] rounded-full opacity-60 animate-pulse"></div>
                    <div className="relative animate-bounce-gentle">
                        <Sparkles size={120} className="text-cyan-500 drop-shadow-[0_0_20px_rgba(34,211,238,0.8)] fill-white" />
                        <Droplets size={60} className="absolute -bottom-4 -right-4 text-blue-500 animate-pulse" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-blue-600 drop-shadow-xl animate-in slide-in-from-bottom-8 duration-700">
                        净化术
                    </h2>
                    <div className="text-cyan-700 font-mono tracking-[0.5em] uppercase text-sm animate-pulse font-bold flex items-center justify-center gap-2">
                        <CheckCircle2 size={16} /> PURIFICATION <CheckCircle2 size={16} />
                    </div>
                </div>

                {/* Description */}
                <div className="mt-10 bg-white/60 border-2 border-cyan-400 px-10 py-5 rounded-full text-cyan-800 font-black text-xl shadow-xl animate-in zoom-in-75 delay-300 flex items-center gap-4">
                    <span className="text-2xl">✨</span>
                    解除诅咒 · 负分归零
                    <span className="text-2xl">✨</span>
                </div>
            </div>
        </div>
    );
}
