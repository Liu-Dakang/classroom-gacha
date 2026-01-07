import React, { useEffect, useState, useRef } from 'react';
import ItemCard from './ItemCard';
import { ItemCard as ItemCardType } from '../types';

interface RouletteEffectProps {
    items: ItemCardType[]; // All possible items to cycle through
    finalItem: ItemCardType; // The result
    onComplete: () => void;
}

export default function RouletteEffect({ items, finalItem, onComplete }: RouletteEffectProps) {
    const [currentItem, setCurrentItem] = useState<ItemCardType>(items[0] || finalItem);
    const [speed, setSpeed] = useState(50);
    const [isStopping, setIsStopping] = useState(false);

    // Use a ref to keep track of the current animation frame or timeout
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    // Generate a display pool that looks random but ends with finalItem
    // Actually we just cycle random items.

    useEffect(() => {
        if (items.length === 0) return;

        let currentSpeed = 50;
        let cycles = 0;
        const maxCycles = 20; // How many switches before slowing down

        const runCycle = () => {
            // Pick random
            const randomIdx = Math.floor(Math.random() * items.length);
            setCurrentItem(items[randomIdx]);

            cycles++;

            if (cycles > maxCycles) {
                // Start slowing down
                currentSpeed *= 1.1;
            }

            if (currentSpeed > 400) {
                // Stop
                setCurrentItem(finalItem);
                setTimeout(() => {
                    onComplete();
                }, 800);
                return;
            }

            timerRef.current = setTimeout(runCycle, currentSpeed);
        };

        runCycle();

        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        }
    }, [items, finalItem, onComplete]);

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="flex flex-col items-center gap-8">
                <div className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber-500 animate-pulse">
                    抽取道具中...
                </div>

                <div className="transform scale-125 transition-all">
                    {/* We can add a "spinning" blur effect by toggling classes or just fast switching */}
                    <div className="animate-pulse">
                        <ItemCard item={currentItem} size="large" showDetails={false} />
                    </div>
                </div>
            </div>
        </div>
    );
}
