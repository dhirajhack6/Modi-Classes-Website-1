import React, { useState } from 'react';
import { 
  Gauge, 
  Layers, 
  Eye, 
  Compass, 
  Zap, 
  Brain, 
  AlertTriangle, 
  Sparkles, 
  Clock, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';

export const AlpFiveBatteriesSection: React.FC = () => {
  const [expandedBattery, setExpandedBattery] = useState<number | null>(1);

  const BATTERIES = [
    {
      id: 1,
      name: 'Battery 1: Memory Test',
      subTypes: 'House Memory • Railway Track Memory • Figure Memory • Object-Number',
      icon: Eye,
      color: 'bg-blue-600',
      questions: '12 to 24 Questions per set',
      timeLimit: '2 Minutes Study + 2 Minutes Test',
      cutoffScore: 'T-Score ≥ 42 (Min. 10+ Accuracy)',
      pitfall: 'Candidates mix up symmetrical house roofs or forget distant track connections under timer stress.',
      solutionInBook: 'Clockwise Story Linking Method & 4-Quadrant Anchor Grid formula included in Chapter 1.'
    },
    {
      id: 2,
      name: 'Battery 2: Following Direction & Table Test',
      subTypes: 'Speed Clock Matrix • Table Navigation • 5x5 Coordinate Eye-Jumps',
      icon: Compass,
      color: 'bg-amber-600',
      questions: '10 to 20 Questions',
      timeLimit: '5 Minutes (15s per question)',
      cutoffScore: 'T-Score ≥ 42 (Min. 8+ Accuracy)',
      pitfall: 'Candidates lose time by tracing physical fingers on the screen or getting confused in 90° vs 180° rotations.',
      solutionInBook: 'Coordinate Eye-Jump Arithmetic (X-2, Y+1) & Instant Angular Clock Offset table in Chapter 2.'
    },
    {
      id: 3,
      name: 'Battery 3: Depth Perception & 3D Brick Test',
      subTypes: 'Hidden Cube Counting • Contacting Face Calculation • 3D Spatial Layout',
      icon: Layers,
      color: 'bg-emerald-600',
      questions: '50 Questions (10 Bricks per stack)',
      timeLimit: '5 Minutes (6s per question)',
      cutoffScore: 'T-Score ≥ 42 (Min. 40+ Accuracy)',
      pitfall: 'Counting edge/point touches as surface contact, or missing bottom-support bricks.',
      solutionInBook: 'Modi Classes 3-Step Touchdown Formula (Left/Right + Top + Bottom) with 500+ solved drills in Chapter 3.'
    },
    {
      id: 4,
      name: 'Battery 4: Concentration Test',
      subTypes: 'Yes/No Test • Find Digits 6 & 9 • Split-Second Optical Scanning',
      icon: Zap,
      color: 'bg-purple-600',
      questions: '96 Questions (Yes/No) or 75 Questions (Digits)',
      timeLimit: '4 to 5 Minutes (Ultra-Fast Reaction)',
      cutoffScore: 'T-Score ≥ 42 (Min. 80+ Accuracy)',
      pitfall: 'Eye fatigue leading to misreading inverted numbers like 6 as 9 or missing tiny punctuation differences.',
      solutionInBook: 'Peripheral Vision Sweeping Drills & Anti-Fatigue Focus Exercises in Chapter 4.'
    },
    {
      id: 5,
      name: 'Battery 5: Perceptual Speed Test',
      subTypes: 'Similarity Test • Hexagon Pattern Matching • Optical Symmetry',
      icon: Gauge,
      color: 'bg-rose-600',
      questions: '72 to 96 Questions',
      timeLimit: '6 Minutes (4s per question)',
      cutoffScore: 'T-Score ≥ 42 (Min. 65+ Accuracy)',
      pitfall: 'Second-guessing slight rotation angles instead of matching prominent corner vertices.',
      solutionInBook: 'Vertex Matching Technique & Trap-Elimination flowcharts in Chapter 5.'
    }
  ];

  return (
    <section id="five-batteries-section" className="py-8 space-y-6">
      
      {/* Section Header */}
      <div className="text-center max-w-2xl mx-auto space-y-1.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-200 text-slate-800 text-xs font-bold">
          <Brain className="w-3.5 h-3.5 text-slate-700" />
          <span>RDSO LUCKNOW OFFICIAL 5 BATTERIES</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
          The 5 Psycho Batteries Decoded
        </h2>
        <p className="text-xs sm:text-sm text-slate-600">
          In Indian Railways CBAT, you must qualify each of the 5 battery tests independently with a minimum 42 T-Score.
        </p>
      </div>

      {/* 5 Batteries Interactive Accordion Grid */}
      <div className="grid grid-cols-1 gap-3 max-w-4xl mx-auto">
        {BATTERIES.map((battery) => {
          const Icon = battery.icon;
          const isExpanded = expandedBattery === battery.id;

          return (
            <div
              key={battery.id}
              className={`rounded-2xl border transition-all overflow-hidden ${
                isExpanded
                  ? 'bg-white border-amber-400 shadow-md ring-1 ring-amber-300'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              {/* Accordion Bar Header */}
              <button
                onClick={() => setExpandedBattery(isExpanded ? null : battery.id)}
                className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-hidden"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className={`w-10 h-10 rounded-xl ${battery.color} flex items-center justify-center text-white shrink-0 shadow-sm`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-slate-900">{battery.name}</h3>
                      <span className="text-[10px] font-black bg-slate-100 text-slate-700 px-2 py-0.5 rounded-sm">
                        {battery.cutoffScore}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{battery.subTypes}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs text-amber-700 font-bold hidden sm:inline">
                    {isExpanded ? 'Hide Formula' : 'View Formula'}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-amber-700" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </div>
              </button>

              {/* Expanded Details Body */}
              {isExpanded && (
                <div className="px-4 sm:px-6 pb-5 pt-2 border-t border-slate-100 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs animate-fade-in">
                  
                  {/* Column 1: Exam Timing & Questions */}
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold text-slate-900">
                      <Clock className="w-4 h-4 text-slate-700" />
                      <span>Exam Timing</span>
                    </div>
                    <p className="text-slate-600"><strong>Questions:</strong> {battery.questions}</p>
                    <p className="text-slate-600"><strong>Time:</strong> {battery.timeLimit}</p>
                    <p className="text-emerald-700 font-semibold"><strong>Target:</strong> {battery.cutoffScore}</p>
                  </div>

                  {/* Column 2: The Critical Trap */}
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 space-y-1.5 text-rose-900">
                    <div className="flex items-center gap-1.5 font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Common Candidate Trap</span>
                    </div>
                    <p className="text-rose-700 leading-relaxed text-[11px]">
                      {battery.pitfall}
                    </p>
                  </div>

                  {/* Column 3: The Book's Secret Formula */}
                  <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 space-y-1.5 text-amber-950">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Formula in Book</span>
                    </div>
                    <p className="text-amber-900 leading-relaxed text-[11px]">
                      {battery.solutionInBook}
                    </p>
                  </div>

                </div>
              )}
            </div>
          );
        })}
      </div>

    </section>
  );
};
