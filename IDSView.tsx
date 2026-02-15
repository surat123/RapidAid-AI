import React, { useState } from 'react';
import { Shield, ShieldAlert, AlertTriangle, CheckCircle, Ban, Activity, Wifi, Search, X, Globe } from 'lucide-react';

interface IDSViewProps {
  t: any;
}

interface NetworkEvent {
  id: string;
  ip: string;
  severity: 'HIGH' | 'MED' | 'LOW';
  activity: string;
  timestamp: string;
}

interface DNSLog {
  id: string;
  domain: string;
  ip: string;
  status: 'RESOLVED' | 'BLOCKED' | 'NXDOMAIN';
  timestamp: string;
}

export const IDSView: React.FC<IDSViewProps> = ({ t }) => {
  const [blockedIPs, setBlockedIPs] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'TRAFFIC' | 'DNS'>('TRAFFIC');

  // Mock Data
  const [events, setEvents] = useState<NetworkEvent[]>([
    { id: '1', ip: '192.168.1.105', severity: 'HIGH', activity: 'Port Scan Detected', timestamp: '10:42:05' },
    { id: '2', ip: '45.33.22.11', severity: 'MED', activity: 'Suspicious Payload', timestamp: '10:41:50' },
    { id: '3', ip: '10.0.0.55', severity: 'LOW', activity: 'Repeated Login Failure', timestamp: '10:40:12' },
    { id: '4', ip: '203.0.113.42', severity: 'HIGH', activity: 'SQL Injection Attempt', timestamp: '10:39:20' },
    { id: '5', ip: '198.51.100.8', severity: 'MED', activity: 'Unusual Traffic Volume', timestamp: '10:35:00' },
  ]);

  const [dnsLogs] = useState<DNSLog[]>([
      { id: '1', domain: 'api.google.com', ip: '142.250.190.46', status: 'RESOLVED', timestamp: '10:42:10' },
      { id: '2', domain: 'mining-pool.xyz', ip: '0.0.0.0', status: 'BLOCKED', timestamp: '10:41:55' },
      { id: '3', domain: 'cdn.content-delivery.net', ip: '104.21.55.2', status: 'RESOLVED', timestamp: '10:41:12' },
      { id: '4', domain: 'update.suspicious-app.org', ip: '-', status: 'NXDOMAIN', timestamp: '10:39:45' },
      { id: '5', domain: 'graph.facebook.com', ip: '157.240.22.35', status: 'RESOLVED', timestamp: '10:38:30' },
  ]);

  const handleBlockIP = (ip: string) => {
    if (blockedIPs.includes(ip)) return;
    
    setBlockedIPs(prev => [...prev, ip]);
    
    // Show Notification
    setNotification(`${t.ids_alert_blocked} (${ip})`);
    
    // Auto Dismiss
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const filteredEvents = events.filter(e => e.ip.includes(searchTerm) || e.activity.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDNS = dnsLogs.filter(d => d.domain.toLowerCase().includes(searchTerm.toLowerCase()) || d.ip.includes(searchTerm));

  const getSeverityBadge = (level: string) => {
    switch (level) {
      case 'HIGH': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">{t.ids_severity_high}</span>;
      case 'MED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 border border-amber-200">{t.ids_severity_med}</span>;
      case 'LOW': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 border border-blue-200">{t.ids_severity_low}</span>;
      default: return null;
    }
  };

  const getDNSStatusBadge = (status: string) => {
      switch (status) {
          case 'RESOLVED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700 border border-emerald-200">RESOLVED</span>;
          case 'BLOCKED': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">BLOCKED</span>;
          case 'NXDOMAIN': return <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200">NXDOMAIN</span>;
          default: return null;
      }
  };

  return (
    <div className="max-w-6xl mx-auto py-8 px-4">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-24 right-6 z-50 animate-in slide-in-from-right duration-300">
           <div className="bg-emerald-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500">
              <div className="bg-white/20 p-2 rounded-full">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                  <span className="font-bold text-sm">Success</span>
                  <span className="text-xs opacity-90">{notification}</span>
              </div>
              <button onClick={() => setNotification(null)} className="ml-4 hover:bg-white/20 p-1 rounded transition-colors">
                <X className="w-4 h-4" />
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-8 bg-slate-900 text-white p-6 rounded-2xl shadow-lg border border-slate-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl -mr-16 -mt-16 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-4">
            <div>
                <h2 className="text-2xl font-bold flex items-center gap-3 font-mono">
                    <Shield className="w-8 h-8 text-blue-400" />
                    {t.ids_title}
                </h2>
                <p className="text-slate-400 mt-1 max-w-lg text-sm">{t.ids_subtitle}</p>
            </div>
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.ids_active_threats}</span>
                    <span className="text-2xl font-mono font-bold text-red-500">{events.length}</span>
                </div>
                <div className="h-10 w-px bg-slate-700 mx-2"></div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t.ids_status_blocked}</span>
                    <span className="text-2xl font-mono font-bold text-slate-300">{blockedIPs.length}</span>
                </div>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Log Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center bg-slate-50 gap-4">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={() => setActiveTab('TRAFFIC')}
                        className={`font-bold flex items-center gap-2 text-sm transition-colors ${activeTab === 'TRAFFIC' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Activity className="w-4 h-4" />
                        {t.ids_tab_traffic}
                    </button>
                    <div className="h-4 w-px bg-slate-300"></div>
                    <button 
                        onClick={() => setActiveTab('DNS')}
                        className={`font-bold flex items-center gap-2 text-sm transition-colors ${activeTab === 'DNS' ? 'text-slate-800' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        <Globe className="w-4 h-4" />
                        {t.ids_tab_dns}
                    </button>
                </div>
                
                <div className="relative w-full sm:w-auto">
                    <input 
                        type="text" 
                        placeholder="Search IP/Domain..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-md focus:ring-1 focus:ring-blue-500 outline-none w-full sm:w-48"
                    />
                    <Search className="w-3 h-3 text-slate-400 absolute left-2.5 top-2" />
                </div>
            </div>
            
            <div className="overflow-x-auto">
                {activeTab === 'TRAFFIC' ? (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-500 font-mono text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">{t.ids_table_ip}</th>
                                <th className="px-6 py-3">{t.ids_table_severity}</th>
                                <th className="px-6 py-3">{t.ids_table_activity}</th>
                                <th className="px-6 py-3 text-right">{t.ids_table_action}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredEvents.map((event) => {
                                const isBlocked = blockedIPs.includes(event.ip);
                                return (
                                    <tr key={event.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-slate-700">{event.ip}</td>
                                        <td className="px-6 py-4">{getSeverityBadge(event.severity)}</td>
                                        <td className="px-6 py-4 text-slate-600">
                                            <div className="flex items-center gap-2">
                                                {event.severity === 'HIGH' && <AlertTriangle className="w-3 h-3 text-red-500" />}
                                                {event.activity}
                                            </div>
                                            <div className="text-[10px] text-slate-400 mt-0.5">{event.timestamp}</div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {isBlocked ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded cursor-not-allowed">
                                                    <Ban className="w-3 h-3" /> {t.ids_status_blocked}
                                                </span>
                                            ) : (
                                                <button 
                                                    onClick={() => handleBlockIP(event.ip)}
                                                    className="inline-flex items-center gap-1 text-xs font-bold text-white bg-slate-900 hover:bg-red-600 px-3 py-1.5 rounded transition-colors shadow-sm"
                                                >
                                                    <ShieldAlert className="w-3 h-3" /> {t.ids_btn_block}
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                ) : (
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-100 text-slate-500 font-mono text-xs uppercase">
                            <tr>
                                <th className="px-6 py-3">{t.ids_table_domain}</th>
                                <th className="px-6 py-3">{t.ids_table_dns_ip}</th>
                                <th className="px-6 py-3">{t.ids_table_status}</th>
                                <th className="px-6 py-3 text-right">Time</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredDNS.map((log) => (
                                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-bold text-slate-700">{log.domain}</td>
                                    <td className="px-6 py-4 font-mono text-slate-600">{log.ip}</td>
                                    <td className="px-6 py-4">{getDNSStatusBadge(log.status)}</td>
                                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-mono">{log.timestamp}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>

        {/* Sidebar / Stats */}
        <div className="space-y-6">
            <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 font-mono">System Status</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100">
                                <Wifi className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Firewall</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ACTIVE</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100">
                                <Activity className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">Packet Insp.</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">RUNNING</span>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-100">
                                <Globe className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-bold text-slate-700">DNS Monitor</span>
                        </div>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4 font-mono">Blacklisted IPs</h3>
                {blockedIPs.length === 0 ? (
                    <div className="text-center py-4 text-slate-400 text-sm italic">No IPs blocked yet.</div>
                ) : (
                    <div className="space-y-2 max-h-64 overflow-y-auto">
                        {blockedIPs.map((ip, idx) => (
                            <div key={idx} className="bg-white px-3 py-2 rounded border border-slate-200 flex justify-between items-center text-xs shadow-sm">
                                <span className="font-mono text-slate-600">{ip}</span>
                                <Ban className="w-3 h-3 text-red-400" />
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>

      </div>
    </div>
  );
};