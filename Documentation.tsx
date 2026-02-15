import React from 'react';
import { Book, Cpu, ShieldCheck, Activity, Globe, Layout, CheckCircle } from 'lucide-react';

interface DocumentationProps {
  t: any;
}

export const Documentation: React.FC<DocumentationProps> = ({ t }) => {
  return (
    <div className="bg-grid-pattern min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8">
          <div className="flex items-center gap-3 mb-2 text-blue-600 font-mono text-sm font-bold uppercase tracking-wider">
            <Book className="w-5 h-5" />
            <span>{t.doc_title}</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900">{t.doc_subtitle}</h1>
          <p className="mt-4 text-lg text-slate-600 leading-relaxed">
            RapidAid_AI is a prototype framework demonstrating the future of emergency medical services.
            It leverages Gemini 3.0 models to bridge the gap between pre-hospital care and emergency room readiness.
          </p>
        </div>

        {/* Concept Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex items-center gap-2">
            <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded text-xs font-mono font-bold">SECTION_01</span>
            <h2 className="font-bold text-slate-800">{t.doc_section_concept}</h2>
          </div>
          <div className="p-6">
            <h3 className="text-xl font-bold text-blue-900 mb-3">{t.doc_concept_title}</h3>
            <p className="text-slate-600 leading-relaxed">
              {t.doc_concept_desc}
            </p>
          </div>
        </div>

        {/* Novelty Grid */}
        <div>
          <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Cpu className="w-5 h-5 text-blue-600" />
            {t.doc_section_novelty}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4 border border-blue-100">
                <Activity className="h-5 w-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t.doc_novelty_1_title}</h3>
              <p className="text-sm text-slate-600">{t.doc_novelty_1_desc}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-4 border border-purple-100">
                <Cpu className="h-5 w-5 text-purple-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t.doc_novelty_2_title}</h3>
              <p className="text-sm text-slate-600">{t.doc_novelty_2_desc}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-4 border border-emerald-100">
                <ShieldCheck className="h-5 w-5 text-emerald-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t.doc_novelty_3_title}</h3>
              <p className="text-sm text-slate-600">{t.doc_novelty_3_desc}</p>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center mb-4 border border-orange-100">
                <Globe className="h-5 w-5 text-orange-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">{t.doc_novelty_4_title}</h3>
              <p className="text-sm text-slate-600">{t.doc_novelty_4_desc}</p>
            </div>
          </div>
        </div>

        {/* Impact & Structure */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Impact */}
          <div className="bg-slate-900 rounded-xl p-6 text-white">
            <h2 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              {t.doc_section_impact}
            </h2>
            <ul className="space-y-4">
              {[t.doc_impact_1, t.doc_impact_2, t.doc_impact_3, t.doc_impact_4].map((item, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <span className="text-slate-300 text-sm font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Structure */}
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h2 className="text-lg font-bold mb-6 text-slate-900 flex items-center gap-2">
              <Layout className="w-5 h-5 text-indigo-600" />
              {t.doc_section_structure}
            </h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono text-slate-600 border border-slate-200">01</div>
                <span className="text-sm font-medium text-slate-700">{t.doc_struct_1}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono text-slate-600 border border-slate-200">02</div>
                <span className="text-sm font-medium text-slate-700">{t.doc_struct_2}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono text-slate-600 border border-slate-200">03</div>
                <span className="text-sm font-medium text-slate-700">{t.doc_struct_3}</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold font-mono text-slate-600 border border-slate-200">04</div>
                <span className="text-sm font-medium text-slate-700">{t.doc_struct_4}</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};