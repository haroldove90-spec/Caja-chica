import React from 'react';
import { X, Printer, FileBadge, Download, Star } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const PDFComprobanteReportModal: React.FC = () => {
  const { pdfComprobanteModalData, setPdfComprobanteModalData } = useApp();

  if (!pdfComprobanteModalData) return null;

  const comp = pdfComprobanteModalData;

  const handlePrint = () => {
    window.print();
  };

  // Ensure 4 row slots in breakdown table like Attachment 2
  const tableRows = [...comp.items];
  while (tableRows.length < 4) {
    tableRows.push({ noCuenta: '', nombre: '', importe: 0 });
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
        {/* Printable Actions Bar */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-200 print:hidden">
          <div className="flex items-center gap-2">
            <FileBadge className="w-5 h-5 text-[#024182]" />
            <h3 className="text-sm font-bold text-zinc-900">Vista Previa - Comprobante de Gastos ({comp.folio})</h3>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-[#024182] hover:bg-[#0b315b] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={() => setPdfComprobanteModalData(null)}
              className="p-1.5 text-zinc-400 hover:text-zinc-900 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* OFFICIAL PRINT SHEET CONTAINER (FAITHFUL TO ATTACHMENT 2 FORMAT) */}
        <div className="p-6 sm:p-8 bg-sky-50/50 border-2 border-[#024182] rounded-xl text-zinc-900 text-xs font-sans space-y-5 shadow-sm">
          {/* Header Dark Blue Banner */}
          <div className="bg-[#024182] text-white rounded-lg p-3.5 flex items-center justify-between shadow-xs">
            <div className="flex-1 text-center">
              <h1 className="text-base sm:text-lg font-black tracking-wider uppercase">
                COMPROBANTE DE GASTOS
              </h1>
            </div>
            <div className="bg-white text-[#024182] font-black px-4 py-1.5 rounded text-sm sm:text-base border border-blue-200">
              $ {comp.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
          <div className="border border-[#024182] rounded-lg overflow-hidden bg-white shadow-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#024182] text-white text-[10px] font-bold uppercase tracking-wider">
                  <th className="p-2 border-r border-white/20 text-center w-[13%]">No. Cuenta</th>
                  <th className="p-2 border-r border-white/20 text-center w-[12%]"># Orden</th>
                  <th className="p-2 border-r border-white/20 text-center w-[13%]"># Cotización</th>
                  <th className="p-2 border-r border-white/20 text-left w-[20%]">Nombre Proyecto</th>
                  <th className="p-2 border-r border-white/20 text-left w-[27%]">Nombre</th>
                  <th className="p-2 text-right w-[15%]">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 text-xs">
                {tableRows.map((row, idx) => (
                  <tr key={idx} className="h-9">
                    <td className="p-2 border-r border-zinc-200 font-mono font-semibold text-zinc-800 text-center text-[11px]">
                      {row.noCuenta || (row.nombre || row.importe ? `${idx + 1}` : '')}
                    </td>
                    <td className="p-2 border-r border-zinc-200 font-mono text-zinc-700 text-center text-[11px]">
                      {row.noOrden || ''}
                    </td>
                    <td className="p-2 border-r border-zinc-200 font-mono text-zinc-700 text-center text-[11px]">
                      {row.noCotizacion || ''}
                    </td>
                    <td className="p-2 border-r border-zinc-200 font-medium text-zinc-800 text-[11px] truncate max-w-[120px]">
                      {row.nombreProyecto || ''}
                    </td>
                    <td className="p-2 border-r border-zinc-200 font-medium text-zinc-700 text-[11px]">
                      {row.nombre}
                    </td>
                    <td className="p-2 text-right font-bold text-zinc-900 font-mono text-[11px]">
                      {row.importe > 0 ? `$${row.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}` : ''}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-sky-100/60 font-black border-t-2 border-[#024182] text-xs">
                  <td colSpan={5} className="p-2 text-right uppercase border-r border-zinc-300 text-[#024182]">
                    TOTAL $
                  </td>
                  <td className="p-2 text-right text-[#024182] text-sm font-mono font-black">
                    ${comp.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
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
        </div>
      </div>
    </div>
  );
};
