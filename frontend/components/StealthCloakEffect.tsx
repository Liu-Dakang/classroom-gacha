import React, { useEffect } from 'react';
import { VenetianMask, Wind } from 'lucide-react';

interface StealthCloakEffectProps {
    onComplete: () => void;
}

export default function StealthCloakEffect({ onComplete }: StealthCloakEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/90 backdrop-blur-md animate-in fade-in duration-500">

            {/* Smoke */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-1/2 left-1/2 w-[500px] h-[500px] -translate-x-1/2 -translate-y-1/2 bg-slate-800 rounded-full blur-[100px] animate-pulse opacity-50"></div>
                {[...Array(5)].map((_, i) => (
                    <Wind
                        key={i}
                        color="#cbd5e1"
                        className="absolute animate-float opacity-20"
                        size={100 + Math.random() * 50}
                        style={{
                            top: `${Math.random() * 100}%`,
                            left: `${Math.random() * 100}%`,
                            animationDuration: `${3 + Math.random() * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative flex flex-col items-center">

                {/* Cloak Icon */}
                <div className="relative z-10 mb-8 scale-125">
                    <div className="absolute inset-0 bg-blue-500/30 blur-[40px] rounded-full animate-pulse"></div>
                    <VenetianMask
                        size={160}
                        className="text-slate-200 drop-shadow-[0_0_25px_rgba(56,189,248,0.5)] animate-vanish"
                        strokeWidth={1}
                    />
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-600 drop-shadow-lg animate-in slide-in-from-bottom-8 duration-700">
                        潜行斗篷
                    </h2>
                    <div className="text-blue-300 font-mono tracking-[0.5em] uppercase text-sm animate-pulse">
                        STEALTH MODE: ENGAGED
                    </div>
                </div>

                {/* Description */}
                <div className="mt-10 bg-slate-900 border border-slate-700 px-8 py-4 rounded-full text-slate-400 font-bold text-lg shadow-xl animate-in zoom-in-75 delay-300 flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    未来 3 次抽取，您将隐身（不在名单中）
                </div>

            </div>

            <style>{`
        @keyframes vanish {
            0% { opacity: 1; transform: scale(1); filter: blur(0px); }
            50% { opacity: 0.8; transform: scale(1.05); filter: blur(2px); }
            100% { opacity: 0; transform: scale(1.1); filter: blur(10px); }
        }
        .animate-vanish {
            animation: vanish 3s forwards ease-in-out;
        }
      `}</style>
        </div>
    );
}
