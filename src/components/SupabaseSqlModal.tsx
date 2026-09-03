import React, { useState } from 'react';
import { Database, Copy, Check, Download, X, AlertTriangle, Terminal, ShieldCheck, RefreshCw, ShieldAlert, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { STRUCTURE_ONLY_SQL_SCRIPT, FULL_SUPABASE_SQL_SCRIPT } from '../constants/supabaseSqlScript';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const [mode, setMode] = useState<'structure' | 'full'>('structure');
  const { syncWithSupabaseNow } = useApp();

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await syncWithSupabaseNow();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err) {
      console.error('Error syncing:', err);
    } finally {
      setSyncing(false);
    }
  };

  const sqlScript = mode === 'structure' ? STRUCTURE_ONLY_SQL_SCRIPT : FULL_SUPABASE_SQL_SCRIPT;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const filename = mode === 'structure' ? 'supabase_schema_solo_estructura.sql' : 'supabase_schema_completo.sql';
    const element = document.createElement('a');
    const file = new Blob([sqlScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = filename;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#024182] to-[#1d5fa6] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Script SQL para Supabase (100% Sin Pérdida de Datos)</h3>
              <p className="text-xs text-blue-100">Protección garantizada: no borra ni sobreescribe registros existentes</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Direct Sync Action Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Sincronizar Base de Datos con Supabase</span>
              </div>
              <p className="text-xs text-emerald-700">
                Sube todos los comprobantes de cliente, gastos, cajas y registros a tu proyecto de Supabase.
              </p>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs ${
                syncSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#024182] hover:bg-[#013266] text-white disabled:opacity-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : syncSuccess ? '¡Sincronizado!' : 'Sincronizar Todo a Supabase'}</span>
            </button>
          </div>

          {/* Mode Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setMode('structure')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                mode === 'structure'
                  ? 'bg-blue-50/80 border-[#024182] shadow-xs'
                  : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-[#024182] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Opción 1: Solo Estructura (Recomendado)
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  CERO RIESGO
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">
                Crea tablas y columnas faltantes con <code className="font-mono text-zinc-800">IF NOT EXISTS</code>. <strong>NO toca ni borra ningún dato</strong> que hayas registrado en tu base de datos.
              </p>
            </button>

            <button
              type="button"
              onClick={() => setMode('full')}
              className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                mode === 'full'
                  ? 'bg-blue-50/80 border-[#024182] shadow-xs'
                  : 'bg-zinc-50 border-zinc-200 hover:bg-zinc-100/70'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-zinc-900 flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-[#024182]" />
                  Opción 2: Estructura + Semillas Base
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                  ON CONFLICT DO NOTHING
                </span>
              </div>
              <p className="text-[11px] text-zinc-600 mt-1.5">
                Crea tablas y solo inserta catálogos si están vacíos. Si ya existe cualquier registro, <strong>NO lo sobreescribe ni lo altera</strong>.
              </p>
            </button>
          </div>

          {/* Explanation Alert */}
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs text-emerald-950 space-y-1">
              <p className="font-bold">Garantía de Preservación de Datos</p>
              <p>
                ✓ <strong>Sin sentencias destructivas:</strong> Se eliminaron todas las operaciones de borrado (<code className="font-mono font-bold">DELETE</code>, <code className="font-mono font-bold">DROP</code>, <code className="font-mono font-bold">TRUNCATE</code>).
              </p>
              <p>
                ✓ <strong>Protección contra sobreescritura:</strong> Todas las inserciones usan <code className="font-mono font-bold bg-emerald-100 px-1 py-0.2 rounded">ON CONFLICT (id) DO NOTHING</code>, protegiendo al 100% tus saldos, cajas, gastos y comprobantes creados.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <Terminal className="w-4 h-4 text-[#024182]" />
              <span>
                {mode === 'structure' ? 'Código SQL: Solo Estructura (Sin Datos)' : 'Código SQL: Estructura + Catálogos Base'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar SQL'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .sql</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
            <pre className="p-4 text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
              {sqlScript}
            </pre>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-[#024182] shrink-0" />
            <span>
              <strong>Instrucciones:</strong> Copia este código, ve a tu panel de Supabase → <strong>SQL Editor</strong> → Crea un nuevo Query, pega el código y haz clic en <strong>RUN</strong>.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
