import React, { useEffect } from 'react';
import { Shield, Lock, Castle } from 'lucide-react';

interface SanctuaryEffectProps {
    onComplete: () => void;
}

export default function SanctuaryEffect({ onComplete }: SanctuaryEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-sky-950/90 backdrop-blur-md animate-in fade-in duration-300">

            {/* Light Rays */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-full bg-sky-400 shadow-[0_0_100px_50px_rgba(56,189,248,0.3)] opacity-50"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-sky-500/30 rounded-full animate-ping-slow"></div>
            </div>

            <div className="relative flex flex-col items-center">

                {/* Sanctuary Icon */}
                <div className="relative z-10 mb-8">
                    <div className="absolute inset-0 bg-sky-500 blur-[60px] rounded-full animate-pulse"></div>
                    <div className="relative flex items-center justify-center">
                        <Shield
                            size={180}
                            className="text-sky-100 drop-shadow-[0_0_30px_rgba(14,165,233,0.8)]"
                            strokeWidth={1}
                        />
                        <Castle
                            size={80}
                            className="absolute text-sky-600 animate-bounce"
                        />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white via-sky-200 to-sky-500 drop-shadow-xl animate-in slide-in-from-top-8 duration-700">
                        结界：庇护所
                    </h2>
                    <div className="flex items-center justify-center gap-2 text-sky-300 font-mono text-sm tracking-widest uppercase">
                        <Lock size={14} /> DORMITORY PROTECTED <Lock size={14} />
                    </div>
                </div>

                {/* Description */}
                <div className="mt-12 bg-sky-900/80 border border-sky-500/50 px-10 py-5 rounded-xl text-sky-100 font-bold text-lg shadow-[0_0_40px_rgba(14,165,233,0.4)] animate-in slide-in-from-bottom-8 delay-500 flex items-center gap-3">
                    <Shield className="fill-current text-sky-400" size={24} />
                    宿舍全员 下一次抽取隐身
                    <Shield className="fill-current text-sky-400" size={24} />
                </div>

            </div>

            <style>{`
        @keyframes ping-slow {
            0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.8; }
            100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        .animate-ping-slow {
            animation: ping-slow 3s cubic-bezier(0, 0, 0.2, 1) infinite;
        }
      `}</style>
        </div>
    );
}
