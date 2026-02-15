import React, { useState } from 'react';
import { PatientData } from '../types';
import * as XLSX from 'xlsx';
import { AlertTriangle, Clock, User, Activity, HeartPulse, Thermometer, CheckCircle, Info, ShieldAlert, Watch, Smartphone, Video, Syringe, Hash, Stethoscope, FileText, AlertOctagon, Monitor, Terminal, ChevronDown, ChevronUp, Biohazard, FileSpreadsheet, Download, BrainCircuit, Siren, Image as ImageIcon, Copy, History, UserCog, Bot, Phone, PhoneOff, Mic, MicOff, VideoOff, Maximize2, X, Loader2, ListFilter } from 'lucide-react';

interface DashboardProps {
  patients: PatientData[];
  onStatusChange: (id: string, newStatus: PatientData['status']) => void;
  onVideoRequest: (id: string) => void;
  t: any;
}

export const Dashboard: React.FC<DashboardProps> = ({ patients, onStatusChange, onVideoRequest, t }) => {
  const [expandedItems, setExpandedItems] = useState<Record<string, 'AI' | 'HISTORY' | null>>({});
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [viewImage, setViewImage] = useState<string | null>(null);
  const [activeVideoCall, setActiveVideoCall] = useState<string | null>(null);
  const [callConnected, setCallConnected] = useState(false);
  const [filterTeleconsult, setFilterTeleconsult] = useState(false);

  const sortedPatients = [...patients]
    .filter(p => !filterTeleconsult || p.requestTeleconsult)
    .sort((a, b) => {
        const statusOrder = { 'pending': 0, 'triaged': 1, 'admitted': 2 };
        if (statusOrder[a.status] !== statusOrder[b.status]) return statusOrder[a.status] - statusOrder[b.status];
        const esiA = a.aiAnalysis?.esiLevel || 5;
        const esiB = b.aiAnalysis?.esiLevel || 5;
        if (esiA !== esiB) return esiA - esiB;
        return b.timestamp - a.timestamp;
    });

  const activePatient = patients.find(p => p.id === activeVideoCall);

  const toggleExpand = (id: string, type: 'AI' | 'HISTORY') => {
    setExpandedItems(prev => ({
      ...prev,
      [id]: prev[id] === type ? null : type
    }));
  };

  const handleStartVideoCall = (id: string) => {
      setActiveVideoCall(id);
      setCallConnected(false);
      setTimeout(() => setCallConnected(true), 2500); // Simulate connection
  };

  const handleEndVideoCall = () => {
      setActiveVideoCall(null);
      setCallConnected(false);
  };

  const getBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-red-600 border-red-700 text-white';
      case 2: return 'bg-orange-500 border-orange-600 text-white';
      case 3: return 'bg-yellow-400 border-yellow-500 text-yellow-900';
      case 4: return 'bg-green-500 border-green-600 text-white';
      case 5: return 'bg-blue-500 border-blue-600 text-white';
      default: return 'bg-slate-500 border-slate-600';
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch(status) {
      case 'pending': return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'triaged': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'admitted': return 'bg-green-50 text-green-700 border-green-200';
      default: return 'bg-slate-50 text-slate-700 border-slate-200';
    }
  };

  const flattenPatientData = () => {
    return patients.map(p => ({
        ID: p.id,
        Timestamp: new Date(p.timestamp).toLocaleString(),
        Name: p.name,
        Age: p.age,
        Gender: p.gender,
        Status: p.status,
        Source: p.submissionSource,
        ESI_Level: p.aiAnalysis?.esiLevel || 'N/A',
        ESI_Desc: p.aiAnalysis?.esiDescription || '',
        AI_Confidence: p.aiAnalysis?.confidenceScore + '%' || '0%',
        Symptoms: p.symptoms,
        Medical_History: p.medicalHistory,
        HR: p.vitals.heartRate,
        BP_Sys: p.vitals.bloodPressureSys,
        BP_Dia: p.vitals.bloodPressureDia,
        SpO2: p.vitals.oxygenSaturation,
        Temp: p.vitals.temperature,
        Resp_Rate: p.vitals.respiratoryRate,
        Infection_Risk: p.aiAnalysis?.infectionRisk ? 'Yes' : 'No',
        Infection_Protocol: p.aiAnalysis?.infectionProtocol || '',
        Teleconsult_Req: p.requestTeleconsult ? 'Yes' : 'No',
        Specialist: p.aiAnalysis?.specialistRequired || 'General',
        AI_Reasoning: p.aiAnalysis?.esiReasoning || ''
    }));
  };

  const handleExportCSV = () => {
    const data = flattenPatientData();
    if (data.length === 0) return;
    
    const headers = Object.keys(data[0]);
    const csvContent = [
        headers.join(','),
        ...data.map(row => headers.map(fieldName => {
            const val = (row as any)[fieldName]?.toString().replace(/"/g, '""') || '';
            return `"${val}"`;
        }).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `RapidAid_Data_${new Date().toISOString().slice(0,10)}.csv`;
    link.click();
  };

  const handleExportExcel = () => {
     const data = flattenPatientData();
     if (data.length === 0) return;

     const worksheet = XLSX.utils.json_to_sheet(data);
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "Patients");
     XLSX.writeFile(workbook, `RapidAid_Export_${new Date().toISOString().slice(0,10)}.xlsx`);
  };

  if (patients.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-140px)] text-slate-400 bg-grid-pattern">
        <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 border border-slate-200">
            <Monitor className="w-10 h-10 text-slate-300" />
        </div>
        <h3 className="text-xl font-bold text-slate-700 font-mono mb-2">{t.dash_system_idle}</h3>
        <p className="font-mono text-sm">{t.dash_waiting}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 bg-grid-pattern min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 bg-white p-4 rounded-lg border border-slate-200 shadow-sm gap-4">
        <div>
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <Monitor className="w-5 h-5 text-blue-600" />
            <span className="font-mono tracking-tight">{t.dash_title}</span>
            </h2>
            <p className="text-xs text-slate-500 font-mono mt-1">{t.dash_subtitle}</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
            <button 
                onClick={() => setFilterTeleconsult(!filterTeleconsult)}
                className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold transition-colors font-mono rounded border ${filterTeleconsult ? 'bg-indigo-600 text-white border-indigo-700' : 'text-slate-600 bg-slate-100 border-slate-200 hover:bg-slate-200'}`}
            >
                <Video className="w-4 h-4" /> {t.dash_filter_tele}
            </button>
            <div className="h-4 w-px bg-slate-200 hidden md:block mx-1"></div>
            <button 
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded border border-slate-200 transition-colors font-mono"
            >
                <FileText className="w-4 h-4" /> {t.dash_export_csv}
            </button>
            <button 
                onClick={handleExportExcel}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors font-mono"
            >
                <FileSpreadsheet className="w-4 h-4" /> {t.dash_export_excel}
            </button>
            <div className="h-4 w-px bg-slate-200 hidden md:block mx-1"></div>
            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-mono font-bold rounded border border-blue-100">
                {t.dash_active_nodes}: {sortedPatients.length}
            </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {sortedPatients.map((patient) => (
          <div key={patient.id} className={`bg-white rounded-lg shadow-sm border flex flex-col hover:shadow-md transition-all duration-300 ${patient.status === 'admitted' ? 'opacity-60 border-slate-200' : 'border-slate-300'}`}>
            
            {/* Technical Header */}
            <div className={`px-5 py-3 border-b flex justify-between items-start bg-slate-50/50 ${patient.aiAnalysis?.esiLevel === 1 && patient.status !== 'admitted' ? 'bg-red-50/50' : ''}`}>
              <div className="w-full">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold font-mono border shadow-sm ${getBadgeColor(patient.aiAnalysis?.esiLevel || 5)}`}>
                            ESI-{patient.aiAnalysis?.esiLevel}
                        </span>
                        
                        {/* Confidence Score Badge */}
                        <div className="flex items-center gap-1 px-1.5 py-1 rounded-md bg-white border border-slate-200 shadow-sm" title="AI Confidence Score">
                            <BrainCircuit className="w-3 h-3 text-indigo-500" />
                            <span className={`text-[10px] font-bold font-mono ${patient.aiAnalysis?.confidenceScore && patient.aiAnalysis.confidenceScore > 80 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {patient.aiAnalysis?.confidenceScore || 0}%
                            </span>
                        </div>

                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold font-mono uppercase border ${getStatusBadgeStyles(patient.status)}`}>
                            {patient.status === 'pending' ? t.status_pending : patient.status === 'triaged' ? t.status_triaged : t.status_admitted}
                        </span>
                    </div>
                    <div className="flex gap-2 text-slate-400">
                         {patient.aiAnalysis?.esiLevel === 1 && patient.status !== 'admitted' && <AlertTriangle className="text-red-600 w-5 h-5 animate-pulse" />}
                         {patient.submissionSource === 'wearable' && <Watch className="w-4 h-4 text-slate-500" />}
                         {patient.submissionSource === 'mobile_app' && <Smartphone className="w-4 h-4 text-slate-500" />}
                         {patient.submissionSource === 'sos' && <Siren className="w-5 h-5 text-red-600 animate-bounce" />}
                    </div>
                </div>
                
                <h3 className="text-lg font-bold text-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {patient.name}
                        {patient.aiAnalysis?.infectionRisk && (
                            <div className="relative">
                                <button 
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setActiveTooltip(activeTooltip === patient.id ? null : patient.id);
                                    }}
                                    className="p-1 rounded-md bg-purple-100 hover:bg-purple-200 text-purple-700 transition-colors"
                                >
                                    <Biohazard className="w-4 h-4" />
                                </button>
                                {activeTooltip === patient.id && (
                                    <div className="absolute left-0 bottom-full mb-2 w-64 p-3 bg-slate-900 text-slate-200 text-xs rounded-lg shadow-xl z-20 border border-slate-700">
                                        <div className="font-bold text-purple-400 mb-1 flex items-center gap-1.5 font-mono uppercase">
                                             <ShieldAlert className="w-3 h-3" />
                                             {t.dash_bio_protocol}
                                        </div>
                                        <p className="leading-relaxed">{patient.aiAnalysis.infectionProtocol}</p>
                                        <div className="absolute -bottom-1 left-3 w-2 h-2 bg-slate-900 transform rotate-45"></div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2 group cursor-pointer" title="Click to copy ID" onClick={() => navigator.clipboard.writeText(patient.id)}>
                        <span className="text-[10px] font-mono text-slate-400 font-normal bg-white px-1.5 py-0.5 rounded border border-slate-200 group-hover:bg-slate-50 transition-colors">
                            ID:{patient.id.slice(0, 8)}
                        </span>
                    </div>
                </h3>
                
                <div className="flex items-center text-xs text-slate-500 mt-1 gap-4 font-mono">
                    <span className="flex items-center gap-1.5"><User className="w-3 h-3" /> {patient.age}Y / {patient.gender === 'Male' ? 'M' : 'F'}</span>
                    <span className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {new Date(patient.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false })}</span>
                </div>
              </div>
            </div>

            {/* Protocol Banner */}
            {patient.aiAnalysis?.infectionRisk && (
                <div className="bg-purple-50 px-5 py-3 border-b border-purple-200 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-purple-100 rounded-full -mr-8 -mt-8 opacity-50 pointer-events-none"></div>
                    <div className="p-2 bg-purple-100 rounded-lg border border-purple-200 shadow-sm">
                         <ShieldAlert className="w-5 h-5 text-purple-700" />
                    </div>
                    <div className="flex-1 relative z-10">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider font-mono">{t.dash_bio_protocol}</span>
                            <span className="px-1.5 py-0.5 bg-purple-600 text-white text-[9px] font-bold rounded-full animate-pulse shadow-sm">HIGH RISK</span>
                        </div>
                        <span className="text-sm font-bold text-slate-800 leading-tight block">{patient.aiAnalysis.infectionProtocol}</span>
                    </div>
                </div>
            )}

            {/* SOS Image Preview */}
            {patient.imageUrl && (
                 <div className="bg-slate-900 px-5 py-2 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                        <ImageIcon className="w-4 h-4 text-slate-400" />
                        <span className="text-xs text-slate-300 font-bold">{t.dash_img_proof}</span>
                    </div>
                    <button 
                        onClick={() => setViewImage(patient.imageUrl!)}
                        className="text-[10px] bg-slate-700 hover:bg-slate-600 text-white px-2 py-1 rounded transition"
                    >
                        VIEW
                    </button>
                 </div>
            )}

            {/* Main Content */}
            <div className="p-5 flex-1 flex flex-col space-y-4">
                
                {/* Vitals Console */}
                <div className="bg-slate-900 rounded-md p-3 border border-slate-800 text-slate-300 font-mono text-xs">
                    <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                            <span className="text-slate-500">HR</span>
                            <span className="text-emerald-400 font-bold">{patient.vitals.heartRate} <span className="text-[10px] text-slate-600">bpm</span></span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-800 pb-1">
                            <span className="text-slate-500">BP</span>
                            <span className="text-blue-400 font-bold">{patient.vitals.bloodPressureSys}/{patient.vitals.bloodPressureDia}</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500">SpO2</span>
                            <span className="text-cyan-400 font-bold">{patient.vitals.oxygenSaturation}%</span>
                        </div>
                        <div className="flex justify-between items-center pt-1">
                            <span className="text-slate-500">Temp</span>
                            <span className={`font-bold ${parseFloat(patient.vitals.temperature) > 37.5 ? 'text-orange-400' : 'text-slate-300'}`}>{patient.vitals.temperature}°C</span>
                        </div>
                    </div>
                </div>

                {/* AI & History Toggles */}
                <div className="flex gap-2">
                     <button 
                        type="button"
                        onClick={() => toggleExpand(patient.id, 'AI')}
                        className={`flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider font-mono p-1.5 rounded transition-colors border ${expandedItems[patient.id] === 'AI' ? 'bg-blue-50 text-blue-600 border-blue-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <Terminal className="w-3 h-3 mr-1.5" /> {t.dash_ai_log}
                    </button>
                    <button 
                        type="button"
                        onClick={() => toggleExpand(patient.id, 'HISTORY')}
                        className={`flex-1 flex items-center justify-center text-[10px] font-bold uppercase tracking-wider font-mono p-1.5 rounded transition-colors border ${expandedItems[patient.id] === 'HISTORY' ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100'}`}
                    >
                        <History className="w-3 h-3 mr-1.5" /> {t.dash_history_log}
                    </button>
                </div>
                
                {/* AI Log Expansion */}
                {expandedItems[patient.id] === 'AI' && (
                    <div className="bg-slate-50 rounded-md border border-slate-200 p-3 text-xs leading-relaxed text-slate-700 font-mono animate-in slide-in-from-top-1 duration-200 fade-in-0">
                        <div className="flex justify-between items-center mb-2 pb-2 border-b border-slate-200">
                            <span className="text-[10px] text-slate-400">UUID: {patient.id}</span>
                            <button onClick={() => navigator.clipboard.writeText(patient.id)} className="text-slate-400 hover:text-blue-500">
                                <Copy className="w-3 h-3" />
                            </button>
                        </div>
                        <p>
                            <span className="text-blue-600 font-bold">{">"}</span> {patient.aiAnalysis?.esiReasoning}
                        </p>
                         {patient.aiAnalysis?.riskFactors && patient.aiAnalysis.riskFactors.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-200">
                                {patient.aiAnalysis.riskFactors.map((rf, idx) => (
                                    <span key={idx} className="px-2 py-1 bg-red-50 text-red-700 text-[10px] font-bold uppercase rounded border border-red-100 font-mono">
                                        ! {rf}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* History Expansion */}
                {expandedItems[patient.id] === 'HISTORY' && (
                    <div className="bg-slate-50 rounded-md border border-slate-200 p-3 animate-in slide-in-from-top-1 duration-200 fade-in-0 max-h-48 overflow-y-auto">
                        <div className="space-y-3 relative">
                            {/* Vertical Line */}
                            <div className="absolute top-2 bottom-2 left-[5px] w-px bg-slate-200"></div>

                            {patient.history && patient.history.map((event, idx) => (
                                <div key={idx} className="relative pl-4 flex flex-col gap-1">
                                    <div className={`absolute top-1.5 left-0 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm z-10 ${event.type === 'SOS_ALERT' ? 'bg-red-500' : event.type === 'CREATION' ? 'bg-blue-500' : 'bg-slate-400'}`}></div>
                                    <div className="flex justify-between items-center text-[10px] font-mono text-slate-400">
                                        <span>{new Date(event.timestamp).toLocaleTimeString()}</span>
                                        <span className="bg-slate-200 px-1 rounded text-slate-600 uppercase">{event.actor}</span>
                                    </div>
                                    <div className="text-xs text-slate-700 font-medium">
                                        {event.type === 'SOS_ALERT' && <Siren className="w-3 h-3 inline mr-1 text-red-500" />}
                                        {event.details}
                                    </div>
                                    {event.meta && event.meta.from && event.meta.to && (
                                        <div className="text-[10px] flex items-center gap-2 mt-0.5">
                                            <span className={`px-1.5 rounded border uppercase ${getStatusBadgeStyles(event.meta.from)}`}>{event.meta.from}</span>
                                            <span className="text-slate-400">→</span>
                                            <span className={`px-1.5 rounded border uppercase ${getStatusBadgeStyles(event.meta.to)}`}>{event.meta.to}</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {(!patient.history || patient.history.length === 0) && (
                                <p className="text-xs text-slate-400 italic text-center py-2">No history recorded.</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Medical Summary */}
                <div className="pt-2 border-t border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">{t.dash_clinical_summary}</p>
                    <p className="text-sm text-slate-600 leading-snug">{patient.aiAnalysis?.summary}</p>
                </div>
            </div>

            {/* Action Footer */}
            <div className="px-5 py-3 bg-slate-50 border-t border-slate-200 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                     <div className="flex items-center gap-2">
                        <div className="p-1.5 bg-white border border-slate-200 rounded text-indigo-600">
                            <Stethoscope className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-slate-400 uppercase font-mono">{t.dash_referral}</span>
                            <span className="text-xs font-bold text-slate-800">{patient.aiAnalysis?.specialistRequired || t.dash_general}</span>
                        </div>
                     </div>
                </div>
                
                {/* Video Call Controls */}
                <div className="flex justify-end">
                    {patient.requestTeleconsult ? (
                        <button 
                            onClick={() => handleStartVideoCall(patient.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white text-xs font-bold rounded shadow-sm hover:bg-indigo-700 transition-colors animate-pulse"
                        >
                            <Video className="w-3 h-3" /> {t.dash_btn_video_start}
                        </button>
                    ) : (
                        <button 
                            onClick={() => onVideoRequest(patient.id)}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white text-slate-600 text-xs font-bold border border-slate-200 rounded hover:border-indigo-300 hover:text-indigo-600 transition-colors"
                        >
                            <Video className="w-3 h-3" /> {t.dash_btn_video_request}
                        </button>
                    )}
                </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-medium font-mono">{t.dash_set_status}:</span>
                  <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg border border-slate-200">
                    {(['pending', 'triaged', 'admitted'] as const).map((statusOption) => (
                      <button
                        key={statusOption}
                        onClick={() => onStatusChange(patient.id, statusOption)}
                        className={`
                          py-1.5 text-[10px] font-bold uppercase rounded-md transition-all flex justify-center items-center font-mono
                          ${patient.status === statusOption 
                            ? 'bg-white text-blue-600 shadow-sm border border-slate-200 ring-1 ring-slate-200' 
                            : 'text-slate-400 hover:text-slate-600 hover:bg-slate-200/50'
                          }
                        `}
                      >
                        {statusOption === 'pending' ? t.status_pending : statusOption === 'triaged' ? t.status_triaged : t.status_admitted}
                      </button>
                    ))}
                  </div>
                </div>
            </div>
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {viewImage && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4" onClick={() => setViewImage(null)}>
              <div className="relative max-w-4xl max-h-full">
                  <img src={viewImage} alt="Emergency Proof" className="max-w-full max-h-[90vh] rounded-lg border-2 border-slate-700" />
                  <button onClick={() => setViewImage(null)} className="absolute top-4 right-4 text-white bg-black/50 p-2 rounded-full hover:bg-white/20">
                      Close
                  </button>
              </div>
          </div>
      )}

      {/* Video Call Simulation Modal */}
      {activeVideoCall && activePatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 animate-in fade-in">
              <div className="bg-slate-900 w-full max-w-6xl h-[85vh] rounded-2xl overflow-hidden shadow-2xl flex relative border border-slate-700">
                  
                  {/* Left Column: Video Feed */}
                  <div className="flex-1 flex flex-col relative bg-black border-r border-slate-800">
                      {/* Header Overlay */}
                      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-start z-10 bg-gradient-to-b from-black/80 to-transparent">
                           <div className="flex items-center gap-3">
                               <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_red]"></div>
                               <div>
                                   <h3 className="text-white font-bold font-mono leading-none">{t.dash_video_modal_title}</h3>
                                   <span className="text-[10px] text-slate-400 font-mono">ID: {activeVideoCall.slice(0,8)}</span>
                               </div>
                           </div>
                           <div className="text-slate-300 font-mono text-sm bg-black/50 px-2 py-1 rounded border border-slate-700">
                               {callConnected ? "00:42" : "CONNECTING..."}
                           </div>
                      </div>

                      {/* Video Area */}
                      <div className="flex-1 flex items-center justify-center relative">
                          {!callConnected ? (
                              <div className="flex flex-col items-center">
                                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mb-4" />
                                  <p className="text-blue-400 font-mono text-sm animate-pulse">{t.dash_video_connecting}</p>
                              </div>
                          ) : (
                              <div className="w-full h-full relative">
                                  {/* Mock Patient Feed */}
                                  <div className="absolute inset-0 flex items-center justify-center bg-slate-800">
                                      <User className="w-32 h-32 text-slate-600" />
                                      <p className="absolute bottom-1/3 text-slate-500 font-mono text-sm">{t.dash_video_connected}</p>
                                  </div>
                                  {/* Self View (PIP) */}
                                  <div className="absolute bottom-6 right-6 w-48 h-32 bg-slate-900 border-2 border-slate-700 rounded-lg shadow-lg flex items-center justify-center overflow-hidden">
                                      <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center">
                                           <UserCog className="w-6 h-6 text-slate-500" />
                                      </div>
                                  </div>
                              </div>
                          )}
                      </div>

                      {/* Bottom Controls */}
                      <div className="bg-slate-900/90 p-6 flex justify-center gap-6 backdrop-blur border-t border-slate-800">
                           <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"><Mic className="w-6 h-6" /></button>
                           <button className="p-4 rounded-full bg-slate-800 text-white hover:bg-slate-700 transition-colors border border-slate-700"><Video className="w-6 h-6" /></button>
                           <button onClick={handleEndVideoCall} className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors shadow-lg shadow-red-900/50"><PhoneOff className="w-6 h-6" /></button>
                      </div>
                  </div>

                  {/* Right Column: Console Data */}
                  <div className="w-96 bg-slate-900 border-l border-slate-800 flex flex-col hidden lg:flex">
                      
                      {/* Patient Info */}
                      <div className="p-5 border-b border-slate-800 bg-slate-800/50">
                          <h4 className="text-white font-bold text-lg mb-1">{activePatient.name}</h4>
                          <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                              <span>{activePatient.age}Y / {activePatient.gender}</span>
                              <span className={`px-1.5 py-0.5 rounded ${getBadgeColor(activePatient.aiAnalysis?.esiLevel || 5)}`}>ESI-{activePatient.aiAnalysis?.esiLevel}</span>
                          </div>
                      </div>

                      {/* Vitals */}
                      <div className="p-5 border-b border-slate-800">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 font-mono flex items-center gap-2">
                              <Activity className="w-3 h-3 text-emerald-500" /> {t.dash_console_vitals}
                          </h5>
                          <div className="grid grid-cols-2 gap-4">
                              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                  <span className="text-slate-500 text-[10px] block mb-1">HEART RATE</span>
                                  <span className="text-emerald-400 font-mono font-bold text-xl">{activePatient.vitals.heartRate} <span className="text-xs">bpm</span></span>
                              </div>
                              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700">
                                  <span className="text-slate-500 text-[10px] block mb-1">OXYGEN</span>
                                  <span className="text-blue-400 font-mono font-bold text-xl">{activePatient.vitals.oxygenSaturation}<span className="text-xs">%</span></span>
                              </div>
                              <div className="bg-slate-800 p-3 rounded-lg border border-slate-700 col-span-2 flex justify-between items-center">
                                  <div>
                                      <span className="text-slate-500 text-[10px] block mb-1">BLOOD PRESSURE</span>
                                      <span className="text-white font-mono font-bold text-lg">{activePatient.vitals.bloodPressureSys}/{activePatient.vitals.bloodPressureDia}</span>
                                  </div>
                                  <div>
                                      <span className="text-slate-500 text-[10px] block mb-1">TEMP</span>
                                      <span className="text-orange-400 font-mono font-bold text-lg">{activePatient.vitals.temperature}°C</span>
                                  </div>
                              </div>
                          </div>
                      </div>

                      {/* Notes / Scribe */}
                      <div className="flex-1 p-5 flex flex-col">
                          <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 font-mono flex items-center gap-2">
                              <FileText className="w-3 h-3 text-blue-500" /> {t.dash_console_notes}
                          </h5>
                          <div className="flex-1 bg-slate-800 rounded-lg p-3 border border-slate-700 font-mono text-xs text-slate-300 leading-relaxed overflow-y-auto">
                              <p className="opacity-50 italic mb-2">// Automated transcription active...</p>
                              <p><span className="text-blue-400">[00:15] Dr:</span> Can you describe the pain intensity?</p>
                              <p><span className="text-emerald-400">[00:20] Pt:</span> It feels like a sharp stabbing in my chest.</p>
                              <p><span className="text-blue-400">[00:25] Dr:</span> Does it radiate to your arm?</p>
                          </div>
                          <div className="mt-4 flex gap-2">
                               <button className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded font-bold text-xs transition-colors">ADMIT</button>
                               <button className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded font-bold text-xs transition-colors">DISCHARGE</button>
                          </div>
                      </div>

                  </div>
              </div>
          </div>
      )}
    </div>
  );
};