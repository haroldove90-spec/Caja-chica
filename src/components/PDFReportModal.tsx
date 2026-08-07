import React, { useState } from 'react';
import { X, Printer, Download, Building2, CheckCircle2, Camera } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';

export const PDFReportModal: React.FC = () => {
  const { pdfModalData, setPdfModalData, giros } = useApp();
  const [selectedLogoId, setSelectedLogoId] = useState<string>('coteyuc');
  const [incluirEvidencias, setIncluirEvidencias] = useState<boolean>(true);

  if (!pdfModalData) return null;

  const { reembolso, caja, gastos = [] } = pdfModalData;
  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const handlePrint = () => {
    window.print();
  };

  const totalReport = gastos.reduce((a, b) => a + b.importe, 0);
  const gastosConEvidencia = gastos.filter(g => Boolean(g.evidenciaUrl));

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-5xl w-full shadow-2xl relative my-auto max-h-[96vh] flex flex-col overflow-hidden printable-modal-container">
        {/* STICKY TOP HEADER FOR ACTIONS & LOGO SELECTOR */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 space-y-3 shrink-0 print:hidden z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#024182] text-white rounded-xl">
                <Printer className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Vista Previa - Reporte de Reembolso</h3>
                <p className="text-[11px] text-zinc-500">Seleccione un logotipo antes de guardar o imprimir</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {gastosConEvidencia.length > 0 && (
                <button
                  type="button"
                  onClick={() => setIncluirEvidencias(!incluirEvidencias)}
                  className={`px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer border ${
                    incluirEvidencias
                      ? 'bg-blue-50 text-[#024182] border-blue-300 shadow-xs'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-200 hover:bg-zinc-200'
                  }`}
                  title="Activar u omitir imágenes de tickets/evidencias en la impresión del PDF"
                >
                  <Camera className="w-4 h-4" />
                  <span>{incluirEvidencias ? `Evidencias (${gastosConEvidencia.length}): INCLUIDAS` : `Evidencias (${gastosConEvidencia.length}): OMITIDAS`}</span>
                </button>
              )}

              <button
                onClick={handlePrint}
                className="bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all flex items-center gap-2 cursor-pointer shadow-md active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar como PDF</span>
              </button>

              <button
                onClick={() => setPdfModalData(null)}
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
          <div className="printable-sheet w-full space-y-6 text-zinc-900 text-xs font-sans">
          {/* Official Header with Logo */}
          <div className="flex justify-between items-start border-b border-zinc-900 pb-4">
            <div className="flex items-center gap-4">
              {activeLogo?.url && (
                <div className="shrink-0">
                  <img
                    src={activeLogo.url}
                    alt={activeLogo.nombre}
                    className="h-12 sm:h-16 w-auto max-w-[180px] object-contain"
                  />
                </div>
              )}
              <div>
                <h1 className="text-base sm:text-lg font-black tracking-tight text-zinc-900 uppercase">
                  REPORTE OFICIAL DE REEMBOLSO DE CAJA CHICA
                </h1>
                <p className="text-xs text-zinc-600 font-medium mt-0.5">
                  {caja?.nombre || 'Caja Chica General'}
                </p>
                <p className="text-[10px] text-zinc-400">Responsable: {caja?.responsable}</p>
              </div>
            </div>

            <div className="text-right space-y-0.5 shrink-0 pl-2">
              <span className="font-mono text-sm font-bold text-zinc-900 block">
                {reembolso ? reembolso.nroReembolso : `REP-${new Date().toISOString().substring(0, 10)}`}
              </span>
              <span className="text-[10px] text-zinc-500 block">
                Fecha: {reembolso ? reembolso.fechaSolicitud : new Date().toISOString().substring(0, 10)}
              </span>
            </div>
          </div>

          {/* Key Metrics Table */}
          <div className="grid grid-cols-3 gap-4 bg-zinc-50 p-3 rounded-lg border border-zinc-200/80">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Fondo Fijo Base</span>
              <span className="font-bold text-sm text-zinc-800">
                ${(caja?.fondoBase || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Total Solicitado</span>
              <span className="font-bold text-sm text-zinc-900">
                ${totalReport.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase">Estado del Trámite</span>
              <span className="font-bold text-xs uppercase text-emerald-700">
                {reembolso ? reembolso.estado : 'Consolidado'}
              </span>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider">
              Desglose de Comprobantes Presentados ({gastos.length})
            </h4>

            <table className="w-full text-left border-collapse border border-zinc-200">
              <thead>
                <tr className="bg-zinc-100 text-[10px] font-bold text-zinc-700 uppercase border-b border-zinc-200">
                  <th className="p-2 border-r border-zinc-200">N° Orden</th>
                  <th className="p-2 border-r border-zinc-200">Fecha</th>
                  <th className="p-2 border-r border-zinc-200">Proveedor</th>
                  <th className="p-2 border-r border-zinc-200">Concepto</th>
                  <th className="p-2 border-r border-zinc-200">Giro</th>
                  <th className="p-2 text-right">Importe ($)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-[11px]">
                {gastos.map((g) => {
                  const giroObj = giros.find(gi => gi.id === g.giroId);
                  return (
                    <tr key={g.id}>
                      <td className="p-2 border-r border-zinc-200 font-mono font-semibold">{g.nroOrden}</td>
                      <td className="p-2 border-r border-zinc-200">{g.fecha}</td>
                      <td className="p-2 border-r border-zinc-200 font-medium">{g.proveedor}</td>
                      <td className="p-2 border-r border-zinc-200 text-zinc-600">{g.concepto}</td>
                      <td className="p-2 border-r border-zinc-200 font-medium">{giroObj?.nombre || 'General'}</td>
                      <td className="p-2 text-right font-bold">${g.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-zinc-50 font-bold border-t-2 border-zinc-900 text-xs">
                  <td colSpan={5} className="p-2 text-right uppercase border-r border-zinc-200">Total a Reembolsar:</td>
                  <td className="p-2 text-right text-zinc-900">${totalReport.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Official Signature Lines */}
          <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[10px] text-zinc-600">
            <div className="space-y-1">
              <div className="border-t border-zinc-400 pt-1 font-semibold text-zinc-900">
                {caja?.responsable || 'CUSTODIO DE CAJA'}
              </div>
              <p className="text-[9px] text-zinc-400">Entrega de Comprobantes</p>
            </div>

            <div className="space-y-1">
              <div className="border-t border-zinc-400 pt-1 font-semibold text-zinc-900">
                CP. ALBERTO VARGAS
              </div>
              <p className="text-[9px] text-zinc-400">Contador / Auditoria</p>
            </div>

            <div className="space-y-1">
              <div className="border-t border-zinc-400 pt-1 font-semibold text-zinc-900">
                DIRECCIÓN GENERAL
              </div>
              <p className="text-[9px] text-zinc-400">Autorización Final</p>
            </div>
          </div>

          {/* ANEXO DE EVIDENCIAS FOTOGRÁFICAS / TICKETS */}
          {incluirEvidencias && gastosConEvidencia.length > 0 && (
            <div className="pt-8 border-t-2 border-dashed border-zinc-300 space-y-4 page-break-before">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-200">
                <h4 className="font-bold text-xs text-zinc-800 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#024182]" />
                  <span>Anexo: Evidencias Fotográficas y Comprobantes Adjuntos ({gastosConEvidencia.length})</span>
                </h4>
                <span className="text-[10px] text-zinc-400 font-mono">Impresión con comprobantes</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {gastosConEvidencia.map((g, idx) => (
                  <div key={g.id || idx} className="border border-zinc-200 rounded-lg p-3 space-y-2 bg-zinc-50/50 break-inside-avoid">
                    <div className="flex items-center justify-between text-[11px] font-bold text-zinc-800 border-b border-zinc-200 pb-1">
                      <span>{g.nroOrden} - {g.proveedor}</span>
                      <span className="font-mono text-[#024182]">${g.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                    </div>
                    <p className="text-[10px] text-zinc-500 line-clamp-1">{g.concepto}</p>
                    <div className="mt-2 flex justify-center bg-white border border-zinc-200 rounded p-2 max-h-64 overflow-hidden">
                      <img src={g.evidenciaUrl} alt={`Comprobante ${g.nroOrden}`} className="max-h-56 w-auto object-contain" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
);
};
