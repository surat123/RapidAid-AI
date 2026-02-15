import React, { useState, useCallback, useMemo } from 'react';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { PatientForm } from './components/PatientForm';
import { Dashboard } from './components/Dashboard';
import { Documentation } from './components/Documentation';
import { TransportView } from './components/TransportView';
import { SOSView } from './components/SOSView';
import { LoginView } from './components/LoginView';
import { IDSView } from './components/IDSView';
import { RansomwareView } from './components/RansomwareView';
import { PatientData, ViewState, Language, TriageHistoryEvent, User } from './types';
import { translations } from './translations';
import { Siren } from 'lucide-react';

function App() {
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.HOME);
  const [patients, setPatients] = useState<PatientData[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const t = translations[language];

  // Auth Handlers
  const handleLogin = useCallback((user: User) => {
    setCurrentUser(user);
    if (user.role === 'ADMIN') {
      setCurrentView(ViewState.DASHBOARD);
    } else {
      setCurrentView(ViewState.PATIENT_FORM);
    }
  }, []);

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentView(ViewState.HOME);
  }, []);

  // Protected Route Handler
  const navigateTo = useCallback((view: ViewState) => {
    const protectedViews = [ViewState.PATIENT_FORM, ViewState.DASHBOARD, ViewState.TRANSPORT, ViewState.SOS, ViewState.IDS, ViewState.RANSOMWARE];
    if (protectedViews.includes(view) && !currentUser) {
      setCurrentView(ViewState.LOGIN);
    } else {
      setCurrentView(view);
    }
  }, [currentUser]);

  const handlePatientSubmit = useCallback((newPatient: PatientData) => {
    setPatients(prev => [newPatient, ...prev]);
    setCurrentView(ViewState.DASHBOARD);
  }, []);

  const handleStatusChange = useCallback((id: string, newStatus: PatientData['status']) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === id) {
        const newHistoryItem: TriageHistoryEvent = {
          timestamp: Date.now(),
          type: 'STATUS_CHANGE',
          details: `Status updated from ${patient.status} to ${newStatus}`,
          actor: 'STAFF',
          meta: { from: patient.status, to: newStatus }
        };
        return {
          ...patient,
          status: newStatus,
          history: [newHistoryItem, ...patient.history]
        };
      }
      return patient;
    }));
  }, []);

  const handleVideoRequest = useCallback((id: string) => {
    setPatients(prev => prev.map(patient => {
      if (patient.id === id && !patient.requestTeleconsult) {
        const newHistoryItem: TriageHistoryEvent = {
          timestamp: Date.now(),
          type: 'STATUS_CHANGE',
          details: `Video consultation requested by Admin`,
          actor: 'STAFF',
        };
        return {
          ...patient,
          requestTeleconsult: true,
          history: [newHistoryItem, ...patient.history]
        };
      }
      return patient;
    }));
  }, []);

  const renderContent = useMemo(() => {
    switch (currentView) {
      case ViewState.HOME:
        return <Hero onStart={() => navigateTo(ViewState.PATIENT_FORM)} onDocs={() => setCurrentView(ViewState.DOCUMENTATION)} t={t} />;
      case ViewState.LOGIN:
        return <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.PATIENT_FORM:
        return currentUser ? <PatientForm onSubmit={handlePatientSubmit} language={language} t={t} /> : <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.DASHBOARD:
        return currentUser ? <Dashboard patients={patients} onStatusChange={handleStatusChange} onVideoRequest={handleVideoRequest} t={t} /> : <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.TRANSPORT:
        return currentUser ? <TransportView t={t} /> : <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.DOCUMENTATION:
        return <Documentation t={t} />;
      case ViewState.SOS:
        return currentUser ? <SOSView onSubmit={handlePatientSubmit} language={language} t={t} onClose={() => setCurrentView(ViewState.HOME)} /> : <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.IDS:
        return currentUser?.role === 'ADMIN' ? <IDSView t={t} /> : <LoginView onLogin={handleLogin} t={t} />;
      case ViewState.RANSOMWARE:
        return currentUser?.role === 'ADMIN' ? <RansomwareView t={t} /> : <LoginView onLogin={handleLogin} t={t} />;
      default:
        return <Hero onStart={() => navigateTo(ViewState.PATIENT_FORM)} onDocs={() => setCurrentView(ViewState.DOCUMENTATION)} t={t} />;
    }
  }, [currentView, currentUser, patients, language, t, navigateTo, handleLogin, handlePatientSubmit, handleStatusChange, handleVideoRequest]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans relative">
      <Navbar 
        currentView={currentView} 
        setView={navigateTo} 
        language={language} 
        setLanguage={setLanguage}
        t={t}
        user={currentUser}
        onLogout={handleLogout}
      />
      <main className="flex-grow">
        {renderContent}
      </main>

      {/* Floating Mobile SOS Button - Only if logged in */}
      {currentView !== ViewState.SOS && currentUser && (
          <button 
            onClick={() => setCurrentView(ViewState.SOS)}
            className="md:hidden fixed bottom-6 right-6 w-16 h-16 bg-red-600 rounded-full shadow-2xl flex items-center justify-center text-white z-50 animate-bounce active:scale-95 transition-transform"
          >
              <Siren className="w-8 h-8" />
          </button>
      )}
      
      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 gap-4">
            <div className="flex flex-col">
                <p className="font-semibold text-slate-300">{t.footer_copyright}</p>
                <p className="text-xs text-slate-500">{t.footer_desc}</p>
            </div>
            <div className="flex items-center gap-6 font-mono text-xs">
                <span className="hover:text-blue-400 cursor-pointer transition-colors">/privacy</span>
                <span className="hover:text-blue-400 cursor-pointer transition-colors">/terms</span>
                <span className="hover:text-blue-400 cursor-pointer transition-colors">/status</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;