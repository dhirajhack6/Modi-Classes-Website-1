import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { Book } from '../../types';
import { ModiClassesLogo } from '../common/ModiClassesLogo';
import { 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Zap, 
  ShoppingBag, 
  CheckCircle2, 
  Layers, 
  TrainTrack, 
  Clock, 
  Eye, 
  Plus, 
  Minus,
  KeyRound,
  FileCheck2,
  Award,
  Check,
  Pause,
  Play
} from 'lucide-react';

interface AlpBookHero3DProps {
  book?: Book;
}

export const AlpBookHero3D: React.FC<AlpBookHero3DProps> = () => {
  const { 
    books, 
    addToCart, 
    setIsCartDrawerOpen, 
    openCheckoutDirect 
  } = useApp();

  const book = books[0];
  
  // 3D Orientation state (in degrees)
  const [rotX, setRotX] = useState<number>(10);
  const [rotY, setRotY] = useState<number>(-22);
  const [rotZ] = useState<number>(0);
  const [isAutoMoving, setIsAutoMoving] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [floatY, setFloatY] = useState<number>(0);
  
  // Drag tracking refs
  const dragStartRef = useRef<{ x: number; y: number; rotX: number; rotY: number }>({ x: 0, y: 0, rotX: 10, rotY: -22 });
  const animFrameRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number>(performance.now());
  const angleYRef = useRef<number>(-22);
  const angleXBaseRef = useRef<number>(10);

  if (!book) return null;

  const unitPrice = book.discountPriceHardcopy || 499;
  const originalPrice = book.priceHardcopy || 899;
  const savingsPercent = Math.round(((originalPrice - unitPrice) / originalPrice) * 100);

  // Smooth Multi-Directional Auto-Movement Physics Loop
  useEffect(() => {
    if (!isAutoMoving || isDragging) {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      return;
    }

    lastTimeRef.current = performance.now();

    const loop = (currentTime: number) => {
      const delta = (currentTime - lastTimeRef.current) / 1000;
      lastTimeRef.current = currentTime;

      // 360 degree continuous turntable auto-rotation: 18 deg/sec
      angleYRef.current = (angleYRef.current + 18 * delta) % 360;
      
      // Gentle harmonic floating wave on tilt (X-axis) and elevation (Y-axis)
      const wave = Math.sin(currentTime * 0.0018);
      const waveFloat = Math.sin(currentTime * 0.0025);
      
      const newX = angleXBaseRef.current + wave * 4.5;
      const newFloatY = waveFloat * 8; // 8px gentle vertical bobbing

      setRotY(angleYRef.current);
      setRotX(newX);
      setFloatY(newFloatY);

      animFrameRef.current = requestAnimationFrame(loop);
    };

    animFrameRef.current = requestAnimationFrame(loop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [isAutoMoving, isDragging]);

  // Pointer drag handlers for full 360 multi-direction rotation
  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    dragStartRef.current = {
      x: e.clientX,
      y: e.clientY,
      rotX,
      rotY
    };
    if (e.pointerType !== 'touch') {
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const deltaX = e.clientX - dragStartRef.current.x;
    const deltaY = e.clientY - dragStartRef.current.y;
    
    // Sensitivity factor
    const sensitivity = 0.55;
    const newRotY = (dragStartRef.current.rotY + deltaX * sensitivity) % 360;
    const newRotX = Math.max(-70, Math.min(70, dragStartRef.current.rotX - deltaY * sensitivity));

    angleYRef.current = newRotY;
    angleXBaseRef.current = newRotX;
    setRotX(newRotX);
    setRotY(newRotY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    setIsDragging(false);
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  };

  const handleAddToCart = () => {
    addToCart(book, 'hardcopy', quantity);
    setIsCartDrawerOpen(true);
  };

  const handleInstantBuy = () => {
    openCheckoutDirect(book, 'hardcopy', quantity);
  };

  const handleShowFront = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoMoving(false);
    angleYRef.current = -22;
    angleXBaseRef.current = 10;
    setRotY(-22);
    setRotX(10);
    setRotZ(0);
  };

  const handleShowBack = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsAutoMoving(false);
    angleYRef.current = 175;
    angleXBaseRef.current = 6;
    setRotY(175);
    setRotX(6);
    setRotZ(0);
  };

  return (
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/90 shadow-xl text-slate-900">
      
      {/* Top Signal Bar - Light & Crisp */}
      <div className="bg-slate-100/90 border-b border-slate-200 px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 bg-slate-900 text-white font-black px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider shadow-xs border border-slate-700">
            <ModiClassesLogo size={20} />
            <span className="text-amber-400">MODI CLASSES & VIDYASAGAR</span>
          </div>
          <span className="text-slate-600 hidden md:inline font-medium">
            Official 2025 RDSO Online Exam Edition • 524 Pages Hardcopy with 50 OMR Sheets
          </span>
        </div>

        <div className="flex items-center gap-3 text-slate-700 text-[11px]">
          <div className="flex items-center gap-1 text-emerald-700 font-bold">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>RDSO T-Score ≥ 42 Guarantee</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-amber-700 font-medium">
            <Truck className="w-3.5 h-3.5 text-amber-600" />
            <span>48h Express Dispatch</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 3D Multi-Directional Book on Left + Purchase Details on Right */}
      <div className="p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center bg-gradient-to-b from-amber-50/20 via-white to-slate-50/40">
        
        {/* Left Column: Pure 3D Auto-Moving Volumetric Book Showcase */}
        <div className="lg:col-span-6 flex flex-col items-center justify-center">
          
          {/* Interactive 3D Stage Container (Pure book presentation with seamless drag-to-inspect) */}
          <div 
            className="relative w-full rounded-2xl bg-gradient-to-b from-slate-50/80 via-white to-amber-50/20 border border-slate-200/70 p-2 sm:p-8 flex flex-col items-center justify-center select-none cursor-grab active:cursor-grabbing overflow-hidden h-[440px] xs:h-[480px] sm:h-[560px]"
            style={{ touchAction: 'pan-y' }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Mobile Drag to Rotate Hint */}
            <div className="absolute top-3 inset-x-0 flex items-center justify-center pointer-events-none z-20">
              <span className="bg-slate-900/80 text-amber-300 text-[10px] font-bold px-3 py-1 rounded-full backdrop-blur-xs flex items-center gap-1.5 border border-slate-700/80 shadow-xs">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Drag to Rotate 360°</span>
              </span>
            </div>

            {/* Responsive Scale Wrapper for Small Mobile Screens */}
            <div className="transform scale-[0.70] xs:scale-[0.82] sm:scale-100 transition-transform duration-150 origin-center flex items-center justify-center">
              {/* 3D PERSPECTIVE STAGE (Large, High-Definition Volume) */}
              <div 
                className="relative flex items-center justify-center transition-transform duration-75 ease-out"
                style={{
                  perspective: '1400px',
                  transformStyle: 'preserve-3d',
                  width: '380px',
                  maxWidth: '380px',
                  height: '530px'
                }}
              >
              
              {/* Dynamic 3D Ground Shadow with real-time tracking */}
              <div 
                className="absolute -bottom-8 bg-slate-400/35 rounded-full blur-2xl pointer-events-none transition-all duration-300 w-80 h-12"
                style={{
                  transform: `translateX(${rotY * 0.45}px) scale(${1 - Math.abs(rotX) * 0.004 + (floatY * -0.02)})`
                }}
              />

              {/* BOOK OBJECT (Transforms in 3D according to rotX, rotY, rotZ, and harmonic floatY) */}
              <div
                className="relative transition-transform duration-75 ease-out"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `translateY(${floatY}px) rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(${rotZ}deg)`,
                  width: '340px',
                  height: '490px'
                }}
              >
                
                {/* ======================================================== */}
                {/* 3D VOLUMETRIC BOOK (High-Res Accurate Model)              */}
                {/* ======================================================== */}
                <div
                  className="relative w-[340px] h-[490px] select-none"
                  style={{ transformStyle: 'preserve-3d' }}
                >
                  {/* FRONT COVER (z = 24px for 48px depth) */}
                  <div 
                    className="absolute inset-0 rounded-r-xl rounded-l-xs overflow-hidden bg-white border-2 border-slate-300 shadow-2xl flex flex-col justify-between select-none"
                    style={{
                      transform: 'translateZ(24px)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Glossy Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent pointer-events-none z-30" />

                    <img 
                      src="/assets/book.jpg" 
                      alt="Railway Psychological/Aptitude Test For Asst. Loco Pilot" 
                      className="w-full h-full object-cover"
                    />

                  </div>

                  {/* BACK COVER (z = -24px, rotated 180deg) */}
                  <div 
                    className="absolute inset-0 rounded-l-xl rounded-r-xs overflow-hidden bg-white border-2 border-slate-300 shadow-2xl flex flex-col justify-between select-none"
                    style={{
                      transform: 'rotateY(180deg) translateZ(24px)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Glossy Sheen Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/15 to-transparent pointer-events-none z-30" />

                    <img 
                      src={book.backCoverImage || '/assets/book-back.jpg'} 
                      alt="Railway Psychological/Aptitude Test Back Cover" 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/assets/book-back.png';
                      }}
                    />
                  </div>

                  {/* 3D THICK SPINE (Left face, perfectly joins front & back at x = 0, spanning z = +24px to -24px) */}
                  <div 
                    className="absolute top-0 bottom-0 w-[48px] bg-gradient-to-b from-[#16a34a] via-white to-[#16a34a] border-y-2 border-green-700 text-slate-950 flex flex-col justify-between items-center py-4 select-none shadow-md font-bold"
                    style={{
                      left: '-24px',
                      transform: 'rotateY(-90deg)',
                      backfaceVisibility: 'hidden'
                    }}
                  >
                    {/* Top Spine: Vidyasagar */}
                    <div className="flex flex-col items-center">
                      <span className="text-[9px] tracking-widest font-black uppercase text-[#006d77] [writing-mode:vertical-lr] rotate-180">
                        VIDYASAGAR
                      </span>
                      <div className="flex gap-0.5 mt-1">
                        <span className="w-1 h-2 bg-[#06b6d4]" />
                        <span className="w-1 h-2 bg-[#ec4899]" />
                        <span className="w-1 h-2 bg-[#eab308]" />
                      </div>
                    </div>

                    {/* Center Spine: Title */}
                    <div className="flex flex-col items-center gap-1 [writing-mode:vertical-lr] rotate-180">
                      <span className="text-[10px] font-black text-[#006d77] tracking-wider">
                        RAILWAY
                      </span>
                      <span className="text-[10px] font-black text-[#dc2626] tracking-tight">
                        Psycho/Aptitude Test
                      </span>
                      <span className="text-[7.5px] font-extrabold text-slate-900 tracking-tight">
                        Asst. Loco Pilot (Diesel/Electrical)
                      </span>
                    </div>

                    {/* Bottom Spine: VP Shield */}
                    <div className="w-6 h-6 rounded-sm bg-white border border-red-600 flex items-center justify-center text-red-600 font-black text-[9px] font-serif shadow-xs">
                      VP
                    </div>
                  </div>

                    {/* 3D PAGES FORE-EDGE (Right side with VISIBLE 524 PAGES LINING) */}
                    <div 
                      className="absolute top-[3px] bottom-[3px] w-[48px] rounded-r-xs shadow-inner flex flex-col justify-between overflow-hidden"
                      style={{
                        left: '316px',
                        transform: 'rotateY(90deg)',
                        background: 'repeating-linear-gradient(to bottom, #ffffff 0px, #fdfcf7 1px, #e2e8f0 2px, #cbd5e1 2.5px, #f8fafc 3px)',
                        boxShadow: 'inset 0 0 8px rgba(0,0,0,0.22)'
                      }}
                    >
                      {/* Realistic Paper Core Grooves & Section Markers */}
                      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/15 via-transparent to-slate-900/20 pointer-events-none" />
                      
                      {/* High-definition 524 stacked page lines */}
                      <div className="h-full w-full flex flex-col justify-around px-0.5 py-1 opacity-90">
                        {[...Array(40)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`w-full ${
                              i % 8 === 0 
                                ? 'h-[1.5px] bg-slate-400/90' 
                                : i % 4 === 0 
                                ? 'h-[1px] bg-slate-300' 
                                : 'h-[0.5px] bg-slate-200'
                            }`} 
                          />
                        ))}
                      </div>

                      {/* 524 Pages Volume Tag on Page Edge */}
                      <div className="absolute inset-x-0 bottom-6 flex justify-center">
                        <span className="bg-amber-100 text-slate-800 text-[7px] font-black px-1.5 py-0.5 rounded-xs border border-amber-300/80 shadow-xs [writing-mode:vertical-lr] rotate-180 uppercase tracking-wider">
                          524 PAGES • 50 OMR
                        </span>
                      </div>
                    </div>

                    {/* 3D TOP PAGES EDGE (Visible stacked page lines from top) */}
                    <div 
                      className="absolute left-[3px] w-[334px] h-[48px] overflow-hidden shadow-inner"
                      style={{
                        top: '-24px',
                        transform: 'rotateX(90deg)',
                        background: 'repeating-linear-gradient(to right, #f8fafc 0px, #ffffff 1px, #e2e8f0 2px, #cbd5e1 2.5px, #f8fafc 3px)',
                        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.18)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-900/20 pointer-events-none" />
                      <div className="w-full h-full flex justify-around py-0.5">
                        {[...Array(30)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full ${
                              i % 6 === 0 ? 'w-[1.5px] bg-slate-400/80' : 'w-[0.5px] bg-slate-200'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>

                    {/* 3D BOTTOM PAGES EDGE (Visible stacked page lines from bottom) */}
                    <div 
                      className="absolute left-[3px] w-[334px] h-[48px] overflow-hidden shadow-inner"
                      style={{
                        top: '466px',
                        transform: 'rotateX(-90deg)',
                        background: 'repeating-linear-gradient(to right, #f8fafc 0px, #ffffff 1px, #e2e8f0 2px, #cbd5e1 2.5px, #f8fafc 3px)',
                        boxShadow: 'inset 0 0 6px rgba(0,0,0,0.18)'
                      }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 via-transparent to-slate-900/20 pointer-events-none" />
                      <div className="w-full h-full flex justify-around py-0.5">
                        {[...Array(30)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-full ${
                              i % 6 === 0 ? 'w-[1.5px] bg-slate-400/80' : 'w-[0.5px] bg-slate-200'
                            }`} 
                          />
                        ))}
                      </div>
                    </div>
                  </div>

              </div>
            </div>
          </div>

            {/* 3D Perspective Controls: Front, Back Cover, 360° Spin */}
            <div 
              className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-full border border-slate-700/80 shadow-xl cursor-default"
              onPointerDown={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleShowFront}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  !isAutoMoving && (Math.abs(rotY - (-22)) < 30 || Math.abs(rotY) < 30)
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="View Front Cover"
                id="btn-3d-front"
              >
                Front Cover
              </button>

              <button
                type="button"
                onClick={handleShowBack}
                className={`px-3 py-1 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  !isAutoMoving && Math.abs(rotY - 175) < 35
                    ? 'bg-amber-400 text-slate-950 shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title="View Back Cover"
                id="btn-3d-back"
              >
                <span>Back Cover</span>
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsAutoMoving((prev) => !prev);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  isAutoMoving
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
                title={isAutoMoving ? 'Pause 360° Turntable' : 'Start 360° Turntable'}
                id="toggle-3d-motion-btn"
              >
                {isAutoMoving ? (
                  <>
                    <Pause className="w-3.5 h-3.5" />
                    <span>Spinning</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>360° Spin</span>
                  </>
                )}
              </button>
            </div>

          </div>

        </div>

        {/* Right Column: Physical Master Book Details, Pricing & Direct Purchase */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Badge & Title */}
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-lime-100 text-lime-900 text-xs font-bold border border-lime-300">
              <Award className="w-3.5 h-3.5 text-lime-700" />
              <span>OFFICIAL 2025 RDSO ONLINE EXAM EDITION</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-black font-serif text-slate-900 tracking-tight leading-tight">
              Railway Psychological / Aptitude Test (CBAT) Master Book
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              By <strong>Sandeep Kumar (Vidyasagar Publication)</strong>. Complete 524-page physical book covering all 5 RDSO Lucknow batteries with step-by-step Hindi & English solutions, 50 printed OMR bubble practice sheets, and previous year solved papers.
            </p>
          </div>

          {/* Pricing Box - Crisp Light Card */}
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-3">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 font-mono">
                ₹{unitPrice}
              </span>
              <span className="text-base text-slate-400 line-through font-mono">
                ₹{originalPrice}
              </span>
              <span className="bg-emerald-600 text-white font-black text-xs px-2.5 py-1 rounded-full uppercase">
                {savingsPercent}% OFF
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-700">
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>In Stock & Ready for Dispatch</span>
              </div>
              <div className="flex items-center gap-1 text-slate-600">
                <Truck className="w-4 h-4 text-amber-600" />
                <span>Free Express Shipping across India</span>
              </div>
            </div>
          </div>

          {/* What's In The Box Checklist */}
          <div className="space-y-2 text-xs text-slate-700">
            <h4 className="font-bold text-slate-900 text-xs uppercase tracking-wider">
              Package Includes:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px]">524 Pages Vidyasagar Hardcopy Book</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px]">50 Physical OMR Bubble Sheets</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px]">Previous Year (2014-2025) Solved Sets</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-medium text-[11px]">Online CBT Simulator Access Key</span>
              </div>
            </div>
          </div>

          {/* Quantity & CTA Buttons */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-slate-300 rounded-xl bg-white p-1">
                <button
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="w-10 text-center font-bold font-mono text-sm text-slate-900">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-700 hover:bg-slate-100 font-bold cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button
                onClick={handleInstantBuy}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 cursor-pointer transition-all hover:scale-[1.02]"
                id="instant-buy-btn"
              >
                <ShoppingBag className="w-5 h-5" />
                <span>Buy Book Now • ₹{unitPrice * quantity}</span>
              </button>
            </div>

            <button
              onClick={handleAddToCart}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-colors border border-slate-200"
            >
              <span>Add to Cart ({quantity})</span>
            </button>
          </div>

          {/* Trust Guarantees */}
          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-200">
            <div className="flex items-center gap-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>100% Genuine Physical Book</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Dispatched within 24-48 Hours</span>
            </div>
          </div>

        </div>

      </div>

      {/* Mobile Sticky Bottom Purchase Action Bar */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-2.5 shadow-2xl flex items-center justify-between gap-3 pb-safe">
        <div className="flex flex-col min-w-0">
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">524 Pgs + 50 OMRs</span>
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-black text-slate-900 font-mono">₹{unitPrice}</span>
            <span className="text-[11px] text-slate-400 line-through font-mono">₹{originalPrice}</span>
            <span className="text-[9px] bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded font-mono">{savingsPercent}% OFF</span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={handleAddToCart}
            className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-300 transition-colors"
            title="Add to cart"
            aria-label="Add to cart"
          >
            <ShoppingBag className="w-4 h-4 text-slate-700" />
          </button>
          <button
            onClick={handleInstantBuy}
            className="py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center gap-1.5 shadow-md transition-transform active:scale-95"
            id="mobile-sticky-buy-btn"
          >
            <span>Buy Book Now</span>
          </button>
        </div>
      </div>

    </div>
  );
};
