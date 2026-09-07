import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  HelpCircle, 
  Sparkles, 
  Clock, 
  Trophy, 
  Layers, 
  Eye, 
  Compass, 
  BookOpen
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlpInteractiveMiniTest: React.FC = () => {
  const { setSelectedBookForSample, books } = useApp();
  const singleBook = books[0];

  const [activeTab, setActiveTab] = useState<'brick' | 'memory' | 'clock'>('brick');
  
  // Brick Test State
  const [selectedBrick, setSelectedBrick] = useState<'A' | 'B' | 'C' | 'D' | 'E'>('A');
  const [userBrickAnswer, setUserBrickAnswer] = useState<number | null>(null);
  const [brickSubmitted, setBrickSubmitted] = useState(false);

  // Memory Test State
  const [memoryPhase, setMemoryPhase] = useState<'study' | 'test' | 'result'>('study');
  const [memoryTimer, setMemoryTimer] = useState(6);
  const [userMemoryAnswer, setUserMemoryAnswer] = useState<string | null>(null);

  // Clock Test State
  const [userClockAnswer, setUserClockAnswer] = useState<string | null>(null);
  const [clockSubmitted, setClockSubmitted] = useState(false);

  // Memory Timer Effect
  useEffect(() => {
    let interval: any;
    if (activeTab === 'memory' && memoryPhase === 'study') {
      interval = setInterval(() => {
        setMemoryTimer((prev) => {
          if (prev <= 1) {
            setMemoryPhase('test');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeTab, memoryPhase]);

  const restartMemoryTest = () => {
    setMemoryPhase('study');
    setMemoryTimer(6);
    setUserMemoryAnswer(null);
  };

  // Correct answers definition
  const brickContactData = {
    A: { contacts: 4, touchingList: ['B (Left)', 'C (Top)', 'D (Top-Right)', 'E (Bottom)'], explanation: 'Brick A touches 4 bricks directly on surface boundaries (Left B, Top C, Top D, Bottom E).' },
    B: { contacts: 3, touchingList: ['A (Right)', 'C (Top)', 'E (Bottom)'], explanation: 'Brick B touches 3 bricks (Right A, Top C, Bottom E).' },
    C: { contacts: 3, touchingList: ['A (Bottom)', 'B (Bottom)', 'D (Right)'], explanation: 'Brick C rests on top of A and B, and touches D on the right face.' },
    D: { contacts: 2, touchingList: ['A (Bottom)', 'C (Left)'], explanation: 'Brick D touches C on the left and rests on A.' },
    E: { contacts: 2, touchingList: ['A (Top)', 'B (Top)'], explanation: 'Brick E supports both A and B from the bottom.' }
  };

  return (
    <section id="interactive-test-section" className="py-6">
      <div className="rounded-3xl bg-white border border-slate-200/90 p-6 sm:p-10 shadow-xl text-slate-900 relative overflow-hidden">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-slate-200">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
              <Zap className="w-3.5 h-3.5 text-amber-700" />
              <span>LIVE RDSO BATTERY SIMULATOR</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
              Test Your Psycho Aptitude <span className="text-amber-600">In 30 Seconds</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
              Experience the actual questions railway aspirants face in the Computer-Based Aptitude Test (CBAT). See how our book transforms 60-second struggles into 6-second instant answers!
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium">Target T-Score:</span>
            <span className="bg-emerald-100 text-emerald-900 font-bold px-3 py-1 rounded-lg border border-emerald-300 text-xs flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-700" />
              T ≥ 42 Qualifying Cutoff
            </span>
          </div>
        </div>

        {/* Mini Test Mode Tabs */}
        <div className="mt-6 flex flex-wrap gap-1.5 sm:gap-2">
          <button
            onClick={() => setActiveTab('brick')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'brick'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Layers className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="sm:hidden">1. Brick Test</span>
            <span className="hidden sm:inline">1. 3D Brick Test (Depth Perception)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('memory');
              restartMemoryTest();
            }}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'memory'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Eye className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="sm:hidden">2. Memory Test</span>
            <span className="hidden sm:inline">2. Landmark Memory Test (Battery 1)</span>
          </button>

          <button
            onClick={() => setActiveTab('clock')}
            className={`px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer ${
              activeTab === 'clock'
                ? 'bg-amber-500 text-slate-950 shadow-md font-black'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Compass className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            <span className="sm:hidden">3. Clock Test</span>
            <span className="hidden sm:inline">3. Following Direction (Clock Test)</span>
          </button>
        </div>

        {/* Tab 1: 3D Brick Depth Perception Test */}
        {activeTab === 'brick' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-center bg-slate-50/80 p-4 sm:p-6 rounded-2xl border border-slate-200">
            
            {/* Visual 3D Stack Canvas */}
            <div className="lg:col-span-6 flex flex-col items-center">
              <div className="text-center mb-3">
                <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                  Interactive 3D Stack Visualizer
                </span>
                <p className="text-xs text-slate-600">Click any brick to test its contacting surfaces:</p>
              </div>

              {/* Graphical Brick Stack Representation */}
              <div className="relative w-full max-w-sm h-60 sm:h-64 bg-white rounded-2xl border border-slate-300 p-3 sm:p-4 flex flex-col justify-center items-center shadow-xs">
                
                {/* Top Row: Bricks C and D */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      setSelectedBrick('C');
                      setUserBrickAnswer(null);
                      setBrickSubmitted(false);
                    }}
                    className={`w-20 sm:w-24 h-11 sm:h-12 rounded-lg font-black text-xs sm:text-sm transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                      selectedBrick === 'C'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Brick C
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBrick('D');
                      setUserBrickAnswer(null);
                      setBrickSubmitted(false);
                    }}
                    className={`w-20 sm:w-24 h-11 sm:h-12 rounded-lg font-black text-xs sm:text-sm transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                      selectedBrick === 'D'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Brick D
                  </button>
                </div>

                {/* Middle Row: Bricks B and A */}
                <div className="flex gap-2 mb-2">
                  <button
                    onClick={() => {
                      setSelectedBrick('B');
                      setUserBrickAnswer(null);
                      setBrickSubmitted(false);
                    }}
                    className={`w-20 sm:w-24 h-12 sm:h-14 rounded-lg font-black text-xs sm:text-sm transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                      selectedBrick === 'B'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Brick B
                  </button>

                  <button
                    onClick={() => {
                      setSelectedBrick('A');
                      setUserBrickAnswer(null);
                      setBrickSubmitted(false);
                    }}
                    className={`w-28 sm:w-36 h-12 sm:h-14 rounded-lg font-black text-xs sm:text-sm transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                      selectedBrick === 'A'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Brick A
                  </button>
                </div>

                {/* Bottom Row: Brick E */}
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setSelectedBrick('E');
                      setUserBrickAnswer(null);
                      setBrickSubmitted(false);
                    }}
                    className={`w-40 sm:w-48 h-11 sm:h-12 rounded-lg font-black text-xs sm:text-sm transition-all border flex items-center justify-center cursor-pointer shadow-xs ${
                      selectedBrick === 'E'
                        ? 'bg-amber-400 text-slate-950 border-amber-500 ring-2 ring-amber-400 scale-105'
                        : 'bg-slate-100 text-slate-800 border-slate-300 hover:bg-slate-200'
                    }`}
                  >
                    Brick E (Base)
                  </button>
                </div>

              </div>
            </div>

            {/* Questions & Solution Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-amber-800 font-bold">RDSO Question Rule:</span>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                  How many bricks are touching <span className="text-amber-700 font-black">Brick {selectedBrick}</span>?
                </h3>
                <p className="text-xs text-slate-600">
                  Select your count answer below. (Must solve in under 6 seconds in actual exam):
                </p>
              </div>

              {/* Number Buttons 1 to 5 */}
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((num) => (
                  <button
                    key={num}
                    onClick={() => {
                      setUserBrickAnswer(num);
                      setBrickSubmitted(true);
                    }}
                    className={`py-3 rounded-xl font-bold text-sm border transition-all cursor-pointer ${
                      userBrickAnswer === num
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-md'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {num}
                  </button>
                ))}
              </div>

              {/* Feedback Alert */}
              {brickSubmitted && userBrickAnswer !== null && (
                <div className={`p-4 rounded-xl border animate-fade-in text-xs space-y-2 ${
                  userBrickAnswer === brickContactData[selectedBrick].contacts
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="flex items-center justify-between font-bold">
                    <span className="flex items-center gap-1.5">
                      {userBrickAnswer === brickContactData[selectedBrick].contacts ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          Correct! Brick {selectedBrick} touches {brickContactData[selectedBrick].contacts} Bricks.
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-600" />
                          Incorrect! (Correct is {brickContactData[selectedBrick].contacts} Bricks)
                        </>
                      )}
                    </span>
                  </div>

                  <p className="text-slate-700 text-[11px] leading-relaxed">
                    {brickContactData[selectedBrick].explanation}
                  </p>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-amber-900 font-medium">
                    <span>⭐ Modi Classes Touchdown Rule: Count Left/Right + Top + Bottom</span>
                  </div>
                </div>
              )}

              {/* Book Solution Trigger */}
              <div className="pt-2">
                <button
                  onClick={() => singleBook && setSelectedBookForSample(singleBook)}
                  className="text-xs text-amber-800 hover:text-amber-900 font-bold flex items-center gap-1.5 cursor-pointer underline"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Read Chapter 3 for 500+ solved 3D Brick problems in the book</span>
                </button>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Landmark Memory Test */}
        {activeTab === 'memory' && (
          <div className="mt-6 bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
            {memoryPhase === 'study' && (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-900 px-4 py-1 rounded-full text-xs font-bold border border-amber-300">
                  <Clock className="w-4 h-4 text-amber-700 animate-spin" />
                  <span>Study Phase: Memorize Landmark Locations ({memoryTimer}s remaining)</span>
                </div>

                <div className="max-w-md mx-auto grid grid-cols-2 gap-2 sm:gap-4 bg-white p-3 sm:p-6 rounded-2xl border border-slate-300 shadow-xs">
                  <div className="p-2.5 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-xl sm:text-2xl block">🏥</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">Hospital</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold">(Top-Left / NW)</span>
                  </div>
                  <div className="p-2.5 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-xl sm:text-2xl block">🚉</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">Railway Station</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold">(Top-Right / NE)</span>
                  </div>
                  <div className="p-2.5 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-xl sm:text-2xl block">🏫</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">School</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold">(Bottom-Left / SW)</span>
                  </div>
                  <div className="p-2.5 sm:p-4 bg-amber-50 rounded-xl border border-amber-200 text-center">
                    <span className="text-xl sm:text-2xl block">⛽</span>
                    <span className="text-xs font-bold text-slate-900 mt-1 block">Petrol Pump</span>
                    <span className="text-[9px] sm:text-[10px] text-amber-800 font-bold">(Bottom-Right / SE)</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600">
                  Modi Classes Tip: Use the <em>"Clockwise Story Method"</em> — Hospital (NW) to Station (NE) to Petrol Pump (SE) to School (SW).
                </p>
              </div>
            )}

            {memoryPhase === 'test' && (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-900 px-3 py-1 rounded-full text-xs font-bold border border-amber-300">
                  <Eye className="w-3.5 h-3.5" />
                  <span>Test Phase: Answer from Memory</span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-slate-900">
                  Where was the <span className="text-amber-700">🚉 Railway Station</span> located?
                </h3>

                <div className="max-w-md mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                  {[
                    { id: 'NW', label: 'Top-Left (North-West)' },
                    { id: 'NE', label: 'Top-Right (North-East)' },
                    { id: 'SW', label: 'Bottom-Left (South-West)' },
                    { id: 'SE', label: 'Bottom-Right (South-East)' }
                  ].map((loc) => (
                    <button
                      key={loc.id}
                      onClick={() => {
                        setUserMemoryAnswer(loc.id);
                        setMemoryPhase('result');
                      }}
                      className="p-3 sm:p-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs border border-slate-300 hover:border-amber-500 cursor-pointer transition-all shadow-xs"
                    >
                      {loc.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {memoryPhase === 'result' && (
              <div className="text-center space-y-4 py-4 animate-fade-in">
                <div className={`p-5 rounded-2xl max-w-md mx-auto border ${
                  userMemoryAnswer === 'NE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  {userMemoryAnswer === 'NE' ? (
                    <div className="space-y-1">
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                      <h4 className="font-black text-base">Perfect Memory Recall!</h4>
                      <p className="text-xs text-slate-700">
                        Railway Station was at <strong>Top-Right (North-East)</strong>. Your response time qualifies for T-Score 62+!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <XCircle className="w-8 h-8 text-rose-600 mx-auto" />
                      <h4 className="font-black text-base">Missed Anchor!</h4>
                      <p className="text-xs text-slate-700">
                        The Railway Station was at <strong>Top-Right (NE)</strong>.
                      </p>
                    </div>
                  )}
                </div>

                <button
                  onClick={restartMemoryTest}
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-xs font-bold text-slate-800 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Try Memory Test Again</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Following Direction (Clock Test) */}
        {activeTab === 'clock' && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-slate-50/80 p-6 rounded-2xl border border-slate-200">
            <div className="lg:col-span-5 flex flex-col items-center">
              {/* Circular Clock Dial Graphic */}
              <div className="relative w-48 h-48 rounded-full border-4 border-amber-500 bg-white flex items-center justify-center shadow-md">
                <span className="absolute top-2 font-black text-slate-900 text-xs">12 (A)</span>
                <span className="absolute right-2 font-black text-slate-900 text-xs">3 (B)</span>
                <span className="absolute bottom-2 font-black text-slate-900 text-xs">6 (C)</span>
                <span className="absolute left-2 font-black text-slate-900 text-xs">9 (D)</span>
                <div className="w-3 h-3 bg-amber-500 rounded-full z-10" />
                <div className="absolute w-1 h-16 bg-amber-500 -top-1 origin-bottom rotate-90 rounded-full" />
              </div>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <div className="space-y-1">
                <span className="text-xs text-amber-800 font-bold">Clock Direction Question:</span>
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  If the pointer starts at <strong>3 o'clock (B)</strong>, moves <strong>90° Clockwise</strong>, and then <strong>180° Counter-Clockwise</strong>, which position does it point to?
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[
                  { key: 'A', label: '12 (A)' },
                  { key: 'B', label: '3 (B)' },
                  { key: 'C', label: '6 (C)' },
                  { key: 'D', label: '9 (D)' }
                ].map((opt) => (
                  <button
                    key={opt.key}
                    onClick={() => {
                      setUserClockAnswer(opt.key);
                      setClockSubmitted(true);
                    }}
                    className={`py-3 rounded-xl font-bold text-xs border transition-all cursor-pointer ${
                      userClockAnswer === opt.key
                        ? 'bg-amber-500 text-slate-950 border-amber-600 font-black scale-105 shadow-md'
                        : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {clockSubmitted && (
                <div className={`p-4 rounded-xl border animate-fade-in text-xs space-y-1 ${
                  userClockAnswer === 'A'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-950'
                    : 'bg-rose-50 border-rose-300 text-rose-950'
                }`}>
                  <div className="font-bold flex items-center gap-1.5 text-sm">
                    {userClockAnswer === 'A' ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Correct! 12 o'clock (Position A)
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4 text-rose-600" />
                        Incorrect! Correct is Position A (12 o'clock)
                      </>
                    )}
                  </div>
                  <p className="text-slate-700 text-[11px]">
                    ⭐ Modi Angle Formula: Start at 3 (+90° CW = 6 o'clock) &rarr; -180° CCW = 12 o'clock (Position A).
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
};
