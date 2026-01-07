import React, { useEffect } from 'react';
import { FlaskConical, Star, Sparkles } from 'lucide-react';

interface ExpPotionEffectProps {
    onComplete: () => void;
}

export default function ExpPotionEffect({ onComplete }: ExpPotionEffectProps) {
    useEffect(() => {
        const timer = setTimeout(() => {
            onComplete();
        }, 2500);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative flex flex-col items-center">

                {/* Burst Background */}
                <div className="absolute inset-0 bg-yellow-400/20 blur-[100px] animate-pulse rounded-full"></div>

                {/* Floating Particles */}
                <div className="absolute inset-0 overflow-hidden w-full h-full">
                    {[...Array(12)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute text-yellow-300 animate-float-up"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: '100%',
                                animationDelay: `${Math.random() * 1}s`,
                                animationDuration: `${1.5 + Math.random()}s`,
                                opacity: 0.8
                            }}
                        >
                            <Star size={10 + Math.random() * 20} fill="currentColor" />
                        </div>
                    ))}
                </div>

                {/* Potion Icon */}
                <div className="relative z-10 animate-potion-tilt origin-bottom">
                    <FlaskConical
                        size={140}
                        className="text-purple-400 drop-shadow-[0_0_20px_rgba(168,85,247,0.8)]"
                        strokeWidth={1.5}
                    />
                    {/* Liquid inside - mimicked with clip path or gradient? Simple gradient text fill is hard on svg. 
                 Let's just use an overlay div for "bubbling"
             */}
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-purple-500 blur-xl animate-pulse"></div>
                </div>

                {/* Big Star Popup */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 animate-star-pop">
                    <Star size={180} className="text-yellow-400 fill-yellow-400 drop-shadow-[0_0_50px_rgba(250,204,21,1)]" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-6xl font-black text-white drop-shadow-md">+1</span>
                    </div>
                </div>

                <div className="mt-24 text-center z-30">
                    <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-yellow-400 animate-in slide-in-from-bottom-4 duration-500">
                        经验UP!
                    </h2>
                    <p className="text-yellow-200 text-sm font-mono tracking-widest mt-2">STAR LEVEL INCREASED</p>
                </div>

            </div>

            <style>{`
        @keyframes float-up {
            0% { transform: translateY(0) rotate(0deg); opacity: 0; }
            20% { opacity: 1; }
            100% { transform: translateY(-300px) rotate(360deg); opacity: 0; }
        }
        .animate-float-up {
            animation: float-up 2s linear forwards;
        }
        @keyframes potion-tilt {
            0% { transform: rotate(0deg); }
            25% { transform: rotate(-15deg); }
            50% { transform: rotate(15deg); }
            75% { transform: rotate(-5deg); }
            100% { transform: rotate(0deg); }
        }
        .animate-potion-tilt {
            animation: potion-tilt 2s ease-in-out infinite;
        }
        @keyframes star-pop {
            0% { transform: translate(-50%, -50%) scale(0); opacity: 0; }
            50% { transform: translate(-50%, -50%) scale(1.2); opacity: 1; }
            70% { transform: translate(-50%, -50%) scale(0.9); }
            100% { transform: translate(-50%, -50%) scale(1); }
        }
        .animate-star-pop {
            animation: star-pop 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275) 0.5s both;
        }
      `}</style>
        </div>
    );
}
