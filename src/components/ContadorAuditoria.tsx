import React, { useState } from 'react';
import {
  FileCheck2,
  Eye,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  Building2,
  X,
  FileText
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ReembolsoRequest, Gasto } from '../types';
import { EvidenceGrid } from './EvidenceGrid';

export const ContadorAuditoria: React.FC = () => {
  const {
    reembolsos,
    gastos,
    cajas,
    giros,
    aprobarReembolso,
    rechazarGasto,
    aprobarGasto,
    setPreviewEvidencia,
    setPdfModalData
  } = useApp();

  const [selectedRmbId, setSelectedRmbId] = useState<string | null>(
    reembolsos.find(r => r.estado === 'pendiente')?.id || reembolsos[0]?.id || null
  );

  const [firmaInput, setFirmaInput] = useState<string>('CP. Alberto Vargas - KeyAuth-8841');
  const [rejectingGastoId, setRejectingGastoId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState<string>('');

  const selectedReembolso = reembolsos.find(r => r.id === selectedRmbId);
  const selectedCaja = selectedReembolso ? cajas.find(c => c.id === selectedReembolso.cajaId) : null;
  
  // Try matching by reembolsoId first; if empty (e.g. legacy or pending sync), fallback to caja's current expenses
  const directReembolsoGastos = selectedReembolso ? gastos.filter(g => g.reembolsoId === selectedReembolso.id) : [];
  const fallbackCajaGastos = selectedReembolso && directReembolsoGastos.length === 0 
    ? gastos.filter(g => g.cajaId === selectedReembolso.cajaId && g.activo !== false)
    : [];
  const reembolsoGastos = directReembolsoGastos.length > 0 ? directReembolsoGastos : fallbackCajaGastos;

  const handleConfirmRechazo = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectingGastoId && rejectReason.trim()) {
      rechazarGasto(rejectingGastoId, rejectReason);
      setRejectingGastoId(null);
      setRejectReason('');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* BANDEJA DE REEMBOLSOS PENDIENTES */}
      <div className="lg:col-span-4 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Bandeja de Reembolsos</h3>
            <p className="text-[11px] text-zinc-500">Solicitudes enviadas por Custodios</p>
          </div>
          <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-2.5 py-1 rounded-full border border-zinc-200">
            {reembolsos.filter(r => r.estado === 'pendiente').length} Pendientes
          </span>
        </div>

        {reembolsos.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-6">No hay solicitudes de reembolso.</p>
        ) : (
          <div className="space-y-2.5">
            {reembolsos.map((rmb) => {
              const cajaObj = cajas.find(c => c.id === rmb.cajaId);
              const isSelected = selectedRmbId === rmb.id;
              const isPendiente = rmb.estado === 'pendiente';

              return (
                <button
                  key={rmb.id}
                  onClick={() => setSelectedRmbId(rmb.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-zinc-200/80 bg-zinc-50/50 hover:border-zinc-300 text-zinc-800'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className={`font-mono text-xs font-semibold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                      {rmb.nroReembolso}
                    </span>
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        isPendiente
                          ? isSelected ? 'bg-amber-400/20 text-amber-200 border border-amber-400/30' : 'bg-amber-100 text-amber-800'
                          : isSelected ? 'bg-emerald-400/20 text-emerald-200 border border-emerald-400/30' : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {rmb.estado.toUpperCase()}
                    </span>
                  </div>

                  <p className={`text-xs font-medium ${isSelected ? 'text-zinc-200' : 'text-zinc-700'}`}>
                    {cajaObj?.nombre || 'Caja Chica'}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-zinc-200/20 text-[11px]">
                    <span className={isSelected ? 'text-zinc-400' : 'text-zinc-400'}>
                      {rmb.fechaSolicitud}
                    </span>
                    <span className={`font-bold ${isSelected ? 'text-white' : 'text-zinc-900'}`}>
                      ${rmb.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* AUDITORÍA Y DETALLE DE COMPROBANTES */}
      <div className="lg:col-span-8 space-y-6">
        {selectedReembolso ? (
          <>
            {/* Header / Info box */}
            <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-semibold text-zinc-900">{selectedReembolso.nroReembolso}</h3>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full ${
                      selectedReembolso.estado === 'pendiente' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {selectedReembolso.estado}
                    </span>
                  </div>
                  <p className="text-xs text-zinc-500">{selectedCaja?.nombre} • Responsable: {selectedCaja?.responsable}</p>
                </div>

                <button
                  onClick={() => setPdfModalData({
                    reembolso: selectedReembolso,
                    caja: selectedCaja || undefined,
                    gastos: reembolsoGastos
                  })}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-800 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer shrink-0"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Ver Reporte Oficial PDF</span>
                </button>
              </div>

              {/* Observaciones operativas enviadas por el custodio */}
              {selectedReembolso.observaciones && (
                <div className="bg-zinc-50 border border-zinc-200/80 rounded-xl p-3 text-xs text-zinc-700">
                  <span className="font-semibold block text-zinc-900 mb-0.5">Observaciones del Custodio:</span>
                  {selectedReembolso.observaciones}
                </div>
              )}

              {/* Comprobantes adjuntos para auditar */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
                  Revisión Individual de Comprobantes ({reembolsoGastos.length})
                </h4>

                <div className="space-y-2.5">
                  {reembolsoGastos.map((g) => {
                    const giroObj = giros.find(gi => gi.id === g.giroId);
                    const isRechazado = g.estado === 'rechazado';

                    return (
                      <div
                        key={g.id}
                        className={`p-3.5 rounded-xl border transition-all space-y-3 ${
                          isRechazado ? 'bg-rose-50/50 border-rose-200' : 'bg-zinc-50/60 border-zinc-200/80'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-mono font-semibold text-xs text-zinc-900">{g.nroOrden}</span>
                              {giroObj && (
                                <span
                                  className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                                  style={{ backgroundColor: `${giroObj.color}15`, color: giroObj.color }}
                                >
                                  {giroObj.nombre}
                                </span>
                              )}
                              <span className="text-[10px] text-zinc-400">{g.facturado ? 'Facturado' : 'Nota Simple'}</span>
                              <span className="text-[10px] text-zinc-400 font-mono">Fecha: {g.fecha}</span>
                            </div>

                            <p className="text-xs font-semibold text-zinc-900">{g.proveedor}</p>
                            <p className="text-xs text-zinc-600 line-clamp-2">{g.concepto}</p>

                            {isRechazado && (
                              <p className="text-[11px] text-rose-600 font-medium pt-1">
                                ⚠️ Rechazado: "{g.notaRechazo}"
                              </p>
                            )}
                          </div>

                          <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                            <div className="text-right">
                              <span className="text-sm font-bold text-zinc-900 block">
                                ${g.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                              </span>
                            </div>

                            {selectedReembolso.estado === 'pendiente' && (
                              <div className="flex items-center gap-1">
                                {isRechazado ? (
                                  <button
                                    onClick={() => aprobarGasto(g.id)}
                                    className="text-[10px] bg-zinc-200 hover:bg-zinc-300 text-zinc-800 px-2.5 py-1 rounded-md transition-colors cursor-pointer font-medium"
                                  >
                                    Re-Aprobar
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => setRejectingGastoId(g.id)}
                                    className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                                    title="Rechazar Comprobante"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* CUADRÍCULA / GRID DE EVIDENCIA AUDITABLE */}
                        {g.evidenciaUrl && (
                          <div className="pt-2 border-t border-zinc-200/60">
                            <EvidenceGrid
                              evidenciaUrl={g.evidenciaUrl}
                              evidenciaNombre={g.evidenciaNombre || `Evidencia_${g.nroOrden}`}
                              evidenciaType={g.evidenciaType || 'image'}
                              recordIdentifier={g.nroOrden}
                              title="Evidencia / Ticket Adjunto"
                              compact={true}
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* FIRMA ELECTRÓNICA Y APROBACIÓN FINAL DEL REEMBOLSO */}
              {selectedReembolso.estado === 'pendiente' ? (
                <div className="pt-4 border-t border-zinc-100 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-zinc-800">
                    <FileCheck2 className="w-4 h-4 text-emerald-600" />
                    <span>Firma Electrónica de Autorización de Fondo</span>
                  </div>

                  <div>
                    <label className="block text-[11px] text-zinc-500 mb-1">
                      Token / Código de Firma Electrónica del Autorizador
                    </label>
                    <input
                      type="text"
                      value={firmaInput}
                      onChange={(e) => setFirmaInput(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900"
                    />
                  </div>

                  <button
                    onClick={() => {
                      if (!firmaInput.trim()) {
                        alert('Ingresa tu firma o sello de autorización.');
                        return;
                      }
                      aprobarReembolso(selectedReembolso.id, firmaInput);
                    }}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
                  >
                    <Check className="w-4 h-4" />
                    <span>Aprobar Reembolso de ${selectedReembolso.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })} y Depositar a Fondo</span>
                  </button>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center justify-between">
                  <div>
                    <span className="font-semibold block">Aprobado y Liquidado</span>
                    <span className="text-[10px]">Aprobado por: {selectedReembolso.aprobadoPor} el {selectedReembolso.fechaAprobacion}</span>
                  </div>
                  <span className="font-mono text-[10px] bg-white px-2 py-1 rounded border border-emerald-300 text-emerald-900">
                    {selectedReembolso.firmaElectronica}
                  </span>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center text-zinc-400">
            Selecciona un reembolso de la bandeja para auditar.
          </div>
        )}
      </div>

      {/* MODAL DE RECHAZO CON MOTIVO */}
      {rejectingGastoId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-xl">
            <div className="flex items-center justify-between pb-2 border-b border-zinc-100">
              <h3 className="text-sm font-semibold text-zinc-900">Mandar Gasto a Corrección</h3>
              <button
                onClick={() => setRejectingGastoId(null)}
                className="text-zinc-400 hover:text-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmRechazo} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Motivo del Rechazo / Aclaración *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ej: Foto ilisible / ticket no corresponde al giro asignado / falta archivo PDF..."
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-900 resize-none"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingGastoId(null)}
                  className="flex-1 py-2 rounded-xl border border-zinc-200 font-medium text-zinc-600 hover:bg-zinc-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-medium shadow-xs"
                >
                  Confirmar Rechazo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
