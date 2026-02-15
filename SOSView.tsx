import React, { useState, useEffect, useRef } from 'react';
import { Camera, MapPin, Mic, MicOff, Send, AlertOctagon, CheckCircle2, RotateCcw, Loader2, Siren, X } from 'lucide-react';
import { PatientData, Language } from '../types';

interface SOSViewProps {
  onSubmit: (data: PatientData) => void;
  language: Language;
  t: any;
  onClose: () => void;
}

export const SOSView: React.FC<SOSViewProps> = ({ onSubmit, language, t, onClose }) => {
  const [step, setStep] = useState<'LOCATING' | 'CAMERA' | 'DETAILS' | 'CONFIRMING' | 'SENDING' | 'SENT'>('LOCATING');
  const [location, setLocation] = useState<{lat: number, lng: number} | null>(null);
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [symptoms, setSymptoms] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [countdown, setCountdown] = useState(5);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const confirmText = {
    en: {
      title: "CONFIRM EMERGENCY",
      sendingIn: "Sending alert in...",
      cancel: "CANCEL ALERT",
      info: "Emergency teams will be notified with your location."
    },
    th: {
      title: "ยืนยันเหตุฉุกเฉิน",
      sendingIn: "จะส่งสัญญาณใน...",
      cancel: "ยกเลิกการแจ้งเตือน",
      info: "ระบบจะแจ้งเตือนทีมฉุกเฉินพร้อมพิกัดของคุณ"
    }
  };

  const ct = confirmText[language] || confirmText.en;

  // 1. Auto Locate on Mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setTimeout(() => {
            setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
            setStep('CAMERA');
          }, 2000); // Artificial delay for effect
        },
        (err) => {
           console.error(err);
           // Fallback
           setLocation({ lat: 13.7563, lng: 100.5018 });
           setStep('CAMERA');
        }
      );
    } else {
        setStep('CAMERA');
    }
  }, []);

  // 2. Camera Logic
  useEffect(() => {
    let stream: MediaStream | null = null;
    
    const startCamera = async () => {
        if (step === 'CAMERA' && !imgSrc) {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (e) {
                console.error("Camera access denied", e);
            }
        }
    };

    startCamera();

    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    };
  }, [step, imgSrc]);

  // 3. Countdown Logic
  useEffect(() => {
    let timer: any;
    if (step === 'CONFIRMING') {
      if (countdown > 0) {
        timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      } else {
        executeSOS();
      }
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg');
            setImgSrc(dataUrl);
        }
    }
  };

  const toggleVoiceInput = () => {
    if (isListening) {
      // Stop
      setIsListening(false);
      // In a real app, stop recognition
    } else {
      // Start
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert("Voice not supported");
        return;
      }
      const recognition = new SpeechRecognition();
      recognition.lang = language === 'th' ? 'th-TH' : 'en-US';
      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms(prev => prev ? `${prev} ${transcript}` : transcript);
      };
      recognition.start();
    }
  };

  const handleSOSClick = () => {
    setCountdown(5);
    setStep('CONFIRMING');
  };

  const cancelSOS = () => {
    setStep('DETAILS');
  };

  const executeSOS = () => {
    setStep('SENDING');
    
    // Simulate Processing
    setTimeout(() => {
        const timestamp = Date.now();
        const newPatient: PatientData = {
            id: crypto.randomUUID(),
            name: "Emergency SOS",
            age: "Unknown",
            gender: "Unknown",
            symptoms: symptoms || "SOS Activation - Immediate Assistance Required",
            medicalHistory: "Unknown",
            vitals: {
                heartRate: "0",
                bloodPressureSys: "0",
                bloodPressureDia: "0",
                temperature: "0",
                oxygenSaturation: "0",
                respiratoryRate: "0"
            },
            timestamp,
            status: 'pending',
            submissionSource: 'sos',
            requestTeleconsult: true,
            imageUrl: imgSrc || undefined,
            location: location || undefined,
            aiAnalysis: {
                esiLevel: 1,
                esiDescription: "Resuscitation/Emergent",
                esiReasoning: "SOS Button Activated. High Priority Assumption.",
                summary: "Patient activated SOS beacon with visual evidence.",
                recommendedAction: "Dispatch Ambulance Immediately",
                specialistRequired: "Emergency Physician",
                riskFactors: ["Unresponsive", "Trauma"],
                infectionRisk: false,
                infectionProtocol: "Standard",
                confidenceScore: 100
            },
            history: [{
                timestamp,
                type: 'SOS_ALERT',
                details: "SOS Emergency Alert activated. ESI Level 1 assigned automatically.",
                actor: 'SYSTEM',
                meta: { esi: 1 }
            }]
        };
        onSubmit(newPatient);
        setStep('SENT');
    }, 2000);
  };

  if (step === 'SENT') {
      return (
        <div className="fixed inset-0 z-50 bg-slate-900 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-300">
             <div className="w-24 h-24 bg-red-600 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(220,38,38,0.5)] animate-pulse">
                <CheckCircle2 className="w-12 h-12 text-white" />
             </div>
             <h2 className="text-3xl font-bold text-white mb-2 font-mono">{t.sos_alert_sent}</h2>
             <p className="text-slate-300 text-lg mb-8">{t.sos_help_coming}</p>
             <button onClick={onClose} className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition">
                {t.sos_return}
             </button>
        </div>
      );
  }

  return (
    <div className="fixed inset-0 z-[100] bg-slate-950 text-white flex flex-col">
        {/* Header */}
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <Siren className="w-6 h-6 text-red-500 animate-pulse" />
                <h1 className="font-bold text-lg tracking-wider font-mono text-red-500">{t.sos_title}</h1>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-white">Close</button>
        </div>

        {/* Content */}
        <div className="flex-grow flex flex-col relative overflow-hidden">
            
            {/* Step 1: Locating Overlay */}
            {step === 'LOCATING' && (
                <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-900/90 backdrop-blur">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <MapPin className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-500 w-8 h-8" />
                    </div>
                    <p className="mt-4 text-blue-400 font-mono animate-pulse">{t.sos_step_1}</p>
                </div>
            )}

            {/* Confirmation Dialog */}
            {step === 'CONFIRMING' && (
                <div className="absolute inset-0 z-50 bg-slate-900/90 backdrop-blur-sm flex items-center justify-center p-6 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-sm rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="absolute top-0 left-0 w-full h-2 bg-red-500"></div>
                        
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                             <AlertOctagon className="w-10 h-10 text-red-600 animate-pulse" />
                        </div>
                        
                        <h2 className="text-2xl font-bold text-slate-900 mb-2 font-mono uppercase tracking-tight">{ct.title}</h2>
                        <p className="text-slate-500 text-sm font-medium mb-6">{ct.sendingIn}</p>
                        
                        <div className="text-7xl font-black text-slate-900 mb-8 font-mono tabular-nums">
                            {countdown}
                        </div>

                        <p className="text-xs text-slate-400 mb-8 px-4 leading-relaxed">
                            {ct.info}
                        </p>

                        <button 
                            onClick={cancelSOS}
                            className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-red-200 transition-transform active:scale-95 flex items-center justify-center gap-3"
                        >
                            <X className="w-6 h-6" /> {ct.cancel}
                        </button>
                    </div>
                </div>
            )}

            {/* Main Area */}
            <div className="flex-grow flex flex-col">
                
                {/* Camera Viewport */}
                <div className="relative h-1/2 bg-black flex items-center justify-center overflow-hidden">
                    {imgSrc ? (
                        <img src={imgSrc} alt="Captured" className="h-full w-full object-cover" />
                    ) : (
                        <video ref={videoRef} autoPlay playsInline muted className="h-full w-full object-cover" />
                    )}
                    <canvas ref={canvasRef} className="hidden" />
                    
                    {/* Map Overlay */}
                    {location && (
                        <div className="absolute top-4 left-4 bg-black/60 backdrop-blur px-3 py-1 rounded-full border border-white/20 flex items-center gap-2 text-xs font-mono">
                            <MapPin className="w-3 h-3 text-emerald-400" />
                            <span className="text-emerald-400">{t.sos_loc_locked}</span>
                            <span className="text-white opacity-70">{location.lat.toFixed(4)}, {location.lng.toFixed(4)}</span>
                        </div>
                    )}

                    {/* Camera Trigger */}
                    {!imgSrc ? (
                        <button 
                            onClick={capturePhoto}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full border-4 border-white flex items-center justify-center active:scale-95 transition"
                        >
                            <div className="w-12 h-12 bg-white rounded-full"></div>
                        </button>
                    ) : (
                        <button 
                            onClick={() => setImgSrc(null)}
                            className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/80 text-white px-4 py-2 rounded-full flex items-center gap-2 border border-white/20"
                        >
                            <RotateCcw className="w-4 h-4" /> {t.sos_retake}
                        </button>
                    )}
                </div>

                {/* Symptom Input */}
                <div className="h-1/2 bg-slate-900 p-6 flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                        <label className="text-sm font-bold text-slate-400 uppercase font-mono">{t.sos_symptoms_label}</label>
                        <button 
                            onClick={toggleVoiceInput}
                            className={`p-2 rounded-full transition-colors ${isListening ? 'bg-red-500/20 text-red-500 animate-pulse' : 'bg-slate-800 text-slate-400'}`}
                        >
                            {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                        </button>
                    </div>
                    
                    <textarea 
                        value={symptoms}
                        onChange={(e) => setSymptoms(e.target.value)}
                        placeholder={t.sos_symptoms_placeholder}
                        className="w-full flex-grow bg-slate-800 border border-slate-700 rounded-xl p-4 text-white placeholder-slate-500 focus:ring-2 focus:ring-red-500 outline-none resize-none mb-4"
                    />

                    <button 
                        onClick={handleSOSClick}
                        disabled={step === 'SENDING'}
                        className="w-full py-4 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-red-900/50 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                    >
                        {step === 'SENDING' ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" /> {t.sos_sending}
                            </>
                        ) : (
                            <>
                                <AlertOctagon className="w-6 h-6" /> {t.sos_alert_sent.replace('SENT', 'NOW')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    </div>
  );
};