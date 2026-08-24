import React from 'react';

interface ModiClassesLogoProps {
  className?: string;
  size?: number | string;
  showText?: boolean;
}

export const ModiClassesLogo: React.FC<ModiClassesLogoProps> = ({
  className = '',
  size = 48,
  showText = false
}) => {
  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg
        viewBox="0 0 300 300"
        width={size}
        height={size}
        className="shrink-0 drop-shadow-md select-none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Paths for text curving */}
          <path
            id="top-arc"
            d="M 40,150 A 110,110 0 1,1 260,150"
            fill="none"
          />
          <path
            id="bottom-arc"
            d="M 260,150 A 110,110 0 0,1 40,150"
            fill="none"
          />
          {/* Gradients */}
          <radialGradient id="redRingGrad" cx="50%" cy="50%" r="50%">
            <stop offset="60%" stopColor="#e11d48" />
            <stop offset="95%" stopColor="#b91c1c" />
            <stop offset="100%" stopColor="#881337" />
          </radialGradient>
          <radialGradient id="yellowCenterGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fef08a" />
            <stop offset="70%" stopColor="#facc15" />
            <stop offset="100%" stopColor="#eab308" />
          </radialGradient>
          <linearGradient id="goldBorderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="50%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#ca8a04" />
          </linearGradient>
        </defs>

        {/* 1. Outer Black & Gold Rim */}
        <circle cx="150" cy="150" r="148" fill="#1e293b" />
        <circle cx="150" cy="150" r="144" fill="url(#goldBorderGrad)" />
        <circle cx="150" cy="150" r="138" fill="#1e293b" />

        {/* 2. Red Main Ring */}
        <circle cx="150" cy="150" r="136" fill="url(#redRingGrad)" />

        {/* 3. Outer Curved Text: MODI CLASSES (Top Arc) */}
        <text
          fill="#ffffff"
          fontSize="26"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="4"
          filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.6))"
        >
          <textPath href="#top-arc" startOffset="50%" textAnchor="middle">
            MODI CLASSES
          </textPath>
        </text>

        {/* Left Star */}
        <polygon
          points="46,145 49,153 58,153 51,158 53,166 46,161 39,166 41,158 34,153 43,153"
          fill="#ffffff"
          filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
        />

        {/* Right Star */}
        <polygon
          points="254,145 257,153 266,153 259,158 261,166 254,161 247,166 249,158 242,153 251,153"
          fill="#ffffff"
          filter="drop-shadow(0px 1px 2px rgba(0,0,0,0.5))"
        />

        {/* TM Badge */}
        <g transform="translate(230, 85)">
          <circle cx="10" cy="10" r="11" fill="#eab308" stroke="#ca8a04" strokeWidth="1" />
          <circle cx="10" cy="10" r="9" fill="#e11d48" />
          <text
            x="10"
            y="13"
            fill="#fef08a"
            fontSize="7"
            fontWeight="900"
            textAnchor="middle"
            fontFamily="sans-serif"
          >
            TM
          </text>
        </g>

        {/* 4. Outer Curved Text: MODI RAILWAY PSYCHO TEST CLASSES (Bottom Arc) */}
        <text
          fill="#ffffff"
          fontSize="15"
          fontWeight="900"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
          letterSpacing="1.5"
          filter="drop-shadow(0px 2px 2px rgba(0,0,0,0.6))"
        >
          <textPath href="#bottom-arc" startOffset="50%" textAnchor="middle">
            MODI RAILWAY PSYCHO TEST CLASSES
          </textPath>
        </text>

        {/* 5. Inner Gold Border Ring */}
        <circle cx="150" cy="150" r="86" fill="#1e293b" />
        <circle cx="150" cy="150" r="83" fill="url(#goldBorderGrad)" />
        <circle cx="150" cy="150" r="80" fill="#1e293b" />

        {/* 6. Central Yellow Sun Disk */}
        <circle cx="150" cy="150" r="78" fill="url(#yellowCenterGrad)" />

        {/* 7. Yellow Human Head Silhouette Profile Facing Right (Embossed on yellow disk) */}
        <g id="head-profile" transform="translate(0, 0)">
          
          {/* Head Profile Outline & Base Neck */}
          <path
            d="M 125,75 
               C 155,72 178,82 188,102 
               C 193,113 194,124 186,134 
               C 183,137 186,140 193,142 
               C 200,144 205,147 202,154 
               C 200,158 193,161 190,163 
               C 187,165 189,170 192,175 
               C 194,180 188,187 182,189 
               C 176,191 174,196 177,204 
               C 180,212 176,224 165,225 
               C 145,226 122,226 102,225 
               C 108,206 112,192 110,180 
               C 107,165 98,155 96,135 
               C 94,110 105,80 125,75 Z"
            fill="#facc15"
          />

          {/* LEFT BRAIN: Digital Circuit / PCB Microchip (Black + Yellow Traces) */}
          <g id="circuit-brain" transform="translate(100, 78)">
            {/* Brain Left Hemisphere Background */}
            <path
              d="M 45,5 C 25,5 10,20 8,40 C 6,55 12,72 20,80 C 28,88 38,92 45,95 Z"
              fill="#0f172a"
            />
            {/* PCB Traces & Nodes (Yellow/Gold) */}
            <g stroke="#facc15" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M 45,15 H 32 L 24,23 H 16" />
              <path d="M 45,28 H 26 L 18,36 H 12" />
              <path d="M 45,40 H 30 L 22,48 H 14" />
              <path d="M 45,52 H 34 L 28,58 H 18" />
              <path d="M 45,65 H 30 L 24,71 H 20" />
              <path d="M 45,78 H 36 L 30,84" />
              {/* Vertical Busses */}
              <path d="M 32,15 V 35" />
              <path d="M 26,45 V 65" />
            </g>
            {/* PCB Chip Solder Nodes */}
            <g fill="#facc15">
              <circle cx="16" cy="23" r="2.5" />
              <circle cx="12" cy="36" r="2.5" />
              <circle cx="14" cy="48" r="2.5" />
              <circle cx="18" cy="58" r="2.5" />
              <circle cx="20" cy="71" r="2.5" />
              <circle cx="30" cy="84" r="2.5" />
              <circle cx="32" cy="35" r="2.5" />
              <circle cx="26" cy="45" r="2.5" />
            </g>
          </g>

          {/* RIGHT BRAIN: Biological / Psychological Organic Cerebrum (Vibrant Red) */}
          <g id="organic-brain" transform="translate(145, 78)">
            {/* Brain Right Hemisphere */}
            <path
              d="M 0,5 C 22,5 38,18 42,38 C 45,55 40,75 30,86 C 22,94 10,96 0,95 Z"
              fill="#e11d48"
            />
            {/* Organic Brain Gyri / Folds (Golden-Yellow Creases) */}
            <g stroke="#facc15" strokeWidth="2" strokeLinecap="round" fill="none">
              <path d="M 5,14 C 18,12 28,18 32,26 C 26,30 18,26 8,30" />
              <path d="M 5,34 C 16,32 26,36 36,44 C 30,48 20,44 10,50" />
              <path d="M 6,56 C 18,52 28,58 35,66 C 28,70 18,66 8,72" />
              <path d="M 5,78 C 14,76 22,80 26,88" />
              <path d="M 24,18 C 28,28 26,38 32,46" />
              <path d="M 20,44 C 26,52 24,64 30,72" />
            </g>
          </g>

          {/* 8. NECK / BASE: Steam Locomotive Engine & Railway Track */}
          <g id="locomotive-seal" transform="translate(118, 160)">
            {/* Radiating Light Rays */}
            <g stroke="#0f172a" strokeWidth="1.5" strokeLinecap="round">
              <line x1="16" y1="12" x2="8" y2="4" />
              <line x1="24" y1="8" x2="20" y2="0" />
              <line x1="32" y1="6" x2="32" y2="-2" />
              <line x1="40" y1="8" x2="44" y2="0" />
              <line x1="48" y1="12" x2="56" y2="4" />
            </g>

            {/* Chimney / Smoke Stack */}
            <rect x="27" y="1" width="10" height="6" rx="2" fill="#0f172a" />

            {/* Circular Locomotive Boiler Head */}
            <circle cx="32" cy="20" r="16" fill="#0f172a" />
            <circle cx="32" cy="20" r="13" fill="#facc15" />
            <circle cx="32" cy="20" r="10" fill="#0f172a" />

            {/* Star in Center of Locomotive Headlight */}
            <polygon
              points="32,13 34,18 39,18 35,21 37,26 32,23 27,26 29,21 25,18 30,18"
              fill="#facc15"
            />

            {/* Cowcatcher / Engine Base */}
            <polygon
              points="14,34 50,34 58,44 6,44"
              fill="#0f172a"
            />
            {/* Inner V-Shape Inverted Triangle Cowcatcher grill */}
            <polygon
              points="32,42 46,36 18,36"
              fill="#facc15"
            />

            {/* Railway Tracks (Rails & Sleepers) */}
            <g fill="#0f172a">
              {/* Top Rail */}
              <rect x="2" y="44" width="60" height="3" rx="1" />
              {/* Bottom Rail */}
              <rect x="0" y="52" width="64" height="4" rx="1" />
              {/* Cross Sleepers */}
              <rect x="8" y="44" width="4" height="11" />
              <rect x="22" y="44" width="4" height="11" />
              <rect x="38" y="44" width="4" height="11" />
              <rect x="52" y="44" width="4" height="11" />
            </g>
          </g>

        </g>
      </svg>

      {showText && (
        <div className="flex flex-col">
          <span className="font-black text-sm sm:text-base text-slate-900 tracking-tight leading-none font-serif">
            MODI RAILWAY PSYCHOTEST CLASSES
          </span>
          <span className="text-[10px] text-amber-700 font-bold uppercase tracking-wider mt-0.5">
            Official CBAT Master Book Portal
          </span>
        </div>
      )}
    </div>
  );
};
