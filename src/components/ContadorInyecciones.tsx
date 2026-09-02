import React, { useState } from 'react';
import { TrendingUp, Plus, ArrowUpRight, History, Settings, Calendar, Filter, Printer, HelpCircle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PDFInyeccionesModal } from './PDFInyeccionesModal';

export const ContadorInyecciones: React.FC = () => {
  const {
    activeCaja,
    activeCajaId,
    cajas,
    abonos,
    addAbono,
    updateFondoBase
  } = useApp();

  const safeCaja = activeCaja || {
    id: activeCajaId || 'caja-1',
    nombre: 'Caja Chica - Reina Pino (Matriz)',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 15000,
    estado: 'Abierta',
    ubicacion: 'Oficina Central',
    tipoFondo: 'fijo'
  };

  const [montoAbono, setMontoAbono] = useState<string>('');
  const [conceptoAbono, setConceptoAbono] = useState<string>('');
  const [cajaDestinoId, setCajaDestinoId] = useState<string>(safeCaja.id);
  const [nuevoFondoBase, setNuevoFondoBase] = useState<string>(safeCaja.fondoBase.toString());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Filters for Monthly Report
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCaja, setFilterCaja] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Compute available months from abonos
  const availableMonths: string[] = Array.from(new Set<string>(abonos.map(a => {
    const d = new Date(a.fecha.replace(' ', 'T'));
    if (isNaN(d.getTime())) return a.fecha.substring(0, 7);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }))).sort().reverse();

  // Filtered Abonos for Report
  const filteredAbonos = abonos.filter(a => {
    if (filterCaja !== 'all' && a.cajaId !== filterCaja) return false;
    if (filterMonth !== 'all') {
      const d = new Date(a.fecha.replace(' ', 'T'));
      const aMonth = isNaN(d.getTime()) ? a.fecha.substring(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (aMonth !== filterMonth) return false;
    }
    return true;
  });

  const totalInyectadoFiltrado = filteredAbonos.reduce((acc, curr) => acc + curr.monto, 0);

  const getMonthName = (monthKey: string) => {
    if (monthKey === 'all') return 'Todos los Meses';
    const [year, month] = monthKey.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${year}`;
  };

  const getCajaName = (cajaId: string) => {
    if (cajaId === 'all') return 'Todas las Cajas Chicas';
    return cajas.find(c => c.id === cajaId)?.nombre || cajaId;
  };

  const handleAddAbono = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montoAbono);
    if (isNaN(val) || val <= 0 || !conceptoAbono.trim()) {
      alert('Por favor ingresa un monto válido y un concepto para el abono.');
      return;
    }

    const targetCaja = cajas.find(c => c.id === cajaDestinoId) || safeCaja;

    addAbono({
      cajaId: targetCaja.id,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      monto: val,
      concepto: conceptoAbono.trim(),
      registradoPor: 'CP. Alberto Vargas'
    });

    setFeedbackMsg(`¡Inyección de $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })} aplicada automáticamente al saldo de ${targetCaja.nombre}!`);
    setMontoAbono('');
    setConceptoAbono('');
    setTimeout(() => setFeedbackMsg(null), 5000);
  };

  const handleUpdateFondoBase = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(nuevoFondoBase);
    if (isNaN(val) || val < 0) {
      alert('Ingresa un límite de fondo base válido.');
      return;
    }

    updateFondoBase(safeCaja.id, val);
    alert(`Límite estructural de fondo base actualizado a $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })} para ${safeCaja.nombre}`);
  };

  return (
    <div className="space-y-6">
      {/* EXPLANATORY BANNER */}
      <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 text-xs text-blue-950 flex items-start gap-3 shadow-xs">
        <HelpCircle className="w-5 h-5 text-[#024182] shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-bold text-sm text-[#024182]">Regla de Negocio: Inyecciones vs. Ajuste de Fondo Base</h4>
          <p className="text-blue-900 leading-relaxed">
            • <strong>Inyección de Abono Directo:</strong> Incrementa automáticamente el saldo disponible de la caja chica en tiempo real para reposición inmediata.<br />
            • <strong>Ajuste de Fondo Base:</strong> Modifica exclusivamente el límite contractual de la caja chica (asignado por dirección).
          </p>
        </div>
      </div>

      {feedbackMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* TWO FORMS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* REGISTRAR ABONO A FONDO */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Registrar Abono a Fondo</h3>
              <p className="text-[11px] text-zinc-500">Inyección de efectivo o transferencia directa al saldo</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>

          <form onSubmit={handleAddAbono} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Caja Chica Destino *</label>
              <select
                value={cajaDestinoId}
                onChange={(e) => setCajaDestinoId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900"
              >
                {cajas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} {c.tipoFondo === 'sin_fondo' ? '(Flujo Semanal)' : `($${c.fondoBase.toLocaleString('es-MX')})`}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Monto de la Inyección ($) *</label>
              <input
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="Ej: 10000.00"
                value={montoAbono}
                onChange={(e) => setMontoAbono(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Concepto / Detalle de la Entrega *</label>
              <textarea
                required
                rows={2}
                placeholder="Ej: CP. Alberto entregó $10,000.00 por transferencia SPEI para reposición de operativas..."
                value={conceptoAbono}
                onChange={(e) => setConceptoAbono(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 resize-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Abonar Directamente a la Caja</span>
            </button>
          </form>
        </div>

        {/* AJUSTE DE FONDO BASE DE LA CAJA */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 h-fit">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Ajuste de Límite de Fondo Base</h3>
              <p className="text-[11px] text-zinc-500">Actualizar el límite contractual asignado de la caja</p>
            </div>
            <Settings className="w-4 h-4 text-zinc-500" />
          </div>

          <form onSubmit={handleUpdateFondoBase} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Caja Seleccionada</label>
              <input
                type="text"
                disabled
                value={safeCaja.nombre}
                className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-700"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Límite de Fondo Base Actual</label>
              <div className="text-xl font-bold text-zinc-900">
                {safeCaja.tipoFondo === 'sin_fondo' ? 'Sin Fondo Fijo (Flujo Semanal)' : `$${safeCaja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nuevo Límite de Fondo Base ($) *</label>
              <input
                type="number"
                step="500"
                required
                placeholder={safeCaja.fondoBase.toString()}
                value={nuevoFondoBase}
                onChange={(e) => setNuevoFondoBase(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
            >
              <span>Actualizar Límite de Fondo Base</span>
            </button>
          </form>
        </div>
      </div>

      {/* REPORTE MENSUAL DE INYECCIONES Y ABONOS */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900 flex items-center gap-2">
              <span>Reporte Mensual de Inyecciones de Fondo</span>
              <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                {filteredAbonos.length} registros
              </span>
            </h3>
            <p className="text-[11px] text-zinc-500">Monitoreo de fondos transferidos y reposición de efectivo</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter by Month */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs">
              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
                className="bg-transparent text-zinc-800 font-medium focus:outline-none text-xs"
              >
                <option value="all">Todos los Meses</option>
                {availableMonths.map(m => (
                  <option key={m} value={m}>{getMonthName(m)}</option>
                ))}
              </select>
            </div>

            {/* Filter by Caja */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1 text-xs">
              <Filter className="w-3.5 h-3.5 text-zinc-400" />
              <select
                value={filterCaja}
                onChange={(e) => setFilterCaja(e.target.value)}
                className="bg-transparent text-zinc-800 font-medium focus:outline-none text-xs"
              >
                <option value="all">Todas las Cajas</option>
                {cajas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>

            {/* PDF Report Button */}
            <button
              onClick={() => setShowPdfModal(true)}
              className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Reporte Mensual PDF</span>
            </button>
          </div>
        </div>

        {/* METRICS CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80">
            <span className="text-[11px] text-zinc-500 font-medium block">Total Inyectado en Periodo</span>
            <span className="text-xl font-bold text-emerald-600">
              ${totalInyectadoFiltrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80">
            <span className="text-[11px] text-zinc-500 font-medium block">Cantidad de Operaciones</span>
            <span className="text-xl font-bold text-zinc-900">
              {filteredAbonos.length} abonos
            </span>
          </div>

          <div className="bg-zinc-50 rounded-xl p-4 border border-zinc-200/80">
            <span className="text-[11px] text-zinc-500 font-medium block">Promedio por Abono</span>
            <span className="text-xl font-bold text-zinc-900">
              ${filteredAbonos.length > 0 ? (totalInyectadoFiltrado / filteredAbonos.length).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
            </span>
          </div>
        </div>

        {/* HISTORY TABLE */}
        {filteredAbonos.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-6">
            No hay abonos registrados para los filtros seleccionados ({getMonthName(filterMonth)} - {getCajaName(filterCaja)}).
          </p>
        ) : (
          <div className="space-y-2.5">
            {filteredAbonos.map((abn) => {
              const cajaObj = cajas.find(c => c.id === abn.cajaId);
              return (
                <div key={abn.id} className="p-3.5 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs hover:border-zinc-300 transition-all">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-zinc-900">{abn.concepto}</span>
                      <span className="text-[10px] font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {cajaObj?.nombre || abn.cajaId}
                      </span>
                    </div>
                    <span className="text-[10px] text-zinc-400">
                      Registrado por {abn.registradoPor} • {abn.fecha}
                    </span>
                  </div>
                  <span className="font-bold text-emerald-600 text-base shrink-0">
                    +${abn.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* PDF REPORT MODAL FOR INYECCIONES */}
      <PDFInyeccionesModal
        isOpen={showPdfModal}
        onClose={() => setShowPdfModal(false)}
        abonos={filteredAbonos}
        cajas={cajas}
        selectedMonthName={getMonthName(filterMonth)}
        selectedCajaName={getCajaName(filterCaja)}
      />
    </div>
  );
};
