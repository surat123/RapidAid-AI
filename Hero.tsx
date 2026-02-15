import React from 'react';
import { ShieldCheck, Zap, Globe, Heart, ChevronRight, Activity, Cpu, Server, Smartphone } from 'lucide-react';
import { ViewState } from '../types';

interface HeroProps {
  onStart: () => void;
  onDocs?: () => void;
  t: any;
}

export const Hero: React.FC<HeroProps> = ({ onStart, onDocs, t }) => {
  return (
    <div className="bg-white min-h-[calc(100vh-64px)] flex flex-col relative overflow-hidden">
      {/* Tech Grid Background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-40 pointer-events-none"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white/80 pointer-events-none"></div>

      {/* Hero Content */}
      <div className="relative isolate px-6 pt-14 lg:px-8 flex-grow flex items-center">
        <div className="mx-auto max-w-3xl py-16 text-center">
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-mono font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10 bg-blue-50 mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            {t.hero_version}
          </div>
          
          <h1 className="text-5xl font-bold tracking-tight text-slate-900 sm:text-7xl mb-6">
            RapidAid<span className="text-blue-600">{t.hero_title_suffix}</span>
          </h1>
          
          <p className="text-xl leading-8 text-slate-600 mb-10 max-w-2xl mx-auto font-light">
            <span className="font-semibold text-slate-800">{t.hero_subtitle_prefix}</span> {t.hero_subtitle_body}
          </p>
          
          <div className="flex items-center justify-center gap-x-6">
            <button
              onClick={onStart}
              className="group rounded-lg bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-slate-800 hover:shadow-slate-900/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900 transition-all flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-yellow-400 group-hover:text-yellow-300 transition-colors" />
              {t.hero_btn_start}
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={onDocs}
              className="text-sm font-semibold leading-6 text-slate-900 flex items-center gap-2 hover:text-blue-600 transition-colors"
            >
              {t.hero_btn_docs} <span aria-hidden="true" className="font-mono">{'->'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-slate-50 border-t border-slate-200 py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Feature 1 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
                <Smartphone className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono mb-2">{t.feature_pre_hospital_title}</h3>
              <p className="text-sm text-slate-600">{t.feature_pre_hospital_desc}</p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 border border-purple-100">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono mb-2">{t.feature_esi_title}</h3>
              <p className="text-sm text-slate-600">{t.feature_esi_desc}</p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 border border-emerald-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono mb-2">{t.feature_infection_title}</h3>
              <p className="text-sm text-slate-600">{t.feature_infection_desc}</p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4 border border-orange-100">
                <Server className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="text-sm font-bold text-slate-900 font-mono mb-2">{t.feature_tele_title}</h3>
              <p className="text-sm text-slate-600">{t.feature_tele_desc}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};