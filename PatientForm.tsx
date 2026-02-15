import React, { useState, useRef } from 'react';
import { PatientData, VitalSigns, Language, AIAnalysisResult } from '../types';
import { analyzePatientCondition, getSymptomFollowUp, getPronunciationGuide } from '../services/geminiService';
import { Loader2, CheckCircle, Mic, MicOff, Bot, Send, X, AlertTriangle, BookOpen, Volume2, Watch, Smartphone, Video, Activity, User, FileText, ChevronRight, Edit2, CheckCircle2, ShieldAlert, Phone, Bluetooth, Signal, Battery } from 'lucide-react';

interface PatientFormProps {
  onSubmit: (data: PatientData) => void;
  language: Language;
  t: any;
}

export const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, language, t }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [listeningField, setListeningField] = useState<keyof typeof formData | null>(null);
  const recognitionRef = useRef<any>(null);
  
  // Review Mode State
  const [reviewMode, setReviewMode] = useState(false);
  const [aiResult, setAiResult] = useState<AIAnalysisResult | null>(null);

  // Symptom Checker State
  const [showSymptomChecker, setShowSymptomChecker] = useState(false);
  const [isGeneratingQuestion, setIsGeneratingQuestion] = useState(false);
  const [followUpQuestion, setFollowUpQuestion] = useState<string | null>(null);
  const [followUpAnswer, setFollowUpAnswer] = useState('');
  
  // Pronunciation State
  const [pronunciations, setPronunciations] = useState<{ [key: string]: Array<{term: string, pronunciation: string}> }>({});
  const [loadingPronunciation, setLoadingPronunciation] = useState<string | null>(null);

  // Sync Device State
  const [showSyncModal, setShowSyncModal] = useState(false);
  const [syncStep, setSyncStep] = useState<'SCANNING' | 'SELECT' | 'SYNCING' | 'SUCCESS'>('SCANNING');
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);

  const [submissionSource, setSubmissionSource] = useState<'mobile_app' | 'wearable' | 'walk_in'>('mobile_app');
  const [requestTeleconsult, setRequestTeleconsult] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: 'Male',
    symptoms: '',
    medicalHistory: '',
    suggestedSpecialist: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [vitals, setVitals] = useState<VitalSigns>({
    heartRate: '',
    bloodPressureSys: '',
    bloodPressureDia: '',
    temperature: '',
    oxygenSaturation: '',
    respiratoryRate: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleVitalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setVitals(prev => ({ ...prev, [name]: value }));
  };

  // Review Mode Handlers
  const handleReviewChange = (field: keyof AIAnalysisResult, value: any) => {
    if (!aiResult) return;
    setAiResult(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  const toggleVoiceInput = (field: keyof typeof formData) => {
    if (listeningField === field) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setListeningField(null);
      return;
    }
    if (listeningField && recognitionRef.current) recognitionRef.current.stop();

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice input is not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = language === 'th' ? 'th-TH' : 'en-US';
    recognition.continuous = false;
    recognition.onstart = () => setListeningField(field);
    recognition.onend = () => setListeningField(null);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setFormData(prev => {
        const currentVal = prev[field];
        const newVal = currentVal ? `${currentVal} ${transcript}` : transcript;
        return { ...prev, [field]: newVal };
      });
    };
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleSymptomCheck = async () => {
    if (!formData.symptoms || formData.symptoms.length < 3) {
        alert("Please describe your symptoms first.");
        return;
    }
    setShowSymptomChecker(true);
    setIsGeneratingQuestion(true);
    setFollowUpQuestion(null);
    try {
        const question = await getSymptomFollowUp(formData.symptoms, formData.age, formData.gender, language);
        setFollowUpQuestion(question);
    } catch (e) {
        setFollowUpQuestion("Could not generate a follow-up question.");
    } finally {
        setIsGeneratingQuestion(false);
    }
  };

  const submitFollowUpAnswer = () => {
      if (!followUpAnswer.trim() || !followUpQuestion) return;
      const newContext = `\n\n[AI Chatbot]: ${followUpQuestion}\n[Patient]: ${followUpAnswer}`;
      setFormData(prev => ({ ...prev, symptoms: prev.symptoms + newContext }));
      setShowSymptomChecker(false);
      setFollowUpQuestion(null);
      setFollowUpAnswer('');
  };

  const handleGetPronunciation = async (field: string, text: string) => {
    if (!text || text.length < 3) return;
    setLoadingPronunciation(field);
    try {
        const guide = await getPronunciationGuide(text);
        setPronunciations(prev => ({ ...prev, [field]: guide }));
    } catch (e) { console.error(e); } finally { setLoadingPronunciation(null); }
  };

  const clearPronunciation = (field: string) => {
    setPronunciations(prev => {
        const newState = { ...prev };
        delete newState[field];
        return newState;
    });
  };

  const startSyncProcess = () => {
    setShowSyncModal(true);
    setSyncStep('SCANNING');
    setTimeout(() => {
        setSyncStep('SELECT');
    }, 2000);
  };

  const handleDeviceSelect = (deviceName: string) => {
    setSelectedDevice(deviceName);
    setSyncStep('SYNCING');
    setTimeout(() => {
        setSubmissionSource('wearable');
        setVitals({
            heartRate: String(Math.floor(Math.random() * (110 - 60) + 60)),
            bloodPressureSys: String(Math.floor(Math.random() * (140 - 110) + 110)),
            bloodPressureDia: String(Math.floor(Math.random() * (90 - 70) + 70)),
            temperature: String((Math.random() * (38.5 - 36.5) + 36.5).toFixed(1)),
            oxygenSaturation: String(Math.floor(Math.random() * (100 - 94) + 94)),
            respiratoryRate: String(Math.floor(Math.random() * (20 - 14) + 14)),
        });
        setSyncStep('SUCCESS');
        setTimeout(() => {
            setShowSyncModal(false);
        }, 1200);
    }, 2000);
  };

  const fillSimulatedData = () => {
    if (language === 'th') {
      setFormData({
        name: 'สมชาย ใจดี',
        age: '58',
        gender: 'Male',
        symptoms: 'มีไข้และไอแห้งๆ มา 3 วัน รู้สึกหายใจลำบากเมื่อเดิน เพิ่งกลับจากการเดินทาง',
        medicalHistory: 'ความดันโลหิตสูง, เบาหวาน',
        suggestedSpecialist: 'โรคติดเชื้อ',
        emergencyContactName: 'สมหญิง ใจดี',
        emergencyContactPhone: '089-999-9999'
      });
    } else {
      setFormData({
        name: 'John Doe',
        age: '58',
        gender: 'Male',
        symptoms: 'Fever and dry cough for 3 days. Shortness of breath when walking. Travelled recently.',
        medicalHistory: 'Hypertension, Diabetes',
        suggestedSpecialist: 'Infectious Disease',
        emergencyContactName: 'Jane Doe',
        emergencyContactPhone: '+1-555-0100'
      });
    }
    
    setVitals({
      heartRate: '102',
      bloodPressureSys: '135',
      bloodPressureDia: '85',
      temperature: '38.2',
      oxygenSaturation: '93',
      respiratoryRate: '24',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmation(true);
  };

  const handleConfirmedSubmit = async () => {
    setShowConfirmation(false);
    setLoading(true);
    setError(null);

    try {
      if (!process.env.API_KEY) throw new Error("API Key is missing.");

      const result = await analyzePatientCondition({
        ...formData,
        vitals,
        submissionSource,
        requestTeleconsult
      }, language);

      setAiResult(result);
      setReviewMode(true);
      
    } catch (err: any) {
      setError(err.message || "An error occurred during triage analysis.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalSubmit = () => {
    if (!aiResult) return;

    const timestamp = Date.now();
    const newPatient: PatientData = {
      id: crypto.randomUUID(),
      ...formData,
      vitals,
      timestamp,
      status: 'pending',
      submissionSource,
      requestTeleconsult,
      aiAnalysis: aiResult,
      history: [{
          timestamp,
          type: 'CREATION',
          details: `Patient created via ${submissionSource} form. Initial ESI Level: ${aiResult.esiLevel}`,
          actor: 'SYSTEM',
          meta: { esi: aiResult.esiLevel }
      }]
    };

    onSubmit(newPatient);
  };

  const renderVoiceButton = (field: keyof typeof formData) => {
    const isListening = listeningField === field;
    return (
      <button
        type="button"
        onClick={() => toggleVoiceInput(field)}
        className={`absolute right-3 top-3 p-1.5 rounded-md transition-all duration-200 border ${
          isListening 
            ? 'bg-red-50 text-red-600 border-red-200 animate-pulse' 
            : 'bg-white text-slate-400 border-slate-200 hover:border-blue-300 hover:text-blue-500'
        }`}
      >
        {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
      </button>
    );
  };

  const renderPronunciationSection = (field: string, text: string) => {
    const data = pronunciations[field];
    const isLoading = loadingPronunciation === field;

    return (
      <div className="mt-1">
        {(!data || data.length === 0) && text.length > 3 && (
            isLoading ? (
                <div className="flex items-center gap-2 text-xs text-indigo-500 mt-2 font-mono animate-pulse">
                    <Loader2 className="w-3 h-3 animate-spin" />
                    Analyzing terms...
                </div>
            ) : (
                !loadingPronunciation && (
                    <button
                    type="button"
                    onClick={() => handleGetPronunciation(field, text)}
                    className="text-xs text-indigo-600 flex items-center gap-1 hover:text-indigo-800 font-medium transition-colors mt-2"
                    >
                    <BookOpen className="w-3 h-3" />
                    {t.form_analyze_terms}
                    </button>
                )
            )
        )}
        {data && data.length > 0 && (
          <div className="mt-2 bg-indigo-50 p-3 rounded-lg text-sm border border-indigo-100">
             <div className="flex justify-between items-center mb-2">
                <p className="font-semibold text-indigo-800 flex items-center gap-2 text-xs uppercase tracking-wide font-mono">
                    <Volume2 className="w-3 h-3"/> {t.form_phonetic_guide}
                </p>
                <button type="button" onClick={() => clearPronunciation(field)} className="text-indigo-400 hover:text-indigo-700">
                    <X className="w-3 h-3" />
                </button>
             </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
               {data.map((item, idx) => (
                 <div key={idx} className="flex justify-between items-center bg-white px-3 py-1.5 rounded border border-indigo-100 shadow-sm">
                    <span className="font-medium text-slate-700">{item.term}</span>
                    <span className="text-xs text-slate-500 italic bg-slate-50 px-1.5 py-0.5 rounded font-mono">{item.pronunciation}</span>
                 </div>
               ))}
             </div>
          </div>
        )}
      </div>
    );
  };

  // Render Review Screen
  if (reviewMode && aiResult) {
      return (
        <div className="max-w-4xl mx-auto py-8 px-4">
             <div className="bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in duration-300">
                 {/* Review Header */}
                 <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <h2 className="text-xl font-bold text-white tracking-tight">{t.review_title}</h2>
                    </div>
                    <span className="bg-slate-800 text-slate-400 px-2 py-1 rounded text-xs font-mono border border-slate-700">READY_FOR_ADMISSION</span>
                 </div>
                 
                 <div className="p-6 space-y-6">
                    {/* ESI & Override Section */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-slate-50 p-5 rounded-xl border-2 border-slate-200">
                            <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">{t.review_esi}</label>
                            <div className="flex flex-wrap gap-2">
                                {[1, 2, 3, 4, 5].map((level) => {
                                    const colors: Record<number, string> = {
                                        1: 'bg-red-600 border-red-700 text-white',
                                        2: 'bg-orange-500 border-orange-600 text-white',
                                        3: 'bg-yellow-400 border-yellow-500 text-yellow-900',
                                        4: 'bg-green-500 border-green-600 text-white',
                                        5: 'bg-blue-500 border-blue-600 text-white'
                                    };
                                    const isSelected = aiResult.esiLevel === level;
                                    return (
                                        <button
                                            key={level}
                                            onClick={() => handleReviewChange('esiLevel', level)}
                                            className={`
                                                flex-1 py-3 rounded-lg font-bold border-2 transition-all shadow-sm
                                                ${isSelected ? colors[level] + ' ring-2 ring-offset-2 ring-slate-300' : 'bg-white border-slate-200 text-slate-400 hover:border-slate-300'}
                                            `}
                                        >
                                            ESI {level}
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="mt-3 text-right">
                                <span className="text-xs font-bold text-slate-400 uppercase flex items-center justify-end gap-1">
                                    <Edit2 className="w-3 h-3" /> {t.review_override}
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                                <label className="block text-xs font-bold text-blue-800 mb-1 uppercase">{t.review_reason}</label>
                                <textarea
                                    value={aiResult.esiReasoning}
                                    onChange={(e) => handleReviewChange('esiReasoning', e.target.value)}
                                    className="w-full bg-white border border-blue-200 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-24 shadow-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Summary & Protocols */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2 space-y-2">
                             <label className="block text-xs font-bold text-slate-500 uppercase">{t.review_summary}</label>
                             <textarea
                                value={aiResult.summary}
                                onChange={(e) => handleReviewChange('summary', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-3 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32"
                             />
                        </div>
                        
                        <div className="space-y-4">
                            {/* Infection Protocol Card */}
                            <div className={`p-4 rounded-xl border ${aiResult.infectionRisk ? 'bg-purple-50 border-purple-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex items-center gap-2 mb-2">
                                    <ShieldAlert className={`w-4 h-4 ${aiResult.infectionRisk ? 'text-purple-600' : 'text-slate-400'}`} />
                                    <span className={`text-xs font-bold uppercase ${aiResult.infectionRisk ? 'text-purple-700' : 'text-slate-500'}`}>
                                        {t.dash_bio_protocol}
                                    </span>
                                </div>
                                <select 
                                    value={aiResult.infectionRisk ? 'HIGH' : 'LOW'}
                                    onChange={(e) => handleReviewChange('infectionRisk', e.target.value === 'HIGH')}
                                    className="w-full text-xs font-bold p-1 rounded bg-white border border-slate-200 mb-2"
                                >
                                    <option value="LOW">Standard / Low Risk</option>
                                    <option value="HIGH">High Risk / Isolation</option>
                                </select>
                                <textarea
                                    value={aiResult.infectionProtocol}
                                    onChange={(e) => handleReviewChange('infectionProtocol', e.target.value)}
                                    className="w-full bg-white border border-slate-200 rounded p-2 text-xs text-slate-600 h-20 resize-none"
                                />
                            </div>
                        </div>
                    </div>
                 </div>

                 {/* Action Footer */}
                 <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex justify-between items-center">
                    <button 
                        onClick={() => setReviewMode(false)}
                        className="text-slate-500 font-bold text-sm hover:text-slate-800 flex items-center gap-2 px-4 py-2 hover:bg-slate-200 rounded-lg transition"
                    >
                        <Edit2 className="w-4 h-4" /> {t.review_btn_edit}
                    </button>
                    <button 
                        onClick={handleFinalSubmit}
                        className="bg-emerald-600 text-white font-bold text-sm px-8 py-3 rounded-lg shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all flex items-center gap-2 transform hover:translate-y-[-1px]"
                    >
                        <CheckCircle2 className="w-5 h-5" /> {t.review_btn_approve}
                    </button>
                 </div>
             </div>
        </div>
      );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-wider mb-1 font-mono">
                <Activity className="w-3 h-3" /> {t.form_system_header}
            </div>
            <h2 className="text-xl font-bold text-white">{t.form_title}</h2>
          </div>
          <button 
            type="button" 
            onClick={fillSimulatedData} 
            className="text-xs font-mono bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded border border-slate-700 transition"
          >
            {t.form_dev_fill}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
          
          {/* Section 1: Source */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
                <div className="p-3 bg-white rounded-lg shadow-sm border border-slate-200">
                    <Watch className="w-6 h-6 text-slate-700" />
                </div>
                <div>
                    <h4 className="font-bold text-slate-800 text-sm">{t.form_source_title}</h4>
                    <p className="text-xs text-slate-500">{t.form_source_desc}</p>
                </div>
            </div>
            <button 
                type="button" 
                onClick={startSyncProcess}
                className="text-xs font-bold bg-white border border-slate-300 px-4 py-2 rounded-md shadow-sm hover:bg-slate-50 transition text-slate-700 flex items-center gap-2"
            >
                <Bluetooth className="w-3 h-3 text-blue-500" />
                {t.form_btn_sync}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column: Demographics & Vitals */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Demographics */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-2">
                        <User className="w-3 h-3" /> {t.form_section_identity}
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_name}</label>
                            <input required name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm" placeholder={t.form_placeholder_name} />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_age}</label>
                                <input required type="number" name="age" value={formData.age} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_gender}</label>
                                <select name="gender" value={formData.gender} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-white">
                                <option value="Male">{t.form_gender_male}</option>
                                <option value="Female">{t.form_gender_female}</option>
                                <option value="Other">{t.form_gender_other}</option>
                                </select>
                            </div>
                        </div>
                        {/* Emergency Contact */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_contact_name}</label>
                            <input name="emergencyContactName" value={formData.emergencyContactName} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={t.form_placeholder_contact_name} />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_contact_phone}</label>
                            <input name="emergencyContactPhone" value={formData.emergencyContactPhone} onChange={handleInputChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none text-sm" placeholder={t.form_placeholder_contact_phone} />
                        </div>
                    </div>
                </div>

                {/* Vitals */}
                <div className="space-y-4">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-2">
                        <Activity className="w-3 h-3" /> {t.form_section_vitals}
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                        <div className="col-span-2">
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_hr}</label>
                           <div className="relative">
                               <input required type="number" name="heartRate" value={vitals.heartRate} onChange={handleVitalChange} className="w-full pl-3 pr-8 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="--" />
                               <span className="absolute right-3 top-2 text-[10px] text-slate-400 pt-0.5">BPM</span>
                           </div>
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_bp_sys}</label>
                           <input required type="number" name="bloodPressureSys" value={vitals.bloodPressureSys} onChange={handleVitalChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="120" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_bp_dia}</label>
                           <input required type="number" name="bloodPressureDia" value={vitals.bloodPressureDia} onChange={handleVitalChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="80" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_spo2}</label>
                           <input required type="number" name="oxygenSaturation" value={vitals.oxygenSaturation} onChange={handleVitalChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="98" />
                        </div>
                        <div>
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_temp}</label>
                           <input required type="number" name="temperature" value={vitals.temperature} onChange={handleVitalChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="36.5" />
                        </div>
                        <div className="col-span-2">
                           <label className="block text-[10px] font-bold text-slate-500 mb-1 uppercase">{t.form_label_resp}</label>
                           <input required type="number" name="respiratoryRate" value={vitals.respiratoryRate} onChange={handleVitalChange} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-blue-500 text-sm font-mono" placeholder="16" />
                        </div>
                    </div>
                </div>

              </div>

              {/* Right Column: Clinical Data */}
              <div className="lg:col-span-2 space-y-6">
                
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono flex items-center gap-2 border-b border-slate-100 pb-2">
                    <FileText className="w-3 h-3" /> {t.form_section_clinical}
                </h3>

                <div className="space-y-4">
                    <div className="relative group">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_symptoms}</label>
                        <textarea 
                        required 
                        name="symptoms" 
                        value={formData.symptoms} 
                        onChange={handleInputChange} 
                        rows={5} 
                        className="w-full px-4 py-3 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none text-sm leading-relaxed" 
                        placeholder={t.form_placeholder_symptoms} 
                        />
                        {renderVoiceButton('symptoms')}
                    </div>

                    <div className="flex gap-4">
                        {!showSymptomChecker && formData.symptoms.length > 3 && (
                        <button 
                            type="button"
                            onClick={handleSymptomCheck}
                            className="text-xs font-bold text-blue-600 flex items-center gap-2 hover:bg-blue-50 transition-colors px-3 py-2 rounded border border-blue-200"
                        >
                            <Bot className="w-4 h-4" />
                            {t.form_btn_ai_interview}
                        </button>
                        )}
                    </div>

                    {renderPronunciationSection('symptoms', formData.symptoms)}

                    {/* AI Chatbot Area */}
                    {showSymptomChecker && (
                    <div className="bg-slate-50 rounded-lg border border-slate-200 overflow-hidden">
                        <div className="bg-slate-100 px-4 py-2 flex justify-between items-center border-b border-slate-200">
                            <span className="text-xs font-bold text-slate-600 font-mono">{t.form_ai_bot_title}</span>
                            <button type="button" onClick={() => setShowSymptomChecker(false)} className="text-slate-400 hover:text-slate-600"><X className="w-3 h-3"/></button>
                        </div>
                        <div className="p-4">
                             {isGeneratingQuestion ? (
                                <div className="flex items-center gap-2 text-sm text-slate-500">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-500" /> {t.form_ai_processing}
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border border-blue-200">
                                            <Bot className="w-4 h-4 text-blue-600" />
                                        </div>
                                        <div className="bg-white p-3 rounded-lg rounded-tl-none border border-slate-200 shadow-sm text-sm text-slate-700">
                                            {followUpQuestion}
                                        </div>
                                    </div>
                                    <div className="pl-11">
                                         <div className="relative">
                                            <input 
                                                type="text" 
                                                value={followUpAnswer}
                                                onChange={(e) => setFollowUpAnswer(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && submitFollowUpAnswer()}
                                                placeholder={t.form_placeholder_answer}
                                                className="w-full px-4 py-2 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
                                                autoFocus
                                            />
                                            <button 
                                                type="button"
                                                onClick={submitFollowUpAnswer}
                                                disabled={!followUpAnswer.trim()}
                                                className="absolute right-2 top-1.5 p-1 text-blue-600 hover:bg-blue-50 rounded disabled:opacity-50"
                                            >
                                                <Send className="w-4 h-4" />
                                            </button>
                                         </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    )}

                    <div className="relative">
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_history}</label>
                        <textarea 
                        name="medicalHistory" 
                        value={formData.medicalHistory} 
                        onChange={handleInputChange} 
                        rows={2} 
                        className="w-full px-4 py-2 pr-12 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" 
                        placeholder={t.form_placeholder_history} 
                        />
                        {renderVoiceButton('medicalHistory')}
                    </div>
                    {renderPronunciationSection('medicalHistory', formData.medicalHistory)}

                    <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1">{t.form_label_suggested_specialist}</label>
                        <input
                            type="text"
                            name="suggestedSpecialist"
                            value={formData.suggestedSpecialist}
                            onChange={handleInputChange}
                            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            placeholder={t.form_placeholder_suggested_specialist}
                        />
                    </div>

                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-lg p-3">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input
                            type="checkbox"
                            checked={requestTeleconsult}
                            onChange={(e) => setRequestTeleconsult(e.target.checked)}
                            className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                            />
                            <div>
                                <span className="block text-sm font-semibold text-indigo-900">{t.form_checkbox_tele}</span>
                                <span className="block text-xs text-indigo-700/70">{t.form_checkbox_tele_desc}</span>
                            </div>
                        </label>
                    </div>
                </div>

              </div>
          </div>

          {/* Submit Action */}
          <div className="pt-6 border-t border-slate-100">
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto md:min-w-[200px] ml-auto flex items-center justify-center space-x-2 bg-slate-900 text-white py-3 px-6 rounded-lg font-bold shadow-lg hover:bg-slate-800 transition-all ${loading ? 'opacity-70 cursor-not-allowed' : 'hover:translate-y-[-1px]'}`}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{t.form_btn_analyzing}</span>
                </>
              ) : (
                <>
                  <span>{t.form_btn_submit}</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 animate-in fade-in zoom-in-95 duration-200 border border-slate-200">
              <div className="flex items-center gap-3 text-amber-600 mb-4">
                <div className="bg-amber-50 p-2 rounded-lg border border-amber-100">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">{t.modal_title}</h3>
              </div>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-6 text-sm border border-slate-200 font-mono">
                <p className="mb-2 text-slate-700">{t.modal_patient_label}: <span className="font-bold">{formData.name}</span></p>
                {requestTeleconsult && (
                    <p className="text-indigo-600 font-bold mb-2 flex items-center gap-2"><Video className="w-3 h-3"/> {t.modal_tele_req}</p>
                )}
                 {submissionSource === 'wearable' && (
                    <p className="text-slate-500 text-xs flex items-center gap-2"><Watch className="w-3 h-3"/> {t.modal_device_synced}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(false)}
                  className="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors text-sm"
                >
                  {t.modal_btn_abort}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmedSubmit}
                  className="px-4 py-2 bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 shadow-md text-sm"
                >
                  {t.modal_btn_confirm}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Device Sync Modal */}
        {showSyncModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200 relative">
                    
                    {/* Header */}
                    <div className="bg-slate-900 px-6 py-4 flex justify-between items-center">
                        <div className="flex items-center gap-2 text-white">
                             <Bluetooth className="w-5 h-5 text-blue-400" />
                             <h3 className="font-bold">{t.sync_title}</h3>
                        </div>
                        <button onClick={() => setShowSyncModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    
                    <div className="p-6">
                        {/* Step 1: Scanning */}
                        {syncStep === 'SCANNING' && (
                            <div className="flex flex-col items-center justify-center py-8">
                                <div className="relative mb-6">
                                    <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center animate-pulse">
                                        <Bluetooth className="w-10 h-10 text-blue-600" />
                                    </div>
                                    <div className="absolute top-0 left-0 w-24 h-24 border-4 border-blue-500 rounded-full animate-ping opacity-20"></div>
                                </div>
                                <p className="text-slate-600 font-medium animate-pulse">{t.sync_scanning}</p>
                            </div>
                        )}

                        {/* Step 2: Select Device */}
                        {syncStep === 'SELECT' && (
                            <div>
                                <h4 className="text-sm font-bold text-slate-500 uppercase mb-4 tracking-wider">{t.sync_select_device}</h4>
                                <div className="space-y-3">
                                    <button 
                                        onClick={() => handleDeviceSelect(t.sync_device_1)}
                                        className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Watch className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                                            <div className="text-left">
                                                <p className="font-bold text-slate-800 text-sm">{t.sync_device_1}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <Signal className="w-3 h-3 text-emerald-500" /> Strong Signal
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">ID: 8X-99</div>
                                    </button>

                                    <button 
                                        onClick={() => handleDeviceSelect(t.sync_device_2)}
                                        className="w-full p-3 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50 transition-all flex items-center justify-between group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Watch className="w-6 h-6 text-slate-400 group-hover:text-blue-600" />
                                            <div className="text-left">
                                                <p className="font-bold text-slate-800 text-sm">{t.sync_device_2}</p>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                                                    <Signal className="w-3 h-3 text-emerald-500" /> Good Signal
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-[10px] font-mono text-slate-400">ID: GW-06</div>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Step 3: Syncing */}
                        {syncStep === 'SYNCING' && (
                            <div className="text-center py-6">
                                <div className="flex items-center justify-center gap-4 mb-6">
                                    <Watch className="w-10 h-10 text-slate-400" />
                                    <div className="flex gap-1">
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-0"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-150"></div>
                                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce delay-300"></div>
                                    </div>
                                    <Smartphone className="w-10 h-10 text-blue-600" />
                                </div>
                                <h4 className="font-bold text-slate-800 mb-1">{t.sync_syncing}</h4>
                                <p className="text-xs text-slate-500">{selectedDevice}</p>
                                
                                <div className="w-full bg-slate-100 h-2 rounded-full mt-6 overflow-hidden">
                                    <div className="h-full bg-blue-500 animate-[width_1.5s_ease-in-out_forwards]" style={{width: '100%'}}></div>
                                </div>
                            </div>
                        )}

                         {/* Step 4: Success */}
                         {syncStep === 'SUCCESS' && (
                            <div className="text-center py-8">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-in zoom-in">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                                </div>
                                <h4 className="font-bold text-emerald-700 text-lg mb-1">{t.sync_success}</h4>
                                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 mt-2">
                                    <Battery className="w-4 h-4 text-emerald-500" />
                                    <span>Battery 84%</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};