import React, { useState } from 'react';
import { Download, FileText, Printer, FileSpreadsheet, Filter, PieChart, TrendingUp, ShieldCheck, Calendar, Layers } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PDFInyeccionesModal } from './PDFInyeccionesModal';
import { ClientDeliverableModal } from './ClientDeliverableModal';

export const ContadorReportes: React.FC = () => {
  const { gastos, giros, cajas, abonos, setPdfModalData } = useApp();

  const [activeTab, setActiveTab] = useState<'gastos' | 'inyecciones' | 'checklist'>('gastos');

  // Filters for Gastos
  const [selectedCajaFilter, setSelectedCajaFilter] = useState<string>('all');
  const [selectedFacturadoFilter, setSelectedFacturadoFilter] = useState<string>('all');

  // Filters for Inyecciones
  const [filterMonthIny, setFilterMonthIny] = useState<string>('all');
  const [filterCajaIny, setFilterCajaIny] = useState<string>('all');
  const [showPdfInyeccionesModal, setShowPdfInyeccionesModal] = useState<boolean>(false);
  const [showClientDeliverableModal, setShowClientDeliverableModal] = useState<boolean>(false);

  // Compute available months from abonos
  const availableMonths: string[] = Array.from(new Set<string>(abonos.map(a => {
    const d = new Date(a.fecha.replace(' ', 'T'));
    if (isNaN(d.getTime())) return a.fecha.substring(0, 7);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    return `${d.getFullYear()}-${month}`;
  }))).sort().reverse();

  // Filtered Gastos
  const filteredGastos = gastos.filter(g => {
    if (selectedCajaFilter !== 'all' && g.cajaId !== selectedCajaFilter) return false;
    if (selectedFacturadoFilter === 'facturado' && !g.facturado) return false;
    if (selectedFacturadoFilter === 'nota' && g.facturado) return false;
    return g.activo !== false;
  });

  const totalFilteredAmount = filteredGastos.reduce((a, b) => a + b.importe, 0);

  // Filtered Inyecciones
  const filteredAbonos = abonos.filter(a => {
    if (filterCajaIny !== 'all' && a.cajaId !== filterCajaIny) return false;
    if (filterMonthIny !== 'all') {
      const d = new Date(a.fecha.replace(' ', 'T'));
      const aMonth = isNaN(d.getTime()) ? a.fecha.substring(0, 7) : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (aMonth !== filterMonthIny) return false;
    }
    return a.activo !== false;
  });

  const totalInyectadoFiltrado = filteredAbonos.reduce((acc, curr) => acc + curr.monto, 0);

  const getMonthName = (monthKey: string) => {
    if (monthKey === 'all') return 'Todos los Meses';
    const [year, month] = monthKey.split('-');
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    const mIdx = parseInt(month, 10) - 1;
    return `${months[mIdx] || month} ${year}`;
  };

  const getCajaName = (cajaId: string) => {
    if (cajaId === 'all') return 'Todas las Cajas Chicas';
    return cajas.find(c => c.id === cajaId)?.nombre || cajaId;
  };

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
      {/* TABS NAVIGATION */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-xs flex flex-wrap gap-2">
        <button
          onClick={() => setActiveTab('gastos')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gastos'
              ? 'bg-[#024182] text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <PieChart className="w-4 h-4" />
          <span>Consolidado de Gastos y Giros</span>
        </button>

        <button
          onClick={() => setActiveTab('inyecciones')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'inyecciones'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Reporte Mensual de Inyecciones</span>
        </button>

        <button
          onClick={() => setActiveTab('checklist')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'checklist'
              ? 'bg-zinc-900 text-white shadow-xs'
              : 'text-zinc-600 hover:bg-zinc-100'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Entrega de Mejoras y Checklist Cliente (PDF)</span>
        </button>
      </div>

      {/* TAB 1: GASTOS CONSOLIDADO */}
      {activeTab === 'gastos' && (
        <div className="space-y-6">
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
                className="inline-flex items-center gap-1.5 bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold px-3.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir PDF Gastos</span>
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
              <p className="text-xs text-zinc-400 italic text-center py-6">No hay comprobantes para los filtros seleccionados.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-semibold">
                      <th className="py-2.5 px-3">Giro / Centro de Costo</th>
                      <th className="py-2.5 px-3 text-center">Comprobantes</th>
                      <th className="py-2.5 px-3 text-right">Facturados ($)</th>
                      <th className="py-2.5 px-3 text-right">Notas Simples ($)</th>
                      <th className="py-2.5 px-3 text-right">Total Acumulado ($)</th>
                      <th className="py-2.5 px-3 text-right">% Participación</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {girosConsolidado.map(({ giro, cantComprobantes, facturados, notasSimples, totalGiro, porcentaje }) => (
                      <tr key={giro.id} className="hover:bg-zinc-50/80 transition-all">
                        <td className="py-2.5 px-3 font-semibold text-zinc-800 flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: giro.color }} />
                          <span>{giro.nombre}</span>
                        </td>
                        <td className="py-2.5 px-3 text-center text-zinc-600">{cantComprobantes}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-700">${facturados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-700">${notasSimples.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right font-bold text-zinc-900">${totalGiro.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</td>
                        <td className="py-2.5 px-3 text-right text-zinc-600 font-mono">{porcentaje.toFixed(1)}%</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-zinc-900 font-bold text-zinc-900 bg-zinc-50">
                      <td className="py-3 px-3 uppercase">Gran Total Consolidado</td>
                      <td className="py-3 px-3 text-center">{filteredGastos.length}</td>
                      <td className="py-3 px-3 text-right">
                        ${filteredGastos.filter(g => g.facturado).reduce((a, b) => a + b.importe, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right">
                        ${filteredGastos.filter(g => !g.facturado).reduce((a, b) => a + b.importe, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right text-base font-black">
                        ${totalFilteredAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-3 px-3 text-right font-mono">100.0%</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: INYECCIONES MENSUAL */}
      {activeTab === 'inyecciones' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-sm font-semibold text-zinc-900">Reporte Mensual de Inyecciones y Abonos de Fondo</h3>
              <p className="text-xs text-zinc-500">Historial de transferencias y depósitos de efectivo a cajas chicas</p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={filterMonthIny}
                  onChange={(e) => setFilterMonthIny(e.target.value)}
                  className="bg-transparent text-zinc-800 font-medium focus:outline-none text-xs"
                >
                  <option value="all">Todos los Meses</option>
                  {availableMonths.map(m => (
                    <option key={m} value={m}>{getMonthName(m)}</option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl px-2.5 py-1.5 text-xs">
                <Filter className="w-3.5 h-3.5 text-zinc-400" />
                <select
                  value={filterCajaIny}
                  onChange={(e) => setFilterCajaIny(e.target.value)}
                  className="bg-transparent text-zinc-800 font-medium focus:outline-none text-xs"
                >
                  <option value="all">Todas las Cajas</option>
                  {cajas.map(c => (
                    <option key={c.id} value={c.id}>{c.nombre}</option>
                  ))}
                </select>
              </div>

              <button
                onClick={() => setShowPdfInyeccionesModal(true)}
                className="inline-flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Generar PDF Mensual</span>
              </button>
            </div>
          </div>

          {/* METRICS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
              <span className="text-[11px] text-zinc-500 font-medium block">Total Inyectado en Periodo</span>
              <span className="text-2xl font-bold text-emerald-600">
                ${totalInyectadoFiltrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
              <span className="text-[11px] text-zinc-500 font-medium block">Cantidad de Inyecciones</span>
              <span className="text-2xl font-bold text-zinc-900">
                {filteredAbonos.length} operaciones
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
              <span className="text-[11px] text-zinc-500 font-medium block">Promedio por Inyección</span>
              <span className="text-2xl font-bold text-zinc-900">
                ${filteredAbonos.length > 0 ? (totalInyectadoFiltrado / filteredAbonos.length).toLocaleString('es-MX', { minimumFractionDigits: 2 }) : '0.00'}
              </span>
            </div>
          </div>

          {/* TABLE OF INYECCIONES */}
          <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
                Detalle de Abonos ({getMonthName(filterMonthIny)} - {getCajaName(filterCajaIny)})
              </span>
            </div>

            {filteredAbonos.length === 0 ? (
              <p className="text-xs text-zinc-400 italic text-center py-6">No hay abonos registrados para este periodo.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 text-zinc-500 font-semibold bg-zinc-50">
                      <th className="py-2.5 px-3">Fecha</th>
                      <th className="py-2.5 px-3">Caja Destino</th>
                      <th className="py-2.5 px-3">Concepto / Motivo</th>
                      <th className="py-2.5 px-3">Registrado Por</th>
                      <th className="py-2.5 px-3 text-right">Monto ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100">
                    {filteredAbonos.map((abn) => {
                      const cajaObj = cajas.find(c => c.id === abn.cajaId);
                      return (
                        <tr key={abn.id} className="hover:bg-zinc-50/80 transition-all">
                          <td className="py-2.5 px-3 font-mono text-zinc-600">{abn.fecha}</td>
                          <td className="py-2.5 px-3 font-semibold text-zinc-800">{cajaObj?.nombre || abn.cajaId}</td>
                          <td className="py-2.5 px-3 text-zinc-700">{abn.concepto}</td>
                          <td className="py-2.5 px-3 text-zinc-600">{abn.registradoPor}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-emerald-600">
                            +${abn.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-emerald-600 font-bold text-zinc-900 bg-emerald-50/50">
                      <td colSpan={4} className="py-3 px-3 uppercase text-xs">Total Inyecciones:</td>
                      <td className="py-3 px-3 text-right text-emerald-800 text-base font-black">
                        ${totalInyectadoFiltrado.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CHECKLIST & ENTREGA CLIENTE */}
      {activeTab === 'checklist' && (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-base font-bold text-zinc-900 flex items-center gap-2">
                <span>Acta de Entrega de Mejoras y Checklist de Validación</span>
                <span className="text-xs bg-emerald-100 text-emerald-800 font-semibold px-2.5 py-0.5 rounded-full">
                  100% Completado
                </span>
              </h3>
              <p className="text-xs text-zinc-500">Documento de conformidad para entrega formal al cliente Proyecta Digital</p>
            </div>

            <button
              onClick={() => setShowClientDeliverableModal(true)}
              className="inline-flex items-center gap-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs active:scale-95 shrink-0"
            >
              <Printer className="w-4 h-4" />
              <span>Descargar / Imprimir PDF para Cliente</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">1. Inyecciones de Fondo Automáticas al Saldo</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Operativo</span>
              </div>
              <p className="text-xs text-zinc-600">
                Al abonar a una caja chica, el saldo disponible aumenta en tiempo real. El límite de fondo base queda intacto a menos que se ajuste formalmente.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">2. Reporte Mensual de Inyecciones de Fondo</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Operativo</span>
              </div>
              <p className="text-xs text-zinc-600">
                Filtros por mes, año y caja chica con métricas de total inyectado y botón para exportar o imprimir reporte formal en PDF.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">3. Cajas Operativas sin Fondo Fijo (Flujo Semanal)</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Operativo</span>
              </div>
              <p className="text-xs text-zinc-600">
                Modalidad adaptada para <strong>Taller Proyecta</strong>, donde no se asigna un saldo base inicial sino que se capturan gastos semanales para reembolso directo.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">4. Folio de Reembolso Editable</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Operativo</span>
              </div>
              <p className="text-xs text-zinc-600">
                Al solicitar el cierre y reembolso, el usuario puede personalizar el número de folio con su propia nomenclatura corporativa.
              </p>
            </div>

            <div className="p-4 bg-zinc-50 rounded-xl border border-zinc-200 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-zinc-900">5. Restauración y Persistencia Integral de Cajas Chicas</h4>
                <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Operativo</span>
              </div>
              <p className="text-xs text-zinc-600">
                Disponibilidad permanente de todas las cajas (Reina Pino Matriz, Taller Proyecta, Coteyuc Sur) con sincronización fluida a Supabase.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* PDF MODALS */}
      <PDFInyeccionesModal
        isOpen={showPdfInyeccionesModal}
        onClose={() => setShowPdfInyeccionesModal(false)}
        abonos={filteredAbonos}
        cajas={cajas}
        selectedMonthName={getMonthName(filterMonthIny)}
        selectedCajaName={getCajaName(filterCajaIny)}
      />

      <ClientDeliverableModal
        isOpen={showClientDeliverableModal}
        onClose={() => setShowClientDeliverableModal(false)}
      />
    </div>
  );
};
