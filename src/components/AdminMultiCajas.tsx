import React, { useState } from 'react';
import { Building2, Plus, Edit3, Wallet, MapPin, CheckCircle2, Clock, ShieldCheck, RefreshCw, Zap } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CajaChica, TipoFondoCaja } from '../types';

export const AdminMultiCajas: React.FC = () => {
  const { cajas, gastos, addCaja, updateCaja, setActiveCajaId, activeCajaId } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingCaja, setEditingCaja] = useState<CajaChica | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [responsable, setResponsable] = useState('');
  const [tipoFondo, setTipoFondo] = useState<TipoFondoCaja>('fijo');
  const [fondoBase, setFondoBase] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handleReset = () => {
    setIsAdding(false);
    setEditingCaja(null);
    setNombre('');
    setResponsable('');
    setTipoFondo('fijo');
    setFondoBase('');
    setUbicacion('');
  };

  const handleStartEdit = (caja: CajaChica) => {
    setEditingCaja(caja);
    setIsAdding(true);
    setNombre(caja.nombre);
    setResponsable(caja.responsable);
    setTipoFondo(caja.tipoFondo || (caja.fondoBase === 0 ? 'sin_fondo' : 'fijo'));
    setFondoBase(caja.fondoBase.toString());
    setUbicacion(caja.ubicacion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const isSinFondo = tipoFondo === 'sin_fondo';
    const fb = isSinFondo ? 0 : parseFloat(fondoBase);
    
    if (!nombre.trim() || !responsable.trim()) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (!isSinFondo && (isNaN(fb) || fb <= 0)) {
      alert('Por favor especifica un fondo base mayor a 0 para cajas con fondo fijo.');
      return;
    }

    if (editingCaja) {
      updateCaja({
        ...editingCaja,
        nombre,
        responsable,
        tipoFondo,
        fondoBase: fb,
        ubicacion
      });
    } else {
      addCaja({
        nombre,
        responsable,
        tipoFondo,
        fondoBase: fb,
        ubicacion
      });
    }

    handleReset();
  };

  return (
    <div className="space-y-6">
      {/* VISTA PANORÁMICA GLOBAL MULTI-CAJA */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-zinc-100 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Panel Multi-Caja Global</h3>
            <p className="text-xs text-zinc-500">Vista panorámica en tiempo real de todas las cajas chicas de la empresa</p>
          </div>

          <button
            onClick={() => {
              handleReset();
              setIsAdding(true);
            }}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Nueva Caja Chica</span>
          </button>
        </div>

        {/* CARDS PANORÁMICAS DE CAJAS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {cajas.map((caja) => {
            const isSinFondo = caja.tipoFondo === 'sin_fondo' || caja.fondoBase === 0;
            const cajaGastos = gastos.filter(g => g.cajaId === caja.id && !g.reembolsoId && g.activo !== false);
            const totalGastado = cajaGastos.reduce((a, b) => a + b.importe, 0);
            const disponible = isSinFondo ? 0 : Math.max(0, caja.fondoBase - totalGastado);
            const isActive = activeCajaId === caja.id;

            return (
              <div
                key={caja.id}
                className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 ${
                  isActive
                    ? 'border-zinc-900 bg-white ring-2 ring-zinc-900/10 shadow-md'
                    : 'border-zinc-200/80 bg-zinc-50/40 hover:border-zinc-300'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold text-zinc-400">ID: {caja.id}</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        isSinFondo ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {isSinFondo ? 'Flujo Semanal' : 'Fondo Fijo'}
                      </span>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          caja.estado === 'Abierta' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {caja.estado}
                      </span>
                    </div>
                  </div>

                  <h4 className="text-sm font-bold text-zinc-900 leading-snug">{caja.nombre}</h4>

                  <div className="text-xs text-zinc-600 space-y-0.5">
                    <p className="flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-zinc-400" />
                      <span>{caja.ubicacion || 'Sin ubicación'}</span>
                    </p>
                    <p className="text-[11px] text-zinc-500">Responsable: <span className="font-semibold text-zinc-800">{caja.responsable}</span></p>
                  </div>
                </div>

                {/* Balance Progress */}
                <div className="space-y-2 pt-3 border-t border-zinc-100">
                  <div className="flex justify-between items-baseline text-xs">
                    <span className="text-zinc-500">{isSinFondo ? 'Total por Reembolsar:' : 'Disponible:'}</span>
                    <span className={`font-bold text-sm ${isSinFondo ? 'text-purple-700' : 'text-zinc-900'}`}>
                      ${(isSinFondo ? totalGastado : disponible).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  {!isSinFondo ? (
                    <>
                      <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-zinc-900 rounded-full transition-all"
                          style={{
                            width: `${caja.fondoBase > 0 ? Math.min(100, Math.max(0, (disponible / caja.fondoBase) * 100)) : 0}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between text-[10px] text-zinc-400">
                        <span>Gastos: ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                        <span>Fondo: ${caja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </>
                  ) : (
                    <div className="p-2 bg-purple-50 rounded-xl border border-purple-100 text-[11px] text-purple-800 flex items-center justify-between">
                      <span>{cajaGastos.length} comprobantes en semana</span>
                      <span className="font-semibold">Reembolso directo</span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2">
                  <button
                    onClick={() => setActiveCajaId(caja.id)}
                    className={`flex-1 text-xs font-medium py-1.5 rounded-xl border transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white border-zinc-900'
                        : 'bg-white text-zinc-700 border-zinc-200 hover:border-zinc-900'
                    }`}
                  >
                    {isActive ? 'Caja Activa' : 'Seleccionar Caja'}
                  </button>

                  <button
                    onClick={() => handleStartEdit(caja)}
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 border border-zinc-200 hover:border-zinc-400 rounded-xl bg-white cursor-pointer"
                    title="Editar Configuración"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* FORMULARIO DE ALTA / EDICIÓN */}
      {isAdding && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs max-w-xl mx-auto space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <h3 className="text-sm font-semibold text-zinc-900">
              {editingCaja ? `Editar ${editingCaja.nombre}` : 'Alta de Nueva Caja Chica'}
            </h3>
            <button
              onClick={handleReset}
              className="text-xs text-zinc-400 hover:text-zinc-900"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nombre de la Caja Chica *</label>
              <input
                type="text"
                required
                placeholder="Ej: Caja Chica / Reina Pino (Matriz)"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Responsable / Custodio *</label>
              <input
                type="text"
                required
                placeholder="Ej: Lic. Sofía Rodríguez"
                value={responsable}
                onChange={(e) => setResponsable(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1.5">Modalidad Operativa del Fondo *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setTipoFondo('fijo')}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tipoFondo === 'fijo'
                      ? 'border-blue-600 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                    <Wallet className="w-3.5 h-3.5 text-blue-600" />
                    <span>Con Fondo Fijo ($)</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Tiene un monto base fijo (ej: $15,000) y se reembolsa lo gastado para restablecer saldo.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setTipoFondo('sin_fondo');
                    setFondoBase('0');
                  }}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    tipoFondo === 'sin_fondo'
                      ? 'border-purple-600 bg-purple-50/50 text-purple-900 ring-2 ring-purple-500/20'
                      : 'border-zinc-200 bg-zinc-50 text-zinc-600 hover:bg-zinc-100'
                  }`}
                >
                  <div className="font-semibold mb-0.5 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-purple-600" />
                    <span>Sin Fondo Fijo (Operativo)</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 leading-tight">
                    Captura semanal de gastos en efectivo para reembolso directo (ej: Taller Proyecta).
                  </p>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">
                  {tipoFondo === 'sin_fondo' ? 'Fondo Base (No aplica)' : 'Fondo Base Asignado ($) *'}
                </label>
                <input
                  type="number"
                  step="500"
                  disabled={tipoFondo === 'sin_fondo'}
                  required={tipoFondo === 'fijo'}
                  placeholder={tipoFondo === 'sin_fondo' ? '$0.00' : 'Ej: 15000'}
                  value={tipoFondo === 'sin_fondo' ? '0' : fondoBase}
                  onChange={(e) => setFondoBase(e.target.value)}
                  className={`w-full border rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none ${
                    tipoFondo === 'sin_fondo'
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed'
                      : 'bg-zinc-50 border-zinc-200 focus:border-zinc-900 text-zinc-900'
                  }`}
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Ubicación / Sucursal</label>
                <input
                  type="text"
                  placeholder="Ej: Oficina Central o Taller"
                  value={ubicacion}
                  onChange={(e) => setUbicacion(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {editingCaja ? 'Guardar Cambios' : 'Crear Caja Chica'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
