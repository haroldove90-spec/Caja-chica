import React, { useState } from 'react';
import { X, Printer, Download, Car, Fuel, Image as ImageIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { FuelGaugeSVG } from './FuelGaugeSVG';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';

export const PDFGasolinaReportModal: React.FC = () => {
  const { pdfGasolinaModalData, setPdfGasolinaModalData } = useApp();
  const [selectedLogoId, setSelectedLogoId] = useState<string>('coteyuc');

  if (!pdfGasolinaModalData) return null;

  const { list = [], record, vehiculo = 'CAMIONETA PARTNER' } = pdfGasolinaModalData;
  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const recordsToPrint = record ? [record] : list;
  const totalImporte = recordsToPrint.reduce((acc, r) => acc + r.importe, 0);

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

          {/* Table matching Attachment 1 Format */}
          <div className="overflow-x-auto">
            <table className="w-full text-center border-collapse border border-[#1d5fa6]">
              <thead>
                <tr className="bg-[#1d5fa6] text-white text-[10px] font-bold uppercase tracking-wider border-b border-[#1d5fa6]">
                  <th className="p-2.5 border-r border-white/20 w-24">FECHA</th>
                  <th className="p-2.5 border-r border-white/20 w-28">FORMA DE PAGO</th>
                  <th className="p-2.5 border-r border-white/20 text-left">DESCRIPCIÓN DE USO</th>
                  <th className="p-2.5 border-r border-white/20 w-24">ANTES</th>
                  <th className="p-2.5 border-r border-white/20 w-24">DESPUES</th>
                  <th className="p-2.5 border-r border-white/20 w-20">KM</th>
                  <th className="p-2.5 w-24 text-right">IMPORTE</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-[11px] font-medium">
                {recordsToPrint.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-zinc-400 italic">No hay cargas de combustible registradas.</td>
                  </tr>
                ) : (
                  recordsToPrint.map((r, i) => (
                    <tr key={r.id || i} className="hover:bg-zinc-50">
                      <td className="p-2.5 border-r border-zinc-200 font-semibold text-zinc-800">{r.fecha}</td>
                      <td className="p-2.5 border-r border-zinc-200 text-xs font-bold text-zinc-700">{r.formaPago}</td>
                      <td className="p-2.5 border-r border-zinc-200 text-left text-zinc-700">{r.descripcionUso}</td>
                      <td className="p-2 border-r border-zinc-200">
                        <FuelGaugeSVG level={r.nivelAntes} size={42} />
                      </td>
                      <td className="p-2 border-r border-zinc-200">
                        <FuelGaugeSVG level={r.nivelDespues} size={42} />
                      </td>
                      <td className="p-2.5 border-r border-zinc-200 font-mono font-bold text-zinc-800">
                        {r.km.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-bold text-zinc-900">
                        ${r.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}

                {/* Fill empty template rows if needed for realistic format layout */}
                {Array.from({ length: Math.max(0, 8 - recordsToPrint.length) }).map((_, idx) => (
                  <tr key={`empty-${idx}`} className="h-10">
                    <td className="border-r border-zinc-200"></td>
                    <td className="border-r border-zinc-200"></td>
                    <td className="border-r border-zinc-200"></td>
                    <td className="border-r border-zinc-200"></td>
                    <td className="border-r border-zinc-200"></td>
                    <td className="border-r border-zinc-200"></td>
                    <td></td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-100 font-black border-t-2 border-[#1d5fa6] text-xs">
                  <td colSpan={6} className="p-2.5 text-right uppercase border-r border-zinc-300">TOTAL REGISTRADO:</td>
                  <td className="p-2.5 text-right text-[#1d5fa6]">
                    ${totalImporte.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

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
