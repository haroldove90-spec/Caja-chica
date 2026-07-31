import React, { useState } from 'react';
import { Fuel, Plus, Trash2, FileText, Image as ImageIcon, Printer, Download, Search, Car, Gauge, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NivelTanque, RegistroGasolina } from '../types';
import { FuelGaugeSVG } from './FuelGaugeSVG';

export const CustodioGasolina: React.FC = () => {
  const {
    gasolinaRecords,
    addRegistroGasolina,
    deleteRegistroGasolina,
    setPreviewEvidencia,
    setPdfGasolinaModalData,
    activeCaja
  } = useApp();

  const [vehiculo, setVehiculo] = useState('CAMIONETA PARTNER');
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [formaPago, setFormaPago] = useState('EFECTIVO');
  const [descripcionUso, setDescripcionUso] = useState('');
  const [nivelAntes, setNivelAntes] = useState<NivelTanque>('1/4');
  const [nivelDespues, setNivelDespues] = useState<NivelTanque>('F');
  const [km, setKm] = useState<number | ''>('');
  const [importe, setImporte] = useState<number | ''>('');
  const [evidenciaUrl, setEvidenciaUrl] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const niveles: NivelTanque[] = ['E', '1/4', '1/2', '3/4', 'F'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionUso.trim() || !km || !importe) return;

    addRegistroGasolina({
      cajaId: activeCaja?.id || 'caja-1',
      fecha,
      vehiculo,
      formaPago,
      descripcionUso,
      nivelAntes,
      nivelDespues,
      km: Number(km),
      importe: Number(importe),
      registradoPor: activeCaja?.responsable || 'Custodio de Caja',
      evidenciaUrl: evidenciaUrl || undefined,
      evidenciaType: 'image'
    });

    setDescripcionUso('');
    setKm('');
    setImporte('');
    setEvidenciaUrl('');
  };

  const filteredRecords = gasolinaRecords.filter(r =>
    r.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcionUso.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.formaPago.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.fecha.includes(searchTerm)
  );

  const totalInvertido = gasolinaRecords.reduce((acc, curr) => acc + curr.importe, 0);
  const totalKm = gasolinaRecords.reduce((acc, curr) => Math.max(acc, curr.km), 0);
  const totalCargas = gasolinaRecords.length;

  // Open Full Printable PDF / Format modal
  const handlePrintAll = () => {
    setPdfGasolinaModalData({
      list: filteredRecords,
      vehiculo
    });
  };

  const handlePrintSingle = (rec: RegistroGasolina) => {
    setPdfGasolinaModalData({
      record: rec,
      list: [rec],
      vehiculo: rec.vehiculo
    });
  };

  return (
    <div className="space-y-6">
      {/* HEADER BENTO BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-zinc-900 text-white rounded-xl">
              <Fuel className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">Control de Combustible</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Registro bitácora de carga de gasolina, medidor de tanque (Antes / Después) y Odómetro (KM)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrintAll}
            className="bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Ver Formato PDF Completo</span>
          </button>
        </div>
      </div>

      {/* METRICS SUMMARY BENTO GRID */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
            Total Invertido Combustible
          </span>
          <span className="text-xl font-bold text-zinc-900">
            ${totalInvertido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
            Total Cargas Registradas
          </span>
          <span className="text-xl font-bold text-zinc-900">
            {totalCargas} Cargas
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
            Último KM Registrado
          </span>
          <span className="text-xl font-bold text-zinc-900">
            {totalKm > 0 ? `${totalKm.toLocaleString()} KM` : 'N/D'}
          </span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs">
          <span className="text-[10px] uppercase tracking-wider font-semibold text-zinc-400 block mb-1">
            Promedio por Carga
          </span>
          <span className="text-xl font-bold text-emerald-600">
            ${totalCargas > 0 ? (totalInvertido / totalCargas).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '$0.00'}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM TO REGISTER GASOLINE ENTRY */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Registrar Carga de Combustible</h3>
              <p className="text-[11px] text-zinc-500">Captura de datos e indicadores de nivel de tanque</p>
            </div>
            <Car className="w-4 h-4 text-zinc-400" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Vehículo / Unidad *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: CAMIONETA PARTNER"
                  value={vehiculo}
                  onChange={(e) => setVehiculo(e.target.value.toUpperCase())}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900 uppercase"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Fecha de Carga *</label>
                <input
                  type="date"
                  required
                  value={fecha}
                  onChange={(e) => setFecha(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Forma de Pago *</label>
                <select
                  value={formaPago}
                  onChange={(e) => setFormaPago(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-medium"
                >
                  <option value="EFECTIVO">EFECTIVO</option>
                  <option value="TARJETA DE CAJA">TARJETA DE CAJA</option>
                  <option value="TRANSFERENCIA">TRANSFERENCIA</option>
                  <option value="VALES">VALES DE GASOLINA</option>
                </select>
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Kilometraje (KM) *</label>
                <input
                  type="number"
                  required
                  placeholder="Ej: 142850"
                  value={km}
                  onChange={(e) => setKm(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Descripción de Uso / Ruta *</label>
              <textarea
                required
                rows={2}
                placeholder="Ej: Surtido de prendas y entregas a clientes en zona norte"
                value={descripcionUso}
                onChange={(e) => setDescripcionUso(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-900 resize-none"
              />
            </div>

            {/* TANQUE ANTES Y DESPUÉS SELECTORS WITH VISUAL GAUGE PREVIEW */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80">
              {/* Nivel ANTES */}
              <div className="space-y-2 text-center">
                <span className="text-[11px] font-bold text-zinc-700 block uppercase">Nivel ANTES</span>
                <FuelGaugeSVG level={nivelAntes} size={70} showLabel />
                <div className="flex items-center justify-center gap-1 flex-wrap pt-1">
                  {niveles.map(n => (
                    <button
                      key={`antes-${n}`}
                      type="button"
                      onClick={() => setNivelAntes(n)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        nivelAntes === n
                          ? 'bg-zinc-900 text-white'
                          : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              {/* Nivel DESPUÉS */}
              <div className="space-y-2 text-center">
                <span className="text-[11px] font-bold text-zinc-700 block uppercase">Nivel DESPUÉS</span>
                <FuelGaugeSVG level={nivelDespues} size={70} showLabel />
                <div className="flex items-center justify-center gap-1 flex-wrap pt-1">
                  {niveles.map(n => (
                    <button
                      key={`despues-${n}`}
                      type="button"
                      onClick={() => setNivelDespues(n)}
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold cursor-pointer transition-all ${
                        nivelDespues === n
                          ? 'bg-zinc-900 text-white'
                          : 'bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Importe ($ MXN) *</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-zinc-400 font-medium">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="850.00"
                  value={importe}
                  onChange={(e) => setImporte(e.target.value ? Number(e.target.value) : '')}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">URL Evidencia / Foto Ticket (Opcional)</label>
              <input
                type="url"
                placeholder="https://... (Foto del ticket de gasolina u odómetro)"
                value={evidenciaUrl}
                onChange={(e) => setEvidenciaUrl(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Registrar Carga de Combustible</span>
            </button>
          </form>
        </div>

        {/* HISTORIAL DE REGISTROS DE COMBUSTIBLE */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Historial de Registros de Combustible</h3>
              <p className="text-[11px] text-zinc-500">Consulta de bitácora e indicadores por fecha y unidad</p>
            </div>

            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Buscar por uso, fecha..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zinc-900"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* RECORDS LIST TABLE / CARDS */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-1">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No hay registros de combustible que coincidan con la búsqueda.
              </div>
            ) : (
              filteredRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="p-4 rounded-xl border border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:shadow-xs transition-all space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-zinc-900">{rec.vehiculo}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-zinc-200 text-zinc-800 uppercase">
                          {rec.formaPago}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-600 mt-1">{rec.descripcionUso}</p>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        Fecha: {rec.fecha} • Registró: {rec.registradoPor}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-zinc-900 block">
                        ${rec.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] font-mono font-semibold text-zinc-500">
                        {rec.km.toLocaleString()} KM
                      </span>
                    </div>
                  </div>

                  {/* FUEL GAUGES ANTES & DESPUES PREVIEW */}
                  <div className="grid grid-cols-2 gap-2 bg-white p-2.5 rounded-lg border border-zinc-200/80 text-center">
                    <div className="flex items-center justify-around border-r border-zinc-100">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">ANTES</span>
                        <FuelGaugeSVG level={rec.nivelAntes} size={50} showLabel />
                      </div>
                    </div>

                    <div className="flex items-center justify-around">
                      <div>
                        <span className="text-[9px] uppercase font-bold text-zinc-400 block">DESPUÉS</span>
                        <FuelGaugeSVG level={rec.nivelDespues} size={50} showLabel />
                      </div>
                    </div>
                  </div>

                  {/* ACTION BUTTONS: VIEW EVIDENCIA, PRINT PDF, DELETE */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    {rec.evidenciaUrl ? (
                      <button
                        onClick={() => setPreviewEvidencia({ url: rec.evidenciaUrl!, type: 'image', title: `Ticket de Combustible - ${rec.vehiculo}` })}
                        className="text-indigo-600 hover:text-indigo-800 font-semibold text-[11px] flex items-center gap-1 cursor-pointer"
                      >
                        <ImageIcon className="w-3.5 h-3.5" />
                        <span>Ver Ticket Adjunto</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Sin ticket adjunto</span>
                    )}

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handlePrintSingle(rec)}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                        title="Ver Formato PDF de esta Carga"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF / Formato</span>
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar registro de combustible del ${rec.fecha}?`)) {
                            deleteRegistroGasolina(rec.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors"
                        title="Eliminar Registro"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
