import React, { useState } from 'react';
import { X, Printer, Download, TrendingUp, Calendar, Building2, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES } from '../constants/logos';
import { Abono, CajaChica } from '../types';

interface PDFInyeccionesModalProps {
  isOpen: boolean;
  onClose: () => void;
  abonos: Abono[];
  cajas: CajaChica[];
  selectedMonthName: string;
  selectedCajaName: string;
}

export const PDFInyeccionesModal: React.FC<PDFInyeccionesModalProps> = ({
  isOpen,
  onClose,
  abonos,
  cajas,
  selectedMonthName,
  selectedCajaName
}) => {
  const [selectedLogoId, setSelectedLogoId] = useState<string>('proyecta');

  if (!isOpen) return null;

  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);
  const totalInyectado = abonos.reduce((acc, curr) => acc + curr.monto, 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto max-h-[96vh] flex flex-col overflow-hidden printable-modal-container">
        {/* Top Header Toolbar (Hidden in Print) */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 space-y-3 shrink-0 print:hidden z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-emerald-600 text-white rounded-xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Reporte Mensual de Inyecciones de Fondo</h3>
                <p className="text-[11px] text-zinc-500">Seleccione el membrete antes de imprimir o guardar en PDF</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir / Guardar PDF</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
                title="Cerrar vista previa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <LogoSelector
              selectedLogoId={selectedLogoId}
              onSelectLogo={(logo) => setSelectedLogoId(logo.id)}
            />
          </div>
        </div>

        {/* Printable PDF Content Canvas */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/50 print:bg-white print:p-0">
          <div className="bg-white max-w-3xl mx-auto p-6 sm:p-8 rounded-xl shadow-xs print:shadow-none print:p-0 space-y-6 text-zinc-900 font-sans border border-zinc-200 print:border-none">
            {/* Header Document */}
            <div className="flex justify-between items-start border-b-2 border-emerald-600 pb-4">
              <div className="flex items-center gap-3">
                {activeLogo && activeLogo.url ? (
                  <img
                    src={activeLogo.url}
                    alt={activeLogo.nombre}
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto object-contain max-w-[140px]"
                  />
                ) : (
                  <div className="h-10 w-24 bg-zinc-200 rounded flex items-center justify-center text-xs font-bold text-zinc-600">
                    LOGOTIPO
                  </div>
                )}
                <div>
                  <h1 className="text-lg font-black text-zinc-900 tracking-tight uppercase">
                    REPORTE MENSUAL DE INYECCIONES Y ABONOS
                  </h1>
                  <p className="text-xs text-zinc-600 font-medium">Control de Efectivo y Reposiciones de Fondos</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200 block mb-1">
                  PERIODO: {selectedMonthName.toUpperCase()}
                </span>
                <span className="text-[11px] text-zinc-500">
                  Emitido: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* General Info Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs">
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Caja Filtrada</span>
                <span className="font-bold text-zinc-900">{selectedCajaName}</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Total Abonos</span>
                <span className="font-bold text-zinc-900">{abonos.length} operaciones</span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Promedio Abono</span>
                <span className="font-bold text-zinc-900">
                  ${abonos.length > 0 ? (totalInyectado / abonos.length).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase block">Monto Total Inyectado</span>
                <span className="font-black text-emerald-700 text-sm">
                  ${totalInyectado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Table of Injections */}
            <div className="space-y-2">
              <h3 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Detalle Cronológico de Inyecciones de Fondo
              </h3>

              <div className="overflow-x-auto border border-zinc-200 rounded-lg">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-emerald-800 text-white font-semibold">
                      <th className="py-2 px-3">Fecha / Hora</th>
                      <th className="py-2 px-3">Caja Destino</th>
                      <th className="py-2 px-3">Concepto / Motivo</th>
                      <th className="py-2 px-3">Autorizado / Registrado Por</th>
                      <th className="py-2 px-3 text-right">Importe ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {abonos.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-6 text-center text-zinc-400 italic">
                          No se encontraron abonos para el periodo y caja seleccionados.
                        </td>
                      </tr>
                    ) : (
                      abonos.map((abn, idx) => {
                        const cajaObj = cajas.find(c => c.id === abn.cajaId);
                        return (
                          <tr key={abn.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-zinc-50/70'}>
                            <td className="py-2 px-3 font-mono text-[11px] text-zinc-600">{abn.fecha}</td>
                            <td className="py-2 px-3 font-semibold text-zinc-800">{cajaObj?.nombre || abn.cajaId}</td>
                            <td className="py-2 px-3 text-zinc-700">{abn.concepto}</td>
                            <td className="py-2 px-3 text-zinc-600">{abn.registradoPor}</td>
                            <td className="py-2 px-3 text-right font-bold text-emerald-700">
                              +${abn.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="bg-zinc-100 font-bold text-zinc-900 border-t-2 border-emerald-600">
                      <td colSpan={4} className="py-2.5 px-3 text-right uppercase text-xs">
                        Gran Total Inyectado en el Mes:
                      </td>
                      <td className="py-2.5 px-3 text-right text-emerald-800 text-sm font-black">
                        ${totalInyectado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>

            {/* Firmas de Autorización */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-200">
              <div className="text-center">
                <div className="border-b border-zinc-400 w-48 mx-auto mb-1 h-8"></div>
                <p className="text-[11px] font-bold text-zinc-800">CP. Alberto Vargas</p>
                <p className="text-[10px] text-zinc-500">Contador General / Auditor</p>
              </div>

              <div className="text-center">
                <div className="border-b border-zinc-400 w-48 mx-auto mb-1 h-8"></div>
                <p className="text-[11px] font-bold text-zinc-800">Dirección de Administración</p>
                <p className="text-[10px] text-zinc-500">Autorización y Vo.Bo.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
