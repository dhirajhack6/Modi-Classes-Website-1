import React from 'react';
import { AlpBookHero3D } from './AlpBookHero3D';
import { AlpInteractiveMiniTest } from './AlpInteractiveMiniTest';
import { AlpFiveBatteriesSection } from './AlpFiveBatteriesSection';
import { AlpFeatureHighlights } from './AlpFeatureHighlights';
import { AlpRankerWall } from './AlpRankerWall';
import { useApp } from '../../context/AppContext';

export const CatalogView: React.FC = () => {
  const { books } = useApp();
  const singleBook = books[0];

  if (!singleBook) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <p className="text-slate-500">Loading RRB ALP Psycho Test Book...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-12 animate-fade-in">
      
      {/* 1. Flagship 3D Animated Book Hero Presentation */}
      <AlpBookHero3D book={singleBook} />

      {/* 2. Live Interactive Psycho Battery Mini-Simulator (Test Yourself in 30 Seconds) */}
      <AlpInteractiveMiniTest />

      {/* 3. The 5 Psycho Batteries Decoded Section */}
      <AlpFiveBatteriesSection />

      {/* 4. Feature Inclusions, Dynamic Watermarking & Pincode Checker */}
      <AlpFeatureHighlights />

      {/* 5. Loco Pilot Ranker Reviews & Wall of Fame */}
      <AlpRankerWall />

    </div>
  );
};
