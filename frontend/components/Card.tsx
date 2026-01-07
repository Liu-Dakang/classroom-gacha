import React, { useState, useEffect } from 'react';
import { Star, Shield } from 'lucide-react';
import { RARITY_CONFIG } from '../constants';
import { Student, RarityLevel } from '../types';
import Particles from './Particles';

interface CardProps {
  student: Student;
  isRevealed: boolean;
  showDetails?: boolean;
  size?: 'small' | 'normal' | 'large';
  className?: string;
}

const Card: React.FC<CardProps> = ({
  student,
  isRevealed,
  showDetails = true,
  size = 'normal',
  className = ''
}) => {
  // Safe cast for rarity level access. If stars > 5, treat as 5 (EX).
  const clampedStars = Math.min(Math.max(0, student.stars), 5);
  const rarityLevel = clampedStars as RarityLevel;
  const config = RARITY_CONFIG[rarityLevel];
  const isHolo = student.stars >= 5;

  // State to control the slow reveal of color during summoning
  const [animateColor, setAnimateColor] = useState(false);

  useEffect(() => {
    // Only apply this effect for the large summoning card when it's NOT revealed (spinning state)
    if (!isRevealed && size !== 'small') {
      // Reset to neutral immediately when student changes (new draw)
      setAnimateColor(false);

      // Delay the color reveal to create surprise
      const timer = setTimeout(() => {
        setAnimateColor(true);
      }, 500); // Start transitioning after 0.5s

      return () => clearTimeout(timer);
    }
  }, [student.id, isRevealed, size]);

  const sizeClasses = size === 'large'
    ? 'w-64 h-96 text-2xl'
    : size === 'small'
      ? 'w-full h-16 text-sm flex-row items-center px-3'
      : 'w-48 h-72 text-xl';

  if (!isRevealed && size !== 'small') {
    return (
      <div className={`
        ${sizeClasses} rounded-xl bg-slate-800 border-4 
        ${config.shadow} shadow-2xl
        /* Transition for the border color */
        transition-colors duration-[2000ms] ease-in-out
        ${animateColor ? config.border : 'border-slate-700'}
        flex flex-col items-center justify-center relative overflow-hidden group 
        ${className}
      `}>
        {/* Dynamic Background Glow based on rarity - Fades in */}
        <div className={`
          absolute inset-0 animate-pulse transition-opacity duration-[2000ms] 
          ${config.bg} 
          ${animateColor ? 'opacity-20' : 'opacity-0'}
        `}></div>

        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>

        {/* Dynamic Text Color - Fades from slate to rarity color */}
        <div className={`
          text-6xl mb-4 animate-bounce 
          transition-colors duration-[2000ms]
          ${animateColor ? config.color : 'text-slate-600'}
        `}>?</div>

        <div className={`
          font-bold tracking-widest opacity-80
          transition-colors duration-[2000ms]
          ${animateColor ? config.color : 'text-slate-600'}
        `}>召唤</div>

        {/* High Rarity Extra Glow - Only appears for high rarity, fades in */}
        {student.stars >= 4 && (
          <div className={`
             absolute -bottom-10 -right-10 w-40 h-40 bg-white rounded-full blur-3xl animate-pulse
             transition-opacity duration-[2000ms]
             ${animateColor ? 'opacity-10' : 'opacity-0'}
           `}></div>
        )}
      </div>
    );
  }

  return (
    <div className={`
      relative ${sizeClasses} rounded-xl border-4 transition-all duration-500
      ${student.immunity > 0 ? 'border-cyan-400 bg-slate-900 shadow-[0_0_20px_rgba(34,211,238,0.8)] scale-[1.02]' : `${config.border} ${config.bg} ${config.shadow} shadow-lg`} 
      ${size === 'small' ? 'flex justify-between' : 'flex flex-col items-center justify-center'}
      ${isHolo ? 'animate-holo-shine overflow-hidden' : ''}
      ${className}
    `}>
      {/* Immunity Strong Overlay & Text */}
      {student.immunity > 0 && (
        <>
          <div className={`absolute inset-0 bg-cyan-500/30 backdrop-blur-[2px] z-10 animate-pulse pointer-events-none rounded-xl border-2 border-cyan-200/50`}></div>
          <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
            <span className={`
                    font-black italic text-cyan-100 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] tracking-widest bg-cyan-900/80 px-2 py-1 transform -rotate-12 border border-cyan-400
                    ${size === 'small' ? 'text-xs' : 'text-2xl'}
                `}>
              隐身中 x {student.immunity}
            </span>
          </div>
        </>
      )}
      {/* Holo effect for 5 stars */}
      {isHolo && (
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/30 to-transparent w-[200%] h-full -translate-x-full animate-shimmer pointer-events-none"></div>
      )}

      {/* Particles for 4 stars+ */}
      {student.stars >= 4 && size !== 'small' && <Particles active={true} />}

      {/* Rarity Label */}
      <div className={`
        font-black italic ${config.color} 
        ${size === 'small' ? 'text-xs pr-2 static' : 'text-xl absolute top-2 left-2'}
      `}>
        {config.label}
      </div>

      {/* Avatar / Name */}
      <div className={`z-10 font-bold text-slate-800 ${size === 'large' ? 'scale-110' : ''} flex flex-col items-center`}>
        <span>{student.name}</span>
        {student.dormNumber && (
          <span className={`font-normal text-slate-500 font-mono ${size === 'large' ? 'text-sm' : 'text-[10px]'}`}>
            {student.dormNumber}
          </span>
        )}
      </div>

      {/* Stars */}
      <div className={`z-10 flex flex-col items-center gap-1 ${size === 'small' ? '' : 'mt-4 px-2'}`}>
        {size !== 'small' && (
          <div className="flex flex-wrap justify-center gap-1">
            {[...Array(Math.max(5, student.stars))].map((_, i) => (
              <Star
                key={i}
                size={20}
                className={`${i < student.stars ? 'fill-yellow-400 text-yellow-500' : 'fill-slate-700 text-slate-600'} transition-all duration-300`}
              />
            ))}
          </div>
        )}
        <span className="text-xs font-bold text-slate-500 font-mono tracking-widest">{student.stars} STARS</span>
      </div>

      {/* Rank Title (Large only) */}
      {
        size !== 'small' && showDetails && (
          <div className={`absolute bottom-4 uppercase tracking-widest text-xs font-bold ${config.color} opacity-80`}>
            {config.title}
          </div>
        )
      }

      {/* Stats (Small only) */}
      {
        size === 'small' && (
          <div className="text-xs text-slate-500 font-mono">
            被抽中: {student.pickCount}
          </div>
        )
      }
    </div >
  );
};

export default Card;