import React, { useEffect } from 'react';
import { UserMinus, ShieldAlert } from 'lucide-react';

interface OneManGuardEffectProps {
    onComplete: () => void;
}

export default function OneManGuardEffect({ onComplete }: OneManGuardEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 4000); // 4 seconds duration
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-gray-900/90 backdrop-blur-sm animate-in fade-in duration-500">

            {/* Background Gradients */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(50,50,50,0.8)_0%,transparent_70%)]"></div>
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent,rgba(255,0,0,0.1),transparent)] animate-pulse"></div>

            <div className="relative z-20 flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative mb-8 scale-150 animate-bounce-gentle">
                    <div className="absolute inset-0 bg-red-900 blur-[80px] rounded-full opacity-60"></div>
                    <div className="relative inline-block">
                        <ShieldAlert size={140} className="text-gray-300 drop-shadow-[0_0_20px_rgba(255,0,0,0.6)]" />
                        <UserMinus size={60} className="absolute -bottom-4 -right-4 text-red-500 animate-pulse" />
                    </div>
                </div>

                {/* Text */}
                <div className="text-center z-20 space-y-4">
                    <h2 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-gray-200 via-red-400 to-gray-800 drop-shadow-xl animate-in slide-in-from-bottom-8 duration-700">
                        一夫当关
                    </h2>
                    <div className="text-red-800/80 font-mono tracking-[0.5em] uppercase text-sm font-bold animate-pulse">
                        PENALTY ISOLATION
                    </div>
                </div>

                {/* Description */}
                <div className="mt-10 bg-black/60 border border-red-900/50 px-10 py-5 rounded-full text-gray-300 font-bold text-xl shadow-2xl animate-in zoom-in-75 delay-300">
                    仅自身承担 · 余者无碍
                </div>
            </div>
        </div>
    );
}
