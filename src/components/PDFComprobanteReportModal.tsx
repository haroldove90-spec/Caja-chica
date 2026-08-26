import React, { useState } from 'react';
import { X, Printer, FileBadge, Download, Star, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';
import { getPdfRowColor } from '../utils/pdfColors';
import { ComprobanteGastosItem } from '../types';

export const PDFComprobanteReportModal: React.FC = () => {
  const { pdfComprobanteModalData, setPdfComprobanteModalData } = useApp();
  const [selectedLogoId, setSelectedLogoId] = useState<string>('coteyuc');
  const [incluirEvidencias, setIncluirEvidencias] = useState<boolean>(true);

  if (!pdfComprobanteModalData) return null;

  const comp = pdfComprobanteModalData;
  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const handlePrint = () => {
    window.print();
  };

  // Extract all meaningful items (items that have nombre, importe > 0, or associated project/order/quote)
  const meaningfulItems = (Array.isArray(comp.items) ? comp.items : []).filter(
    it => it && (it.nombre?.trim() || (Number(it.importe) || 0) > 0 || it.nombreProyecto?.trim() || it.noOrden?.trim() || it.noCotizacion?.trim())
  );

  let rawItems: ComprobanteGastosItem[] = [];
  if (meaningfulItems.length > 0) {
    rawItems = meaningfulItems.map((it, idx) => ({
      noCuenta: it.noCuenta || `602-0${idx + 1}`,
      noOrden: it.noOrden || '',
      noCotizacion: it.noCotizacion || '',
      nombreProyecto: it.nombreProyecto || '',
      nombre: it.nombre || comp.concepto || 'Gasto General',
      importe: Number(it.importe) || 0
    }));
  } else {
    // If no meaningful breakdown items exist, provide the primary record row with total amount so table is never blank
    rawItems = [
      {
        noCuenta: '602-01',
        noOrden: comp.folio || '',
        noCotizacion: '',
        nombreProyecto: 'COTEYUC',
        nombre: comp.concepto || 'Gastos Diversos',
        importe: Number(comp.importe) || 0
      }
    ];
  }

  const computedTotal = rawItems.reduce((acc, it) => acc + (Number(it.importe) || 0), 0);
  const displayTotal = computedTotal > 0 ? computedTotal : (Number(comp.importe) || 0);

  // Ensure minimum 4 row slots in breakdown table
  const tableRows = [...rawItems];
  while (tableRows.length < 4) {
    tableRows.push({ noCuenta: '', noOrden: '', noCotizacion: '', nombreProyecto: '', nombre: '', importe: 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative my-auto max-h-[96vh] flex flex-col overflow-hidden printable-modal-container">
        {/* STICKY TOP HEADER FOR ACTIONS & LOGO SELECTOR */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 space-y-3 shrink-0 print:hidden z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#024182] text-white rounded-xl">
                <FileBadge className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Vista Previa - Comprobante de Gastos ({comp.folio})</h3>
                <p className="text-[11px] text-zinc-500">Seleccione un logotipo antes de guardar o imprimir</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {comp.evidenciaUrl && (
                <button
                  type="button"
                  onClick={() => setIncluirEvidencias(!incluirEvidencias)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    incluirEvidencias
                      ? 'bg-blue-50 text-[#024182] border-blue-300 shadow-xs'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                  }`}
                  title="Activar u omitir la imagen de la evidencia/ticket en el PDF"
                >
                  <Camera className="w-4 h-4" />
                  <span>{incluirEvidencias ? 'Evidencia: INCLUIDA' : 'Evidencia: OMITIDA'}</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="bg-[#024182] hover:bg-[#0b315b] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar en PDF</span>
              </button>

              <button
                onClick={() => setPdfComprobanteModalData(null)}
                className="p-2 text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl cursor-pointer transition-colors"
                title="Cerrar modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* LOGO SELECTOR BAR */}
          <LogoSelector
            selectedLogoId={selectedLogoId}
            onSelectLogo={(logo: LogoOption) => setSelectedLogoId(logo.id)}
          />
        </div>

        {/* SCROLLABLE INNER SHEET CONTAINER */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 print:p-0 print:overflow-visible bg-white">
          {/* OFFICIAL PRINT SHEET CONTAINER (FULL WIDTH, NO ENCAPSULATION) */}
          <div className="printable-sheet w-full bg-white text-zinc-900 text-xs font-sans space-y-5">
          {/* Header Top Area with Optional Selected Logo & Dark Blue Banner */}
          <div className="space-y-3">
            {activeLogo?.url && (
              <div className="flex items-center justify-between pb-2 border-b border-[#024182]/20">
                <img
                  src={activeLogo.url}
                  alt={activeLogo.nombre}
                  className="h-12 sm:h-14 w-auto max-w-[200px] object-contain"
                />
                <span className="text-[10px] font-mono font-bold text-[#024182] uppercase">
                  {activeLogo.nombre}
                </span>
              </div>
            )}

            <div className="bg-[#024182] text-white rounded-lg p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex-1 text-center">
                <h1 className="text-base sm:text-lg font-black tracking-wider uppercase">
                  COMPROBANTE DE GASTOS
                </h1>
              </div>
              <div className="bg-white text-[#024182] font-black px-4 py-1.5 rounded text-sm sm:text-base border border-blue-200">
                $ {displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </div>
            </div>
          </div>

          {/* Form Rows */}
          <div className="space-y-3 font-medium text-xs">
            {/* Importe con Letra */}
            <div className="flex items-center gap-2 border-b border-dashed border-[#024182]/40 pb-1.5">
              <span className="font-bold text-[#024182] whitespace-nowrap">Importe con letra:</span>
              <span className="font-semibold text-zinc-800 uppercase flex-1">{comp.importeLetra}</span>
            </div>

            {/* Concepto */}
            <div className="flex items-center gap-2 border-b border-dashed border-[#024182]/40 pb-1.5">
              <span className="font-bold text-[#024182] whitespace-nowrap">Concepto:</span>
              <span className="font-medium text-zinc-800 flex-1">{comp.concepto}</span>
            </div>

            {/* Solicitado a */}
            <div className="flex items-center gap-2 border-b border-dashed border-[#024182]/40 pb-1.5">
              <span className="font-bold text-[#024182] whitespace-nowrap">Solicitado a:</span>
              <span className="font-semibold text-zinc-800 flex-1">{comp.solicitadoA}</span>
            </div>
          </div>

          {/* Table Breakdown (No. Cuenta | # Orden | # Cotización | Nombre Proyecto | Nombre | Importe) */}
          <div className="border-2 border-black rounded-lg overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider border-b-2 border-black">
                  <th className="p-2 border-r border-zinc-700 text-center w-[13%]">No. Cuenta</th>
                  <th className="p-2 border-r border-zinc-700 text-center w-[12%]"># Orden</th>
                  <th className="p-2 border-r border-zinc-700 text-center w-[13%]"># Cotización</th>
                  <th className="p-2 border-r border-zinc-700 text-left w-[20%]">Nombre Proyecto</th>
                  <th className="p-2 border-r border-zinc-700 text-left w-[27%]">Nombre</th>
                  <th className="p-2 text-right w-[15%]">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-xs font-bold">
                {tableRows.map((row, idx) => {
                  const isFilled = Boolean(row.nombre?.trim() || (Number(row.importe) || 0) > 0 || row.nombreProyecto?.trim() || row.noOrden?.trim() || row.noCotizacion?.trim());
                  const style = getPdfRowColor(row.nombreProyecto || row.nombre || (row.importe ? 'COTEYUC' : null), idx);
                  return (
                    <tr
                      key={idx}
                      style={isFilled ? { backgroundColor: style.bg, color: style.text } : { backgroundColor: '#FFFFFF', color: '#000000' }}
                      className="h-9 border-b border-black"
                    >
                      <td className="p-2 border-r border-black font-mono font-black text-center text-[11px]">
                        {row.noCuenta || (isFilled ? `602-0${idx + 1}` : '')}
                      </td>
                      <td className="p-2 border-r border-black font-mono font-bold text-center text-[11px]">
                        {row.noOrden || ''}
                      </td>
                      <td className="p-2 border-r border-black font-mono font-bold text-center text-[11px]">
                        {row.noCotizacion || ''}
                      </td>
                      <td className="p-2 border-r border-black font-bold text-[11px] truncate max-w-[120px]">
                        {row.nombreProyecto || ''}
                      </td>
                      <td className="p-2 border-r border-black font-bold text-[11px]">
                        {row.nombre || ''}
                      </td>
                      <td className="p-2 text-right font-black font-mono text-[11px]">
                        {(Number(row.importe) || 0) > 0 ? `$${Number(row.importe).toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-white font-black border-t-2 border-black text-xs text-black">
                  <td colSpan={5} className="p-2 text-right uppercase border-r border-black tracking-wider">
                    TOTAL $
                  </td>
                  <td className="p-2 text-right text-black text-sm font-mono font-black">
                    ${displayTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Bottom Signatures Box (Fecha | Autorizado por | Recibido por) */}
          <div className="pt-4 grid grid-cols-3 gap-4 items-end text-center text-[10px]">
            {/* Fecha */}
            <div className="border-t border-[#024182] pt-1">
              <span className="font-bold text-zinc-800 block">{comp.fecha}</span>
              <span className="text-[9px] text-zinc-500 block uppercase">Fecha</span>
            </div>

            {/* Autorizado por */}
            <div className="border-t border-[#024182] pt-1">
              <span className="font-bold text-zinc-800 block uppercase">{comp.autorizadoPor}</span>
              <span className="text-[9px] text-zinc-500 block uppercase">Autorizado por</span>
            </div>

            {/* Recibido por */}
            <div className="border-t border-[#024182] pt-1">
              <span className="font-bold text-zinc-800 block uppercase">{comp.recibidoPor}</span>
              <span className="text-[9px] text-zinc-500 block uppercase">Recibido por</span>
            </div>
          </div>

          {/* Brand Logo Watermark Mark: "estrella" */}
          <div className="flex items-center justify-between pt-2 text-[#024182]">
            <span className="text-[9px] text-zinc-400 font-mono">Folio: {comp.folio}</span>
            <div className="flex items-center gap-1 font-bold italic text-xs">
              <span>estrella</span>
              <Star className="w-3 h-3 fill-[#024182]" />
            </div>
          </div>

          {/* ANEXO DE EVIDENCIA ADJUNTA */}
          {incluirEvidencias && comp.evidenciaUrl && (
            <div className="pt-8 border-t-2 border-dashed border-zinc-300 space-y-3 page-break-before">
              <div className="flex items-center justify-between pb-1 border-b border-zinc-200">
                <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#024182]" />
                  <span>Anexo: Evidencia Fotográfica / Ticket Adjunto</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">Folio: {comp.folio}</span>
              </div>

              <div className="flex justify-center bg-zinc-50 border border-zinc-200 rounded-lg p-4">
                <img
                  src={comp.evidenciaUrl}
                  alt={`Evidencia ${comp.folio}`}
                  className="max-h-[500px] w-auto object-contain rounded border border-zinc-200 shadow-xs"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
