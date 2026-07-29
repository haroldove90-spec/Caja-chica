import React, { useState } from 'react';
import { Building2, Plus, Edit3, Wallet, MapPin, CheckCircle2, Clock, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CajaChica } from '../types';

export const AdminMultiCajas: React.FC = () => {
  const { cajas, gastos, addCaja, updateCaja, setActiveCajaId, activeCajaId } = useApp();

  const [isAdding, setIsAdding] = useState(false);
  const [editingCaja, setEditingCaja] = useState<CajaChica | null>(null);

  // Form State
  const [nombre, setNombre] = useState('');
  const [responsable, setResponsable] = useState('');
  const [fondoBase, setFondoBase] = useState('');
  const [ubicacion, setUbicacion] = useState('');

  const handleReset = () => {
    setIsAdding(false);
    setEditingCaja(null);
    setNombre('');
    setResponsable('');
    setFondoBase('');
    setUbicacion('');
  };

  const handleStartEdit = (caja: CajaChica) => {
    setEditingCaja(caja);
    setIsAdding(true);
    setNombre(caja.nombre);
    setResponsable(caja.responsable);
    setFondoBase(caja.fondoBase.toString());
    setUbicacion(caja.ubicacion);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fb = parseFloat(fondoBase);
    if (!nombre.trim() || !responsable.trim() || isNaN(fb) || fb <= 0) {
      alert('Completa los campos obligatorios.');
      return;
    }

    if (editingCaja) {
      updateCaja({
        ...editingCaja,
        nombre,
        responsable,
        fondoBase: fb,
        ubicacion
      });
    } else {
      addCaja({
        nombre,
        responsable,
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
            const cajaGastos = gastos.filter(g => g.cajaId === caja.id && !g.reembolsoId);
            const totalGastado = cajaGastos.reduce((a, b) => a + b.importe, 0);
            const disponible = caja.fondoBase - totalGastado;
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
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                        caja.estado === 'Abierta' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {caja.estado}
                    </span>
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
                    <span className="text-zinc-500">Disponible:</span>
                    <span className="font-bold text-zinc-900 text-sm">
                      ${disponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="w-full h-2 bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-zinc-900 rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, Math.max(0, (disponible / caja.fondoBase) * 100))}%`
                      }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-zinc-400">
                    <span>Gastos: ${totalGastado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    <span>Fondo: ${caja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
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
                placeholder="Ej: Caja Chica / Reina Pino"
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

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Fondo Base Inicial ($) *</label>
                <input
                  type="number"
                  step="500"
                  required
                  placeholder="Ej: 15000"
                  value={fondoBase}
                  onChange={(e) => setFondoBase(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Ubicación / Sucursal</label>
                <input
                  type="text"
                  placeholder="Ej: Oficina Central"
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
