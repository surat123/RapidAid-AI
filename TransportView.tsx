import React, { useState, useEffect, useRef } from 'react';
import { Ambulance, MapPin, Navigation, Car, Shield, Clock, Phone, Loader2, CheckCircle2, Bus, Map as MapIcon, ExternalLink, Siren, Users } from 'lucide-react';

interface TransportViewProps {
  t: any;
}

interface GhostCar {
  id: number;
  lat: number;
  lng: number;
  type: 'AMBULANCE' | 'VOLUNTEER';
  angle: number;
}

export const TransportView: React.FC<TransportViewProps> = ({ t }) => {
  const [step, setStep] = useState<'SELECT' | 'MATCHING' | 'TRACKING'>('SELECT');
  const [selectedType, setSelectedType] = useState<'AMBULANCE' | 'VOLUNTEER'>('AMBULANCE');
  
  // Location & Simulation State
  const [userLoc, setUserLoc] = useState<{lat: number, lng: number} | null>(null);
  const [nearbyCars, setNearbyCars] = useState<GhostCar[]>([]);
  const [assignedDriver, setAssignedDriver] = useState<GhostCar | null>(null);
  const [eta, setEta] = useState(8); // minutes
  const [distance, setDistance] = useState(3.2); // km
  const [progress, setProgress] = useState(0); // 0 to 100% arrival

  // Init Location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        // Generate random nearby cars
        const cars: GhostCar[] = Array.from({ length: 5 }).map((_, i) => ({
          id: i,
          lat: (Math.random() - 0.5) * 0.01, // Relative offset
          lng: (Math.random() - 0.5) * 0.01,
          type: Math.random() > 0.3 ? 'VOLUNTEER' : 'AMBULANCE',
          angle: Math.random() * 360
        }));
        setNearbyCars(cars);
      }, () => {
         // Fallback if denied
         setUserLoc({ lat: 13.7563, lng: 100.5018 });
      });
    }
  }, []);

  // Tracking Simulation
  useEffect(() => {
    let interval: any;
    if (step === 'TRACKING' && progress < 100) {
      interval = setInterval(() => {
        setProgress(p => {
            const next = p + 0.5;
            if (next >= 100) {
                setEta(0);
                setDistance(0);
                return 100;
            }
            return next;
        });
        setEta(prev => Math.max(0, parseFloat((prev - 0.05).toFixed(1))));
        setDistance(prev => Math.max(0, parseFloat((prev - 0.02).toFixed(1))));
      }, 100);
    }
    return () => clearInterval(interval);
  }, [step, progress]);

  const handleRequestRide = () => {
    setStep('MATCHING');
    // Simulate finding driver
    setTimeout(() => {
      const driver = nearbyCars.find(c => c.type === selectedType) || nearbyCars[0];
      setAssignedDriver({
          ...driver,
          lat: 0.005, // Start slightly away relative to center
          lng: 0.005
      });
      setStep('TRACKING');
      setProgress(0);
      setEta(Math.floor(Math.random() * 5) + 5);
      setDistance(Math.floor(Math.random() * 3) + 2);
    }, 2500);
  };

  const getDriverPosition = () => {
    // Interpolate from Start (0.005, 0.005) to Center (0,0) based on progress
    const startX = 40; // % from center
    const startY = -40; // % from center
    
    const currentX = startX * (1 - progress / 100);
    const currentY = startY * (1 - progress / 100);
    
    return { x: currentX, y: currentY };
  };

  const openGoogleMaps = () => {
    if (userLoc) {
      // Open Google Maps with the current user location
      const url = `https://www.google.com/maps/search/?api=1&query=${userLoc.lat},${userLoc.lng}`;
      window.open(url, '_blank');
    }
  };

  return (
    <div className="max-w-md mx-auto h-[calc(100vh-64px)] relative bg-slate-100 overflow-hidden flex flex-col md:max-w-4xl md:h-auto md:min-h-[600px] md:my-8 md:rounded-2xl md:border md:border-slate-200 md:shadow-xl">
      
      {/* MAP LAYER */}
      <div className="absolute inset-0 bg-slate-200 z-0 overflow-hidden group">
        
        {/* Map Grid/Texture */}
        <div className="absolute inset-0 opacity-10" 
            style={{ 
                backgroundImage: `linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)`,
                backgroundSize: '40px 40px'
            }}>
        </div>

        {/* Pulse Radar (When Matching) */}
        {step === 'MATCHING' && (
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-64 h-64 bg-blue-500/10 rounded-full animate-ping"></div>
                <div className="w-48 h-48 bg-blue-500/20 rounded-full animate-ping delay-75 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"></div>
            </div>
        )}

        {/* User Pin (Center) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20">
            <div className="relative">
                <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg z-10 relative"></div>
                <div className="w-12 h-12 bg-blue-500/20 rounded-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
            </div>
            {step === 'SELECT' && <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] px-2 py-1 rounded font-bold whitespace-nowrap">You</div>}
        </div>

        {/* Ghost Cars (Idle Mode) */}
        {step === 'SELECT' && nearbyCars.map(car => (
            <div key={car.id} 
                className="absolute transition-all duration-1000 ease-in-out"
                style={{
                    top: `calc(50% + ${car.lat * 5000}px)`,
                    left: `calc(50% + ${car.lng * 5000}px)`,
                    transform: `rotate(${car.angle}deg)`
                }}
            >
                <div className={`p-1.5 rounded-md shadow-sm opacity-80 ${car.type === 'AMBULANCE' ? 'bg-red-50 text-red-600' : 'bg-slate-50 text-slate-600'}`}>
                    {car.type === 'AMBULANCE' ? <Ambulance className="w-3 h-3" /> : <Car className="w-3 h-3" />}
                </div>
            </div>
        ))}

        {/* Matched Driver (Tracking Mode) */}
        {step === 'TRACKING' && assignedDriver && (
             <div 
                className="absolute z-30 transition-all duration-300 ease-linear"
                style={{
                    top: `calc(50% + ${getDriverPosition().y}%)`,
                    left: `calc(50% + ${getDriverPosition().x}%)`,
                }}
             >
                <div className="relative">
                    <div className={`p-2 rounded-lg shadow-xl border-2 border-white ${selectedType === 'AMBULANCE' ? 'bg-red-600 text-white' : 'bg-blue-600 text-white'}`}>
                        {selectedType === 'AMBULANCE' ? <Ambulance className="w-5 h-5" /> : <Car className="w-5 h-5" />}
                    </div>
                    {/* Bearing Line */}
                    <div className="absolute top-1/2 left-1/2 w-20 h-0.5 bg-slate-400 origin-left -z-10" style={{ transform: 'rotate(135deg)' }}></div>
                </div>
             </div>
        )}
        
        {/* Google Maps Link Button */}
        <button 
            onClick={openGoogleMaps}
            className="absolute top-4 right-4 z-40 bg-white/90 backdrop-blur p-3 rounded-full shadow-lg border border-slate-200 text-slate-700 hover:text-blue-600 transition-transform active:scale-95 flex items-center gap-2"
        >
            <MapIcon className="w-5 h-5" />
            <span className="text-xs font-bold font-mono hidden md:inline">{t.trans_open_maps}</span>
        </button>

      </div>

      {/* UI OVERLAY (Bottom Sheet) */}
      <div className="absolute bottom-0 left-0 right-0 z-40">
        
        {/* Step 1: Selection Panel */}
        {step === 'SELECT' && (
            <div className="bg-white rounded-t-3xl shadow-[0_-5px_25px_rgba(0,0,0,0.1)] p-6 space-y-6 animate-in slide-in-from-bottom duration-300">
                <div className="w-12 h-1.5 bg-slate-200 rounded-full mx-auto mb-2"></div>
                <h3 className="text-lg font-bold text-slate-900 mb-4">{t.trans_select_ride}</h3>
                
                {/* Option 1: Ambulance */}
                <div 
                    onClick={() => setSelectedType('AMBULANCE')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedType === 'AMBULANCE' ? 'border-red-600 bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                            <Ambulance className="w-8 h-8 text-red-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{t.trans_amb_label}</p>
                            <p className="text-xs text-slate-500">{t.trans_amb_desc}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900">5-8 {t.trans_mins}</p>
                        <span className="text-[10px] font-bold bg-red-200 text-red-800 px-1.5 py-0.5 rounded">PRIORITY</span>
                    </div>
                </div>

                {/* Option 2: Volunteer */}
                <div 
                    onClick={() => setSelectedType('VOLUNTEER')}
                    className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${selectedType === 'VOLUNTEER' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                >
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center border border-slate-100 shadow-sm">
                            <Car className="w-8 h-8 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-bold text-slate-900">{t.trans_vol_label}</p>
                            <p className="text-xs text-slate-500">{t.trans_vol_desc}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-slate-900">10-15 {t.trans_mins}</p>
                        <span className="text-[10px] font-bold bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">STD</span>
                    </div>
                </div>

                <button 
                    onClick={handleRequestRide}
                    className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-lg shadow-lg hover:bg-slate-800 transition-transform active:scale-95 flex items-center justify-center gap-2"
                >
                    <Navigation className="w-5 h-5" />
                    Request {selectedType === 'AMBULANCE' ? 'Ambulance' : 'Volunteer'}
                </button>
            </div>
        )}

        {/* Step 2: Matching */}
        {step === 'MATCHING' && (
            <div className="bg-white rounded-t-3xl shadow-2xl p-8 text-center space-y-4 pb-12">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto" />
                <h3 className="text-xl font-bold text-slate-900">{t.trans_finding}</h3>
                <p className="text-slate-500">{t.trans_nearby_units}: {nearbyCars.length}</p>
                <button onClick={() => setStep('SELECT')} className="text-red-500 font-bold text-sm mt-4">{t.trans_cancel}</button>
            </div>
        )}

        {/* Step 3: Tracking / En Route */}
        {step === 'TRACKING' && (
            <div className="bg-white rounded-t-3xl shadow-[0_-5px_30px_rgba(0,0,0,0.15)] p-0 overflow-hidden animate-in slide-in-from-bottom duration-500">
                {/* Status Bar */}
                <div className={`${selectedType === 'AMBULANCE' ? 'bg-red-600' : 'bg-emerald-600'} px-6 py-4 flex justify-between items-center text-white`}>
                    <div className="flex flex-col">
                        <span className="text-xs font-mono opacity-80 uppercase">{progress >= 100 ? t.trans_status_arrived : t.trans_status_en_route}</span>
                        <span className="font-bold text-lg flex items-center gap-2">
                             {progress >= 100 ? "ARRIVED" : `${Math.ceil(eta)} ${t.trans_mins}`}
                             {selectedType === 'AMBULANCE' && <Siren className="w-5 h-5 animate-pulse" />}
                        </span>
                    </div>
                    <div className="text-right">
                        <span className="block font-mono font-bold text-2xl">{distance.toFixed(1)}</span>
                        <span className="text-xs opacity-80">km</span>
                    </div>
                </div>

                {/* Driver Info */}
                <div className="p-6">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-16 h-16 bg-slate-200 rounded-full overflow-hidden border-2 border-white shadow-md">
                            <div className="w-full h-full bg-slate-300 flex items-center justify-center text-slate-500">
                                <Users className="w-8 h-8" />
                            </div>
                        </div>
                        <div className="flex-1">
                            <h4 className="font-bold text-slate-900 text-lg">Somsak P.</h4>
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="flex items-center gap-1 text-yellow-500 font-bold">★ 4.9</span>
                                <span>•</span>
                                <span className="font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-700">{selectedType === 'AMBULANCE' ? 'EMS-99' : '1กข-5678'}</span>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">{selectedType === 'AMBULANCE' ? 'Advanced Life Support Unit' : 'Toyota Camry (Volunteer)'}</p>
                        </div>
                        <button className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 hover:bg-green-200 transition-colors">
                            <Phone className="w-6 h-6" />
                        </button>
                    </div>

                    <div className="flex gap-3">
                         <button className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-lg text-sm hover:bg-slate-200 transition-colors">
                            Share Trip
                        </button>
                        <button 
                            onClick={() => { setStep('SELECT'); }}
                            className="flex-1 py-3 border border-red-200 text-red-600 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors"
                        >
                            {progress >= 100 ? 'Complete' : t.trans_cancel}
                        </button>
                    </div>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};