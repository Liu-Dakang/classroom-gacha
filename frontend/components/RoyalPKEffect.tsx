import React, { useState, useEffect } from 'react';
import { Swords, Crown, Trophy, User } from 'lucide-react';
import { Student } from '../types';

interface RoyalPKEffectProps {
    user: Student;
    opponent: Student;
    onComplete: (winnerId: number | null) => void;
}

export default function RoyalPKEffect({ user, opponent, onComplete }: RoyalPKEffectProps) {
    const [stage, setStage] = useState<'intro' | 'clash' | 'result'>('intro');
    const [winner, setWinner] = useState<number | null>(null);

    useEffect(() => {
        // Determine winner immediately
        // If user > opponent -> User wins (id)
        // Else -> No one wins extra star (null) or Opponent wins?
        // Description: "If higher than opponent, gain +1 star". 
        // It doesn't say opponent loses or gains anything.
        // So if User > Opponent -> Winner is User.
        // If User <= Opponent -> Winner is null (Draw/Loss).

        let w: number | null = null;
        if (user.stars > opponent.stars) {
            w = user.id;
        } else {
            w = null;
        }
        setWinner(w);

        const timer1 = setTimeout(() => setStage('clash'), 1500);
        const timer2 = setTimeout(() => setStage('result'), 3000);
        const timer3 = setTimeout(() => onComplete(w), 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [user, opponent, onComplete]);

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/95 animate-in fade-in duration-500">

            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.1)_0%,transparent_70%)]"></div>

            <div className="relative z-20 w-full max-w-4xl flex items-center justify-between px-10">

                {/* User Side */}
                <div className={`flex flex-col items-center transition-all duration-500 ${stage === 'clash' ? 'translate-x-20 scale-110' : ''}`}>
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-40 rounded-full"></div>
                        <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-blue-400 flex items-center justify-center relative z-10">
                            <User size={60} className="text-blue-200" />
                        </div>
                        {stage === 'result' && winner === user.id && (
                            <div className="absolute -top-6 left-1/2 -translate-x-1/2 z-20 animate-bounce">
                                <Crown size={40} className="text-yellow-400 fill-yellow-400 drop-shadow-lg" />
                            </div>
                        )}
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{user.name}</div>
                    <div className="text-4xl font-black text-blue-400 font-mono">{user.stars} ★</div>
                </div>

                {/* VS Icon */}
                <div className="flex flex-col items-center justify-center">
                    {stage === 'intro' && (
                        <div className="text-6xl font-black text-red-500 italic transform -skew-x-12 animate-pulse">VS</div>
                    )}
                    {stage === 'clash' && (
                        <Swords size={100} className="text-yellow-500 animate-pulse drop-shadow-[0_0_20px_rgba(234,179,8,0.8)]" />
                    )}
                    {stage === 'result' && (
                        <div className="text-center">
                            {winner === user.id ? (
                                <div className="text-yellow-400 font-bold text-2xl animate-in zoom-in">VICTORY</div>
                            ) : (
                                <div className="text-slate-500 font-bold text-2xl animate-in zoom-in">DEFEAT</div>
                            )}
                        </div>
                    )}
                </div>

                {/* Opponent Side */}
                <div className={`flex flex-col items-center transition-all duration-500 ${stage === 'clash' ? '-translate-x-20 scale-110' : ''}`}>
                    <div className="relative mb-4">
                        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 rounded-full"></div>
                        <div className="w-32 h-32 bg-slate-800 rounded-full border-4 border-red-400 flex items-center justify-center relative z-10">
                            <User size={60} className="text-red-200" />
                        </div>
                    </div>
                    <div className="text-2xl font-bold text-white mb-2">{opponent.name}</div>
                    <div className="text-4xl font-black text-red-400 font-mono">{opponent.stars} ★</div>
                </div>

            </div>

            {/* Title */}
            <div className="absolute top-20 text-center">
                <h2 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-b from-yellow-300 to-yellow-600 drop-shadow-sm uppercase tracking-widest">
                    皇城 PK
                </h2>
            </div>

        </div>
    );
}
