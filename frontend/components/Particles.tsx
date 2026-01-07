import React from 'react';

interface ParticlesProps {
  active: boolean;
}

const Particles: React.FC<ParticlesProps> = ({ active }) => {
  if (!active) return null;
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(12)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-ping"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 1}s`,
            animationDuration: `${1 + Math.random()}s`,
            opacity: 0.6
          }}
        />
      ))}
    </div>
  );
};

export default Particles;