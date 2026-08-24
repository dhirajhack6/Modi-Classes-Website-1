import React from 'react';
import { 
  Star, 
  Award, 
  CheckCircle2, 
  ThumbsUp, 
  TrainTrack, 
  Quote, 
  Sparkles, 
  ShieldCheck 
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AlpRankerWall: React.FC = () => {
  const { reviews } = useApp();

  return (
    <section className="py-8 space-y-6">
      
      {/* Header & Metric Banner - Light & Warm */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-gradient-to-br from-amber-50/60 via-white to-slate-50 p-8 rounded-3xl text-slate-900 border border-amber-200/80 shadow-md">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 text-xs font-bold border border-amber-300">
            <Award className="w-3.5 h-3.5 text-amber-700" />
            <span>LOCO PILOT WALL OF FAME</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-serif text-slate-900 tracking-tight">
            Trusted by 1,840+ Selected <span className="text-amber-700">Railway Loco Pilots</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-600">
            Real feedback from candidates who mastered the 5 RDSO batteries with Modi Classes and are now driving trains across Indian Railways.
          </p>
        </div>

        {/* Aggregate Ratings Card */}
        <div className="p-4 rounded-2xl bg-white border border-amber-200/80 shadow-sm flex items-center gap-4 shrink-0">
          <div className="text-center">
            <span className="text-3xl font-black text-amber-600">4.96</span>
            <div className="flex items-center justify-center gap-0.5 text-amber-500 my-0.5">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              ))}
            </div>
            <span className="text-[10px] text-slate-500 block">Out of 5 Stars</span>
          </div>

          <div className="h-10 w-px bg-slate-200"></div>

          <div className="text-xs space-y-0.5">
            <p className="font-bold text-slate-900">100% RDSO Match</p>
            <p className="text-[11px] text-slate-500">1,840 Verified Purchases</p>
            <p className="text-[10px] text-emerald-700 font-bold">T-Score ≥ 60 Reported</p>
          </div>
        </div>
      </div>

      {/* Testimonials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div 
            key={rev.id} 
            className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
          >
            <div className="space-y-3">
              {/* Star Rating & Verified Badge */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-amber-500">
                  {[...Array(rev.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full flex items-center gap-1 border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  Verified Loco Pilot
                </span>
              </div>

              {/* Review Quote */}
              <p className="text-xs text-slate-700 leading-relaxed italic">
                "{rev.comment}"
              </p>
            </div>

            {/* Author Meta */}
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-900">{rev.userName}</p>
                <p className="text-[10px] text-amber-800 font-semibold">{rev.userBatch}</p>
              </div>
              <div className="text-[10px] text-slate-400">
                {rev.date}
              </div>
            </div>
          </div>
        ))}
      </div>

    </section>
  );
};
