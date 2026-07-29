import React, { useState } from 'react';
import { Lock, Send, AlertCircle, CheckCircle2, FileText, PieChart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustodioCierre: React.FC = () => {
  const {
    activeCaja,
    activeCajaId,
    activeCajaGastos,
    activeCajaGastosAcumulados,
    giros,
    solicitarReembolso,
    reembolsos,
    setActiveModule
  } = useApp();

  const [observaciones, setObservaciones] = useState('');
  const [submitted, setSubmitted] = useState(false);

  if (!activeCaja) return null;

  // Group active unsubmitted expenses by Giro
  const breakdownByGiro = giros.map(giro => {
    const giroGastos = activeCajaGastos.filter(g => g.giroId === giro.id);
    const total = giroGastos.reduce((a, b) => a + b.importe, 0);
    return {
      giro,
      count: giroGastos.length,
      total,
      percentage: activeCajaGastosAcumulados > 0 ? (total / activeCajaGastosAcumulados) * 100 : 0
    };
  }).filter(item => item.count > 0);

  const pendingReembolso = reembolsos.find(r => r.cajaId === activeCajaId && r.estado === 'pendiente');

  const handleSolicitar = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeCajaGastos.length === 0) {
      alert('No hay gastos acumulados para solicitar reembolso.');
      return;
    }
    solicitarReembolso(activeCajaId, observaciones);
    setSubmitted(true);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Pending status banner if caja is pending reimbursement */}
      {pendingReembolso ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-amber-900">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold">Solicitud de Reembolso en Proceso ({pendingReembolso.nroReembolso})</h3>
              <p className="text-xs text-amber-800">
                Esta caja se encuentra en estado <span className="font-semibold">Pendiente de Reembolso</span> enviada el {pendingReembolso.fechaSolicitud}.
                El Contador/Auditor está revisando las evidencias por un total de <span className="font-bold">${pendingReembolso.totalGastos.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>.
              </p>
            </div>
          </div>
        </div>
      ) : submitted ? (
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-5 text-emerald-900 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
          <h3 className="text-base font-semibold">¡Solicitud Enviada con Éxito!</h3>
          <p className="text-xs text-emerald-800">
            Los gastos han sido congelados y el reporte fue enviado al panel del Contador / Auditor para su revisión y depósito.
          </p>
          <button
            onClick={() => {
              setSubmitted(false);
              setActiveModule('movimientos');
            }}
            className="mt-3 bg-emerald-700 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-emerald-800 cursor-pointer"
          >
            Volver a Consulta de Fondo
          </button>
        </div>
      ) : (
        <>
          {/* Resumen de Cierre */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-semibold text-zinc-900">Resumen para Solicitud de Reembolso</h3>
                <p className="text-xs text-zinc-500">{activeCaja.nombre}</p>
              </div>
              <span className="text-xs font-mono font-semibold text-zinc-700 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200">
                {activeCajaGastos.length} Comprobantes
              </span>
            </div>

            {/* General Metrics */}
            <div className="grid grid-cols-2 gap-4 bg-zinc-50 p-4 rounded-xl border border-zinc-200/60">
              <div>
                <span className="text-[11px] text-zinc-500 block">Monto Total A Reembolsar</span>
                <span className="text-2xl font-bold text-zinc-900 tracking-tight">
                  ${activeCajaGastosAcumulados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-zinc-500 block">Fondo Base Asignado</span>
                <span className="text-lg font-semibold text-zinc-700">
                  ${activeCaja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Desglose por Giro / Centro de Costos */}
            <div className="space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
                <PieChart className="w-4 h-4 text-zinc-500" />
                <span>Desglose por Giro / Centro de Costos</span>
              </div>

              {breakdownByGiro.length === 0 ? (
                <p className="text-xs text-zinc-400 italic">No hay gastos para clasificar.</p>
              ) : (
                <div className="space-y-2">
                  {breakdownByGiro.map(({ giro, count, total, percentage }) => (
                    <div key={giro.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: giro.color }}
                          />
                          <span className="font-medium text-zinc-800">{giro.nombre}</span>
                          <span className="text-[10px] text-zinc-400">({count} nota{count > 1 ? 's' : ''})</span>
                        </div>
                        <span className="font-semibold text-zinc-900">
                          ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} ({percentage.toFixed(0)}%)
                        </span>
                      </div>
                      <div className="w-full h-1.5 bg-zinc-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-300"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: giro.color
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Registro de Observaciones */}
            <form onSubmit={handleSolicitar} className="space-y-4 pt-3 border-t border-zinc-100">
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1">
                  Registro de Observaciones Operativas
                </label>
                <textarea
                  rows={3}
                  placeholder="Escribe notas sobre entregas físicas de efectivo, boletos originales o aclaraciones sobre el reembolso..."
                  value={observaciones}
                  onChange={(e) => setObservaciones(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-900 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={activeCajaGastos.length === 0}
                className={`w-full font-medium text-xs py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                  activeCajaGastos.length === 0
                    ? 'bg-zinc-200 text-zinc-400 cursor-not-allowed'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>Congelar Gastos y Solicitar Reembolso</span>
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
};
