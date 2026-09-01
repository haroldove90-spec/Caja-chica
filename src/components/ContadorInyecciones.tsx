import React, { useState } from 'react';
import { TrendingUp, Plus, ArrowUpRight, History, Settings } from 'lucide-react';
import { useApp } from '../context/AppContext';

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
    nombre: 'Caja Chica - Matriz',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 15000,
    estado: 'Abierta',
    ubicacion: 'Oficina Central'
  };

  const [montoAbono, setMontoAbono] = useState<string>('');
  const [conceptoAbono, setConceptoAbono] = useState<string>('');
  const [nuevoFondoBase, setNuevoFondoBase] = useState<string>(safeCaja.fondoBase.toString());

  const cajaAbonos = abonos.filter(a => a.cajaId === safeCaja.id);

  const handleAddAbono = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(montoAbono);
    if (isNaN(val) || val <= 0 || !conceptoAbono.trim()) {
      alert('Por favor ingresa un monto válido y un concepto para el abono.');
      return;
    }

    addAbono({
      cajaId: safeCaja.id,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 16),
      monto: val,
      concepto: conceptoAbono,
      registradoPor: 'CP. Alberto Vargas'
    });

    setMontoAbono('');
    setConceptoAbono('');
  };

  const handleUpdateFondoBase = (e: React.FormEvent) => {
    e.preventDefault();
    const val = parseFloat(nuevoFondoBase);
    if (isNaN(val) || val <= 0) {
      alert('Ingresa un límite de fondo base válido.');
      return;
    }

    updateFondoBase(safeCaja.id, val);
    alert(`Límite de fondo base actualizado a $${val.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* REGISTRAR ABONO A FONDO */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Registrar Abono a Fondo</h3>
            <p className="text-[11px] text-zinc-500">Inyección de efectivo o transferencia a caja chica</p>
          </div>
          <TrendingUp className="w-4 h-4 text-emerald-600" />
        </div>

        <form onSubmit={handleAddAbono} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Caja Destino</label>
            <input
              type="text"
              disabled
              value={activeCaja.nombre}
              className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-medium text-zinc-700"
            />
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
            <span>Abonar a la Caja Chica</span>
          </button>
        </form>
      </div>

      {/* AJUSTE DE FONDO BASE DE LA CAJA */}
      <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 h-fit">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Ajuste de Fondo Base</h3>
            <p className="text-[11px] text-zinc-500">Actualizar el límite máximo autorizado de la caja</p>
          </div>
          <Settings className="w-4 h-4 text-zinc-500" />
        </div>

        <form onSubmit={handleUpdateFondoBase} className="space-y-4 text-xs">
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Límite de Fondo Base Actual</label>
            <div className="text-xl font-bold text-zinc-900">
              ${activeCaja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 font-medium mb-1">Nuevo Límite de Fondo Base ($) *</label>
            <input
              type="number"
              step="500"
              required
              placeholder={activeCaja.fondoBase.toString()}
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

      {/* HISTORIAL DE INYECCIONES Y ABONOS */}
      <div className="lg:col-span-12 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Historial de Entradas e Inyecciones</h3>
            <p className="text-[11px] text-zinc-500">Abonos registrados a {activeCaja.nombre}</p>
          </div>
          <History className="w-4 h-4 text-zinc-400" />
        </div>

        {cajaAbonos.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-6">No hay abonos registrados en esta caja.</p>
        ) : (
          <div className="space-y-2.5">
            {cajaAbonos.map((abn) => (
              <div key={abn.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between gap-3 text-xs">
                <div>
                  <span className="font-semibold text-zinc-900 block">{abn.concepto}</span>
                  <span className="text-[10px] text-zinc-400">Registrado por {abn.registradoPor} • {abn.fecha}</span>
                </div>
                <span className="font-bold text-emerald-600 text-sm shrink-0">
                  +${abn.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
