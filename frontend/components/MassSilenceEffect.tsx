import React, { useEffect } from 'react';
import { MicOff, Ghost, CloudFog } from 'lucide-react';

interface MassSilenceEffectProps {
    onComplete: () => void;
}

export default function MassSilenceEffect({ onComplete }: MassSilenceEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 3500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-950/95 backdrop-blur-sm animate-in fade-in duration-500">

            {/* Gloomy Background Fog */}
            <div className="absolute inset-0 overflow-hidden opacity-30">
                <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] bg-[radial-gradient(circle,rgba(100,116,139,0.3)_0%,transparent_60%)] animate-pulse"></div>
                {[...Array(5)].map((_, i) => (
                    <CloudFog
                        key={i}
                        className="absolute text-slate-600 animate-float-slow opacity-20"
                        size={200 + Math.random() * 200}
                        style={{
                            top: `${Math.random() * 80}%`,
                            left: `${Math.random() * 80}%`,
                            animationDelay: `${i * 2}s`
                        }}
                    />
                ))}
            </div>

            <div className="relative flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative z-10">
                    <div className="absolute inset-0 bg-red-900/40 blur-3xl rounded-full animate-pulse"></div>
                    <MicOff
                        size={150}
                        className="text-slate-400 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] animate-shake"
                        strokeWidth={1}
                    />
                    <Ghost
                        size={60}
                        className="absolute -top-4 -right-8 text-indigo-300 opacity-60 animate-bounce delay-75"
                    />
                    <Ghost
                        size={40}
                        className="absolute bottom-0 -left-6 text-indigo-300 opacity-40 animate-bounce delay-300"
                    />
                </div>

                {/* Text */}
                <div className="mt-12 text-center z-20 space-y-2">
                    <h2 className="text-5xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-slate-200 to-slate-600 drop-shadow-lg animate-in slide-in-from-top-8 duration-700">
                        群体沉默
                    </h2>
                    <p className="text-slate-500 text-sm font-mono tracking-[0.5em] border-t border-slate-700 pt-4 mt-4 inline-block">
                        MASS SILENCE
                    </p>
                </div>

                {/* Effect Description */}
                <div className="mt-8 bg-black/60 border border-slate-800 px-6 py-3 rounded-lg backdrop-blur text-red-400 font-bold animate-in zoom-in-50 delay-500 duration-500">
                    ⚠ 同宿舍全员 星级 -1
                </div>

            </div>

            <style>{`
        @keyframes shake {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(-5deg); }
            75% { transform: rotate(5deg); }
        }
        .animate-shake {
            animation: shake 0.5s ease-in-out infinite;
        }
        @keyframes float-slow {
            0% { transform: translateX(0) translateY(0); }
            50% { transform: translateX(20px) translateY(-20px); }
            100% { transform: translateX(0) translateY(0); }
        }
        .animate-float-slow {
            animation: float-slow 10s ease-in-out infinite;
        }
      `}</style>
        </div>
    );
}
