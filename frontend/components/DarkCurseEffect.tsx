import React, { useEffect } from 'react';
import { Skull, Ghost, Ban } from 'lucide-react';

interface DarkCurseEffectProps {
    onComplete: () => void;
}

export default function DarkCurseEffect({ onComplete }: DarkCurseEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm animate-in fade-in duration-500">

            {/* Background Fog */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,#000000_90%)] z-10"></div>
                {/* Moving fog effect using standard CSS animations if possible or keyframes */}
                <div className="absolute top-0 left-0 w-[200%] h-[200%] bg-zinc-900 opacity-20 animate-fog"></div>
            </div>

            <div className="relative z-20 flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative mb-8 scale-150 animate-pulse">
                    <div className="absolute inset-0 bg-purple-900 blur-3xl rounded-full opacity-60"></div>
                    <Skull size={140} className="text-zinc-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] animate-shake" />
                    <Ghost size={60} className="absolute -top-4 -right-8 text-purple-400 opacity-80 animate-float" />
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-2">
                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-zinc-200 via-purple-400 to-zinc-600 drop-shadow-lg tracking-tighter animate-in zoom-in-50 duration-500">
                        黑暗诅咒
                    </h2>
                    <div className="text-purple-500 font-mono tracking-[0.5em] uppercase text-sm font-bold flex items-center justify-center gap-2">
                        <Ban size={14} /> DARK CURSE <Ban size={14} />
                    </div>
                </div>

                {/* Description */}
                <div className="mt-12 bg-zinc-900/80 border border-purple-900/50 px-8 py-4 rounded-xl text-zinc-300 font-bold text-xl shadow-2xl animate-in slide-in-from-bottom-10 delay-300 max-w-lg text-center leading-relaxed">
                    <span className="text-purple-400 block mb-1 text-sm uppercase tracking-wide opacity-70">Curse Effect applied</span>
                    自身陷入深渊<br />星级可跌破零点
                </div>

            </div>

            <style>{`
        @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(5deg); }
            75% { transform: rotate(-5deg); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out infinite;
        }
        @keyframes fog {
            0% { transform: translate(0, 0); }
            100% { transform: translate(-20%, -20%); }
        }
        .animate-fog {
            animation: fog 20s linear infinite;
        }
      `}</style>
        </div>
    );
}
