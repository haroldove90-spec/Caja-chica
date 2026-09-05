import React, { useState } from 'react';
import { Fuel, Plus, Trash2, FileText, Image as ImageIcon, Printer, Download, Search, Car, Gauge, CheckCircle2, Edit3, Power, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { NivelTanque, RegistroGasolina } from '../types';
import { FuelGaugeSVG } from './FuelGaugeSVG';
import { EvidenceGrid } from './EvidenceGrid';
import { compressImageFile } from '../utils/imageCompressor';

export const CustodioGasolina: React.FC = () => {
  const {
    gasolinaRecords,
    addRegistroGasolina,
    updateRegistroGasolina,
    deleteRegistroGasolina,
    toggleActivoRegistroGasolina: toggleActivoGasolina,
    setPreviewEvidencia,
    setPdfGasolinaModalData,
    activeCaja
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [vehiculo, setVehiculo] = useState('CAMIONETA PARTNER');
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [formaPago, setFormaPago] = useState('EFECTIVO');
  const [descripcionUso, setDescripcionUso] = useState('');
  const [nivelAntes, setNivelAntes] = useState<NivelTanque>('1/4');
  const [nivelDespues, setNivelDespues] = useState<NivelTanque>('F');
  const [km, setKm] = useState<number | ''>('');
  const [importe, setImporte] = useState<number | ''>('');
  const [evidenciaUrl, setEvidenciaUrl] = useState('');
  const [evidenciaNombre, setEvidenciaNombre] = useState<string | undefined>();
  const [searchTerm, setSearchTerm] = useState('');

  const niveles: NivelTanque[] = ['E', '1/4', '1/2', '3/4', 'F'];

  const handleFileUpload = async (file: File) => {
    setEvidenciaNombre(file.name);
    try {
      const optimizedUrl = await compressImageFile(file, { maxWidth: 1280, quality: 0.75 });
      setEvidenciaUrl(optimizedUrl);
    } catch (err) {
      console.warn('Falla en compresión, usando lector estándar:', err);
      const reader = new FileReader();
      reader.onload = (event) => {
        setEvidenciaUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResetForm = () => {
    setEditingId(null);
    setVehiculo('CAMIONETA PARTNER');
    setFecha(new Date().toISOString().substring(0, 10));
    setFormaPago('EFECTIVO');
    setDescripcionUso('');
    setNivelAntes('1/4');
    setNivelDespues('F');
    setKm('');
    setImporte('');
    setEvidenciaUrl('');
    setEvidenciaNombre(undefined);
  };

  const handleStartEdit = (rec: RegistroGasolina) => {
    setEditingId(rec.id);
    setVehiculo(rec.vehiculo);
    setFecha(rec.fecha);
    setFormaPago(rec.formaPago);
    setDescripcionUso(rec.descripcionUso);
    setNivelAntes(rec.nivelAntes);
    setNivelDespues(rec.nivelDespues);
    setKm(rec.km);
    setImporte(rec.importe);
    setEvidenciaUrl(rec.evidenciaUrl || '');
    setEvidenciaNombre(`Ticket_${rec.vehiculo}_${rec.fecha}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionUso.trim() || !km || !importe) return;

    if (editingId) {
      const existing = gasolinaRecords.find(r => r.id === editingId);
      if (existing) {
        updateRegistroGasolina({
          ...existing,
          fecha,
          vehiculo,
          formaPago,
          descripcionUso,
          nivelAntes,
          nivelDespues,
          km: Number(km),
          importe: Number(importe),
          evidenciaUrl: evidenciaUrl || undefined
        });
      }
      handleResetForm();
    } else {
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
      handleResetForm();
    }
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
            className="inline-flex items-center gap-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-4 h-4" />
            <span>Generar Formato Oficial PDF</span>
          </button>
        </div>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block uppercase">Total Combustible</span>
            <span className="text-xl font-black text-zinc-900 mt-0.5 block font-mono">
              ${totalInvertido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#024182] flex items-center justify-center font-bold">
            $
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block uppercase">Total Cargas / Tickets</span>
            <span className="text-xl font-black text-zinc-900 mt-0.5 block font-mono">
              {totalCargas}
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            #
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 block uppercase">Último Odómetro Registrado</span>
            <span className="text-xl font-black text-zinc-900 mt-0.5 block font-mono">
              {totalKm.toLocaleString()} KM
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Gauge className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* MAIN TWO COLUMN WORKSPACE: REGISTRATION FORM + HISTORY TABLE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORMULARIO DE REGISTRO */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs h-fit space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {editingId ? `Editar Carga (${vehiculo})` : 'Nueva Carga de Combustible'}
              </h3>
              <p className="text-[11px] text-zinc-500">Captura de datos e indicadores de nivel de tanque</p>
            </div>
            {editingId ? (
              <button
                onClick={handleResetForm}
                className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                Cancelar
              </button>
            ) : (
              <Car className="w-4 h-4 text-zinc-400" />
            )}
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

            {/* GRID DE EVIDENCIAS EN EL FORMULARIO DE GASOLINA */}
            <div className="p-3.5 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2">
              <EvidenceGrid
                evidenciaUrl={evidenciaUrl}
                evidenciaNombre={evidenciaNombre}
                evidenciaType="image"
                isEditing={true}
                recordIdentifier={vehiculo}
                title={editingId ? 'Ticket Guardado' : 'Adjuntar Foto Ticket Gasolina / Odómetro'}
                onRemove={() => {
                  setEvidenciaUrl('');
                  setEvidenciaNombre(undefined);
                }}
                onFileSelect={handleFileUpload}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Guardar Cambios' : 'Registrar Carga de Combustible'}</span>
            </button>
          </form>
        </div>

        {/* HISTORIAL DE REGISTROS DE COMBUSTIBLE */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Historial de Registros de Combustible</h3>
              <p className="text-[11px] text-zinc-500">Consulta de bitácora con cuadrícula de evidencias</p>
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
                  className={`p-4 rounded-xl border transition-all space-y-3 ${
                    editingId === rec.id
                      ? 'border-[#024182] bg-blue-50/20 shadow-xs'
                      : 'border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs text-zinc-900">{rec.vehiculo}</span>
                        <span className="px-2 py-0.5 rounded text-[9px] font-semibold bg-zinc-200 text-zinc-800 uppercase">
                          {rec.formaPago}
                        </span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            rec.activo !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-200 text-zinc-600 line-through'
                          }`}
                        >
                          {rec.activo !== false ? '● Activo' : '○ Inactivo'}
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

                  {/* GRID DE EVIDENCIAS GUARDADAS */}
                  {rec.evidenciaUrl && (
                    <div className="pt-2 border-t border-zinc-200/60">
                      <EvidenceGrid
                        evidenciaUrl={rec.evidenciaUrl}
                        evidenciaNombre={`Ticket_${rec.vehiculo}_${rec.fecha}`}
                        evidenciaType={rec.evidenciaType || 'image'}
                        recordIdentifier={rec.vehiculo}
                        title="Evidencia de Carga / Ticket"
                        compact={true}
                      />
                    </div>
                  )}

                  {/* ACTION BUTTONS: VIEW EVIDENCIA, PRINT PDF, EDIT, DEACTIVATE, DELETE */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => toggleActivoGasolina(rec.id)}
                        title={rec.activo !== false ? 'Desactivar Registro' : 'Activar Registro'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                          rec.activo !== false
                            ? 'text-zinc-600 hover:bg-zinc-200 bg-zinc-100'
                            : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{rec.activo !== false ? 'Desactivar' : 'Activar'}</span>
                      </button>

                      <button
                        onClick={() => handlePrintSingle(rec)}
                        className="p-1.5 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-[10px] font-medium flex items-center gap-1 cursor-pointer"
                        title="Ver Formato PDF de esta Carga"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(rec)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="Editar Registro"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar registro de combustible del ${rec.fecha}?`)) {
                            deleteRegistroGasolina(rec.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
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
