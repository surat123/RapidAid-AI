import React from 'react';
import { ViewState, Language, User } from '../types';
import { Activity, LayoutDashboard, Smartphone, Terminal, Wifi, Globe, Book, Ambulance, Siren, LogIn, LogOut, User as UserIcon, Shield, FileSearch } from 'lucide-react';

interface NavbarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  t: any;
  user: User | null;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setView, language, setLanguage, t, user, onLogout }) => {
  return (
    <nav className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center cursor-pointer group" onClick={() => setView(ViewState.HOME)}>
            <div className="flex-shrink-0 flex items-center gap-3">
              <div className="bg-blue-600/10 border border-blue-500/50 p-2 rounded-md group-hover:bg-blue-600/20 transition-all">
                <Terminal className="h-6 w-6 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <h1 className="text-lg font-bold text-white tracking-tight font-mono">
                  {t.nav_app_title}<span className="text-blue-500">_AI</span>
                </h1>
                <div className="flex items-center gap-1.5">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">{t.nav_system_online}</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            
            {/* Language Switcher */}
            <button
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                className="flex items-center px-3 py-2 rounded-md text-sm font-medium text-slate-400 hover:text-white transition-colors border border-transparent hover:border-slate-700 mr-2"
            >
                <Globe className="h-4 w-4 mr-2" />
                <span className="font-mono">{language.toUpperCase()}</span>
            </button>

            {/* Auth Dependent Buttons */}
            {user ? (
                <>
                    {/* SOS Button - Always available if logged in */}
                    <button
                        onClick={() => setView(ViewState.SOS)}
                        className="hidden md:flex items-center px-4 py-2 rounded-md text-sm font-bold bg-red-600 text-white hover:bg-red-700 shadow-md animate-pulse mr-2"
                    >
                        <Siren className="h-4 w-4 mr-2" />
                        <span className="font-mono tracking-wider">{t.nav_sos}</span>
                    </button>

                    <button
                    onClick={() => setView(ViewState.PATIENT_FORM)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        currentView === ViewState.PATIENT_FORM 
                        ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                    }`}
                    >
                    <Smartphone className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline font-mono">{t.nav_patient_app}</span>
                    </button>
                    
                    <button
                    onClick={() => setView(ViewState.TRANSPORT)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        currentView === ViewState.TRANSPORT
                        ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                    }`}
                    >
                    <Ambulance className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline font-mono">{t.nav_transport}</span>
                    </button>
                    
                    <button
                    onClick={() => setView(ViewState.DASHBOARD)}
                    className={`flex items-center px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        currentView === ViewState.DASHBOARD 
                        ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                    }`}
                    >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    <span className="hidden md:inline font-mono">{t.nav_dashboard}</span>
                    </button>

                    {/* Admin Only Tools */}
                    {user.role === 'ADMIN' && (
                        <>
                            <button
                            onClick={() => setView(ViewState.IDS)}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                                currentView === ViewState.IDS 
                                ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                            }`}
                            >
                            <Shield className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline font-mono">{t.nav_ids}</span>
                            </button>

                            <button
                            onClick={() => setView(ViewState.RANSOMWARE)}
                            className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                                currentView === ViewState.RANSOMWARE
                                ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                                : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                            }`}
                            >
                            <FileSearch className="h-4 w-4 md:mr-2" />
                            <span className="hidden md:inline font-mono">{t.nav_ransom}</span>
                            </button>
                        </>
                    )}

                    <button
                    onClick={() => setView(ViewState.DOCUMENTATION)}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                        currentView === ViewState.DOCUMENTATION
                        ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                        : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                    }`}
                    >
                    <Book className="h-4 w-4 sm:mr-2" />
                    <span className="hidden md:inline font-mono">{t.nav_docs}</span>
                    </button>

                    {/* User Profile / Logout */}
                    <div className="ml-2 pl-2 border-l border-slate-700 flex items-center gap-2">
                         <div className="hidden md:flex flex-col items-end mr-1">
                             <span className="text-xs font-bold text-slate-200">{user.name}</span>
                             <span className="text-[10px] text-blue-400 font-mono uppercase">{user.role}</span>
                         </div>
                         <button 
                            onClick={onLogout}
                            className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                            title={t.nav_logout}
                         >
                            <LogOut className="h-4 w-4" />
                         </button>
                    </div>
                </>
            ) : (
                <>
                     {/* Public Links only when logged out */}
                     <button
                        onClick={() => setView(ViewState.DOCUMENTATION)}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 border ${
                            currentView === ViewState.DOCUMENTATION
                            ? 'bg-slate-800 text-blue-400 border-slate-700 shadow-inner' 
                            : 'text-slate-400 border-transparent hover:bg-slate-800 hover:text-white'
                        }`}
                        >
                        <Book className="h-4 w-4 sm:mr-2" />
                        <span className="hidden md:inline font-mono">{t.nav_docs}</span>
                    </button>

                    <button
                        onClick={() => setView(ViewState.LOGIN)}
                        className="flex items-center px-4 py-2 rounded-md text-sm font-bold bg-blue-600 text-white hover:bg-blue-700 shadow-md ml-2 transition-all"
                    >
                        <LogIn className="h-4 w-4 mr-2" />
                        <span className="font-mono">{t.nav_login}</span>
                    </button>
                </>
            )}

          </div>
        </div>
      </div>
    </nav>
  );
};