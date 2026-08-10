import React, { useState } from 'react';
import { X, Printer, Download, Car, Fuel, Image as ImageIcon, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FuelGaugeSVG } from './FuelGaugeSVG';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';
import { getPdfRowColor } from '../utils/pdfColors';

export const PDFGasolinaReportModal: React.FC = () => {
  const { pdfGasolinaModalData, setPdfGasolinaModalData, giros } = useApp();
  const [selectedLogoId, setSelectedLogoId] = useState<string>('coteyuc');
  const [incluirEvidencias, setIncluirEvidencias] = useState<boolean>(true);

  if (!pdfGasolinaModalData) return null;

  const { list = [], record, vehiculo = 'CAMIONETA PARTNER' } = pdfGasolinaModalData;
  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const recordsToPrint = record ? [record] : list;
  const totalImporte = recordsToPrint.reduce((acc, r) => acc + r.importe, 0);
  const recordsConEvidencia = recordsToPrint.filter(r => Boolean(r.evidenciaUrl));

  // Build summary table matching Image 1 format for Gasolina
  const defaultCategories = [
    'TALLER COTEYUC',
    'TALLER PROYECTA',
    'PROYECTA',
    'COTEYUC',
    'PUBLIKREA',
    'OTROS',
    'LOCAL HOCABA',
    'DESPACHO'
  ];

  const catTotals: Record<string, number> = {};
  defaultCategories.forEach(cat => { catTotals[cat] = 0; });

  recordsToPrint.forEach(r => {
    const text = `${r.descripcionUso || ''} ${r.formaPago || ''}`.toUpperCase();
    let matchedKey = 'OTROS';
    if (text.includes('TALLER') && text.includes('COTEYUC')) matchedKey = 'TALLER COTEYUC';
    else if (text.includes('TALLER') && text.includes('PROYECTA')) matchedKey = 'TALLER PROYECTA';
    else if (text.includes('PROYECTA')) matchedKey = 'PROYECTA';
    else if (text.includes('COTEYUC')) matchedKey = 'COTEYUC';
    else if (text.includes('PUBLI') || text.includes('PUBLICREA')) matchedKey = 'PUBLIKREA';
    else if (text.includes('DESPACHO')) matchedKey = 'DESPACHO';
    else if (text.includes('HOCABA')) matchedKey = 'LOCAL HOCABA';
    else if (recordsToPrint.length === 1 && catTotals['COTEYUC'] === 0) matchedKey = 'COTEYUC';

    catTotals[matchedKey] = (catTotals[matchedKey] || 0) + r.importe;
  });

  const summaryList = Object.entries(catTotals).map(([name, amount]) => ({ name, amount }));

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative my-auto max-h-[96vh] flex flex-col overflow-hidden printable-modal-container">
        {/* STICKY TOP HEADER FOR ACTIONS & LOGO SELECTOR */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 space-y-3 shrink-0 print:hidden z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#1d5fa6] text-white rounded-xl">
                <Fuel className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Vista Previa - Control de Combustible</h3>
                <p className="text-[11px] text-zinc-500">Seleccione un logotipo antes de guardar o imprimir</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {recordsConEvidencia.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIncluirEvidencias(!incluirEvidencias)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    incluirEvidencias
                      ? 'bg-sky-50 text-[#1d5fa6] border-sky-300 shadow-xs'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                  }`}
                  title="Activar u omitir imágenes de tickets de gasolina en la impresión del PDF"
                >
                  <Camera className="w-4 h-4" />
                  <span>{incluirEvidencias ? `Evidencias (${recordsConEvidencia.length}): INCLUIDAS` : `Evidencias (${recordsConEvidencia.length}): OMITIDAS`}</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="bg-[#1d5fa6] hover:bg-[#15467c] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar como PDF</span>
              </button>

              <button
                onClick={() => setPdfGasolinaModalData(null)}
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
          {/* OFFICIAL PRINT SHEET CONTAINER (MATCHING ATTACHMENT 1) */}
          <div className="printable-sheet w-full bg-white text-zinc-900 text-xs font-sans space-y-6">
          {/* Header Layout with Selected Logo & Title */}
          <div className="flex items-center justify-between border-b-2 border-[#1d5fa6] pb-4 gap-4">
            {/* Left Logo Slot */}
            <div className="w-1/3 text-left">
              {activeLogo?.url ? (
                <img
                  src={activeLogo.url}
                  alt={activeLogo.nombre}
                  className="h-12 sm:h-14 w-auto max-w-[180px] object-contain"
                />
              ) : (
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                  Reporte General
                </span>
              )}
            </div>

            {/* Center Header Title */}
            <div className="w-1/3 text-center">
              <h1 className="text-lg font-black tracking-tight text-zinc-900 uppercase">
                CONTROL DE COMBUSTIBLE
              </h1>
              <h2 className="text-sm font-bold text-[#1d5fa6] uppercase mt-0.5">
                {vehiculo}
              </h2>
            </div>

            {/* Right Sub-info or Brand */}
            <div className="w-1/3 text-right">
              <span className="text-xs font-mono font-bold text-zinc-700 block uppercase">
                EMISIÓN OFICIAL
              </span>
              <span className="text-[10px] font-medium text-zinc-400 block">
                {new Date().toISOString().substring(0, 10)}
              </span>
            </div>
          </div>

          {/* COLORED SUMMARY TABLE BY GIRO / EMPRESA (MATCHING IMAGE 1 EXACTLY) */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider">
              Resumen Consolidado por Empresa / Giro
            </h4>
            <div className="overflow-x-auto border-2 border-black">
              <table className="w-full text-center border-collapse">
                <tbody className="divide-y divide-black font-extrabold text-xs">
                  {summaryList.map((item, idx) => {
                    const style = getPdfRowColor(item.name, idx);
                    return (
                      <tr key={item.name} style={{ backgroundColor: style.bg, color: style.text }} className="border-b border-black">
                        <td className="p-2 border-r border-black w-2/3 uppercase text-center font-black tracking-wide">
                          {item.name}
                        </td>
                        <td className="p-2 w-1/3 text-right font-black tracking-wider pr-4 font-mono">
                          {item.amount > 0 ? `$${item.amount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr className="bg-white text-black font-black text-sm border-t-2 border-black">
                    <td className="p-2.5 text-center uppercase border-r border-black tracking-widest">
                      TOTAL
                    </td>
                    <td className="p-2.5 text-right font-black font-mono pr-4 text-base">
                      $ {totalImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Table matching Attachment 1 Format */}
          <div className="overflow-x-auto pt-2">
            <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider mb-2">
              Bitácora Detallada de Cargas de Combustible
            </h4>
            <table className="w-full text-center border-collapse border-2 border-black">
              <thead>
                <tr className="bg-zinc-900 text-white text-[10px] font-bold uppercase tracking-wider border-b-2 border-black">
                  <th className="p-2.5 border-r border-zinc-700 w-24">FECHA</th>
                  <th className="p-2.5 border-r border-zinc-700 w-28">FORMA DE PAGO</th>
                  <th className="p-2.5 border-r border-zinc-700 text-left">DESCRIPCIÓN DE USO</th>
                  <th className="p-2.5 border-r border-zinc-700 w-24">ANTES</th>
                  <th className="p-2.5 border-r border-zinc-700 w-24">DESPUES</th>
                  <th className="p-2.5 border-r border-zinc-700 w-20">KM</th>
                  <th className="p-2.5 w-24 text-right">IMPORTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black text-[11px] font-bold">
                {recordsToPrint.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-zinc-400 italic">No hay cargas de combustible registradas.</td>
                  </tr>
                ) : (
                  recordsToPrint.map((r, i) => {
                    const style = getPdfRowColor(r.descripcionUso || r.formaPago, i);
                    return (
                      <tr key={r.id || i} style={{ backgroundColor: style.bg, color: style.text }} className="border-b border-black">
                        <td className="p-2.5 border-r border-black font-black">{r.fecha}</td>
                        <td className="p-2.5 border-r border-black text-xs font-black uppercase">{r.formaPago}</td>
                        <td className="p-2.5 border-r border-black text-left font-bold">{r.descripcionUso}</td>
                        <td className="p-2 border-r border-black bg-white/80">
                          <FuelGaugeSVG level={r.nivelAntes} size={42} />
                        </td>
                        <td className="p-2 border-r border-black bg-white/80">
                          <FuelGaugeSVG level={r.nivelDespues} size={42} />
                        </td>
                        <td className="p-2.5 border-r border-black font-mono font-black">
                          {r.km.toLocaleString()}
                        </td>
                        <td className="p-2.5 text-right font-black font-mono text-xs">
                          ${r.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    );
                  })
                )}

                {/* Fill empty template rows if needed for realistic format layout */}
                {Array.from({ length: Math.max(0, 4 - recordsToPrint.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-10 bg-white border-b border-black">
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td className="border-r border-black"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-white text-black font-black border-t-2 border-black text-xs">
                  <td colSpan={6} className="p-2.5 text-right uppercase border-r border-black tracking-wider">TOTAL REGISTRADO:</td>
                  <td className="p-2.5 text-right font-mono text-sm">
                    ${totalImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ANEXO DE EVIDENCIAS FOTOGRÁFICAS / TICKETS */}
          {incluirEvidencias && recordsConEvidencia.length > 0 && (
            <div className="pt-8 border-t-2 border-dashed border-zinc-300 space-y-4 page-break-before">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#1d5fa6]" />
                  <span>Anexo: Evidencias Fotográficas y Comprobantes de Combustible ({recordsConEvidencia.length})</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">Bitácora de Cargas</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {recordsConEvidencia.map((r, idx) => (
                  <div key={r.id || idx} className="border border-zinc-200 rounded-lg p-3 space-y-2 bg-zinc-50/50 break-inside-avoid">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 border-b border-zinc-200 pb-1">
                      <span>{r.fecha} - {r.formaPago}</span>
                      <span className="font-mono text-[#1d5fa6]">${r.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{r.descripcionUso} (KM: {r.km})</p>
                    <div className="mt-2 flex justify-center bg-white border border-zinc-200 rounded p-2 max-h-64 overflow-hidden">
                      <img src={r.evidenciaUrl} alt={`Ticket ${r.fecha}`} className="max-h-56 w-auto object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer Note */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-200 text-[10px] text-zinc-400">
            <span>Bitácora Digital de Control de Flotilla y Combustibles</span>
            <span>Fecha de Emisión: {new Date().toISOString().substring(0, 10)}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);
};
