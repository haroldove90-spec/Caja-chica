import React, { useState, useEffect, useCallback } from 'react';
import {
  Database,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Check,
  Download,
  X,
  Server,
  Shield,
  Clock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowUpRight,
  History,
  CheckCircle,
  Calendar,
  Zap,
  TrendingUp
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { pingSupabase, runFullSupabaseDiagnostic, DiagnosticResult } from '../lib/supabaseSync';
import { FULL_SUPABASE_SQL_SCRIPT } from '../constants/supabaseSqlScript';

export const SupabaseSmartButton: React.FC = () => {
  const {
    role,
    syncWithSupabaseNow,
    gastos,
    gasolinaRecords,
    comprobantesGastos,
    comprobantesCombustibleCliente,
    cajas,
    lastSupabaseSave,
    supabaseSaveHistory,
    dismissLastSupabaseSave
  } = useApp();

  // Hidden strictly for 'cliente' role as requested
  if (role === 'cliente' || role === 'home') {
    return null;
  }

  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'feedback' | 'diagnostics' | 'sql' | 'sync'>('feedback');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [latencyMs, setLatencyMs] = useState<number>(38);
  const [isPinging, setIsPinging] = useState<boolean>(false);
  const [diagnostic, setDiagnostic] = useState<DiagnosticResult | null>(null);
  const [isDiagnosing, setIsDiagnosing] = useState<boolean>(false);

  // Auto-dismiss floating toast timer
  const [showToast, setShowToast] = useState<boolean>(false);

  useEffect(() => {
    if (lastSupabaseSave) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 7500);
      return () => clearTimeout(timer);
    }
  }, [lastSupabaseSave]);

  // Sync state
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Heartbeat monitoring every 25 seconds in background
  const runHeartbeat = useCallback(async () => {
    try {
      const result = await pingSupabase();
      setIsConnected(result.ok);
      setLatencyMs(result.latencyMs);
    } catch {
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    runHeartbeat();
    const interval = setInterval(runHeartbeat, 25000); // 25 seconds heartbeat
    return () => clearInterval(interval);
  }, [runHeartbeat]);

  // On-demand verification
  const handleVerifyConnection = async () => {
    setIsPinging(true);
    setIsDiagnosing(true);
    try {
      const diagResult = await runFullSupabaseDiagnostic();
      setDiagnostic(diagResult);
      setIsConnected(diagResult.isConnected);
      setLatencyMs(diagResult.latencyMs);
    } finally {
      setIsPinging(false);
      setIsDiagnosing(false);
    }
  };

  const handleOpenModal = () => {
    setIsOpen(true);
    handleVerifyConnection();
  };

  const handleSyncAll = async () => {
    setIsSyncing(true);
    setSyncSuccess(false);
    try {
      await syncWithSupabaseNow();
      setSyncSuccess(true);
      // Re-run diagnostic after sync to show updated row counts
      const diag = await runFullSupabaseDiagnostic();
      setDiagnostic(diag);
      setTimeout(() => setSyncSuccess(false), 4000);
    } catch (err) {
      console.error('Error during full sync:', err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(FULL_SUPABASE_SQL_SCRIPT);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  const handleDownloadSql = () => {
    const blob = new Blob([FULL_SUPABASE_SQL_SCRIPT], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'supabase_schema_y_registros_muestra.sql';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalLocalRecords =
    gastos.length +
    gasolinaRecords.length +
    comprobantesGastos.length +
    comprobantesCombustibleCliente.length +
    cajas.length;

  return (
    <>
      {/* SMART SUPABASE BUTTON (SEMÁFORO EN VIVO + LATENCIA + FEEDBACK 1-CLIC) */}
      <button
        id="btn-supabase-smart"
        onClick={handleOpenModal}
        title="Estado de conexión Supabase y Diagnóstico en Tiempo Real"
        className={`group relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all duration-200 cursor-pointer border shadow-xs select-none ${
          isConnected
            ? 'bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-900 border-emerald-300/80 hover:border-emerald-400'
            : 'bg-rose-50/90 hover:bg-rose-100/90 text-rose-900 border-rose-300/80 hover:border-rose-400'
        }`}
      >
        {/* SEMÁFORO EN VIVO (🟢 / 🔴) con animación de pulso */}
        <div className="relative flex items-center justify-center shrink-0">
          <span
            className={`absolute inline-flex h-3 w-3 rounded-full opacity-75 ${
              isConnected ? 'animate-ping bg-emerald-400' : 'animate-ping bg-rose-500'
            }`}
          />
          <span
            className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
              isConnected ? 'bg-emerald-600 shadow-[0_0_8px_rgba(16,185,129,0.8)]' : 'bg-rose-600 shadow-[0_0_8px_rgba(239,68,68,0.8)]'
            }`}
          />
        </div>

        {/* ETIQUETA Y LATENCIA EN MS */}
        <div className="flex flex-col items-start leading-none text-left">
          <div className="flex items-center gap-1.5 font-bold tracking-tight text-[11px]">
            <Database className="w-3 h-3 text-[#024182]" />
            <span>Supabase</span>
            <span className={`text-[10px] font-mono px-1 py-0.2 rounded font-black ${isConnected ? 'text-emerald-700 bg-emerald-100' : 'text-rose-700 bg-rose-100'}`}>
              {isConnected ? 'ONLINE' : 'OFFLINE'}
            </span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5 font-medium">
            {isPinging ? 'Verificando...' : `${latencyMs} ms · Heartbeat 25s`}
          </span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-zinc-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
      </button>

      {/* FLOATING REAL-TIME SAVE FEEDBACK TOAST / BANNER */}
      {showToast && lastSupabaseSave && (
        <div
          id="supabase-save-feedback-toast"
          className="fixed bottom-6 right-6 z-50 max-w-md w-full bg-white border border-emerald-300 rounded-2xl shadow-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 print:hidden"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-emerald-100 text-emerald-700 rounded-xl shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-emerald-950">Guardado en Supabase OK</span>
                  <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 rounded text-[10px] font-mono font-bold">
                    {lastSupabaseSave.latencyMs} ms
                  </span>
                </div>
                <p className="text-xs font-semibold text-zinc-800">
                  {lastSupabaseSave.moduleName}: <span className="font-bold text-[#024182]">{lastSupabaseSave.recordIdentifier}</span>
                </p>

                {/* Counter comparison: Before and After */}
                <div className="flex items-center gap-2 text-[11px] font-mono bg-zinc-50 px-2 py-1 rounded-lg border border-zinc-200">
                  <span className="text-zinc-500">Antes: <strong className="text-zinc-800">{lastSupabaseSave.previousCount}</strong></span>
                  <span className="text-zinc-400">→</span>
                  <span className="text-emerald-700 font-bold">Total ahora: <strong>{lastSupabaseSave.newCount}</strong></span>
                </div>

                {/* Date, Time, and Day of Week */}
                <div className="flex items-center gap-1.5 text-[10px] text-zinc-500 font-medium pt-0.5">
                  <Calendar className="w-3 h-3 text-zinc-400" />
                  <span>{lastSupabaseSave.formattedDateTime}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setShowToast(false);
                dismissLastSupabaseSave();
              }}
              className="p-1 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 cursor-pointer"
              title="Cerrar notificación"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="mt-2.5 pt-2 border-t border-zinc-100 flex items-center justify-between text-[11px]">
            <button
              onClick={() => {
                setShowToast(false);
                setIsOpen(true);
                setActiveTab('feedback');
              }}
              className="text-[#024182] hover:underline font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Ver bitácora de guardado en el Botón</span>
              <ChevronRight className="w-3 h-3" />
            </button>
            <span className="text-[10px] text-emerald-600 font-bold font-mono">100% PERSISTIDO</span>
          </div>
        </div>
      )}

      {/* DIAGNOSTIC, TELEMETRY AND SQL CONSOLE MODAL */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto print:hidden">
          <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-[#024182] via-[#0b5394] to-[#1d5fa6] text-white flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-white/10 rounded-xl border border-white/20">
                  <Database className="w-6 h-6 text-emerald-300" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold tracking-tight">Centro Inteligente Supabase</h3>
                    <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 rounded-full text-[10px] font-black font-mono">
                      PostgreSQL 15+
                    </span>
                  </div>
                  <p className="text-xs text-blue-100/90">Diagnóstico de conexión, monitoreo en vivo, script SQL y confirmación de guardado</p>
                </div>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Sub-Header Tabs */}
            <div className="flex items-center justify-between px-5 pt-3 border-b border-zinc-200 bg-zinc-50/80 overflow-x-auto">
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  onClick={() => setActiveTab('feedback')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'feedback'
                      ? 'border-[#024182] text-[#024182] bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Confirmación de Guardado</span>
                  {supabaseSaveHistory.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.2 rounded-full bg-blue-100 text-[#024182] text-[10px] font-bold">
                      {supabaseSaveHistory.length}
                    </span>
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('diagnostics')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'diagnostics'
                      ? 'border-[#024182] text-[#024182] bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Activity className="w-3.5 h-3.5" />
                  <span>Diagnóstico y Estado</span>
                </button>

                <button
                  onClick={() => setActiveTab('sql')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'sql'
                      ? 'border-[#024182] text-[#024182] bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>Script SQL Completo</span>
                </button>

                <button
                  onClick={() => setActiveTab('sync')}
                  className={`px-3 py-2 text-xs font-bold border-b-2 transition-all flex items-center gap-1.5 cursor-pointer ${
                    activeTab === 'sync'
                      ? 'border-[#024182] text-[#024182] bg-white rounded-t-lg shadow-xs'
                      : 'border-transparent text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sincronización en la Nube</span>
                </button>
              </div>

              {/* Instant Verify Action Button */}
              <button
                onClick={handleVerifyConnection}
                disabled={isDiagnosing}
                className="px-3 py-1.5 mb-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs disabled:opacity-50 shrink-0"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isDiagnosing ? 'animate-spin' : ''}`} />
                <span>{isDiagnosing ? 'Comprobando...' : 'Verificar Conexión'}</span>
              </button>
            </div>

            {/* TAB 1: LIVE SAVE FEEDBACK & AUDIT COUNTERS */}
            {activeTab === 'feedback' && (
              <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-50/50">
                {/* Highlight banner for Last Saved Record */}
                <div className="p-4 bg-gradient-to-r from-emerald-900 to-teal-900 rounded-2xl text-white shadow-md">
                  <div className="flex items-start justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-emerald-500/30 border border-emerald-400/40 rounded-full text-[10px] font-black uppercase tracking-wider text-emerald-300">
                          Último Registro Persistido en Supabase
                        </span>
                        <span className="text-xs font-mono text-emerald-200">
                          {lastSupabaseSave ? `${lastSupabaseSave.latencyMs} ms latencia` : 'En espera de nuevo guardado'}
                        </span>
                      </div>

                      {lastSupabaseSave ? (
                        <div>
                          <h4 className="text-base font-bold text-white flex items-center gap-2">
                            <span>{lastSupabaseSave.moduleName}:</span>
                            <span className="text-emerald-300 font-mono">{lastSupabaseSave.recordIdentifier}</span>
                          </h4>
                          <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1">
                            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
                            <strong>{lastSupabaseSave.formattedDateTime}</strong>
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-emerald-100/80">
                          Cualquier nuevo gasto, bitácora de combustible, comprobante o catálogo que registres mostrará aquí el conteo antes/después y su fecha exacta de persistencia.
                        </p>
                      )}
                    </div>

                    {lastSupabaseSave && (
                      <div className="bg-white/10 backdrop-blur-xs p-3 rounded-xl border border-white/20 text-center shrink-0 min-w-[140px]">
                        <p className="text-[10px] uppercase font-bold text-emerald-200">Conteo de Registros</p>
                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-sm font-mono text-white/70">{lastSupabaseSave.previousCount}</span>
                          <span className="text-xs text-emerald-300">→</span>
                          <span className="text-lg font-black font-mono text-emerald-300">{lastSupabaseSave.newCount}</span>
                        </div>
                        <span className="text-[9px] font-bold text-emerald-400">Total en Módulo</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Save History Log Table */}
                <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-xs">
                  <div className="p-3 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                      <History className="w-4 h-4 text-[#024182]" />
                      <span>Historial de Operaciones Guardadas en Supabase (Sesión en Vivo)</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      {supabaseSaveHistory.length} eventos registrados
                    </span>
                  </div>

                  {supabaseSaveHistory.length > 0 ? (
                    <div className="divide-y divide-zinc-100 text-xs max-h-72 overflow-y-auto">
                      {supabaseSaveHistory.map((item) => (
                        <div key={item.id} className="p-3 flex items-center justify-between hover:bg-zinc-50 transition-colors">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-zinc-900">{item.moduleName}</span>
                              <span className="font-mono text-zinc-500 text-[11px]">({item.tableName})</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-mono font-bold uppercase ${
                                item.action === 'insert' ? 'bg-emerald-100 text-emerald-800' :
                                item.action === 'update' ? 'bg-blue-100 text-blue-800' :
                                item.action === 'delete' ? 'bg-rose-100 text-rose-800' : 'bg-purple-100 text-purple-800'
                              }`}>
                                {item.action}
                              </span>
                            </div>
                            <p className="text-[11px] text-zinc-600 font-medium">
                              Identificador: <strong className="text-zinc-900 font-mono">{item.recordIdentifier}</strong>
                            </p>
                            <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                              <Calendar className="w-3 h-3 text-zinc-400" />
                              <span>{item.formattedDateTime}</span>
                            </div>
                          </div>

                          <div className="text-right shrink-0 space-y-1">
                            <div className="flex items-center gap-2 justify-end">
                              <span className="text-[11px] font-mono text-zinc-500">
                                {item.previousCount} → <strong className="text-zinc-900">{item.newCount}</strong>
                              </span>
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 font-mono">
                                {item.latencyMs} ms
                              </span>
                            </div>
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600">
                              <CheckCircle className="w-3 h-3" />
                              <span>Guardado sin falla</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center space-y-2">
                      <div className="p-3 bg-zinc-100 rounded-full w-fit mx-auto text-zinc-400">
                        <Database className="w-6 h-6" />
                      </div>
                      <p className="text-xs font-bold text-zinc-700">Aún no se han realizado operaciones en esta sesión</p>
                      <p className="text-[11px] text-zinc-400 max-w-sm mx-auto">
                        Crea o edita cualquier registro en cualquiera de los módulos para comprobar en tiempo real cómo se sincroniza y almacena en Supabase.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: DIAGNOSTICS & LIVE STATUS */}
            {activeTab === 'diagnostics' && (
              <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-50/50">
                {/* Live Status Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className={`p-4 rounded-xl border flex items-center gap-3 ${
                    isConnected ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <div className={`p-2.5 rounded-xl ${isConnected ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
                      {isConnected ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Semáforo de Conexión</p>
                      <p className={`text-sm font-black ${isConnected ? 'text-emerald-900' : 'text-rose-900'}`}>
                        {isConnected ? '🟢 Conexión Activa' : '🔴 Desconectado'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-blue-50 text-[#024182] border border-blue-100">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Latencia de Respuesta</p>
                      <p className="text-sm font-black font-mono text-zinc-900">
                        {latencyMs} <span className="text-xs font-normal text-zinc-500">milisegundos (ms)</span>
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl border border-zinc-200 bg-white flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-50 text-purple-700 border border-purple-100">
                      <Server className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500">Monitoreo Heartbeat</p>
                      <p className="text-sm font-black text-zinc-900">
                        Cada 25 segundos <span className="text-xs text-emerald-600 font-bold">● Activo</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Table Health Matrix */}
                <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-xs">
                  <div className="p-3 bg-zinc-100/70 border-b border-zinc-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-zinc-800">
                      <Shield className="w-4 h-4 text-[#024182]" />
                      <span>Matriz de Salud de Tablas en Supabase</span>
                    </div>
                    <span className="text-[10px] font-mono text-zinc-500">
                      Última verificación: {diagnostic?.timestamp || 'En este momento'}
                    </span>
                  </div>

                  <div className="divide-y divide-zinc-100 text-xs">
                    {diagnostic?.tableHealth ? (
                      Object.entries(diagnostic.tableHealth).map(([table, h]: [string, any]) => (
                        <div key={table} className="p-2.5 flex items-center justify-between hover:bg-zinc-50">
                          <div className="flex items-center gap-2 font-mono">
                            <span className="font-semibold text-zinc-900">{table}</span>
                          </div>

                          <div className="flex items-center gap-3">
                            {h.ok ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                                <Check className="w-3 h-3" />
                                <span>OK ({h.count} filas)</span>
                              </span>
                            ) : h.status === 'missing_table' ? (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                                <AlertCircle className="w-3 h-3" />
                                <span>Tabla faltante (Ejecutar SQL)</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                                <AlertCircle className="w-3 h-3" />
                                <span>{h.message || 'Bloqueado RLS'}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-zinc-400 text-xs italic">
                        Ejecutando diagnóstico inicial de tablas...
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SQL SCRIPT & 1-CLICK COPY */}
            {activeTab === 'sql' && (
              <div className="p-5 space-y-4 overflow-y-auto flex-1 bg-zinc-50/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-bold text-zinc-900">Script SQL Completo e Idempotente</h4>
                    <p className="text-[11px] text-zinc-500">
                      Incluye definición de tablas, políticas RLS, columnas de estado activo y todos los registros de muestra.
                    </p>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={handleCopySql}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs ${
                        copiedSql
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-[#024182] hover:bg-[#013266] text-white border-[#024182]'
                      }`}
                    >
                      {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedSql ? '¡Copiado con Éxito!' : 'Copiar SQL Completo'}</span>
                    </button>

                    <button
                      onClick={handleDownloadSql}
                      className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-300 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar .sql</span>
                    </button>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-start gap-2.5 text-xs text-blue-900">
                  <Sparkles className="w-4 h-4 text-[#024182] shrink-0 mt-0.5" />
                  <p>
                    <strong>Instrucciones rápidas:</strong> Abre tu panel de Supabase → Sección <strong>SQL Editor</strong> → Haz clic en <strong>New Query</strong> → Pega este código y presiona <strong>RUN</strong>. Este script es seguro y se puede ejecutar múltiples veces sin duplicar registros gracias a <code className="bg-blue-100 px-1 rounded font-mono font-bold">ON CONFLICT DO UPDATE</code>.
                  </p>
                </div>

                {/* SQL Code Box */}
                <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs shadow-inner">
                  <pre className="p-4 text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
                    {FULL_SUPABASE_SQL_SCRIPT}
                  </pre>
                </div>
              </div>
            )}

            {/* TAB 4: SMART SYNC */}
            {activeTab === 'sync' && (
              <div className="p-5 space-y-5 overflow-y-auto flex-1 bg-zinc-50/50">
                <div className="p-5 bg-white border border-zinc-200 rounded-2xl shadow-xs space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h4 className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 text-[#024182]" />
                        <span>Sincronización Inteligente de Bitácora y Registros</span>
                      </h4>
                      <p className="text-xs text-zinc-600 mt-1">
                        Sube y consolida todos los comprobantes, bitácoras de combustible, gastos y usuarios hacia tu base de datos en la nube.
                      </p>
                    </div>

                    <button
                      onClick={handleSyncAll}
                      disabled={isSyncing}
                      className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-sm ${
                        syncSuccess
                          ? 'bg-emerald-600 text-white'
                          : 'bg-[#024182] hover:bg-[#013266] text-white disabled:opacity-50'
                      }`}
                    >
                      <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                      <span>{isSyncing ? 'Subiendo registros...' : syncSuccess ? '¡Todo Sincronizado!' : 'Subir Todos los Registros a Supabase'}</span>
                    </button>
                  </div>

                  {/* Summary of items to sync */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                      <p className="text-lg font-black text-[#024182]">{gastos.length}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Gastos</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                      <p className="text-lg font-black text-[#024182]">{gasolinaRecords.length}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Bitácora Gasolina</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                      <p className="text-lg font-black text-[#024182]">{comprobantesGastos.length}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Comprobantes</p>
                    </div>
                    <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 text-center">
                      <p className="text-lg font-black text-[#024182]">{comprobantesCombustibleCliente.length}</p>
                      <p className="text-[10px] uppercase font-bold text-zinc-500">Tickets Cliente</p>
                    </div>
                  </div>
                </div>

                {syncSuccess && (
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3 text-xs text-emerald-900">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>
                      ¡Excelente! Se sincronizaron exitosamente <strong>{totalLocalRecords} registros</strong> hacia la nube de Supabase.
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Modal Footer */}
            <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-zinc-500">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
                <span>RBAC: Disponible para Administrador, Contador, Supervisor y Custodio</span>
              </div>

              <button
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
              >
                Cerrar Consola
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

