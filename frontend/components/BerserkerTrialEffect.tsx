import React, { useEffect, useState } from 'react';
import { Dumbbell, Medal, PersonStanding } from 'lucide-react';
import { Student } from '../types';

interface BerserkerTrialEffectProps {
    students: Student[];
    onComplete: (winner: Student) => void;
}

export default function BerserkerTrialEffect({ students, onComplete }: BerserkerTrialEffectProps) {
    const [target, setTarget] = useState<Student | null>(null);
    const [count, setCount] = useState(0);

    useEffect(() => {
        // Pick random target immediately
        const winner = students[Math.floor(Math.random() * students.length)];
        setTarget(winner);

        // Initial delay then start counting visuals
        const startDelay = setTimeout(() => {
            let currentCount = 0;
            const interval = setInterval(() => {
                currentCount += 1;
                setCount(currentCount);

                if (currentCount >= 20) {
                    clearInterval(interval);
                    setTimeout(() => {
                        onComplete(winner);
                    }, 2000);
                }
            }, 80); // Fast counting
        }, 1500);

        return () => clearTimeout(startDelay);
    }, []);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-orange-950/95 backdrop-blur-md animate-in fade-in duration-300">

            {/* Background Energy */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.5),transparent_70%)] animate-pulse"></div>
            </div>

            <div className="relative flex flex-col items-center">

                {/* Main Icon */}
                <div className="relative z-10 mb-8 scale-150">
                    <div className="absolute inset-0 bg-red-600 blur-[60px] rounded-full animate-blink-fast"></div>
                    <Dumbbell
                        size={180}
                        className="text-stone-300 drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)] rotate-45"
                        strokeWidth={1.5}
                    />
                </div>

                {/* Text Area */}
                <div className="text-center z-20 h-48 flex flex-col items-center">
                    <h2 className="text-6xl font-black italic tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500 drop-shadow-lg mb-4">
                        狂战士试炼
                    </h2>

                    {/* Target Selection & Challenge */}
                    {!target && <div className="text-2xl font-mono text-orange-300 animate-pulse">寻找勇士中...</div>}

                    {target && count === 0 && (
                        <div className="animate-in zoom-in-50 duration-500 flex flex-col items-center gap-2">
                            <div className="text-3xl font-bold text-white">{target.name}</div>
                            <div className="text-xl text-orange-200">被选中挑战：20个俯卧撑！</div>
                        </div>
                    )}

                    {count > 0 && (
                        <div className="flex flex-col items-center">
                            <div className="text-8xl font-black text-white drop-shadow-[0_0_15px_rgba(249,115,22,1)] tabular-nums scale-150 transition-all">
                                {count}
                            </div>
                            {count >= 20 && (
                                <div className="mt-4 flex items-center gap-2 text-2xl font-bold text-yellow-400 animate-bounce">
                                    <Medal size={28} /> 挑战成功！星级 +1
                                </div>
                            )}
                        </div>
                    )}
                </div>

            </div>

            <style>{`
        @keyframes blink-fast {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.1); }
        }
        .animate-blink-fast {
            animation: blink-fast 0.5s infinite;
        }
      `}</style>
        </div>
    );
}
