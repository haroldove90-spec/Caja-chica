import React, { useState } from 'react';
import { FileBadge, Plus, Trash2, Printer, Image as ImageIcon, Search, FileText, CheckCircle2, Edit3, Power, X } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComprobanteGastos, ComprobanteGastosItem } from '../types';
import { numeroALetras } from '../utils/numeroALetras';
import { EvidenceGrid } from './EvidenceGrid';

export const CustodioComprobantes: React.FC = () => {
  const {
    comprobantesGastos,
    addComprobanteGastos,
    updateComprobanteGastos,
    deleteComprobanteGastos,
    toggleActivoComprobanteGastos: toggleActivoComprobante,
    setPreviewEvidencia,
    setPdfComprobanteModalData,
    activeCaja
  } = useApp();

  const [editingId, setEditingId] = useState<string | null>(null);
  const [folio, setFolio] = useState(`CG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
  const [fecha, setFecha] = useState(new Date().toISOString().substring(0, 10));
  const [concepto, setConcepto] = useState('');
  const [solicitadoA, setSolicitadoA] = useState('');
  const [autorizadoPor, setAutorizadoPor] = useState('CP. ALBERTO VARGAS');
  const [recibidoPor, setRecibidoPor] = useState('LIC. SOFÍA RODRÍGUEZ');
  const [evidenciaUrl, setEvidenciaUrl] = useState('');
  const [evidenciaNombre, setEvidenciaNombre] = useState<string | undefined>();
  const [evidenciaType, setEvidenciaType] = useState<'image' | 'pdf'>('image');
  const [searchTerm, setSearchTerm] = useState('');

  // Items breakdown (default 2 items, up to 4)
  const [items, setItems] = useState<ComprobanteGastosItem[]>([
    { noCuenta: '602-01', noOrden: 'ORD-101', noCotizacion: 'COT-201', nombreProyecto: 'Publikrea Norte', nombre: 'Alimentos y Consumo', importe: 0 },
    { noCuenta: '602-05', noOrden: 'ORD-102', noCotizacion: 'COT-202', nombreProyecto: 'Publikrea Norte', nombre: 'Transporte y Casetas', importe: 0 }
  ]);

  // Total auto-calculated from breakdown items or explicit amount
  const totalImporteCalculado = items.reduce((sum, item) => sum + (Number(item.importe) || 0), 0);
  const [importeManual, setImporteManual] = useState<number | ''>('');

  const importeFinal = importeManual !== '' ? Number(importeManual) : totalImporteCalculado;
  const importeLetraAuto = numeroALetras(importeFinal);
  const [importeLetra, setImporteLetra] = useState('');

  const handleFileUpload = (file: File) => {
    setEvidenciaNombre(file.name);
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    setEvidenciaType(isPdf ? 'pdf' : 'image');

    const reader = new FileReader();
    reader.onload = (event) => {
      setEvidenciaUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setFolio(`CG-${new Date().getFullYear()}-${Math.floor(100 + Math.random() * 900)}`);
    setFecha(new Date().toISOString().substring(0, 10));
    setConcepto('');
    setSolicitadoA('');
    setImporteManual('');
    setImporteLetra('');
    setEvidenciaUrl('');
    setEvidenciaNombre(undefined);
    setItems([
      { noCuenta: '602-01', noOrden: '', noCotizacion: '', nombreProyecto: '', nombre: 'Alimentos y Consumo', importe: 0 },
      { noCuenta: '602-05', noOrden: '', noCotizacion: '', nombreProyecto: '', nombre: 'Transporte y Casetas', importe: 0 }
    ]);
  };

  const handleStartEdit = (comp: ComprobanteGastos) => {
    setEditingId(comp.id);
    setFolio(comp.folio);
    setFecha(comp.fecha);
    setConcepto(comp.concepto);
    setSolicitadoA(comp.solicitadoA);
    setImporteManual(comp.importe);
    setImporteLetra(comp.importeLetra);
    setAutorizadoPor(comp.autorizadoPor || 'CP. ALBERTO VARGAS');
    setRecibidoPor(comp.recibidoPor || 'LIC. SOFÍA RODRÍGUEZ');
    setEvidenciaUrl(comp.evidenciaUrl || '');
    setEvidenciaNombre(comp.evidenciaNombre || `Evidencia_${comp.folio}`);
    setEvidenciaType(comp.evidenciaType || 'image');
    setItems(comp.items && comp.items.length > 0 ? comp.items : [
      { noCuenta: '602-01', noOrden: '', noCotizacion: '', nombreProyecto: '', nombre: 'General', importe: comp.importe }
    ]);
  };

  const handleItemChange = (index: number, field: keyof ComprobanteGastosItem, value: any) => {
    const updated = [...items];
    updated[index] = {
      ...updated[index],
      [field]: field === 'importe' ? (value ? Number(value) : 0) : value
    };
    setItems(updated);
  };

  const handleAddItem = () => {
    if (items.length < 4) {
      setItems([...items, { noCuenta: `602-0${items.length + 1}`, noOrden: '', noCotizacion: '', nombreProyecto: '', nombre: '', importe: 0 }]);
    }
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!concepto.trim() || !solicitadoA.trim() || importeFinal <= 0) return;

    const cleanedItems = items.filter(it => it.nombre?.trim() !== '' || (Number(it.importe) || 0) > 0 || it.nombreProyecto?.trim() !== '' || it.noOrden?.trim() !== '' || it.noCotizacion?.trim() !== '');
    const itemsToSave = cleanedItems.length > 0 ? cleanedItems : [
      {
        noCuenta: '602-01',
        noOrden: folio,
        noCotizacion: '',
        nombreProyecto: 'COTEYUC',
        nombre: concepto,
        importe: importeFinal
      }
    ];

    if (editingId) {
      const existing = comprobantesGastos.find(c => c.id === editingId);
      if (existing) {
        updateComprobanteGastos({
          ...existing,
          folio,
          fecha,
          importe: importeFinal,
          importeLetra: importeLetra.trim() || importeLetraAuto,
          concepto,
          solicitadoA,
          items: itemsToSave,
          autorizadoPor,
          recibidoPor,
          evidenciaUrl: evidenciaUrl || undefined,
          evidenciaNombre: evidenciaNombre || undefined,
          evidenciaType
        });
      }
      handleResetForm();
    } else {
      addComprobanteGastos({
        cajaId: activeCaja?.id || 'caja-1',
        folio,
        fecha,
        importe: importeFinal,
        importeLetra: importeLetra.trim() || importeLetraAuto,
        concepto,
        solicitadoA,
        items: itemsToSave,
        autorizadoPor,
        recibidoPor,
        evidenciaUrl: evidenciaUrl || undefined,
        evidenciaNombre: evidenciaNombre || undefined,
        evidenciaType
      });
      handleResetForm();
    }
  };

  const filteredComprobantes = comprobantesGastos.filter(c =>
    c.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.solicitadoA.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.fecha.includes(searchTerm)
  );

  const totalComprobantesInvertido = comprobantesGastos.reduce((a, b) => a + b.importe, 0);

  return (
    <div className="space-y-6">
      {/* HEADER BENTO BAR */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-5 rounded-2xl border border-zinc-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-[#024182] text-white rounded-xl">
              <FileBadge className="w-5 h-5" />
            </div>
            <h2 className="text-base font-bold text-zinc-900">Módulo Comprobante de Gastos</h2>
          </div>
          <p className="text-xs text-zinc-500 mt-1">
            Generación e historial de comprobantes de gastos con importe en letra, desglose por cuenta y firmas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-zinc-700 bg-zinc-100 px-3 py-1.5 rounded-xl border border-zinc-200">
            Total Emitido: ${totalComprobantesInvertido.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* FORM TO CREATE COMPROBANTE DE GASTOS */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">
                {editingId ? 'Editar Comprobante de Gastos' : 'Nuevo Comprobante de Gastos'}
              </h3>
              <p className="text-[11px] text-zinc-500">Completa el desglose de cuentas y montos</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-[#024182] bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                {folio}
              </span>
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
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Folio *</label>
                <input
                  type="text"
                  required
                  value={folio}
                  onChange={(e) => setFolio(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Fecha de Emisión *</label>
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
                <label className="block text-zinc-600 font-medium mb-1">Solicitado a / Beneficiario *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Lic. Sofía Rodríguez / Comercializadora Coteyuc"
                  value={solicitadoA}
                  onChange={(e) => setSolicitadoA(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Importe Total ($) *</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-zinc-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder={totalImporteCalculado > 0 ? `${totalImporteCalculado}` : '0.00'}
                    value={importeManual}
                    onChange={(e) => setImporteManual(e.target.value ? Number(e.target.value) : '')}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-7 pr-3 py-2 text-xs font-bold text-zinc-900 focus:outline-none focus:border-zinc-900"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Importe con Letra (Auto-calculado)</label>
              <input
                type="text"
                placeholder={importeLetraAuto}
                value={importeLetra}
                onChange={(e) => setImporteLetra(e.target.value)}
                className="w-full bg-blue-50/50 border border-blue-200/80 rounded-xl px-3 py-2 text-xs font-medium text-[#024182] focus:outline-none focus:border-zinc-900"
              />
              <span className="text-[10px] text-zinc-400 block mt-0.5">
                Texto en pesos mexicanos (puedes editar si lo deseas)
              </span>
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Concepto del Gasto *</label>
              <textarea
                required
                rows={2}
                placeholder="Ej: Gastos de representación y viáticos para reunión con clientes corporativos"
                value={concepto}
                onChange={(e) => setConcepto(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-xs focus:outline-none focus:border-zinc-900 resize-none"
              />
            </div>

            {/* ACCOUNT BREAKDOWN TABLE (NO. CUENTA | # ORDEN | # COTIZACIÓN | NOMBRE PROYECTO | NOMBRE | IMPORTE) */}
            <div className="p-3 bg-zinc-50/80 rounded-xl border border-zinc-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-zinc-800 uppercase">
                  Desglose por Cuenta, Orden, Cotización y Proyecto (Máx 4)
                </span>
                {items.length < 4 && (
                  <button
                    type="button"
                    onClick={handleAddItem}
                    className="text-[10px] font-bold text-blue-700 hover:underline cursor-pointer"
                  >
                    + Agregar Fila
                  </button>
                )}
              </div>

              <div className="space-y-2.5">
                {items.map((item, idx) => (
                  <div key={idx} className="p-2.5 bg-white rounded-xl border border-zinc-200/80 shadow-2xs space-y-2">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-100">
                      <span className="text-[10px] font-bold text-[#024182] uppercase">Fila {idx + 1}</span>
                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-zinc-400 hover:text-rose-600 flex items-center gap-1 text-[10px] font-medium transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Eliminar</span>
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-6 gap-2">
                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5">No. Cuenta *</label>
                        <input
                          type="text"
                          placeholder="602-01"
                          value={item.noCuenta}
                          onChange={(e) => handleItemChange(idx, 'noCuenta', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5"># Orden</label>
                        <input
                          type="text"
                          placeholder="ORD-101"
                          value={item.noOrden || ''}
                          onChange={(e) => handleItemChange(idx, 'noOrden', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5"># Cotización</label>
                        <input
                          type="text"
                          placeholder="COT-201"
                          value={item.noCotizacion || ''}
                          onChange={(e) => handleItemChange(idx, 'noCotizacion', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-mono focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5">Nombre Proyecto</label>
                        <input
                          type="text"
                          placeholder="Ej: Proyecto Norte"
                          value={item.nombreProyecto || ''}
                          onChange={(e) => handleItemChange(idx, 'nombreProyecto', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5">Nombre / Concepto *</label>
                        <input
                          type="text"
                          placeholder="Descripción"
                          value={item.nombre}
                          onChange={(e) => handleItemChange(idx, 'nombre', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] focus:outline-none focus:border-zinc-800"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-medium text-zinc-600 mb-0.5">Importe ($) *</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={item.importe || ''}
                          onChange={(e) => handleItemChange(idx, 'importe', e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-2 py-1 text-[11px] font-bold text-right focus:outline-none focus:border-zinc-800"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Autorizado por</label>
                <input
                  type="text"
                  value={autorizadoPor}
                  onChange={(e) => setAutorizadoPor(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 uppercase font-medium"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Recibido por</label>
                <input
                  type="text"
                  value={recibidoPor}
                  onChange={(e) => setRecibidoPor(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 uppercase font-medium"
                />
              </div>
            </div>

            {/* GRID DE EVIDENCIAS EN EL FORMULARIO DE COMPROBANTES */}
            <div className="p-3.5 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2">
              <EvidenceGrid
                evidenciaUrl={evidenciaUrl}
                evidenciaNombre={evidenciaNombre}
                evidenciaType={evidenciaType}
                isEditing={true}
                recordIdentifier={folio}
                title={editingId ? 'Evidencia del Comprobante Guardada' : 'Adjuntar Evidencia (Foto / Factura / PDF)'}
                onRemove={() => {
                  setEvidenciaUrl('');
                  setEvidenciaNombre(undefined);
                }}
                onFileSelect={handleFileUpload}
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#024182] hover:bg-[#0b315b] text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>{editingId ? 'Guardar Cambios' : 'Generar Comprobante de Gastos'}</span>
            </button>
          </form>
        </div>

        {/* HISTORIAL DE COMPROBANTES DE GASTOS */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Historial de Comprobantes de Gastos</h3>
              <p className="text-[11px] text-zinc-500">Visualización de formatos con cuadrícula de evidencias</p>
            </div>

            <div className="relative w-full sm:w-48">
              <input
                type="text"
                placeholder="Buscar por folio, concepto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zinc-900"
              />
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          {/* LIST OF COMPROBANTES */}
          <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-1">
            {filteredComprobantes.length === 0 ? (
              <div className="text-center py-12 text-zinc-400 text-xs">
                No hay comprobantes de gastos que coincidan con la búsqueda.
              </div>
            ) : (
              filteredComprobantes.map((comp) => (
                <div
                  key={comp.id}
                  className={`p-4 rounded-xl border transition-all space-y-2.5 ${
                    editingId === comp.id
                      ? 'border-[#024182] bg-blue-50/20 shadow-xs'
                      : 'border-zinc-200/80 bg-zinc-50/50 hover:bg-white hover:shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-bold text-xs text-[#024182]">{comp.folio}</span>
                        <span className="text-[10px] text-zinc-400">Fecha: {comp.fecha}</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            comp.activo !== false
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-zinc-200 text-zinc-600 line-through'
                          }`}
                        >
                          {comp.activo !== false ? '● Activo' : '○ Inactivo'}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-zinc-900 mt-1">{comp.concepto}</p>
                      <span className="text-[10px] text-zinc-500 block">
                        Solicitado a: <strong className="text-zinc-800">{comp.solicitadoA}</strong>
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="text-sm font-black text-zinc-900 block">
                        ${comp.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[9px] text-zinc-400 block max-w-[150px] truncate">
                        {comp.importeLetra}
                      </span>
                    </div>
                  </div>

                  {/* ITEMS COUNT / DETAILS SUMMARY */}
                  <div className="p-2 rounded-lg bg-blue-50/40 border border-blue-100 text-[10px] text-zinc-600 space-y-1">
                    <span className="font-bold text-[#024182] block">Desglose de Cuentas ({(comp.items || []).length}):</span>
                    {(comp.items && comp.items.length > 0) ? (
                      comp.items.map((it, idx) => (
                        <div key={idx} className="flex justify-between items-center font-mono gap-2 text-[10px]">
                          <span className="truncate">
                            <strong>{it.noCuenta || '602-01'}</strong>
                            {it.noOrden ? ` | Ord: ${it.noOrden}` : ''}
                            {it.noCotizacion ? ` | Cot: ${it.noCotizacion}` : ''}
                            {it.nombreProyecto ? ` | Proy: ${it.nombreProyecto}` : ''}
                            {` - ${it.nombre || comp.concepto || 'General'}`}
                          </span>
                          <span className="font-semibold shrink-0">${(Number(it.importe) || 0).toFixed(2)}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex justify-between items-center font-mono gap-2 text-[10px]">
                        <span className="truncate">
                          <strong>602-01</strong> - {comp.concepto || 'Gastos Diversos'}
                        </span>
                        <span className="font-semibold shrink-0">${(Number(comp.importe) || 0).toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* GRID DE EVIDENCIAS */}
                  {comp.evidenciaUrl && (
                    <div className="pt-2 border-t border-zinc-200/60">
                      <EvidenceGrid
                        evidenciaUrl={comp.evidenciaUrl}
                        evidenciaNombre={comp.evidenciaNombre || `Evidencia_${comp.folio}`}
                        evidenciaType={comp.evidenciaType || 'image'}
                        recordIdentifier={comp.folio}
                        title="Evidencia Adjunta"
                        compact={true}
                      />
                    </div>
                  )}

                  {/* ACTION BUTTONS */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 ml-auto">
                      <button
                        onClick={() => toggleActivoComprobante(comp.id)}
                        title={comp.activo !== false ? 'Desactivar Comprobante' : 'Activar Comprobante'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-[10px] font-bold ${
                          comp.activo !== false
                            ? 'text-zinc-600 hover:bg-zinc-200 bg-zinc-100'
                            : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                        }`}
                      >
                        <Power className="w-3.5 h-3.5" />
                        <span>{comp.activo !== false ? 'Desactivar' : 'Activar'}</span>
                      </button>

                      <button
                        onClick={() => setPdfComprobanteModalData(comp)}
                        className="p-1.5 rounded-lg bg-[#024182] hover:bg-[#0b315b] text-white text-[10px] font-bold flex items-center gap-1 cursor-pointer shadow-xs"
                        title="Ver / Imprimir Comprobante Oficial PDF"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>PDF</span>
                      </button>

                      <button
                        onClick={() => handleStartEdit(comp)}
                        className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        title="Editar Comprobante"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`¿Eliminar comprobante ${comp.folio}?`)) {
                            deleteComprobanteGastos(comp.id);
                          }
                        }}
                        className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Eliminar Comprobante"
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
