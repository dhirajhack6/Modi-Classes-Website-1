import React from 'react';

interface BookCoverGraphicProps {
  className?: string;
  showBadge?: boolean;
  side?: 'front' | 'back';
  coverImage?: string;
  backCoverImage?: string;
  alt?: string;
}

export const BookCoverGraphic: React.FC<BookCoverGraphicProps> = ({ 
  className = '',
  showBadge = true,
  side = 'front',
  coverImage = '/assets/book.jpg',
  backCoverImage = '/assets/book-back.jpg',
  alt
}) => {
  const isBack = side === 'back';
  const primarySrc = isBack ? (backCoverImage || '/assets/book-back.jpg') : (coverImage || '/assets/book.jpg');
  const fallbackSrc = isBack ? '/assets/book-back.png' : '/assets/book.jpg';
  const defaultAlt = isBack 
    ? 'Railway Psychological/Aptitude Test Back Cover - Vidya Publications' 
    : 'Railway Psychological/Aptitude Test For Asst. Loco Pilot';

  return (
    <div 
      className={`relative w-full h-full bg-white overflow-hidden select-none flex flex-col justify-between border border-slate-200/80 shadow-md ${className}`}
    >
      <img 
        src={primarySrc} 
        alt={alt || defaultAlt} 
        className="w-full h-full object-cover transition-opacity duration-200"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (target.src !== fallbackSrc) {
            target.src = fallbackSrc;
          }
        }}
      />
    </div>
  );
};

