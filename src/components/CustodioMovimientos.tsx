import React, { useState } from 'react';
import { Wallet, ArrowDownRight, RefreshCw, Search, Eye, FileText, CheckCircle2, Clock } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const CustodioMovimientos: React.FC = () => {
  const { activeCaja, activeCajaGastos, activeCajaGastosAcumulados, activeCajaSaldoDisponible, giros, setPreviewEvidencia, setActiveModule } = useApp();
  const [searchTerm, setSearchTerm] = useState('');

  const safeCaja = activeCaja || {
    id: 'caja-1',
    nombre: 'Caja Chica - Matriz',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 15000,
    estado: 'Abierta',
    ubicacion: 'Oficina Central'
  };

  const filteredGastos = activeCajaGastos.filter(g =>
    g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.nroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
    g.solicitante.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Visual Dashboard Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Fondo Total</span>
            <Wallet className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-2xl font-semibold text-zinc-900 tracking-tight">
            ${safeCaja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Límite asignado</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Gastos Acumulados</span>
            <ArrowDownRight className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-semibold text-rose-600 tracking-tight">
            ${activeCajaGastosAcumulados.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">{activeCajaGastos.length} comprobantes registrados</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-zinc-200/80 shadow-xs">
          <div className="flex items-center justify-between text-zinc-500 mb-2">
            <span className="text-xs font-medium">Saldo Disponible</span>
            <RefreshCw className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-semibold text-emerald-600 tracking-tight">
            ${activeCajaSaldoDisponible.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Efectivo/Bancos en caja</p>
        </div>
      </div>

      {/* Historial Local de Movimientos */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Movimientos de la Caja Actual</h3>
            <p className="text-xs text-zinc-500">Listado de gastos registrados en el periodo en curso</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1 sm:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Buscar por concepto, proveedor..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zinc-900 transition-colors"
              />
            </div>
            <button
              onClick={() => setActiveModule('gastos')}
              className="bg-zinc-900 text-white text-xs font-medium px-3 py-1.5 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer shrink-0"
            >
              + Nuevo Gasto
            </button>
          </div>
        </div>

        {filteredGastos.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-zinc-200 rounded-xl">
            <FileText className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
            <p className="text-xs font-medium text-zinc-600">No hay movimientos registrados</p>
            <p className="text-[11px] text-zinc-400">Captura el primer gasto del periodo</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
                  <th className="py-2.5 px-3">Fecha / Orden</th>
                  <th className="py-2.5 px-3">Proveedor / Concepto</th>
                  <th className="py-2.5 px-3">Giro</th>
                  <th className="py-2.5 px-3">Solicitante</th>
                  <th className="py-2.5 px-3">Evidencia</th>
                  <th className="py-2.5 px-3 text-right">Importe</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-700">
                {filteredGastos.map((gasto) => {
                  const giroObj = giros.find(g => g.id === gasto.giroId);
                  return (
                    <tr key={gasto.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-3 px-3">
                        <span className="font-semibold text-zinc-900 block">{gasto.nroOrden}</span>
                        <span className="text-[10px] text-zinc-400">{gasto.fecha}</span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-medium text-zinc-900 block">{gasto.proveedor}</span>
                        <span className="text-[11px] text-zinc-500 line-clamp-1">{gasto.concepto}</span>
                      </td>
                      <td className="py-3 px-3">
                        {giroObj && (
                          <span
                            className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium"
                            style={{
                              backgroundColor: `${giroObj.color}15`,
                              color: giroObj.color
                            }}
                          >
                            {giroObj.nombre}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-zinc-600">
                        {gasto.solicitante}
                      </td>
                      <td className="py-3 px-3">
                        {gasto.evidenciaUrl ? (
                          <button
                            onClick={() => setPreviewEvidencia({
                              url: gasto.evidenciaUrl!,
                              type: gasto.evidenciaType || 'image',
                              title: `${gasto.nroOrden} - ${gasto.proveedor}`
                            })}
                            className="inline-flex items-center gap-1 text-[11px] text-zinc-600 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 px-2 py-1 rounded-md transition-colors cursor-pointer"
                          >
                            <Eye className="w-3 h-3" />
                            <span>Ver {gasto.facturado ? 'Factura' : 'Ticket'}</span>
                          </button>
                        ) : (
                          <span className="text-[10px] text-zinc-400">Sin archivo</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right font-semibold text-zinc-900">
                        ${gasto.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        <span className="block text-[10px] font-normal text-zinc-400">
                          {gasto.facturado ? 'Facturado' : 'Nota simple'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
