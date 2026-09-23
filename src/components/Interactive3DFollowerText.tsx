import React, { useState, useRef } from 'react';

interface Interactive3DFollowerTextProps {
  count: number | string;
  size?: 'compact' | 'hero';
  className?: string;
  onClick?: () => void;
  sublabel?: string;
}

export const Interactive3DFollowerText: React.FC<Interactive3DFollowerTextProps> = ({
  count,
  size = 'compact',
  className = '',
  onClick,
  sublabel,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [transformStyle, setTransformStyle] = useState<React.CSSProperties>({
    transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
    transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), text-shadow 0.25s ease',
  });
  const [isInteracting, setIsInteracting] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  const formattedCount = typeof count === 'number' ? count.toLocaleString() : count;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const maxAngle = size === 'hero' ? 22 : 16;
    const rotX = -(y / (rect.height / 2)) * maxAngle;
    const rotY = (x / (rect.width / 2)) * maxAngle;
    const zDepth = isPressed ? -14 : size === 'hero' ? 30 : 18;
    const scale = isPressed ? 0.93 : 1.08;

    setTransformStyle({
      transform: `perspective(600px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg) translateZ(${zDepth}px) scale(${scale})`,
      transition: 'transform 0.08s ease-out, text-shadow 0.1s ease',
    });
  };

  const handleMouseEnter = () => {
    setIsInteracting(true);
  };

  const handleMouseLeave = () => {
    setIsInteracting(false);
    setIsPressed(false);
    setTransformStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), text-shadow 0.3s ease',
    });
  };

  const handleMouseDown = () => {
    setIsPressed(true);
    setTransformStyle((prev) => ({
      ...prev,
      transform: prev.transform ? prev.transform.replace(/translateZ\([^)]+\)/, 'translateZ(-14px)').replace(/scale\([^)]+\)/, 'scale(0.92)') : 'scale(0.92)',
      transition: 'transform 0.1s ease, text-shadow 0.1s ease',
    }));
  };

  const handleMouseUp = () => {
    setIsPressed(false);
  };

  const handleTouchStart = () => {
    setIsInteracting(true);
    setIsPressed(true);
    setTransformStyle({
      transform: 'perspective(600px) rotateX(12deg) rotateY(-8deg) translateZ(-12px) scale(0.93)',
      transition: 'transform 0.12s ease-out, text-shadow 0.12s ease',
    });
  };

  const handleTouchEnd = () => {
    setIsInteracting(false);
    setIsPressed(false);
    setTransformStyle({
      transform: 'perspective(600px) rotateX(0deg) rotateY(0deg) translateZ(0px) scale(1)',
      transition: 'transform 0.4s cubic-bezier(0.2, 0.8, 0.2, 1), text-shadow 0.3s ease',
    });
  };

  // Dynamic 3D depth shadows that respond to hover & pressed/touch states
  const heroShadow = isPressed
    ? '0 1px 0 #fff, 0 2px 0 #888, 0 3px 0 #444, 0 4px 6px rgba(0,0,0,0.9)'
    : isInteracting
    ? '0 1px 0 #ffffff, 0 2px 0 #f4f4f5, 0 3px 0 #e4e4e7, 0 4px 0 #d4d4d8, 0 5px 0 #a1a1aa, 0 6px 0 #71717a, 0 8px 2px rgba(0,0,0,0.6), 0 16px 36px rgba(0,0,0,0.95)'
    : '0 1px 0 #ffffff, 0 2px 0 #e4e4e7, 0 3px 0 #a1a1aa, 0 4px 0 #71717a, 0 6px 2px rgba(0,0,0,0.7), 0 10px 24px rgba(0,0,0,0.85)';

  const compactShadow = isPressed
    ? '0 1px 0 #fff, 0 2px 0 #555, 0 3px 4px rgba(0,0,0,0.8)'
    : isInteracting
    ? '0 1px 0 #ffffff, 0 2px 0 #e4e4e7, 0 3px 0 #a1a1aa, 0 4px 0 #71717a, 0 5px 2px rgba(0,0,0,0.6), 0 8px 18px rgba(0,0,0,0.9)'
    : '0 1px 0 #ffffff, 0 2px 0 #a1a1aa, 0 3px 1px rgba(0,0,0,0.5), 0 4px 8px rgba(0,0,0,0.7)';

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className={`relative inline-flex items-center cursor-pointer select-none touch-none ${className}`}
      style={{
        perspective: '600px',
        transformStyle: 'preserve-3d',
      }}
      title="Tap, push, or hover for interactive 3D motion"
    >
      <div
        className={`font-mono font-black tracking-tight text-white ${
          size === 'hero' ? 'text-5xl sm:text-6xl md:text-7xl' : 'text-base sm:text-lg'
        }`}
        style={{
          ...transformStyle,
          textShadow: size === 'hero' ? heroShadow : compactShadow,
          willChange: 'transform, text-shadow',
        }}
      >
        {formattedCount}
      </div>

      {sublabel && (
        <span className="ml-2 text-xs font-mono font-semibold uppercase tracking-wider text-zinc-400">
          {sublabel}
        </span>
      )}
    </div>
  );
};
