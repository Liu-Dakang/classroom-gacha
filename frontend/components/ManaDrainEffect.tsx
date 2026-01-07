import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight, Zap, Skull } from 'lucide-react';
import { Student } from '../types';

interface ManaDrainEffectProps {
    user: Student;
    students: Student[];
    onComplete: (result: { success: boolean, target: Student }) => void;
}

export default function ManaDrainEffect({ user, students, onComplete }: ManaDrainEffectProps) {
    const [target, setTarget] = useState<Student | null>(null);
    const [phase, setPhase] = useState<'searching' | 'locked' | 'action' | 'result'>('searching');
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // 1. Searching Phase (Shuffle visuals)
        let shuffleInterval: NodeJS.Timeout;
        const candidates = students.filter(s => s.id !== user.id);

        if (candidates.length === 0) {
            onComplete({ success: true, target: user });
            return;
        }

        // Shuffle Animation
        shuffleInterval = setInterval(() => {
            const randomPreview = candidates[Math.floor(Math.random() * candidates.length)];
            setTarget(randomPreview);
        }, 100);

        // Lock Target
        setTimeout(() => {
            clearInterval(shuffleInterval);
            const finalTarget = candidates[Math.floor(Math.random() * candidates.length)];
            setTarget(finalTarget);
            setPhase('locked');

            // Logic Check
            const isSuccess = finalTarget.stars >= 2;
            setSuccess(isSuccess);

            // Proceed
            setTimeout(() => setPhase('action'), 1000);
            setTimeout(() => setPhase('result'), 3000);
            setTimeout(() => {
                onComplete({ success: isSuccess, target: finalTarget });
            }, 4500);

        }, 2000);

        return () => clearInterval(shuffleInterval);
    }, []);

    if (!target) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-indigo-950/95 backdrop-blur-xl animate-in fade-in duration-300">

            {/* Background Magic */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(129,140,248,0.2),transparent_70%)] animate-pulse"></div>
                {phase === 'action' && (
                    <div className={`absolute inset-0 ${success ? 'bg-blue-500/10' : 'bg-red-500/10'} animate-flash`}></div>
                )}
            </div>

            <div className="relative w-full max-w-4xl flex flex-col items-center gap-8">

                <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 drop-shadow-lg">
                    法力汲取
                </h2>

                {/* Duel Stage */}
                <div className="flex items-center justify-between w-full px-8">

                    {/* User */}
                    <div className="flex flex-col items-center gap-2 animate-in slide-in-from-left duration-500">
                        <div className="w-32 h-32 rounded-full border-4 border-cyan-500 flex items-center justify-center bg-slate-800 shadow-[0_0_30px_cyan]">
                            <span className="text-4xl font-bold">{user.name[0]}</span>
                        </div>
                        <div className="text-xl font-bold text-cyan-200">{user.name} (YOU)</div>
                        <div className="text-cyan-400 font-mono">{user.stars} ★</div>
                    </div>

                    {/* Action Zone */}
                    <div className="flex-1 flex flex-col items-center justify-center h-32 relative">
                        {phase === 'searching' && (
                            <div className="text-indigo-400 animate-pulse font-mono tracking-widest">SEARCHING TARGET...</div>
                        )}

                        {phase === 'locked' && (
                            <div className="text-yellow-400 font-bold animate-bounce">TARGET LOCKED</div>
                        )}

                        {phase === 'action' && success && (
                            <div className="relative w-full h-12">
                                <div className="absolute top-1/2 left-0 w-full h-2 bg-gradient-to-r from-transparent via-cyan-400 to-transparent blur-md"></div>
                                <div className="absolute top-0 left-0 w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_20px_yellow] animate-drain-move"></div>
                                <div className="absolute top-4 left-10 w-4 h-4 rounded-full bg-yellow-300 shadow-[0_0_20px_yellow] animate-drain-move" style={{ animationDelay: '0.2s' }}></div>
                            </div>
                        )}

                        {phase === 'action' && !success && (
                            <div className="text-red-500 font-bold text-2xl animate-shake flex items-center gap-2">
                                <Zap size={32} /> BACKFIRE! <Zap size={32} />
                            </div>
                        )}
                    </div>

                    {/* Target */}
                    <div className={`flex flex-col items-center gap-2 transition-all duration-500 ${phase === 'searching' ? 'opacity-0 translate-x-10' : 'opacity-100 translate-x-0'}`}>
                        <div className="w-32 h-32 rounded-full border-4 border-purple-500 flex items-center justify-center bg-slate-800 shadow-[0_0_30px_purple]">
                            <span className="text-4xl font-bold">{target.name[0]}</span>
                        </div>
                        <div className="text-xl font-bold text-purple-200">{target.name}</div>
                        <div className="text-purple-400 font-mono">
                            {phase === 'searching' ? '?' : target.stars} ★
                        </div>
                    </div>

                </div>

                {/* Result Text */}
                {phase === 'result' && (
                    <div className="animate-in zoom-in-75 duration-300">
                        {success ? (
                            <div className="bg-green-500/20 border border-green-500 px-8 py-4 rounded-xl flex items-center gap-4 text-green-300 text-2xl font-bold">
                                <Sparkles /> 汲取成功！获得 2 星
                            </div>
                        ) : (
                            <div className="bg-red-500/20 border border-red-500 px-8 py-4 rounded-xl flex items-center gap-4 text-red-300 text-2xl font-bold">
                                <Skull /> 对方星力不足！反噬 -1 星
                            </div>
                        )}
                    </div>
                )}

            </div>

            <style>{`
        @keyframes drain-move {
            0% { transform: translateX(100%); opacity: 1; }
            100% { transform: translateX(-100%); opacity: 0; }
        }
        .animate-drain-move {
            animation: drain-move 1.5s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }
        @keyframes flash {
            0%, 50%, 100% { opacity: 0; }
            25%, 75% { opacity: 1; }
        }
        .animate-flash {
            animation: flash 0.5s linear;
        }
        @keyframes shake {
             0%, 100% { transform: translateX(0); }
             25% { transform: translateX(-5px); }
             75% { transform: translateX(5px); }
        }
        .animate-shake {
             animation: shake 0.2s linear infinite;
        }
      `}</style>
        </div>
    );
}
