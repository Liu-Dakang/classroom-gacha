import React, { useState, useEffect } from 'react';
import { Skull, Heart, HelpCircle } from 'lucide-react';

interface DestinyRouletteEffectProps {
    onComplete: (result: 'angel' | 'devil') => void;
}

export default function DestinyRouletteEffect({ onComplete }: DestinyRouletteEffectProps) {
    const [phase, setPhase] = useState<'intro' | 'flip' | 'shuffle' | 'pick' | 'reveal'>('intro');
    const [positions, setPositions] = useState<[number, number]>([0, 1]); // Index of cards: 0 is Left, 1 is Right. Content: 0 and 1.
    // Content 0: Angel? Content 1: Devil? No, let's randomized content mapping later.
    // Actually, let's keep it simple: Card A and Card B.
    // We determine the result (Angel/Devil) only when clicked based on probability.
    // Visuals: Just shuffling back and forth.

    const [revealedResult, setRevealedResult] = useState<'angel' | 'devil' | null>(null);
    const [pickedIndex, setPickedIndex] = useState<number | null>(null);

    useEffect(() => {
        // Sequence
        // 1. Inro: Show Angel and Devil cards face up (1s)
        // 2. Flip: Turn face down (1s)
        // 3. Shuffle: Move them around (2-3s)
        // 4. Pick: Wait user click

        let t1: NodeJS.Timeout, t2: NodeJS.Timeout, t3: NodeJS.Timeout;

        if (phase === 'intro') {
            t1 = setTimeout(() => setPhase('flip'), 2000);
        }
        if (phase === 'flip') {
            t2 = setTimeout(() => setPhase('shuffle'), 1000);
        }
        if (phase === 'shuffle') {
            // Animate shuffling
            const shuffleInterval = setInterval(() => {
                setPositions(prev => [prev[1], prev[0]]); // Swap
            }, 300); // Fast swap

            t3 = setTimeout(() => {
                clearInterval(shuffleInterval);
                setPhase('pick');
            }, 2000);
        }

        return () => {
            clearTimeout(t1);
            clearTimeout(t2);
            clearTimeout(t3);
        };
    }, [phase]);

    const handlePick = (index: number) => {
        if (phase !== 'pick') return;

        setPickedIndex(index);

        // Calculate Result
        // 10% Angel, 90% Devil
        const isAngel = Math.random() < 0.1;
        const result = isAngel ? 'angel' : 'devil';

        setRevealedResult(result);
        setPhase('reveal');

        setTimeout(() => {
            onComplete(result);
        }, 3000); // View result for 3s
    };

    return (
        <div className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-900/95 animate-in fade-in duration-500">
            <h2 className="text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600 mb-12 drop-shadow-lg">
                命运轮盘
            </h2>

            <div className="flex gap-20 relative h-80">
                {[0, 1].map((cardIndex) => {
                    // Check if this card is the "result" one or the other one
                    // Visual mapping: 
                    // If phase is 'intro': Left = Angel, Right = Devil (for example)
                    // If phase is 'pick' or 'shuffle': Face down
                    // If phase is 'reveal': 
                    //    If pickedIndex === cardIndex: Show Result (Angel/Devil)
                    //    Else: Show The Other (opposite)

                    const isPicked = pickedIndex === cardIndex;
                    let content = null;

                    if (phase === 'intro') {
                        content = cardIndex === 0 ? 'angel' : 'devil';
                    } else if (phase === 'reveal') {
                        if (pickedIndex === cardIndex) {
                            content = revealedResult;
                        } else {
                            // Show the opposite
                            content = revealedResult === 'angel' ? 'devil' : 'angel';
                        }
                    } else {
                        content = 'hidden';
                    }

                    // Position swap
                    // positions[0] is the logical ID at left slot
                    // positions[1] is the logical ID at right slot
                    // We render cards absolutely? 
                    // Easier: Just render 2 slots. The 'shuffling' is visually simulated by swapping the *rendering* if we wanted, 
                    // BUT for React list transitions, usually better to move elements.
                    // Here we just used current Positions state to determine where to render?
                    // Let's simplified: Two static clickable areas, but we animate a "container" swap?
                    // The shuffling logic setPositions([1, 0]) swaps them.
                    // Let's assume positions maps Visual Slot -> Logical Card ID.
                    // But since we generate result on fly, "Logical Card ID" doesn't strictly matter until reveal.
                    // Just animating 'swapping' visual is enough to trick eye.

                    // Simplified visual:
                    // Left Card and Right Card.
                    // During shuffle, we apply CSS transform to swap X positions?
                    const isSwapped = positions[0] === 1;
                    // If isSwapped, Slot 0 goes Right, Slot 1 goes Left?

                    // Let's just create 2 cards and move them.
                    const translateX = isSwapped
                        ? (cardIndex === 0 ? 'translate-x-[200px]' : '-translate-x-[200px]') // Distance
                        : 'translate-x-0';

                    return (
                        <div
                            key={cardIndex}
                            onClick={() => handlePick(cardIndex)}
                            className={`
                        w-48 h-72 rounded-xl border-4 transition-all duration-300 transform
                        ${phase === 'pick' ? 'cursor-pointer hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.3)]' : ''}
                        ${phase === 'pick' || phase === 'shuffle' || phase === 'flip' ? 'bg-slate-800 border-slate-600' : ''}
                        ${content === 'angel' ? 'bg-gradient-to-br from-yellow-200 to-amber-500 border-yellow-300' : ''}
                        ${content === 'devil' ? 'bg-gradient-to-br from-gray-900 to-red-900 border-red-600' : ''}
                        ${translateX}
                    `}
                            style={{ transition: phase === 'shuffle' ? 'transform 0.3s ease-in-out' : 'all 0.5s' }}
                        >
                            <div className="w-full h-full flex items-center justify-center">
                                {content === 'angel' && (
                                    <div className="flex flex-col items-center animate-in zoom-in">
                                        <Heart size={80} className="text-white fill-white drop-shadow-md mb-4" />
                                        <span className="text-2xl font-black text-white uppercase">Angel</span>
                                    </div>
                                )}
                                {content === 'devil' && (
                                    <div className="flex flex-col items-center animate-in zoom-in">
                                        <Skull size={80} className="text-red-500 fill-red-900 drop-shadow-md mb-4" />
                                        <span className="text-2xl font-black text-red-500 uppercase">Devil</span>
                                    </div>
                                )}
                                {content === 'hidden' && (
                                    <HelpCircle size={60} className="text-slate-600 animate-pulse" />
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            {phase === 'pick' && (
                <div className="mt-12 text-2xl text-white font-bold animate-bounce">
                    请选择一张牌...
                </div>
            )}

            {phase === 'intro' && (
                <div className="mt-12 text-xl text-slate-400">
                    记好它们的位置...
                </div>
            )}

        </div>
    );
}
