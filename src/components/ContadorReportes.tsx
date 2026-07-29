import React, { useState } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, Filter, PieChart } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ContadorReportes: React.FC = () => {
  const { gastos, giros, cajas, setPdfModalData } = useApp();

  const [selectedCajaFilter, setSelectedCajaFilter] = useState<string>('all');
  const [selectedFacturadoFilter, setSelectedFacturadoFilter] = useState<string>('all');

  // Filter expenses
  const filteredGastos = gastos.filter(g => {
    if (selectedCajaFilter !== 'all' && g.cajaId !== selectedCajaFilter) return false;
    if (selectedFacturadoFilter === 'facturado' && !g.facturado) return false;
    if (selectedFacturadoFilter === 'nota' && g.facturado) return false;
    return true;
  });

  const totalFilteredAmount = filteredGastos.reduce((a, b) => a + b.importe, 0);

  // Consolidated breakdown by Giro
  const girosConsolidado = giros.map(giro => {
    const giroGastos = filteredGastos.filter(g => g.giroId === giro.id);
    const facturados = giroGastos.filter(g => g.facturado).reduce((a, b) => a + b.importe, 0);
    const notasSimples = giroGastos.filter(g => !g.facturado).reduce((a, b) => a + b.importe, 0);
    const totalGiro = giroGastos.reduce((a, b) => a + b.importe, 0);

    return {
      giro,
      cantComprobantes: giroGastos.length,
      facturados,
      notasSimples,
      totalGiro,
      porcentaje: totalFilteredAmount > 0 ? (totalGiro / totalFilteredAmount) * 100 : 0
    };
  }).filter(item => item.cantComprobantes > 0);

  // CSV Export Handler
  const handleExportCSV = () => {
    if (filteredGastos.length === 0) {
      alert('No hay datos para exportar.');
      return;
    }

    const headers = ['Nro Orden', 'Fecha', 'Caja Chica', 'Proveedor', 'Concepto', 'Solicitante', 'Giro', 'Tipo Comprobante', 'Importe ($)', 'Estado'];
    const rows = filteredGastos.map(g => {
      const cajaName = cajas.find(c => c.id === g.cajaId)?.nombre || g.cajaId;
      const giroName = giros.find(gi => gi.id === g.giroId)?.nombre || g.giroId;
      return [
        `"${g.nroOrden}"`,
        `"${g.fecha}"`,
        `"${cajaName}"`,
        `"${g.proveedor.replace(/"/g, '""')}"`,
        `"${g.concepto.replace(/"/g, '""')}"`,
        `"${g.solicitante}"`,
        `"${giroName}"`,
        `"${g.facturado ? 'Facturado' : 'Nota Simple'}"`,
        g.importe.toFixed(2),
        `"${g.estado}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_Consolidado_Caja_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* HEADER BAR AND FILTERS */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-900">Consolidado por Giro / Centro de Costos</h3>
          <p className="text-xs text-zinc-500">Análisis comparativo de gastos asignados por centro operativo</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Caja Filter */}
          <select
            value={selectedCajaFilter}
            onChange={(e) => setSelectedCajaFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none"
          >
            <option value="all">Todas las Cajas</option>
            {cajas.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>

          {/* Facturado Filter */}
          <select
            value={selectedFacturadoFilter}
            onChange={(e) => setSelectedFacturadoFilter(e.target.value)}
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-800 font-medium focus:outline-none"
          >
            <option value="all">Facturados y Notas</option>
            <option value="facturado">Solo Facturados</option>
            <option value="nota">Solo Notas Simples</option>
          </select>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel / CSV</span>
          </button>

          {/* Official Printable PDF Modal Button */}
          <button
            onClick={() => setPdfModalData({
              caja: cajas.find(c => c.id === selectedCajaFilter) || cajas[0],
              gastos: filteredGastos
            })}
            className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-medium px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Vista Imprimible PDF</span>
          </button>
        </div>
      </div>

      {/* CONSOLIDADO TABLA COMPARATIVA POR GIRO */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <span className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">
            Desglose Comparativo
          </span>
          <span className="text-xs font-bold text-zinc-900">
            Total Consolidado: ${totalFilteredAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </span>
        </div>

        {girosConsolidado.length === 0 ? (
          <p className="text-xs text-zinc-400 italic text-center py-8">No hay registros para mostrar con los filtros seleccionados.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Giro / Centro de Costos</th>
                  <th className="py-2.5 px-3 text-center">N° Comprobantes</th>
                  <th className="py-2.5 px-3 text-right">Facturado ($)</th>
                  <th className="py-2.5 px-3 text-right">Nota Simple ($)</th>
                  <th className="py-2.5 px-3 text-right">Total Giro ($)</th>
                  <th className="py-2.5 px-3 text-right">Participación (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {girosConsolidado.map(({ giro, cantComprobantes, facturados, notasSimples, totalGiro, porcentaje }) => (
                  <tr key={giro.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: giro.color }}
                        />
                        <span className="font-semibold text-zinc-900">{giro.nombre}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">({giro.codigo})</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {cantComprobantes}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-emerald-700">
                      ${facturados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-medium text-amber-700">
                      ${notasSimples.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right font-bold text-zinc-900">
                      ${totalGiro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <span className="font-semibold text-zinc-800">{porcentaje.toFixed(1)}%</span>
                        <div className="w-12 h-1.5 bg-zinc-100 rounded-full overflow-hidden shrink-0">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${porcentaje}%`,
                              backgroundColor: giro.color
                            }}
                          />
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* DETALLE GENERAL DE COMPROBANTES CONSOLIDADO */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
          <h3 className="text-sm font-semibold text-zinc-900">Detalle de Registros Filtrados ({filteredGastos.length})</h3>
          <span className="text-xs text-zinc-500">Muestreo completo</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                <th className="py-2.5 px-3">Fecha / Orden</th>
                <th className="py-2.5 px-3">Caja</th>
                <th className="py-2.5 px-3">Proveedor / Concepto</th>
                <th className="py-2.5 px-3">Giro</th>
                <th className="py-2.5 px-3">Comprobante</th>
                <th className="py-2.5 px-3 text-right">Importe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
              {filteredGastos.map((g) => {
                const cajaObj = cajas.find(c => c.id === g.cajaId);
                const giroObj = giros.find(gi => gi.id === g.giroId);

                return (
                  <tr key={g.id} className="hover:bg-zinc-50/80">
                    <td className="py-2.5 px-3">
                      <span className="font-mono font-semibold text-zinc-900 block">{g.nroOrden}</span>
                      <span className="text-[10px] text-zinc-400">{g.fecha}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-medium text-zinc-600">
                      {cajaObj?.nombre.split('-')[1] || cajaObj?.nombre}
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="font-medium text-zinc-900 block">{g.proveedor}</span>
                      <span className="text-[10px] text-zinc-500 line-clamp-1">{g.concepto}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      {giroObj && (
                        <span
                          className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                          style={{ backgroundColor: `${giroObj.color}15`, color: giroObj.color }}
                        >
                          {giroObj.nombre}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-[11px] font-medium">
                      {g.facturado ? (
                        <span className="text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">Facturado</span>
                      ) : (
                        <span className="text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded">Nota Simple</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right font-bold text-zinc-900">
                      ${g.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
