import React, { useState } from 'react';
import {
  ShieldAlert,
  Eye,
  Edit3,
  Trash2,
  Power,
  Search,
  Filter,
  Receipt,
  Fuel,
  FileBadge,
  TrendingUp,
  Building2,
  Tags,
  Store,
  Users,
  CheckCircle2,
  XCircle,
  X,
  Check,
  AlertTriangle,
  FileText,
  Calendar,
  DollarSign,
  User,
  HelpCircle,
  Clock
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  Gasto,
  RegistroGasolina,
  ComprobanteGastos,
  ComprobanteCombustibleCliente,
  Abono,
  CajaChica,
  Giro,
  Proveedor,
  Empleado,
  Usuario
} from '../types';
import { EvidenceGrid } from './EvidenceGrid';

type EntityTab =
  | 'gastos'
  | 'gasolina'
  | 'comprobantes'
  | 'combustible_cliente'
  | 'abonos'
  | 'cajas'
  | 'giros'
  | 'proveedores'
  | 'empleados'
  | 'usuarios';

export const AdminControlRegistros: React.FC = () => {
  const {
    gastos,
    updateGasto,
    deleteGasto,
    toggleActivoGasto,

    gasolinaRecords,
    updateRegistroGasolina,
    deleteRegistroGasolina,
    toggleActivoRegistroGasolina,

    comprobantesGastos,
    updateComprobanteGastos,
    deleteComprobanteGastos,
    toggleActivoComprobanteGastos,

    comprobantesCombustibleCliente,
    updateComprobanteCombustibleCliente,
    deleteComprobanteCombustibleCliente,
    toggleActivoComprobanteCombustibleCliente,

    abonos,
    updateAbono,
    deleteAbono,
    toggleActivoAbono,

    cajas,
    updateCaja,
    deleteCaja,
    toggleActivoCaja,

    giros,
    updateGiro,
    deleteGiro,
    toggleActivoGiro,

    proveedores,
    updateProveedor,
    deleteProveedor,
    toggleActivoProveedor,

    empleados,
    updateEmpleado,
    deleteEmpleado,
    toggleActivoEmpleado,

    usuarios,
    updateUsuario,
    deleteUsuario,
    toggleActivoUsuario,

    setPdfModalData,
    setPdfGasolinaModalData,
    setPdfComprobanteModalData,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<EntityTab>('gastos');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCajaId, setFilterCajaId] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'activos' | 'suspendidos'>('all');

  // Modals state
  const [viewingRecord, setViewingRecord] = useState<{ type: EntityTab; data: any } | null>(null);
  const [editingRecord, setEditingRecord] = useState<{ type: EntityTab; data: any } | null>(null);
  const [deletingRecord, setDeletingRecord] = useState<{ type: EntityTab; data: any; label: string } | null>(null);

  // Edit form buffer
  const [editFormData, setEditFormData] = useState<any>({});

  // Helper to open edit modal
  const handleStartEdit = (type: EntityTab, item: any) => {
    setEditingRecord({ type, data: item });
    setEditFormData({ ...item });
  };

  // Helper to save edit
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRecord) return;

    const { type } = editingRecord;
    switch (type) {
      case 'gastos':
        updateGasto({
          ...editFormData,
          importe: Number(editFormData.importe) || 0
        });
        break;
      case 'gasolina':
        updateRegistroGasolina({
          ...editFormData,
          km: Number(editFormData.km) || 0,
          importe: Number(editFormData.importe) || 0
        });
        break;
      case 'comprobantes':
        updateComprobanteGastos({
          ...editFormData,
          importe: Number(editFormData.importe) || 0
        });
        break;
      case 'combustible_cliente':
        updateComprobanteCombustibleCliente({
          ...editFormData,
          importe: Number(editFormData.importe) || 0,
          litros: editFormData.litros ? Number(editFormData.litros) : undefined
        });
        break;
      case 'abonos':
        updateAbono({
          ...editFormData,
          monto: Number(editFormData.monto) || 0
        });
        break;
      case 'cajas':
        updateCaja({
          ...editFormData,
          fondoBase: Number(editFormData.fondoBase) || 0
        });
        break;
      case 'giros':
        updateGiro({
          ...editFormData
        });
        break;
      case 'proveedores':
        updateProveedor({
          ...editFormData
        });
        break;
      case 'empleados':
        updateEmpleado({
          ...editFormData
        });
        break;
      case 'usuarios':
        updateUsuario({
          ...editFormData
        });
        break;
    }
    setEditingRecord(null);
  };

  // Helper to execute delete
  const handleConfirmDelete = () => {
    if (!deletingRecord) return;
    const { type, data } = deletingRecord;

    switch (type) {
      case 'gastos':
        deleteGasto(data.id);
        break;
      case 'gasolina':
        deleteRegistroGasolina(data.id);
        break;
      case 'comprobantes':
        deleteComprobanteGastos(data.id);
        break;
      case 'combustible_cliente':
        deleteComprobanteCombustibleCliente(data.id);
        break;
      case 'abonos':
        deleteAbono(data.id);
        break;
      case 'cajas':
        deleteCaja(data.id);
        break;
      case 'giros':
        deleteGiro(data.id);
        break;
      case 'proveedores':
        deleteProveedor(data.id);
        break;
      case 'empleados':
        deleteEmpleado(data.id);
        break;
      case 'usuarios':
        deleteUsuario(data.id);
        break;
    }
    setDeletingRecord(null);
  };

  // Generic filter logic
  const matchesStatusFilter = (activo?: boolean) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'activos') return activo !== false;
    if (filterStatus === 'suspendidos') return activo === false;
    return true;
  };

  const matchesCajaFilter = (cajaId?: string) => {
    if (filterCajaId === 'all') return true;
    return cajaId === filterCajaId;
  };

  const getCajaName = (cajaId?: string) => {
    if (!cajaId) return 'General';
    const c = cajas.find(c => c.id === cajaId);
    return c?.nombre || cajaId;
  };

  // Calculate high-level metrics
  const totalGastosCount = gastos.length;
  const gastosSuspendidos = gastos.filter(g => g.activo === false).length;
  const totalGasolinaCount = gasolinaRecords.length;
  const gasolinaSuspendidos = gasolinaRecords.filter(g => g.activo === false).length;
  const totalComprobantesCount = comprobantesGastos.length;
  const comprobantesSuspendidos = comprobantesGastos.filter(c => c.activo === false).length;
  const totalAbonosCount = abonos.length;
  const abonosSuspendidos = abonos.filter(a => a.activo === false).length;

  const totalRegistrosGlobal =
    totalGastosCount +
    totalGasolinaCount +
    totalComprobantesCount +
    comprobantesCombustibleCliente.length +
    totalAbonosCount +
    cajas.length +
    giros.length +
    proveedores.length +
    empleados.length +
    usuarios.length;

  const totalSuspendidosGlobal =
    gastosSuspendidos +
    gasolinaSuspendidos +
    comprobantesSuspendidos +
    comprobantesCombustibleCliente.filter(c => c.activo === false).length +
    abonosSuspendidos +
    cajas.filter(c => c.activo === false).length +
    giros.filter(g => g.activo === false).length +
    proveedores.filter(p => p.activo === false).length +
    empleados.filter(e => e.activo === false).length +
    usuarios.filter(u => u.activo === false).length;

  // Filtered lists for each tab
  const filteredGastos = gastos.filter(g => {
    const matchTerm =
      !searchTerm ||
      g.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.proveedor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.nroOrden.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.solicitante.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(g.activo) && matchesCajaFilter(g.cajaId);
  });

  const filteredGasolina = gasolinaRecords.filter(g => {
    const matchTerm =
      !searchTerm ||
      g.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.descripcionUso.toLowerCase().includes(searchTerm.toLowerCase()) ||
      g.registradoPor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(g.activo) && matchesCajaFilter(g.cajaId);
  });

  const filteredComprobantes = comprobantesGastos.filter(c => {
    const matchTerm =
      !searchTerm ||
      c.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.solicitadoA && c.solicitadoA.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.autorizadoPor && c.autorizadoPor.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.recibidoPor && c.recibidoPor.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTerm && matchesStatusFilter(c.activo) && matchesCajaFilter(c.cajaId);
  });

  const filteredCombustibleCliente = comprobantesCombustibleCliente.filter(c => {
    const matchTerm =
      !searchTerm ||
      c.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.vehiculo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.estacion && c.estacion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTerm && matchesStatusFilter(c.activo) && matchesCajaFilter(c.cajaId);
  });

  const filteredAbonos = abonos.filter(a => {
    const matchTerm =
      !searchTerm ||
      a.concepto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.registradoPor.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(a.activo) && matchesCajaFilter(a.cajaId);
  });

  const filteredCajas = cajas.filter(c => {
    const matchTerm =
      !searchTerm ||
      c.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.responsable.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (c.ubicacion && c.ubicacion.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTerm && matchesStatusFilter(c.activo);
  });

  const filteredGiros = giros.filter(g => {
    const matchTerm =
      !searchTerm ||
      g.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (g.codigo && g.codigo.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchTerm && matchesStatusFilter(g.activo);
  });

  const filteredProveedores = proveedores.filter(p => {
    const matchTerm =
      !searchTerm ||
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.rfc.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(p.activo);
  });

  const filteredEmpleados = empleados.filter(e => {
    const matchTerm =
      !searchTerm ||
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.puesto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.departamento.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(e.activo);
  });

  const filteredUsuarios = usuarios.filter(u => {
    const matchTerm =
      !searchTerm ||
      u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchTerm.toLowerCase())) ||
      u.rol.toLowerCase().includes(searchTerm.toLowerCase());
    return matchTerm && matchesStatusFilter(u.activo);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* HEADER BANNER FOR SUPERADMIN */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 text-white rounded-2xl p-5 sm:p-6 shadow-lg border border-zinc-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center font-bold shadow-inner">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  Control Maestro de Registros
                </h1>
                <span className="bg-amber-500 text-zinc-950 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full tracking-wider">
                  Superadmin Total
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Facultad exclusiva para <strong className="text-white">Ver</strong>,{' '}
                <strong className="text-white">Editar</strong>,{' '}
                <strong className="text-white">Suspender / Activar</strong> y{' '}
                <strong className="text-white">Borrar</strong> cualquier registro del sistema.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="bg-zinc-800/90 border border-zinc-700/80 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-zinc-400 block tracking-wider">
                Total Registros
              </span>
              <span className="text-base font-extrabold text-white font-mono">
                {totalRegistrosGlobal}
              </span>
            </div>
            <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-emerald-400 block tracking-wider">
                Activos
              </span>
              <span className="text-base font-extrabold text-emerald-300 font-mono">
                {totalRegistrosGlobal - totalSuspendidosGlobal}
              </span>
            </div>
            <div className="bg-amber-950/40 border border-amber-500/30 rounded-xl px-3.5 py-2 text-center">
              <span className="text-[10px] uppercase font-bold text-amber-400 block tracking-wider">
                Suspendidos
              </span>
              <span className="text-base font-extrabold text-amber-300 font-mono">
                {totalSuspendidosGlobal}
              </span>
            </div>
          </div>
        </div>

        {/* Action explanation pill */}
        <div className="bg-zinc-800/60 rounded-xl p-3 border border-zinc-700/60 flex flex-wrap items-center gap-4 text-xs text-zinc-300">
          <span className="text-amber-400 font-semibold flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Acciones Habilitadas:
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Eye className="w-3.5 h-3.5 text-blue-400" />
            <strong>Ver</strong> detalle y comprobantes
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
            <strong>Editar</strong> importes, conceptos y datos
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Power className="w-3.5 h-3.5 text-amber-400" />
            <strong>Suspender / Activar</strong> (bloquea sin destruir)
          </span>
          <span className="flex items-center gap-1 text-zinc-300">
            <Trash2 className="w-3.5 h-3.5 text-rose-400" />
            <strong>Borrar</strong> registro permanentemente con auditoría
          </span>
        </div>
      </div>

      {/* MODULE / ENTITY TABS SELECTOR */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-xs overflow-x-auto">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            onClick={() => setActiveTab('gastos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'gastos'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Gastos ({gastos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('gasolina')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'gasolina'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Gasolina ({gasolinaRecords.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('comprobantes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'comprobantes'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <FileBadge className="w-4 h-4" />
            <span>Comprobantes Gastos ({comprobantesGastos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('combustible_cliente')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'combustible_cliente'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Fuel className="w-4 h-4" />
            <span>Combustible Clientes ({comprobantesCombustibleCliente.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('abonos')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'abonos'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Inyecciones / Abonos ({abonos.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('cajas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'cajas'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>Multi-Cajas ({cajas.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('giros')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'giros'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Tags className="w-4 h-4" />
            <span>Giros ({giros.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('proveedores')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'proveedores'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Store className="w-4 h-4" />
            <span>Proveedores ({proveedores.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empleados')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'empleados'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Personal ({empleados.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('usuarios')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'usuarios'
                ? 'bg-zinc-900 text-white shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Usuarios ({usuarios.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTERS BAR */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            placeholder="Buscar por concepto, proveedor, folio, solicitante..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2.5 top-2.5 text-zinc-400 hover:text-zinc-700"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto flex-wrap">
          {/* Caja Filter (if entity has cajaId) */}
          {['gastos', 'gasolina', 'comprobantes', 'combustible_cliente', 'abonos'].includes(activeTab) && (
            <select
              value={filterCajaId}
              onChange={(e) => setFilterCajaId(e.target.value)}
              className="bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-700 focus:outline-none cursor-pointer"
            >
              <option value="all">Todas las Cajas</option>
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          )}

          {/* Status Filter */}
          <div className="flex items-center bg-zinc-100 p-1 rounded-xl">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterStatus === 'all'
                  ? 'bg-white text-zinc-900 shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterStatus('activos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterStatus === 'activos'
                  ? 'bg-emerald-600 text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Activos
            </button>
            <button
              onClick={() => setFilterStatus('suspendidos')}
              className={`px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all ${
                filterStatus === 'suspendidos'
                  ? 'bg-amber-600 text-white shadow-2xs font-semibold'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              Suspendidos
            </button>
          </div>
        </div>
      </div>

      {/* RECORDS LIST CONTENT BY TAB */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        {/* TAB 1: GASTOS */}
        {activeTab === 'gastos' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Registros de Gastos de Caja Chica ({filteredGastos.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Control total de egresos registrados en todas las cajas chicas
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 bg-zinc-200/70 px-2.5 py-1 rounded-full">
                Suma: ${filteredGastos.reduce((acc, g) => acc + g.importe, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredGastos.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay registros de gastos que coincidan con los filtros aplicados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredGastos.map((gasto) => {
                  const isSuspended = gasto.activo === false;
                  return (
                    <div
                      key={gasto.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                            {gasto.nroOrden}
                          </span>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {getCajaName(gasto.cajaId)}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVO
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{gasto.fecha}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-zinc-900">{gasto.concepto}</strong>
                          <span className="text-zinc-400">•</span>
                          <span className="text-xs text-zinc-600">{gasto.proveedor}</span>
                        </div>

                        <p className="text-[11px] text-zinc-500">
                          Solicitó: <strong>{gasto.solicitante}</strong> • Facturado:{' '}
                          <strong>{gasto.facturado ? 'Sí (Factura)' : 'No (Nota/Ticket)'}</strong>
                          {gasto.reembolsoId && (
                            <span className="ml-2 text-indigo-600 font-mono text-[10px]">
                              [Reembolso: {gasto.reembolsoId}]
                            </span>
                          )}
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-900 font-mono">
                          ${gasto.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'gastos', data: gasto })}
                            title="Ver Detalle Completo"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('gastos', gasto)}
                            title="Editar Registro de Gasto"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoGasto(gasto.id)}
                            title={isSuspended ? 'Reactivar Registro' : 'Suspender Registro'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'gastos',
                                data: gasto,
                                label: `Gasto ${gasto.nroOrden} (${gasto.concepto} - $${gasto.importe})`
                              })
                            }
                            title="Eliminar Registro Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: GASOLINA */}
        {activeTab === 'gasolina' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Control de Cargas de Combustible ({filteredGasolina.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Supervisión y control de registros de gasolina en flotilla y cajas
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 bg-zinc-200/70 px-2.5 py-1 rounded-full">
                Suma: ${filteredGasolina.reduce((acc, g) => acc + g.importe, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredGasolina.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay registros de combustible que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredGasolina.map((rec) => {
                  const isSuspended = rec.activo === false;
                  return (
                    <div
                      key={rec.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-xs text-zinc-900">{rec.vehiculo}</span>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {getCajaName(rec.cajaId)}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVO
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{rec.fecha}</span>
                        </div>

                        <p className="text-xs text-zinc-600">
                          {rec.descripcionUso} • Odómetro: <strong>{rec.km} KM</strong> • Pago:{' '}
                          <strong>{rec.formaPago}</strong>
                        </p>

                        <div className="text-[11px] text-zinc-500">
                          Tanque: {rec.nivelAntes} → {rec.nivelDespues} • Registró:{' '}
                          <strong>{rec.registradoPor}</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-900 font-mono">
                          ${rec.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'gasolina', data: rec })}
                            title="Ver Detalle y Evidencias"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('gasolina', rec)}
                            title="Editar Registro de Gasolina"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoRegistroGasolina(rec.id)}
                            title={isSuspended ? 'Reactivar Registro' : 'Suspender Registro'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'gasolina',
                                data: rec,
                                label: `Carga Gasolina ${rec.vehiculo} (${rec.fecha} - $${rec.importe})`
                              })
                            }
                            title="Eliminar Registro Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: COMPROBANTES DE GASTOS */}
        {activeTab === 'comprobantes' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Comprobantes y Facturas de Gastos ({filteredComprobantes.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Tickets, notas de remisión y facturas oficiales de comprobación
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 bg-zinc-200/70 px-2.5 py-1 rounded-full">
                Total: ${filteredComprobantes.reduce((acc, c) => acc + (c.importe || 0), 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredComprobantes.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay comprobantes de gastos registrados con esos criterios.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredComprobantes.map((comp) => {
                  const isSuspended = comp.activo === false;
                  return (
                    <div
                      key={comp.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded">
                            Folio: {comp.folio}
                          </span>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {getCajaName(comp.cajaId)}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVO
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{comp.fecha}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-zinc-900">{comp.concepto}</strong>
                          <span className="text-zinc-400">•</span>
                          <span className="text-xs text-zinc-600">Solicitado a: {comp.solicitadoA || 'N/A'}</span>
                        </div>

                        <p className="text-[11px] text-zinc-500">
                          Autorizado por: <strong>{comp.autorizadoPor || 'N/A'}</strong> • Recibido por: <strong>{comp.recibidoPor || 'N/A'}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-900 font-mono">
                          ${(comp.importe || 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'comprobantes', data: comp })}
                            title="Ver Detalle y Comprobante"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('comprobantes', comp)}
                            title="Editar Comprobante"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoComprobanteGastos(comp.id)}
                            title={isSuspended ? 'Reactivar Comprobante' : 'Suspender Comprobante'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'comprobantes',
                                data: comp,
                                label: `Comprobante ${comp.folio} (${comp.concepto} - $${comp.importe || 0})`
                              })
                            }
                            title="Eliminar Comprobante Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: COMBUSTIBLE CLIENTE */}
        {activeTab === 'combustible_cliente' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Comprobantes de Combustible Enviados por Clientes ({filteredCombustibleCliente.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Tickets y cargas cargadas directamente desde el portal de cliente
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-zinc-800 bg-zinc-200/70 px-2.5 py-1 rounded-full">
                Suma: ${filteredCombustibleCliente.reduce((acc, c) => acc + c.importe, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredCombustibleCliente.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay comprobantes de clientes registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredCombustibleCliente.map((rec) => {
                  const isSuspended = rec.activo === false;
                  return (
                    <div
                      key={rec.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-zinc-900">{rec.clienteNombre}</strong>
                          <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                            {rec.vehiculo} {rec.placas && `(${rec.placas})`}
                          </span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                            Estado: {rec.estado}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVO
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{rec.fecha}</span>
                        </div>

                        <p className="text-xs text-zinc-600">
                          {rec.tipoCombustible} • {rec.litros ? `${rec.litros} L` : 'Litros no esp.'} • Estación:{' '}
                          {rec.estacion || 'No esp.'}
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-900 font-mono">
                          ${rec.importe.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'combustible_cliente', data: rec })}
                            title="Ver Detalle y Ticket"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('combustible_cliente', rec)}
                            title="Editar Comprobante Cliente"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoComprobanteCombustibleCliente(rec.id)}
                            title={isSuspended ? 'Reactivar Registro' : 'Suspender Registro'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'combustible_cliente',
                                data: rec,
                                label: `Comprobante de ${rec.clienteNombre} (${rec.vehiculo} - $${rec.importe})`
                              })
                            }
                            title="Eliminar Comprobante Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: ABONOS / INYECCIONES */}
        {activeTab === 'abonos' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Inyecciones y Abonos de Fondo ({filteredAbonos.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Depósitos y recargas financieras a las cajas chicas
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                Suma: ${filteredAbonos.reduce((acc, a) => acc + a.monto, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>

            {filteredAbonos.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay abonos de fondo registrados con esos filtros.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredAbonos.map((abn) => {
                  const isSuspended = abn.activo === false;
                  return (
                    <div
                      key={abn.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-zinc-900">{abn.concepto}</strong>
                          <span className="text-[10px] font-semibold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                            {getCajaName(abn.cajaId)}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVO
                            </span>
                          )}
                          <span className="text-[10px] text-zinc-400 font-mono">{abn.fecha}</span>
                        </div>

                        <p className="text-[11px] text-zinc-500">
                          Registrado por: <strong>{abn.registradoPor}</strong>
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-emerald-600 font-mono">
                          +${abn.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'abonos', data: abn })}
                            title="Ver Detalle"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('abonos', abn)}
                            title="Editar Abono"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoAbono(abn.id)}
                            title={isSuspended ? 'Reactivar Abono' : 'Suspender Abono'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'abonos',
                                data: abn,
                                label: `Abono de $${abn.monto} a ${getCajaName(abn.cajaId)} (${abn.fecha})`
                              })
                            }
                            title="Eliminar Abono Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 6: CAJAS */}
        {activeTab === 'cajas' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Cajas Chicas Registradas ({filteredCajas.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Configuración de fondos, responsables y estados operativos
                </p>
              </div>
            </div>

            {filteredCajas.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay cajas que coincidan con la búsqueda.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredCajas.map((caja) => {
                  const isSuspended = caja.activo === false;
                  return (
                    <div
                      key={caja.id}
                      className={`p-4 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <strong className="text-xs text-zinc-900">{caja.nombre}</strong>
                          <span className="text-[10px] font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded">
                            {caja.id}
                          </span>
                          <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                            {caja.tipoFondo === 'sin_fondo' ? 'Flujo Semanal' : 'Fondo Fijo'}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300 flex items-center gap-1">
                              <Power className="w-3 h-3 text-amber-600" />
                              SUSPENDIDA
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              ACTIVA
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-zinc-600">
                          Responsable: <strong>{caja.responsable}</strong> • Ubicación:{' '}
                          {caja.ubicacion || 'Sin asignar'} • Estado: {caja.estado}
                        </p>
                      </div>

                      <div className="flex items-center justify-between lg:justify-end gap-3 shrink-0">
                        <span className="text-sm font-black text-zinc-900 font-mono">
                          Fondo: ${caja.fondoBase.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </span>

                        <div className="flex items-center gap-1">
                          {/* VER */}
                          <button
                            onClick={() => setViewingRecord({ type: 'cajas', data: caja })}
                            title="Ver Detalle"
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* EDITAR */}
                          <button
                            onClick={() => handleStartEdit('cajas', caja)}
                            title="Editar Caja"
                            className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* SUSPENDER / ACTIVAR */}
                          <button
                            onClick={() => toggleActivoCaja(caja.id)}
                            title={isSuspended ? 'Reactivar Caja' : 'Suspender Caja'}
                            className={`p-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold ${
                              isSuspended
                                ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                                : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                            }`}
                          >
                            <Power className="w-4 h-4" />
                            <span className="hidden sm:inline">
                              {isSuspended ? 'Activar' : 'Suspender'}
                            </span>
                          </button>

                          {/* BORRAR */}
                          <button
                            onClick={() =>
                              setDeletingRecord({
                                type: 'cajas',
                                data: caja,
                                label: `Caja ${caja.nombre} (ID: ${caja.id})`
                              })
                            }
                            title="Eliminar Caja Permanentemente"
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 7: GIROS */}
        {activeTab === 'giros' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Catálogo de Giros y Centros de Costo ({filteredGiros.length})
              </h3>
            </div>

            {filteredGiros.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay giros registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredGiros.map((giro) => {
                  const isSuspended = giro.activo === false;
                  return (
                    <div
                      key={giro.id}
                      className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: giro.color || '#3b82f6' }}
                          />
                          <strong className="text-xs text-zinc-900">{giro.nombre}</strong>
                          <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                            {giro.codigo}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              ACTIVO
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingRecord({ type: 'giros', data: giro })}
                          title="Ver Detalle"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit('giros', giro)}
                          title="Editar Giro"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivoGiro(giro.id)}
                          title={isSuspended ? 'Reactivar Giro' : 'Suspender Giro'}
                          className={`p-2 rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            isSuspended
                              ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                              : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {isSuspended ? 'Activar' : 'Suspender'}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setDeletingRecord({
                              type: 'giros',
                              data: giro,
                              label: `Giro ${giro.nombre}`
                            })
                          }
                          title="Eliminar Giro"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: PROVEEDORES */}
        {activeTab === 'proveedores' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Directorio Homologado de Proveedores ({filteredProveedores.length})
              </h3>
            </div>

            {filteredProveedores.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay proveedores registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredProveedores.map((prov) => {
                  const isSuspended = prov.activo === false;
                  return (
                    <div
                      key={prov.id}
                      className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-zinc-900">{prov.nombre}</strong>
                          <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-600">
                            RFC: {prov.rfc}
                          </span>
                          <span className="text-[10px] font-semibold bg-purple-50 text-purple-700 px-2 py-0.5 rounded-full">
                            {prov.categoria}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              ACTIVO
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingRecord({ type: 'proveedores', data: prov })}
                          title="Ver Detalle"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit('proveedores', prov)}
                          title="Editar Proveedor"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivoProveedor(prov.id)}
                          title={isSuspended ? 'Reactivar Proveedor' : 'Suspender Proveedor'}
                          className={`p-2 rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            isSuspended
                              ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                              : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {isSuspended ? 'Activar' : 'Suspender'}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setDeletingRecord({
                              type: 'proveedores',
                              data: prov,
                              label: `Proveedor ${prov.nombre} (${prov.rfc})`
                            })
                          }
                          title="Eliminar Proveedor"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 9: EMPLEADOS */}
        {activeTab === 'empleados' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Directorio de Personal y Solicitantes ({filteredEmpleados.length})
              </h3>
            </div>

            {filteredEmpleados.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay empleados registrados.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredEmpleados.map((emp) => {
                  const isSuspended = emp.activo === false;
                  return (
                    <div
                      key={emp.id}
                      className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-zinc-900">{emp.nombre}</strong>
                          <span className="text-[10px] text-zinc-500">
                            {emp.puesto} • {emp.departamento}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              ACTIVO
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingRecord({ type: 'empleados', data: emp })}
                          title="Ver Detalle"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit('empleados', emp)}
                          title="Editar Personal"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivoEmpleado(emp.id)}
                          title={isSuspended ? 'Reactivar Personal' : 'Suspender Personal'}
                          className={`p-2 rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            isSuspended
                              ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                              : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {isSuspended ? 'Activar' : 'Suspender'}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setDeletingRecord({
                              type: 'empleados',
                              data: emp,
                              label: `Personal ${emp.nombre} (${emp.puesto})`
                            })
                          }
                          title="Eliminar Personal"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 10: USUARIOS */}
        {activeTab === 'usuarios' && (
          <div>
            <div className="p-4 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-zinc-900">
                Usuarios y Credenciales de Acceso al Sistema ({filteredUsuarios.length})
              </h3>
            </div>

            {filteredUsuarios.length === 0 ? (
              <div className="p-12 text-center text-zinc-400 italic text-xs">
                No hay usuarios registrados con esos filtros.
              </div>
            ) : (
              <div className="divide-y divide-zinc-100">
                {filteredUsuarios.map((usr) => {
                  const isSuspended = usr.activo === false;
                  return (
                    <div
                      key={usr.id}
                      className={`p-4 transition-colors flex items-center justify-between gap-4 ${
                        isSuspended ? 'bg-amber-50/40 opacity-80' : 'hover:bg-zinc-50/80'
                      }`}
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <strong className="text-xs text-zinc-900">{usr.nombre}</strong>
                          <span className="text-[10px] font-mono bg-zinc-100 px-2 py-0.5 rounded text-zinc-700">
                            Rol: <strong>{usr.rol}</strong>
                          </span>
                          <span className="text-[10px] text-zinc-500 font-mono">
                            {usr.email}
                          </span>
                          {isSuspended ? (
                            <span className="text-[10px] font-extrabold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-300">
                              SUSPENDIDO
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                              ACTIVO
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setViewingRecord({ type: 'usuarios', data: usr })}
                          title="Ver Detalle"
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl cursor-pointer"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleStartEdit('usuarios', usr)}
                          title="Editar Usuario"
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl cursor-pointer"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActivoUsuario(usr.id)}
                          title={isSuspended ? 'Reactivar Usuario' : 'Suspender Acceso'}
                          className={`p-2 rounded-xl cursor-pointer flex items-center gap-1 text-xs font-bold ${
                            isSuspended
                              ? 'text-emerald-700 bg-emerald-100 hover:bg-emerald-200'
                              : 'text-amber-700 bg-amber-100 hover:bg-amber-200'
                          }`}
                        >
                          <Power className="w-4 h-4" />
                          <span className="hidden sm:inline">
                            {isSuspended ? 'Activar' : 'Suspender'}
                          </span>
                        </button>
                        <button
                          onClick={() =>
                            setDeletingRecord({
                              type: 'usuarios',
                              data: usr,
                              label: `Usuario ${usr.nombre} (${usr.email})`
                            })
                          }
                          title="Eliminar Usuario"
                          className="p-2 text-rose-600 hover:bg-rose-50 rounded-xl cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* MODAL 1: VER DETALLE DEL REGISTRO */}
      {viewingRecord && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-zinc-200 p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
                  <Eye className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Inspección Detallada de Registro
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                    Módulo: {viewingRecord.type}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingRecord(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Structured view of fields */}
            <div className="space-y-3 text-xs max-h-[60vh] overflow-y-auto pr-1">
              <div className="grid grid-cols-2 gap-2 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">ID / Folio:</span>
                  <span className="font-mono font-bold text-zinc-900">
                    {viewingRecord.data.nroOrden ||
                      viewingRecord.data.folio ||
                      viewingRecord.data.id}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-400 block font-semibold">Estado en Sistema:</span>
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      viewingRecord.data.activo !== false
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {viewingRecord.data.activo !== false ? '✓ ACTIVO' : '⚠ SUSPENDIDO'}
                  </span>
                </div>
              </div>

              {/* Dynamic properties representation */}
              <div className="space-y-2">
                {Object.entries(viewingRecord.data).map(([key, value]) => {
                  if (key === 'evidenciaUrl' || key === 'evidenciaPdfUrl') return null;
                  return (
                    <div
                      key={key}
                      className="flex items-center justify-between py-1.5 border-b border-zinc-100 text-xs"
                    >
                      <span className="text-zinc-500 font-mono capitalize">{key}:</span>
                      <span className="font-semibold text-zinc-900 text-right max-w-[280px] truncate font-mono">
                        {typeof value === 'boolean'
                          ? value
                            ? 'Sí / Activo'
                            : 'No / Inactivo'
                          : typeof value === 'number' &&
                            (key.toLowerCase().includes('importe') ||
                              key.toLowerCase().includes('monto') ||
                              key.toLowerCase().includes('total') ||
                              key.toLowerCase().includes('subtotal'))
                          ? `$${value.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`
                          : String(value ?? '—')}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Evidence viewer if attached */}
              {viewingRecord.data.evidenciaUrl && (
                <div className="pt-2 border-t border-zinc-100">
                  <span className="text-xs font-bold text-zinc-800 block mb-2">
                    Comprobante / Evidencia Digital Adjunta:
                  </span>
                  <EvidenceGrid
                    evidenciaUrl={viewingRecord.data.evidenciaUrl}
                    evidenciaNombre={`Evidencia_${viewingRecord.data.id}`}
                    evidenciaType={viewingRecord.data.evidenciaType || 'image'}
                    recordIdentifier={viewingRecord.data.id}
                    title="Evidencia de Respaldo"
                  />
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-100">
              <button
                onClick={() => {
                  const { type, data } = viewingRecord;
                  setViewingRecord(null);
                  handleStartEdit(type, data);
                }}
                className="px-3.5 py-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Registro</span>
              </button>
              <button
                onClick={() => setViewingRecord(null)}
                className="px-3.5 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR CUALQUIER REGISTRO */}
      {editingRecord && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-zinc-200 p-6 shadow-2xl space-y-4 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Edit3 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">
                    Modificar Registro (Superadmin)
                  </h3>
                  <span className="text-[10px] font-mono text-zinc-400">
                    {editingRecord.type} — ID: {editingRecord.data.id}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setEditingRecord(null)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-3 text-xs max-h-[65vh] overflow-y-auto pr-1">
              {/* Concepto / Nombre */}
              {editFormData.concepto !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Concepto:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.concepto || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, concepto: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.nombre !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Nombre:</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nombre || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, nombre: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Importe / Monto / Total / Fondo Base */}
              {editFormData.importe !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Importe ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.importe || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, importe: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.monto !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Monto ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.monto || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, monto: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.total !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Total ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.total || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, total: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.fondoBase !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Fondo Base ($):</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={editFormData.fondoBase || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fondoBase: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono font-bold focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Fecha */}
              {editFormData.fecha !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Fecha:</label>
                  <input
                    type="date"
                    required
                    value={editFormData.fecha || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, fecha: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Proveedor */}
              {editFormData.proveedor !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Proveedor:</label>
                  <input
                    type="text"
                    value={editFormData.proveedor || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, proveedor: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Solicitante / Registrado Por */}
              {editFormData.solicitante !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Solicitante:</label>
                  <input
                    type="text"
                    value={editFormData.solicitante || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, solicitante: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.responsable !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Responsable de Caja:</label>
                  <input
                    type="text"
                    value={editFormData.responsable || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, responsable: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Vehículo y Gasolina fields */}
              {editFormData.vehiculo !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Vehículo:</label>
                  <input
                    type="text"
                    value={editFormData.vehiculo || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, vehiculo: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.km !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Kilometraje (KM):</label>
                  <input
                    type="number"
                    value={editFormData.km || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, km: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {editFormData.descripcionUso !== undefined && (
                <div>
                  <label className="block text-zinc-600 font-bold mb-1">Descripción de Uso:</label>
                  <textarea
                    rows={2}
                    value={editFormData.descripcionUso || ''}
                    onChange={(e) =>
                      setEditFormData({ ...editFormData, descripcionUso: e.target.value })
                    }
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-2.5 text-xs focus:outline-none focus:border-zinc-900"
                  />
                </div>
              )}

              {/* Toggle Activo status inside edit */}
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200 flex items-center justify-between">
                <div>
                  <span className="font-bold text-zinc-900 block text-xs">Estado Operativo</span>
                  <span className="text-[10px] text-zinc-500">
                    Determina si este registro está activo o suspendido
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setEditFormData({
                      ...editFormData,
                      activo: editFormData.activo === false ? true : false
                    })
                  }
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer transition-colors flex items-center gap-1.5 ${
                    editFormData.activo !== false
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-zinc-950'
                  }`}
                >
                  <Power className="w-3.5 h-3.5" />
                  <span>{editFormData.activo !== false ? 'Activo' : 'Suspendido'}</span>
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-100">
                <button
                  type="button"
                  onClick={() => setEditingRecord(null)}
                  className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIRMACIÓN DE BORRADO SEGURO */}
      {deletingRecord && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">¿Eliminar Registro Definitivamente?</h3>
                <span className="text-[11px] text-zinc-500">Acción autorizada para Superadministrador</span>
              </div>
            </div>

            <div className="p-3 bg-rose-50 border border-rose-200/80 rounded-xl text-xs text-rose-900 space-y-1">
              <p className="font-semibold">Registro a eliminar:</p>
              <p className="font-mono text-[11px] bg-white/70 p-1.5 rounded border border-rose-200">
                {deletingRecord.label}
              </p>
              <p className="text-[10px] text-rose-700 pt-1">
                Esta acción eliminará el registro de la base de datos Supabase y del almacenamiento local. Si prefieres conservarlo sin que afecte operaciones, usa el botón <strong>Suspender</strong>.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeletingRecord(null)}
                className="px-4 py-2 bg-zinc-100 text-zinc-700 rounded-xl text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-colors flex items-center gap-1 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sí, Eliminar Registro</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
