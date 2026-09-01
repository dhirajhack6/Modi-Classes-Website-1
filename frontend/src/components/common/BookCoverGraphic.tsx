import React from 'react';

interface BookCoverGraphicProps {
  className?: string;
  showBadge?: boolean;
}

export const BookCoverGraphic: React.FC<BookCoverGraphicProps> = ({ 
  className = '',
  showBadge = true 
}) => {
  return (
    <div 
      className={`relative w-full h-full bg-white overflow-hidden select-none flex flex-col justify-between border border-slate-200/80 shadow-md ${className}`}
    >
      <img 
        src="/assets/book.jpg" 
        alt="Railway Psychological/Aptitude Test For Asst. Loco Pilot" 
        className="w-full h-full object-cover"
      />
    </div>
  );
};

