import React, { useState } from 'react';
import { Upload, Trash2, Edit3, FileText, CheckCircle2, AlertCircle, Plus, X, Printer, Power, Image as ImageIcon, Eye } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Gasto } from '../types';
import { EvidenceGrid } from './EvidenceGrid';

export const CustodioGastos: React.FC = () => {
  const {
    activeCajaId,
    activeCaja,
    activeCajaGastos,
    giros,
    proveedores,
    empleados,
    addGasto,
    updateGasto,
    deleteGasto,
    toggleActivoGasto,
    setPreviewEvidencia,
    setPdfModalData
  } = useApp();

  // Form State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [fecha, setFecha] = useState<string>(new Date().toISOString().split('T')[0]);
  const [nroOrden, setNroOrden] = useState<string>(`ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [proveedor, setProveedor] = useState<string>('');
  const [concepto, setConcepto] = useState<string>('');
  const [importe, setImporte] = useState<string>('');
  const [solicitante, setSolicitante] = useState<string>('');
  const [giroId, setGiroId] = useState<string>('');
  const [facturado, setFacturado] = useState<boolean>(true);

  // Evidencia Attachment State
  const [evidenciaUrl, setEvidenciaUrl] = useState<string | undefined>();
  const [evidenciaNombre, setEvidenciaNombre] = useState<string | undefined>();
  const [evidenciaType, setEvidenciaType] = useState<'image' | 'pdf'>('image');

  // Handle File Upload
  const processUploadedFile = (file: File) => {
    setEvidenciaNombre(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setEvidenciaType(isPdf ? 'pdf' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidenciaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processUploadedFile(file);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFecha(new Date().toISOString().split('T')[0]);
    setNroOrden(`ORD-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setProveedor('');
    setConcepto('');
    setImporte('');
    setSolicitante('');
    setGiroId('');
    setFacturado(true);
    setEvidenciaUrl(undefined);
    setEvidenciaNombre(undefined);
  };

  const handleStartEdit = (gasto: Gasto) => {
    setEditingId(gasto.id);
    setFecha(gasto.fecha);
    setNroOrden(gasto.nroOrden);
    setProveedor(gasto.proveedor);
    setConcepto(gasto.concepto);
    setImporte(gasto.importe.toString());
    setSolicitante(gasto.solicitante);
    setGiroId(gasto.giroId);
    setFacturado(gasto.facturado);
    setEvidenciaUrl(gasto.evidenciaUrl);
    setEvidenciaNombre(gasto.evidenciaNombre || `Evidencia_${gasto.nroOrden}`);
    setEvidenciaType(gasto.evidenciaType || 'image');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!proveedor || !concepto || !importe || !solicitante || !giroId) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    const numImporte = parseFloat(importe);
    if (isNaN(numImporte) || numImporte <= 0) {
      alert('Ingresa un importe válido mayor a $0');
      return;
    }

    if (editingId) {
      const existing = activeCajaGastos.find(g => g.id === editingId);
      if (existing) {
        updateGasto({
          ...existing,
          fecha,
          nroOrden,
          proveedor,
          concepto,
          importe: numImporte,
          solicitante,
          giroId,
          facturado,
          evidenciaUrl,
          evidenciaNombre,
          evidenciaType
        });
      }
    } else {
      addGasto({
        cajaId: activeCajaId,
        nroOrden,
        fecha,
        proveedor,
        concepto,
        importe: numImporte,
        solicitante,
        giroId,
        facturado,
        evidenciaUrl,
        evidenciaNombre,
        evidenciaType
      });
    }

    handleResetForm();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* FORMULARIO RÁPIDO DE REGISTRO DE GASTO */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs h-fit space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {editingId ? `Editar Gasto (${nroOrden})` : 'Capturar Nuevo Gasto'}
            </h3>
            <p className="text-[11px] text-zinc-500">
              {editingId ? 'Modifica los datos y revisa la evidencia guardada' : 'Completa los campos y adjunta tu comprobante'}
            </p>
          </div>
          {editingId && (
            <button
              onClick={handleResetForm}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Row 1: Fecha & N° Orden */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Fecha *</label>
              <input
                type="date"
                required
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>
            <div>
              <label className="block text-zinc-600 font-medium mb-1">N° Orden *</label>
              <input
                type="text"
                required
                value={nroOrden}
                onChange={(e) => setNroOrden(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          {/* Proveedor */}
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Proveedor *</label>
            <input
              type="text"
              required
              list="proveedores-list"
              placeholder="Escribe o selecciona proveedor (ej. Oxxo)"
              value={proveedor}
              onChange={(e) => setProveedor(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
            />
            <datalist id="proveedores-list">
              {proveedores.map(p => (
                <option key={p.id} value={p.nombre} />
              ))}
            </datalist>
          </div>

          {/* Concepto */}
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Concepto / Detalle *</label>
            <textarea
              required
              rows={2}
              placeholder="Descripción breve del gasto realizado..."
              value={concepto}
              onChange={(e) => setConcepto(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 resize-none"
            />
          </div>

          {/* Row: Importe & Giro */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Importe ($) *</label>
              <input
                type="number"
                step="0.01"
                min="0.1"
                required
                placeholder="0.00"
                value={importe}
                onChange={(e) => setImporte(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-semibold focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Giro / Centro Costo *</label>
              <select
                required
                value={giroId}
                onChange={(e) => setGiroId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              >
                <option value="">Seleccionar...</option>
                {giros.filter(g => g.activo).map(g => (
                  <option key={g.id} value={g.id}>{g.nombre}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Solicitante */}
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Solicitante del Gasto *</label>
            <select
              required
              value={solicitante}
              onChange={(e) => setSolicitante(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
            >
              <option value="">Seleccionar empleado...</option>
              {empleados.map(emp => (
                <option key={emp.id} value={emp.nombre}>{emp.nombre} ({emp.puesto})</option>
              ))}
            </select>
          </div>

          {/* Indicador de Facturación */}
          <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs font-medium text-zinc-800 block">Tipo de Comprobante</span>
              <span className="text-[10px] text-zinc-400">
                {facturado ? 'Factura fiscal con UUID' : 'Nota de venta o ticket simple'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setFacturado(true)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  facturado ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                Facturado
              </button>
              <button
                type="button"
                onClick={() => setFacturado(false)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  !facturado ? 'bg-zinc-900 text-white' : 'bg-zinc-200 text-zinc-600'
                }`}
              >
                Nota Simple
              </button>
            </div>
          </div>

          {/* GRID DE EVIDENCIAS EN EL FORMULARIO */}
          <div className="p-3.5 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2">
            <EvidenceGrid
              evidenciaUrl={evidenciaUrl}
              evidenciaNombre={evidenciaNombre}
              evidenciaType={evidenciaType}
              isEditing={true}
              recordIdentifier={nroOrden}
              title={editingId ? 'Evidencia Guardada del Gasto' : 'Adjuntar Evidencia (Ticket / Factura)'}
              onRemove={() => {
                setEvidenciaUrl(undefined);
                setEvidenciaNombre(undefined);
              }}
              onFileSelect={processUploadedFile}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>{editingId ? 'Guardar Cambios del Gasto' : 'Registrar Gasto'}</span>
          </button>
        </form>
      </div>

      {/* BORRADOR DE MOVIMIENTOS (TABLA MODIFICABLE) */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Borrador de Movimientos</h3>
            <p className="text-[11px] text-zinc-500">
              Gastos con acceso directo a la <span className="font-semibold text-blue-700">cuadrícula de evidencias</span>
            </p>
          </div>
          <span className="text-xs bg-zinc-100 text-zinc-700 font-medium px-2.5 py-1 rounded-full border border-zinc-200">
            {activeCajaGastos.length} Registros
          </span>
        </div>

        {activeCajaGastos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-zinc-600">No hay borradores en esta caja</p>
            <p className="text-[11px] text-zinc-400">Usa el formulario para agregar movimientos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeCajaGastos.map((gasto) => {
              const giroObj = giros.find(g => g.id === gasto.giroId);
              return (
                <div
                  key={gasto.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col gap-3 ${
                    editingId === gasto.id
                      ? 'border-[#024182] bg-blue-50/20 shadow-xs'
                      : 'border-zinc-200/80 hover:border-zinc-300 bg-zinc-50/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-semibold text-xs text-zinc-900">{gasto.nroOrden}</span>
                        <span className="text-[10px] text-zinc-400">• {gasto.fecha}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            gasto.activo !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-200 text-zinc-600 line-through'
                          }`}
                        >
                          {gasto.activo !== false ? '● Activo' : '○ Inactivo'}
                        </span>
                        {giroObj && (
                          <span
                            className="px-2 py-0.5 rounded-md text-[10px] font-medium"
                            style={{
                              backgroundColor: `${giroObj.color}15`,
                              color: giroObj.color
                            }}
                          >
                            {giroObj.nombre}
                          </span>
                        )}
                      </div>
                      <p className="text-xs font-semibold text-zinc-900">{gasto.proveedor}</p>
                      <p className="text-xs text-zinc-600 line-clamp-1">{gasto.concepto}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-400">
                        <span>Solicitante: {gasto.solicitante}</span>
                        <span>•</span>
                        <span className={gasto.facturado ? 'text-zinc-700 font-medium' : 'text-zinc-500'}>
                          {gasto.facturado ? 'Facturado' : 'Nota Simple'}
                        </span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-zinc-200/60">
                      <div className="text-right">
                        <span className="text-sm font-bold text-zinc-900 block">
                          ${gasto.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => toggleActivoGasto(gasto.id)}
                          title={gasto.activo !== false ? 'Desactivar Gasto' : 'Activar Gasto'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                            gasto.activo !== false
                              ? 'text-zinc-600 hover:bg-zinc-200 bg-zinc-100'
                              : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                          <span>{gasto.activo !== false ? 'Desactivar' : 'Activar'}</span>
                        </button>
                        <button
                          onClick={() => setPdfModalData({
                            caja: activeCaja,
                            gastos: [gasto]
                          })}
                          title="Ver PDF de este Gasto Seleccionado"
                          className="p-1.5 text-[#024182] bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handleStartEdit(gasto)}
                          title="Editar Gasto"
                          className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar gasto ${gasto.nroOrden}?`)) {
                              deleteGasto(gasto.id);
                            }
                          }}
                          title="Eliminar Gasto"
                          className="p-1.5 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* GRID DE EVIDENCIA EN LA TARJETA */}
                  {gasto.evidenciaUrl && (
                    <div className="pt-2 border-t border-zinc-200/60">
                      <EvidenceGrid
                        evidenciaUrl={gasto.evidenciaUrl}
                        evidenciaNombre={gasto.evidenciaNombre || `Ticket_${gasto.nroOrden}`}
                        evidenciaType={gasto.evidenciaType || 'image'}
                        recordIdentifier={gasto.nroOrden}
                        title="Evidencia Adjunta"
                        compact={true}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
