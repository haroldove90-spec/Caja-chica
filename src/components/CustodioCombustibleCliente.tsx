import React, { useState } from 'react';
import { Fuel, Camera, Eye, CheckCircle2, Clock, XCircle, User, Filter, AlertCircle, ExternalLink, Search } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComprobanteCombustibleCliente } from '../types';

export const CustodioCombustibleCliente: React.FC = () => {
  const {
    activeCajaId,
    cajas,
    comprobantesCombustibleCliente,
    updateComprobanteCombustibleClienteEstado,
    deleteComprobanteCombustibleCliente,
    setPreviewEvidencia
  } = useApp();

  const [filterState, setFilterState] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Filter records by box and optional state search
  const filteredRecords = comprobantesCombustibleCliente.filter(rec => {
    const matchesState = filterState === 'todos' || rec.estado === filterState;
    const matchesSearch = !searchTerm ||
      rec.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rec.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (rec.placas && rec.placas.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (rec.estacion && rec.estacion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesState && matchesSearch;
  });

  const getStatusBadge = (estado: ComprobanteCombustibleCliente['estado']) => {
    switch (estado) {
      case 'aprobado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>APROBADO</span>
          </span>
        );
      case 'revisado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 border border-blue-200">
            <Clock className="w-3 h-3 text-blue-600" />
            <span>REVISADO</span>
          </span>
        );
      case 'rechazado':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <XCircle className="w-3 h-3 text-rose-600" />
            <span>RECHAZADO</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            <span>PENDIENTE ENVIADO</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#024182] text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Camera className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Comprobantes de Combustible - Rol Cliente
            </h1>
            <p className="text-xs text-zinc-500">
              Revise las fotos de los tickets tomadas desde dispositivos móviles por los clientes, verifique la evidencia y controle su estado.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="bg-blue-50 border border-blue-200 text-blue-900 px-4 py-2 rounded-xl text-center">
            <span className="text-[10px] uppercase font-bold text-blue-600 block">Total Comprobantes</span>
            <span className="text-base font-black font-mono">{comprobantesCombustibleCliente.length}</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-80">
            <input
              type="text"
              placeholder="Buscar por cliente, vehículo, placas o estación..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs font-medium focus:outline-none focus:border-zinc-900 focus:bg-white"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
          </div>
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl w-full md:w-auto overflow-x-auto">
          {['todos', 'enviado', 'revisado', 'aprobado', 'rechazado'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterState(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all cursor-pointer whitespace-nowrap ${
                filterState === st
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Grid List of Client Fuel Tickets */}
      {filteredRecords.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200/80 p-12 text-center space-y-3">
          <Fuel className="w-12 h-12 text-zinc-300 mx-auto" />
          <h3 className="text-sm font-semibold text-zinc-800">No se encontraron comprobantes de combustible</h3>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto">
            No hay registros enviados por clientes que coincidan con el filtro seleccionado.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRecords.map((rec) => (
            <div
              key={rec.id}
              className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col"
            >
              {/* Card Header */}
              <div className="p-4 border-b border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#024182] text-white flex items-center justify-center font-bold text-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-zinc-900 truncate max-w-[170px]">
                      {rec.clienteNombre}
                    </h3>
                    <span className="text-[10px] text-zinc-400 font-mono block">{rec.fecha}</span>
                  </div>
                </div>
                {getStatusBadge(rec.estado)}
              </div>

              {/* Photo Evidence Box with Zoom Trigger */}
              <div className="p-4 bg-zinc-900/5 border-b border-zinc-100 flex flex-col items-center justify-center relative min-h-[180px]">
                {rec.evidenciaUrl ? (
                  <div className="relative group w-full flex flex-col items-center">
                    <img
                      src={rec.evidenciaUrl}
                      alt={`Ticket ${rec.clienteNombre}`}
                      className="max-h-[160px] w-auto object-contain rounded-xl border border-zinc-200 shadow-xs cursor-pointer group-hover:opacity-90 transition-opacity"
                      onClick={() =>
                        setPreviewEvidencia({
                          url: rec.evidenciaUrl,
                          type: 'image',
                          title: `Ticket Combustible - Cliente: ${rec.clienteNombre} ($${rec.importe.toFixed(2)})`
                        })
                      }
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setPreviewEvidencia({
                          url: rec.evidenciaUrl,
                          type: 'image',
                          title: `Ticket Combustible - Cliente: ${rec.clienteNombre} ($${rec.importe.toFixed(2)})`
                        })
                      }
                      className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#024182] hover:bg-[#013266] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ampliar Imagen / Zoom Ticket</span>
                    </button>
                  </div>
                ) : (
                  <div className="text-center p-4">
                    <AlertCircle className="w-8 h-8 text-amber-500 mx-auto mb-1" />
                    <span className="text-xs font-medium text-zinc-500">Sin foto de ticket adjunta</span>
                  </div>
                )}
              </div>

              {/* Ticket Details */}
              <div className="p-4 space-y-3 flex-1 text-xs text-zinc-700">
                <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 font-mono">
                  <div>
                    <span className="text-[10px] text-zinc-400 block font-sans">Vehículo:</span>
                    <strong className="text-zinc-900 text-[11px] block truncate">{rec.vehiculo}</strong>
                    {rec.placas && <span className="text-[10px] text-zinc-500">{rec.placas}</span>}
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-zinc-400 block font-sans">Importe Carga:</span>
                    <strong className="text-sm font-black text-[#024182] block">
                      ${rec.importe.toFixed(2)}
                    </strong>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Tipo Combustible:</span>
                    <span className="font-semibold text-zinc-800">{rec.tipoCombustible} ({rec.litros ? `${rec.litros} L` : 'N/A'})</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500">Gasolinera:</span>
                    <span className="font-medium text-zinc-800 truncate max-w-[150px]">{rec.estacion || 'No especificada'}</span>
                  </div>
                  {rec.observaciones && (
                    <div className="pt-2 border-t border-zinc-100 text-[11px] text-zinc-600 italic">
                      "{rec.observaciones}"
                    </div>
                  )}
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between gap-2">
                <span className="text-[10px] text-zinc-400 font-mono">ID: {rec.id}</span>
                <div className="flex items-center gap-1.5">
                  {rec.estado !== 'aprobado' && (
                    <button
                      type="button"
                      onClick={() => updateComprobanteCombustibleClienteEstado(rec.id, 'aprobado')}
                      className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-[11px] font-semibold hover:bg-emerald-700 transition-colors cursor-pointer"
                    >
                      Aprobar
                    </button>
                  )}
                  {rec.estado !== 'revisado' && (
                    <button
                      type="button"
                      onClick={() => updateComprobanteCombustibleClienteEstado(rec.id, 'revisado')}
                      className="px-2.5 py-1 bg-blue-600 text-white rounded-lg text-[11px] font-semibold hover:bg-blue-700 transition-colors cursor-pointer"
                    >
                      Revisar
                    </button>
                  )}
                  {rec.estado !== 'rechazado' && (
                    <button
                      type="button"
                      onClick={() => updateComprobanteCombustibleClienteEstado(rec.id, 'rechazado')}
                      className="px-2.5 py-1 bg-rose-600 text-white rounded-lg text-[11px] font-semibold hover:bg-rose-700 transition-colors cursor-pointer"
                    >
                      Rechazar
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
