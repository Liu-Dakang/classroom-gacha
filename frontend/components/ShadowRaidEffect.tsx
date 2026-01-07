import React, { useEffect, useState } from 'react';
import { Sword, Ghost, EyeOff } from 'lucide-react';
import { Student } from '../types';

interface ShadowRaidEffectProps {
    students: Student[]; // Need list to show who got hit, or we just show generic effect?
    // Better to select the victim here or pass it in?
    // Let's pass the VICTIM in if we calculated it, or just generic "Searching..."
    // The requirement is just the effect. 
    // I'll stick to generic cool effect, maybe revealing the name at the end if I can.
    // For simplicity and consistency with MarkTarget, I'll let the parent handle logic 
    // but maybe I can show the result callback?
    // Actually, MarkTarget calls back with the result.
    // Let's do the random selection inside logic, here just visuals.
    // Or better: Visuals show "Searching..." -> "Strike!".
    onComplete: (victim: Student) => void;
}

export default function ShadowRaidEffect({ students, onComplete }: ShadowRaidEffectProps) {
    const [target, setTarget] = useState<Student | null>(null);
    const [phase, setPhase] = useState<'searching' | 'striking' | 'reveal'>('searching');

    useEffect(() => {
        // 1. Searching Phase (Rapid shuffle)
        let shuffleInterval: NodeJS.Timeout;

        // Pick final target immediately
        const finalTarget = students[Math.floor(Math.random() * students.length)];
        setTarget(finalTarget);

        if (phase === 'searching') {
            setTimeout(() => {
                setPhase('striking');
            }, 1500);
        } else if (phase === 'striking') {
            setTimeout(() => {
                setPhase('reveal');
            }, 1000);
        } else if (phase === 'reveal') {
            setTimeout(() => {
                onComplete(finalTarget);
            }, 2000);
        }
    }, [phase]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 animate-in fade-in duration-300 overflow-hidden">

            {/* Background Slashes */}
            {phase === 'striking' && (
                <div className="absolute inset-0">
                    <div className="absolute top-1/2 left-0 w-full h-2 bg-purple-500 shadow-[0_0_20px_purple] -rotate-45 transform scale-x-0 animate-slash-1"></div>
                    <div className="absolute top-1/4 right-0 w-full h-2 bg-red-500 shadow-[0_0_20px_red] rotate-12 transform scale-x-0 animate-slash-2 delay-100"></div>
                </div>
            )}

            <div className="relative flex flex-col items-center z-10">

                {phase === 'searching' && (
                    <div className="animate-pulse flex flex-col items-center gap-4 text-purple-400">
                        <EyeOff size={100} />
                        <h2 className="text-3xl font-mono tracking-widest text-purple-500">
                            SEARCHING PREY...
                        </h2>
                    </div>
                )}

                {phase === 'striking' && (
                    <div className="scale-150 text-red-600 animate-ping">
                        <Sword size={150} />
                    </div>
                )}

                {phase === 'reveal' && target && (
                    <div className="flex flex-col items-center gap-6 animate-in zoom-in-50 duration-300">
                        <div className="relative">
                            <Ghost size={120} className="text-purple-300 opacity-50 absolute -top-10 -left-10 animate-bounce" />
                            {/* Minimal Card Profile */}
                            <div className="w-64 h-80 bg-slate-800 border-2 border-purple-500 rounded-xl flex flex-col items-center justify-center gap-4 shadow-[0_0_50px_rgba(168,85,247,0.4)] relative overflow-hidden">
                                <div className="absolute inset-0 bg-red-900/20 animate-pulse"></div>
                                <div className="text-6xl font-black text-white">{target.name[0]}</div>
                                <div className="text-2xl font-bold text-purple-200">{target.name}</div>
                                <div className="text-red-500 font-bold text-xl flex items-center gap-2">
                                    <Sword size={20} /> HP -1 (Star)
                                </div>
                            </div>
                        </div>

                        <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-red-400">
                            暗影突袭成功
                        </h2>
                    </div>
                )}

            </div>

            <style>{`
        @keyframes slash {
            0% { transform: scaleX(0); opacity: 1; }
            50% { transform: scaleX(1); opacity: 1; }
            100% { transform: scaleX(1); opacity: 0; }
        }
        .animate-slash-1 {
            animation: slash 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
        .animate-slash-2 {
            animation: slash 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }
      `}</style>
        </div>
    );
}
