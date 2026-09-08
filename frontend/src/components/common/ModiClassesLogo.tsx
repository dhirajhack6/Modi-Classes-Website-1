import React from 'react';

interface ModiClassesLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
  alt?: string;
}

export const ModiClassesLogo: React.FC<ModiClassesLogoProps> = ({
  className = '',
  size = 48,
  showText = false,
  alt = 'Modi Classes Official Logo'
}) => {
  const pixelSize = typeof size === 'number' ? `${size}px` : size;
  const numSize = typeof size === 'number' ? size : parseInt(String(size), 10) || 48;

  const imageElement = (
    <img
      src="/assets/modi_classes_logo.png"
      alt={alt}
      width={numSize}
      height={numSize}
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 drop-shadow-md select-none rounded-full object-contain ${!showText ? className : ''}`}
      loading="eager"
      decoding="async"
    />
  );

  if (!showText) {
    return imageElement;
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      {imageElement}
      <div className="flex flex-col">
        <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-none font-serif">
          MODI RAILWAY PSYCHOTEST CLASSES
        </span>
        <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">
          Official CBAT Master Book Portal
        </span>
      </div>
    </div>
  );
};
