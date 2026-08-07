import React, { useState } from 'react';
import { X, Printer, Download, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';

export const PDFReportModal: React.FC = () => {
  const { pdfModalData, setPdfModalData, giros } = useApp();
  const [selectedLogoId, setSelectedLogoId] = useState<string>('coteyuc');

  if (!pdfModalData) return null;

  const { reembolso, caja, gastos = [] } = pdfModalData;
  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const handlePrint = () => {
    window.print();
  };

  const totalReport = gastos.reduce((a, b) => a + b.importe, 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-5 shadow-2xl relative my-8">
        {/* Printable Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-zinc-700" />
            <h3 className="text-sm font-bold text-zinc-900">Vista Previa para Impresión / Exportación PDF</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar como PDF</span>
            </button>

            <button
              onClick={() => setPdfModalData(null)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg cursor-pointer"
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

        {/* OFFICIAL PRINT SHEET CONTAINER */}
        <div className="p-6 sm:p-8 border border-zinc-200 rounded-xl space-y-6 bg-white text-zinc-900 text-xs font-sans">
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
        </div>
      </div>
    </div>
  );
};
