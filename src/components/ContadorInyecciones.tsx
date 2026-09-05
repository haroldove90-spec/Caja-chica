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
  const [cajaAjusteId, setCajaAjusteId] = useState<string>(safeCaja.id);
  const [nuevoFondoBase, setNuevoFondoBase] = useState<string>((safeCaja.fondoBase ?? 0).toString());
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const selectedCaja = cajas.find(c => c.id === cajaDestinoId) || safeCaja;
  const cajaAjuste = cajas.find(c => c.id === cajaAjusteId) || safeCaja;
  const numMontoAbono = parseFloat(montoAbono) || 0;

  // Filters for Monthly Report
  const [filterMonth, setFilterMonth] = useState<string>('all');
  const [filterCaja, setFilterCaja] = useState<string>('all');
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);

  // Compute available months from abonos safely
  const availableMonths: string[] = Array.from(new Set<string>(abonos.map(a => {
    if (!a?.fecha) return '';
    const d = new Date(a.fecha.replace(' ', 'T'));
    if (isNaN(d.getTime())) return a.fecha.substring(0, 7);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }))).filter(Boolean).sort().reverse();

  // Filtered Abonos for Report safely
  const filteredAbonos = abonos.filter(a => {
    if (!a) return false;
    if (filterCaja !== 'all' && a.cajaId !== filterCaja) return false;
    if (filterMonth !== 'all') {
      if (!a.fecha) return false;
      const d = new Date(a.fecha.replace(' ', 'T'));
      const aMonth = isNaN(d.getTime()) ? a.fecha.substring(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (aMonth !== filterMonth) return false;
    }
    return true;
  });

  const totalInyectadoFiltrado = filteredAbonos.reduce((acc, curr) => acc + (curr?.monto || 0), 0);

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

  // Currency input handler (no arrows, only digits and decimals)
  const handleMontoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    // Keep only numbers and dots
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].substring(0, 2);
    }
    setMontoAbono(val);
  };

  const handleNuevoFondoBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value;
    val = val.replace(/[^0-9.]/g, '');
    const parts = val.split('.');
    if (parts.length > 2) {
      val = parts[0] + '.' + parts.slice(1).join('');
    }
    if (parts[1] && parts[1].length > 2) {
      val = parts[0] + '.' + parts[1].substring(0, 2);
    }
    setNuevoFondoBase(val);
  };

  const handleAddAbono = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montoAbono);
    if (isNaN(val) || val <= 0 || !conceptoAbono.trim()) {
      alert('Por favor ingresa un monto válido y un concepto para el abono.');
      return;
    }

    const targetCaja = cajas.find(c => c.id === cajaDestinoId) || safeCaja;
    const nuevoSaldo = Number(((targetCaja.saldoActual || 0) + val).toFixed(2));

    await addAbono({
      cajaId: targetCaja.id,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      monto: val,
      concepto: conceptoAbono.trim(),
      registradoPor: 'CP. Alberto Vargas'
    });

    setFeedbackMsg(`¡Inyección de $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })} aplicada con éxito! El fondo actual de "${targetCaja.nombre}" ahora es de $${nuevoSaldo.toLocaleString('es-MX', { minimumFractionDigits: 2 })}.`);
    setMontoAbono('');
    setConceptoAbono('');
    setTimeout(() => setFeedbackMsg(null), 6000);
  };

  const handleUpdateFondoBase = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(nuevoFondoBase);
    if (isNaN(val) || val < 0) {
      alert('Ingresa un límite de fondo base válido.');
      return;
    }

    updateFondoBase(cajaAjuste.id, val);
    alert(`Límite estructural de fondo base actualizado a $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })} para ${cajaAjuste.nombre}`);
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
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                {cajas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre} • Saldo: ${(c.saldoActual ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} (Base: ${(c.fondoBase ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })})
                  </option>
                ))}
              </select>
            </div>

            {/* ESTADO DE FONDO ACTUAL DE LA CAJA SELECCIONADA */}
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-medium block">Fondo Actual Disponible</span>
                <span className="text-sm font-black text-zinc-900">
                  ${(selectedCaja.saldoActual ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="h-7 w-px bg-zinc-200" />
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-medium block">Límite Base Asignado</span>
                <span className="text-xs font-semibold text-zinc-700">
                  {selectedCaja.tipoFondo === 'sin_fondo' ? 'Flujo Semanal' : `$${(selectedCaja.fondoBase ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
            </div>

            {/* CAMPO DE MONTO - SOLO MONEDA (SIN FLECHITAS / SPIN BUTTONS) */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-zinc-700 font-medium">Monto de la Inyección ($) *</label>
                <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                  Solo Moneda (MXN)
                </span>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
                  $
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  placeholder="0.00"
                  value={montoAbono}
                  onChange={handleMontoChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-14 py-2.5 text-sm font-bold text-zinc-900 placeholder:text-zinc-400 placeholder:font-normal focus:outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-xs font-semibold">
                  MXN
                </div>
              </div>

              {/* PROYECCIÓN EN TIEMPO REAL DEL FONDO ACTUAL RESULTANTE */}
              {numMontoAbono > 0 && (
                <div className="mt-2.5 p-3 bg-emerald-50/80 border border-emerald-200/90 rounded-xl text-xs space-y-1.5 animate-fade-in">
                  <div className="flex justify-between items-center text-zinc-600">
                    <span>Fondo Actual Disponible:</span>
                    <span className="font-semibold text-zinc-900">
                      ${(selectedCaja.saldoActual ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-emerald-700 font-medium">
                    <span>+ Inyección solicitada:</span>
                    <span className="font-bold">
                      +${numMontoAbono.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-900 font-bold pt-1.5 border-t border-emerald-200 text-xs">
                    <span className="text-emerald-950 font-bold">Nuevo Saldo del Fondo:</span>
                    <span className="text-sm text-emerald-700 font-black">
                      ${((selectedCaja.saldoActual ?? 0) + numMontoAbono).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}
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
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
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
              <select
                value={cajaAjusteId}
                onChange={(e) => {
                  setCajaAjusteId(e.target.value);
                  const c = cajas.find(item => item.id === e.target.value);
                  if (c) setNuevoFondoBase((c.fondoBase ?? 0).toString());
                }}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold text-zinc-800 focus:outline-none focus:border-zinc-900 cursor-pointer"
              >
                {cajas.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] text-zinc-500 font-medium block">Límite Base Actual</span>
                <span className="text-sm font-black text-zinc-900">
                  {cajaAjuste.tipoFondo === 'sin_fondo' ? 'Sin Fondo Fijo' : `$${(cajaAjuste.fondoBase ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
                </span>
              </div>
              <div className="h-7 w-px bg-zinc-200" />
              <div className="text-right">
                <span className="text-[10px] text-zinc-500 font-medium block">Saldo Disponible Actual</span>
                <span className="text-xs font-semibold text-zinc-700">
                  ${(cajaAjuste.saldoActual ?? 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nuevo Límite de Fondo Base ($) *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500 font-bold text-sm">
                  $
                </div>
                <input
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  required
                  placeholder={(cajaAjuste.fondoBase ?? 0).toString()}
                  value={nuevoFondoBase}
                  onChange={handleNuevoFondoBaseChange}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-14 py-2.5 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all shadow-xs [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-zinc-400 text-xs font-semibold">
                  MXN
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs active:scale-[0.99]"
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
