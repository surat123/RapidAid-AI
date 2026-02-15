import React, { useState, useRef } from 'react';
import { FileSearch, Upload, ShieldCheck, AlertTriangle, ShieldAlert, Binary, Info, FileText, Check, X, RefreshCw, Activity } from 'lucide-react';

interface RansomwareViewProps {
  t: any;
}

interface AnalysisResult {
  fileName: string;
  fileSize: string;
  magicBytes: string;
  detectedType: string;
  entropy: number;
  isEncrypted: boolean;
  status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS';
  details: string;
  timestamp: string;
}

// Known Magic Bytes
const MAGIC_SIGNATURES: Record<string, string> = {
  '89 50 4E 47': 'PNG Image',
  'FF D8 FF': 'JPEG Image',
  '25 50 44 46': 'PDF Document',
  '50 4B 03 04': 'ZIP Archive',
  '4D 5A': 'Windows Executable (EXE)',
  '7F 45 4C 46': 'ELF Executable',
  '49 44 33': 'MP3 Audio',
  '00 00 00 18': 'MP4 Video',
};

export const RansomwareView: React.FC<RansomwareViewProps> = ({ t }) => {
  const [file, setFile] = useState<File | null>(null);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate Shannon Entropy
  const calculateEntropy = (data: Uint8Array): number => {
    const frequency = new Array(256).fill(0);
    for (let i = 0; i < data.length; i++) {
      frequency[data[i]]++;
    }
    
    let entropy = 0;
    for (let i = 0; i < 256; i++) {
      if (frequency[i] > 0) {
        const p = frequency[i] / data.length;
        entropy -= p * Math.log2(p);
      }
    }
    return entropy;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const analyzeFile = async () => {
    if (!file) return;
    setScanning(true);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const bytes = new Uint8Array(arrayBuffer);
      
      // 1. Get Magic Bytes (First 4 bytes)
      const headerBytes = Array.from(bytes.slice(0, 4))
        .map(b => b.toString(16).padStart(2, '0').toUpperCase())
        .join(' ');
      
      // 2. Determine File Type from Magic Bytes
      let detectedType = "Unknown / Binary";
      for (const [sig, type] of Object.entries(MAGIC_SIGNATURES)) {
         if (headerBytes.startsWith(sig)) {
             detectedType = type;
             break;
         }
      }

      // 3. Calculate Entropy
      // High entropy (> 7.5) often indicates encryption or compression
      const entropy = calculateEntropy(bytes);
      const isHighEntropy = entropy > 7.2;

      // 4. Heuristics & Rules
      let status: 'SAFE' | 'SUSPICIOUS' | 'MALICIOUS' = 'SAFE';
      let details = "Structure appears normal.";

      // Rule: Executable disguised as document
      const ext = file.name.split('.').pop()?.toLowerCase();
      if ((ext === 'pdf' || ext === 'jpg' || ext === 'txt') && detectedType.includes('Executable')) {
          status = 'MALICIOUS';
          details = "CRITICAL: Executable detected with deceptive extension.";
      } 
      // Rule: High entropy + unknown format (potential ransomware encrypted file)
      else if (isHighEntropy && detectedType === "Unknown / Binary") {
          status = 'SUSPICIOUS';
          details = "High entropy detected in unknown file format. Possible encryption or packed malware.";
      }
      // Rule: Double extension
      else if (file.name.match(/\.[a-z]{3,4}\.[a-z]{3,4}$/i)) {
          status = 'SUSPICIOUS';
          details = "Double extension detected (potential phishing).";
      }

      // Simulation delay for effect
      setTimeout(() => {
        setResult({
          fileName: file.name,
          fileSize: (file.size / 1024).toFixed(2) + ' KB',
          magicBytes: headerBytes,
          detectedType,
          entropy,
          isEncrypted: isHighEntropy,
          status,
          details,
          timestamp: new Date().toLocaleTimeString()
        });
        setScanning(false);
      }, 1500);

    } catch (error) {
      console.error("Analysis failed", error);
      setScanning(false);
    }
  };

  const reset = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getStatusColor = (status: string) => {
      switch(status) {
          case 'SAFE': return 'text-emerald-500 bg-emerald-50 border-emerald-200';
          case 'SUSPICIOUS': return 'text-amber-500 bg-amber-50 border-amber-200';
          case 'MALICIOUS': return 'text-red-500 bg-red-50 border-red-200';
          default: return 'text-slate-500 bg-slate-50 border-slate-200';
      }
  };

  const getStatusIcon = (status: string) => {
      switch(status) {
          case 'SAFE': return <ShieldCheck className="w-12 h-12 text-emerald-500" />;
          case 'SUSPICIOUS': return <AlertTriangle className="w-12 h-12 text-amber-500" />;
          case 'MALICIOUS': return <ShieldAlert className="w-12 h-12 text-red-500" />;
          default: return <Info className="w-12 h-12 text-slate-500" />;
      }
  };

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      
      {/* Header */}
      <div className="mb-8 bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="relative z-10">
             <h2 className="text-2xl font-bold flex items-center gap-3 font-mono">
                <FileSearch className="w-8 h-8 text-emerald-400" />
                {t.ransom_title}
            </h2>
            <p className="text-slate-400 mt-1 max-w-lg text-sm">{t.ransom_subtitle}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Upload Section */}
        <div className="space-y-6">
            <div 
                className={`border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center text-center transition-all bg-white shadow-sm ${file ? 'border-emerald-500 bg-emerald-50/10' : 'border-slate-300 hover:border-blue-400 hover:bg-slate-50'}`}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                    e.preventDefault();
                    if(e.dataTransfer.files && e.dataTransfer.files[0]) {
                        setFile(e.dataTransfer.files[0]);
                        setResult(null);
                    }
                }}
            >
                <input 
                    type="file" 
                    ref={fileInputRef}
                    className="hidden" 
                    onChange={handleFileChange}
                />
                
                {file ? (
                    <div className="animate-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                            <FileText className="w-8 h-8 text-emerald-600" />
                        </div>
                        <p className="font-bold text-slate-800 text-lg break-all px-4">{file.name}</p>
                        <p className="text-sm text-slate-500 font-mono mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                        <button 
                            onClick={reset}
                            className="mt-4 text-xs text-red-500 hover:text-red-700 font-bold underline"
                        >
                            Remove / Change File
                        </button>
                    </div>
                ) : (
                    <div>
                        <div className="w-16 h-16 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-50 transition-colors">
                            <Upload className="w-8 h-8 text-slate-400 group-hover:text-blue-500" />
                        </div>
                        <h3 className="font-bold text-slate-700 text-lg">{t.ransom_drop_title}</h3>
                        <p className="text-sm text-slate-500 mt-2">{t.ransom_drop_desc}</p>
                        <button 
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-6 px-6 py-2 bg-slate-900 text-white rounded-lg font-bold text-sm hover:bg-slate-800 transition-colors shadow-lg"
                        >
                            Select File
                        </button>
                    </div>
                )}
            </div>

            {file && !result && (
                <button
                    onClick={analyzeFile}
                    disabled={scanning}
                    className={`w-full py-4 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${scanning ? 'bg-slate-400 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'}`}
                >
                    {scanning ? (
                        <>
                            <Binary className="w-5 h-5 animate-pulse" />
                            {t.ransom_analyzing}
                        </>
                    ) : (
                        <>
                            <FileSearch className="w-5 h-5" />
                            {t.ransom_btn_analyze}
                        </>
                    )}
                </button>
            )}
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 min-h-[400px] flex flex-col">
            <h3 className="font-bold text-slate-800 flex items-center gap-2 mb-6 uppercase tracking-wide text-sm font-mono border-b border-slate-100 pb-2">
                <Activity className="w-4 h-4 text-slate-400" />
                {t.ransom_details}
            </h3>

            {!result ? (
                <div className="flex-grow flex flex-col items-center justify-center text-slate-400 text-center opacity-60">
                    <Binary className="w-16 h-16 mb-4 text-slate-200" />
                    <p className="font-mono text-sm">Waiting for file analysis...</p>
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-right duration-500 space-y-6">
                    
                    {/* Status Banner */}
                    <div className={`p-4 rounded-xl border flex items-center gap-4 ${getStatusColor(result.status)}`}>
                        <div className="shrink-0">
                            {getStatusIcon(result.status)}
                        </div>
                        <div>
                            <h4 className="font-bold text-lg">
                                {result.status === 'SAFE' && t.ransom_result_safe}
                                {result.status === 'SUSPICIOUS' && t.ransom_result_suspicious}
                                {result.status === 'MALICIOUS' && t.ransom_result_malicious}
                            </h4>
                            <p className="text-xs font-mono mt-1 opacity-90">{result.details}</p>
                        </div>
                    </div>

                    {/* Technical Details */}
                    <div className="space-y-4 font-mono text-sm">
                        
                        {/* Magic Bytes */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">{t.ransom_magic_bytes}</span>
                            <div className="flex justify-between items-center">
                                <span className="font-bold text-indigo-600 tracking-widest">{result.magicBytes}</span>
                                <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">{result.detectedType}</span>
                            </div>
                        </div>

                        {/* Entropy */}
                        <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                            <span className="block text-[10px] text-slate-400 uppercase font-bold mb-1">{t.ransom_entropy}</span>
                            <div className="flex items-center gap-4">
                                <div className="flex-grow h-2 bg-slate-200 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full rounded-full ${result.entropy > 7.5 ? 'bg-red-500' : 'bg-blue-500'}`} 
                                        style={{ width: `${(result.entropy / 8) * 100}%` }}
                                    ></div>
                                </div>
                                <span className="font-bold text-slate-700">{result.entropy.toFixed(3)} / 8.0</span>
                            </div>
                            <p className="text-[10px] text-slate-400 mt-1 italic">High entropy ({">"} 7.5) indicates compression or encryption.</p>
                        </div>

                        {/* Extension Match */}
                        <div className="flex items-center justify-between p-3 border-b border-slate-100">
                            <span className="text-slate-500">{t.ransom_ext_match}</span>
                            {result.status === 'MALICIOUS' ? (
                                <span className="text-red-500 font-bold flex items-center gap-1"><X className="w-4 h-4" /> MISMATCH</span>
                            ) : (
                                <span className="text-emerald-500 font-bold flex items-center gap-1"><Check className="w-4 h-4" /> VERIFIED</span>
                            )}
                        </div>

                        <div className="flex items-center justify-between p-3">
                            <span className="text-slate-500">Analysis Time</span>
                            <span className="text-slate-800">{result.timestamp}</span>
                        </div>

                    </div>

                    <button 
                        onClick={reset}
                        className="w-full py-2 text-slate-500 hover:text-slate-800 text-xs font-bold flex items-center justify-center gap-2 mt-4"
                    >
                        <RefreshCw className="w-3 h-3" /> Analyze Another File
                    </button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
};