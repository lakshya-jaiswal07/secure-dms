import React, { useState } from 'react';
import { 
  Shield, Filter, Search, Download, AlertTriangle, CheckCircle, 
  Terminal, User, HardDrive, Laptop, Globe
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import GeoAccessMap from './GeoAccessMap';

export default function AuditConsoleFeed() {
  const { auditLogs } = useApp();
  const [filterSeverity, setFilterSeverity] = useState('ALL'); // ALL, SUSPICIOUS, CRITICAL, SUCCESS, INFO
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = auditLogs.filter(log => {
    if (filterSeverity === 'SUSPICIOUS') {
      if (log.severity !== 'CRITICAL' && log.severity !== 'WARNING') return false;
    } else if (filterSeverity !== 'ALL') {
      if (log.severity !== filterSeverity) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        log.user.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.ip.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q) ||
        log.documentId.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const exportAuditJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(auditLogs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `SENTINEL_AUDIT_TRAIL_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Export */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-brand-500/10 dark:bg-brand-500/20 border border-brand-500/20 rounded-2xl text-brand-600 dark:text-cyan-400">
            <Terminal className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Security Operations & Audit Trail Console (SOC)
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-brand-500/10 dark:bg-cyan-500/15 text-brand-700 dark:text-cyan-300 border border-brand-500/20 dark:border-cyan-500/30">
                LIVE TELEMETRY
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Append-only audit logs capturing identity tokens, MAC addresses, cryptographic hash audits, and anomalies.
            </p>
          </div>
        </div>

        <button
          onClick={exportAuditJSON}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-sm"
        >
          <Download className="w-4 h-4 text-brand-600 dark:text-cyan-400" />
          Export Signed Audit Manifest (JSON)
        </button>
      </div>

      {/* Embedded Geo/Device Map */}
      <GeoAccessMap />

      {/* Filter and Search Controls */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-sm dark:shadow-xl flex flex-wrap items-center justify-between gap-3 transition-colors">
        {/* Severity Filter Tabs */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1 text-[11px] font-medium">
            <Filter className="w-3.5 h-3.5" /> Filter:
          </span>
          <button
            onClick={() => setFilterSeverity('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === 'ALL'
                ? 'bg-brand-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            All Events ({auditLogs.length})
          </button>
          <button
            onClick={() => setFilterSeverity('SUSPICIOUS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === 'SUSPICIOUS'
                ? 'bg-red-600 text-white font-bold animate-pulse shadow-sm'
                : 'bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/50 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800/60'
            }`}
          >
            ⚠ Suspicious Only
          </button>
          <button
            onClick={() => setFilterSeverity('CRITICAL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === 'CRITICAL'
                ? 'bg-red-600 text-white font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Critical
          </button>
          <button
            onClick={() => setFilterSeverity('SUCCESS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              filterSeverity === 'SUCCESS'
                ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Signatures / Certs
          </button>
        </div>

        {/* Search Query Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by User, IP, Action..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
          />
        </div>
      </div>

      {/* Filterable Audit Feed Stream */}
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-sm dark:shadow-xl overflow-hidden transition-colors">
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs font-mono">
              No audit events matched current criteria.
            </div>
          ) : (
            filteredLogs.map((log) => {
              const isCritical = log.severity === 'CRITICAL' || log.severity === 'WARNING';
              const isAmber = log.severity === 'SUCCESS';

              return (
                <div 
                  key={log.id} 
                  className={`p-4 transition-colors hover:bg-slate-50 dark:hover:bg-slate-850 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs ${
                    isCritical ? 'bg-red-50/50 dark:bg-red-950/20' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Severity Pill / Dot */}
                    <div className="mt-1">
                      {isCritical ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></div>
                      ) : isAmber ? (
                        <div className="w-2.5 h-2.5 rounded-full bg-amber-400"></div>
                      ) : (
                        <div className="w-2.5 h-2.5 rounded-full bg-brand-500 dark:bg-cyan-400"></div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`font-mono font-bold ${
                          isCritical ? 'text-red-600 dark:text-red-400' : isAmber ? 'text-amber-600 dark:text-amber-300' : 'text-slate-900 dark:text-slate-100'
                        }`}>
                          {log.action}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-brand-700 dark:text-cyan-300 border border-slate-200 dark:border-slate-700 font-semibold">
                          {log.documentId}
                        </span>
                        <span className={`text-[10px] font-mono px-2 py-0.5 rounded font-semibold ${
                          isCritical 
                            ? 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-200 border border-red-200 dark:border-red-700' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                        }`}>
                          {log.status}
                        </span>
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 mt-1 font-mono text-[11px] leading-relaxed">
                        {log.details}
                      </p>

                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                          <User className="w-3 h-3 text-slate-400" /> {log.user} ({log.role})
                        </span>
                        <span className="flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-400" /> {log.ip} • {log.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Laptop className="w-3 h-3 text-slate-400" /> {log.device}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="font-mono text-[11px] text-slate-500 dark:text-slate-400 shrink-0 text-left md:text-right">
                    <div>{log.timestamp}</div>
                    <div className="text-[9px] text-slate-400 dark:text-slate-500">{log.id}</div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
