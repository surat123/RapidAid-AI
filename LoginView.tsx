import React, { useState } from 'react';
import { User, UserRole } from '../types';
import { Lock, User as UserIcon, Shield, ChevronRight, Fingerprint, Activity, Mail, Chrome, Facebook, LogIn, UserPlus, CheckCircle2 } from 'lucide-react';

interface LoginViewProps {
  onLogin: (user: User) => void;
  t: any;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, t }) => {
  const [mode, setMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('STAFF');
  const [loading, setLoading] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [biometricSuccess, setBiometricSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() && !email.trim()) return;
    
    setLoading(true);
    
    // Simulate API delay
    setTimeout(() => {
        // Mock User Logic
        const user: User = {
            id: crypto.randomUUID(),
            name: username || email.split('@')[0] || 'User',
            role: role,
            department: role === 'ADMIN' ? 'Command Center' : 'Triage Unit'
        };
        onLogin(user);
    }, 1200);
  };

  const handleSocialLogin = (provider: 'GOOGLE' | 'FACEBOOK') => {
      setLoading(true);
      setTimeout(() => {
        const user: User = {
            id: crypto.randomUUID(),
            name: provider === 'GOOGLE' ? 'Google User' : 'Facebook User',
            role: 'STAFF', // Default role for social login
            department: 'External'
        };
        onLogin(user);
      }, 1500);
  };

  const handleBiometricLogin = () => {
    if (loading || isBiometricScanning) return;
    
    setIsBiometricScanning(true);
    setLoading(true);

    // Simulate scan phases
    setTimeout(() => {
        setBiometricSuccess(true);
        setTimeout(() => {
             const user: User = {
                id: crypto.randomUUID(),
                name: 'Dr. Biometric',
                role: role, 
                department: role === 'ADMIN' ? 'Command Center' : 'Triage Unit'
            };
            onLogin(user);
        }, 1000);
    }, 2000);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] bg-slate-100 flex items-center justify-center p-4 bg-grid-pattern">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-emerald-400 to-blue-500"></div>
            <div className="w-16 h-16 bg-slate-800 rounded-2xl mx-auto flex items-center justify-center mb-4 border border-slate-700 shadow-inner">
                <Lock className="w-8 h-8 text-blue-400" />
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{t.auth_title}</h2>
            <p className="text-slate-400 text-sm mt-2">{t.auth_subtitle}</p>

            {/* Mode Toggle Tabs */}
            <div className="flex bg-slate-800 p-1 rounded-lg mt-6 border border-slate-700">
                <button 
                    onClick={() => setMode('LOGIN')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold font-mono transition-all ${mode === 'LOGIN' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.auth_tab_login}
                </button>
                <button 
                    onClick={() => setMode('REGISTER')}
                    className={`flex-1 py-2 rounded-md text-xs font-bold font-mono transition-all ${mode === 'REGISTER' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-200'}`}
                >
                    {t.auth_tab_register}
                </button>
            </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-5">
            
            {mode === 'REGISTER' && (
                <div className="space-y-1 animate-in slide-in-from-top-2 fade-in duration-300">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                        <Mail className="w-3 h-3" /> {t.auth_label_email}
                    </label>
                    <input 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium transition-all text-sm"
                        placeholder={t.auth_placeholder_email}
                        required={mode === 'REGISTER'}
                    />
                </div>
            )}

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <UserIcon className="w-3 h-3" /> {mode === 'REGISTER' ? t.auth_label_username : t.auth_label_username}
                </label>
                <input 
                    type="text" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium transition-all text-sm"
                    placeholder={t.auth_placeholder_username}
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Lock className="w-3 h-3" /> {t.auth_label_password}
                </label>
                <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none text-slate-800 font-medium transition-all text-sm"
                    placeholder={t.auth_placeholder_password}
                    required
                />
            </div>

            <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                    <Shield className="w-3 h-3" /> {t.auth_label_role}
                </label>
                <div className="grid grid-cols-1 gap-2">
                    <div 
                        onClick={() => setRole('STAFF')}
                        className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${role === 'STAFF' ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${role === 'STAFF' ? 'border-blue-500' : 'border-slate-300'}`}>
                            {role === 'STAFF' && <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />}
                        </div>
                        <span className={`text-xs font-bold ${role === 'STAFF' ? 'text-blue-700' : 'text-slate-600'}`}>{t.auth_role_staff}</span>
                    </div>

                    <div 
                        onClick={() => setRole('ADMIN')}
                        className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${role === 'ADMIN' ? 'border-purple-500 bg-purple-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${role === 'ADMIN' ? 'border-purple-500' : 'border-slate-300'}`}>
                            {role === 'ADMIN' && <div className="w-1.5 h-1.5 rounded-full bg-purple-500" />}
                        </div>
                        <span className={`text-xs font-bold ${role === 'ADMIN' ? 'text-purple-700' : 'text-slate-600'}`}>{t.auth_role_admin}</span>
                    </div>

                     <div 
                        onClick={() => setRole('EMS')}
                        className={`p-2.5 rounded-lg border-2 cursor-pointer transition-all flex items-center gap-3 ${role === 'EMS' ? 'border-red-500 bg-red-50' : 'border-slate-100 hover:border-slate-200'}`}
                    >
                        <div className={`w-3 h-3 rounded-full border-2 flex items-center justify-center ${role === 'EMS' ? 'border-red-500' : 'border-slate-300'}`}>
                            {role === 'EMS' && <div className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </div>
                        <span className={`text-xs font-bold ${role === 'EMS' ? 'text-red-700' : 'text-slate-600'}`}>{t.auth_role_ems}</span>
                    </div>
                </div>
            </div>

            <button 
                type="submit"
                disabled={loading || !username.trim()}
                className={`w-full py-3.5 rounded-xl font-bold text-white shadow-lg flex items-center justify-center gap-2 transition-all ${loading || !username.trim() ? 'bg-slate-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-slate-800 hover:shadow-slate-900/20 active:scale-95'}`}
            >
                {loading ? (
                    <Activity className="w-5 h-5 animate-spin" />
                ) : (
                    <>
                        {mode === 'LOGIN' ? (
                            <>{t.auth_btn_login} <LogIn className="w-4 h-4" /></>
                        ) : (
                            <>{t.auth_btn_register} <UserPlus className="w-4 h-4" /></>
                        )}
                    </>
                )}
            </button>
            
            {/* Biometric Button */}
            <button
                type="button"
                onClick={handleBiometricLogin}
                disabled={loading || isBiometricScanning}
                className={`w-full py-3 rounded-xl font-bold border-2 border-slate-200 text-slate-600 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2 ${isBiometricScanning ? 'animate-pulse bg-blue-50 border-blue-400' : ''}`}
            >
                {isBiometricScanning ? (
                    biometricSuccess ? (
                         <><CheckCircle2 className="w-5 h-5 text-emerald-500" /> {t.auth_scan_success}</>
                    ) : (
                         <><Fingerprint className="w-5 h-5 animate-pulse text-blue-500" /> {t.auth_scanning}</>
                    )
                ) : (
                    <><Fingerprint className="w-5 h-5" /> {t.auth_biometric_btn}</>
                )}
            </button>

            {/* Social Divider */}
            <div className="relative flex items-center py-2">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink-0 mx-4 text-[10px] text-slate-400 font-bold uppercase tracking-wider">{t.auth_or_divider}</span>
                <div className="flex-grow border-t border-slate-200"></div>
            </div>

            {/* Social Buttons */}
            <div className="grid grid-cols-2 gap-3">
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('GOOGLE')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white shadow-sm"
                >
                    <Chrome className="w-4 h-4 text-slate-700" />
                    <span className="text-xs font-bold text-slate-600">{t.auth_social_google}</span>
                </button>
                <button 
                    type="button"
                    onClick={() => handleSocialLogin('FACEBOOK')}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-2.5 border border-slate-200 rounded-lg hover:bg-blue-50 transition-colors bg-white shadow-sm"
                >
                    <Facebook className="w-4 h-4 text-blue-600" />
                    <span className="text-xs font-bold text-slate-600">{t.auth_social_facebook}</span>
                </button>
            </div>

            <div className="text-center pt-2">
                <button 
                    type="button"
                    onClick={() => setMode(mode === 'LOGIN' ? 'REGISTER' : 'LOGIN')}
                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                    {mode === 'LOGIN' ? t.auth_toggle_register : t.auth_toggle_login}
                </button>
            </div>

            <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-mono pt-2 border-t border-slate-100">
                <Fingerprint className="w-3 h-3" />
                {t.auth_secure_badge}
            </div>
        </form>
      </div>
    </div>
  );
};