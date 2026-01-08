import React, { useState } from 'react';
import { ItemCard as ItemCardType } from '../types';
import { Info } from 'lucide-react';

interface Props {
    item: ItemCardType;
    onClick?: () => void;
    size?: 'small' | 'large';
    showDetails?: boolean;
    className?: string;
}

const ItemCard: React.FC<Props> = ({ item, onClick, size = 'small', showDetails = false, className = '' }) => {
    const [isHovered, setIsHovered] = useState(false);
    const API_URL = 'http://localhost:8000'; // Make global const later if needed

    return (
        <div
            className={`
        relative overflow-hidden rounded-lg border-2 border-amber-500/50 bg-slate-900 shadow-lg cursor-pointer transition-all duration-300
        ${size === 'large' ? 'w-64 h-96' : 'w-24 h-36'}
        ${onClick ? 'hover:scale-105 hover:border-amber-400 hover:shadow-amber-500/20' : ''}
        ${className}
      `}
            onClick={onClick}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {item.image_path ? (
                <img
                    src={`${API_URL}/static/images/${item.image_path}`}
                    alt={item.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                    <span className="text-4xl">🎴</span>
                </div>
            )}

            {/* Overlay Title */}
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent p-2">
                <div className={`font-bold text-amber-200 text-center ${size === 'large' ? 'text-xl' : 'text-xs line-clamp-1'}`}>
                    {item.name}
                </div>
            </div>

            {/* Info Overlay (Large only or hover) */}
            {(size === 'large' || isHovered) && showDetails && (
                <div className="absolute inset-0 bg-black/80 p-4 flex flex-col items-center justify-center text-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                    <h3 className="text-amber-400 font-bold mb-2">{item.name}</h3>
                    <p className="text-slate-300 text-xs mb-2">{item.description}</p>
                    <p className="text-white text-sm font-medium">{item.function_desc}</p>
                </div>
            )}
        </div>
    );
};

export default ItemCard;
