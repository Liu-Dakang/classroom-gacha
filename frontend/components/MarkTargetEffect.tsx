import React, { useEffect, useState, useMemo } from 'react';
import { Target, Shuffle } from 'lucide-react';
import { Student } from '../types';
import Card from './Card';

interface MarkTargetEffectProps {
    students: Student[];
    onComplete: (target: Student) => void;
}

export default function MarkTargetEffect({ students, onComplete }: MarkTargetEffectProps) {
    const [displayedStudent, setDisplayedStudent] = useState<Student | null>(null);
    const [isRunning, setIsRunning] = useState(true);

    // Available pool (excluding current student logic could be added upstream if needed, 
    // but here we just accept a list of candidates)
    const candidates = useMemo(() => {
        return students;
    }, [students]);

    useEffect(() => {
        if (candidates.length === 0) return;

        let intervalId: NodeJS.Timeout;
        const startTime = Date.now();
        const duration = 2500; // Duration of shuffle

        if (isRunning) {
            intervalId = setInterval(() => {
                // Random shuffle animation
                const randomIndex = Math.floor(Math.random() * candidates.length);
                setDisplayedStudent(candidates[randomIndex]);
            }, 50);

            // Stop after duration
            const timeoutId = setTimeout(() => {
                setIsRunning(false);
                clearInterval(intervalId);

                // Final selection
                const finalValues = new Uint32Array(1);
                crypto.getRandomValues(finalValues);
                const finalIndex = finalValues[0] % candidates.length;
                const selected = candidates[finalIndex];

                setDisplayedStudent(selected);

                // Wait a bit to show result then complete
                setTimeout(() => {
                    onComplete(selected);
                }, 1500);

            }, duration);

            return () => {
                clearInterval(intervalId);
                clearTimeout(timeoutId);
            };
        }
    }, [candidates, isRunning, onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 backdrop-blur-md animate-in fade-in duration-300">

            {/* Background Grid Animation */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]"></div>

            <div className="relative flex flex-col items-center gap-8 z-10 w-full max-w-md">

                {/* Title */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-rose-400 flex items-center justify-center gap-3">
                        <Target className="text-red-500 animate-pulse" />
                        <span className="tracking-widest">目标锁定中...</span>
                    </h2>
                    <p className="text-slate-500 text-xs font-mono">SCANNING TARGETS...</p>
                </div>

                {/* Card Display Area */}
                <div className="relative">
                    {/* Sight Overlay */}
                    <div className="absolute -inset-8 border-2 border-red-500/30 rounded-lg pointer-events-none z-20">
                        <div className="absolute top-0 left-0 w-4 h-4 border-t-4 border-l-4 border-red-500"></div>
                        <div className="absolute top-0 right-0 w-4 h-4 border-t-4 border-r-4 border-red-500"></div>
                        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-4 border-l-4 border-red-500"></div>
                        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-4 border-r-4 border-red-500"></div>
                    </div>

                    {/* Scanning Line */}
                    {isRunning && (
                        <div className="absolute inset-x-0 h-1 bg-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.8)] z-30 animate-[scan_1.5s_linear_infinite]"></div>
                    )}

                    <div className={`transform transition-all duration-200 ${!isRunning ? 'scale-110 drop-shadow-[0_0_25px_rgba(239,68,68,0.6)]' : ''}`}>
                        <Card
                            student={displayedStudent || { id: -1, name: '???', stars: 0, pickCount: 0 }}
                            isRevealed={true}
                            size="large"
                        />
                    </div>
                </div>

                {!isRunning && displayedStudent && (
                    <div className="animate-in slide-in-from-bottom-4 fade-in duration-300 text-center">
                        <div className="text-xl font-bold text-red-400 mb-1">目标已锁定</div>
                        <div className="text-2xl font-black text-white">{displayedStudent.name}</div>
                    </div>
                )}

            </div>

            <style>{`
        @keyframes scan {
            0% { top: 0%; opacity: 0; }
            10% { opacity: 1; }
            90% { opacity: 1; }
            100% { top: 100%; opacity: 0; }
        }
      `}</style>
        </div>
    );
}
