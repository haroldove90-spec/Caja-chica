import React, { useState } from 'react';
import { Tags, Store, Users, Plus, Trash2, Edit3, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminCatalogos: React.FC = () => {
  const {
    giros,
    addGiro,
    updateGiro,
    deleteGiro,
    proveedores,
    addProveedor,
    updateProveedor,
    deleteProveedor,
    empleados,
    addEmpleado,
    updateEmpleado,
    deleteEmpleado
  } = useApp();

  const [activeTab, setActiveTab] = useState<'giros' | 'proveedores' | 'empleados'>('giros');

  // Giro Form State
  const [giroNombre, setGiroNombre] = useState('');
  const [giroCodigo, setGiroCodigo] = useState('');
  const [giroColor, setGiroColor] = useState('#3b82f6');

  // Proveedor Form State
  const [provNombre, setProvNombre] = useState('');
  const [provRfc, setProvRfc] = useState('');
  const [provCategoria, setProvCategoria] = useState('');

  // Empleado Form State
  const [empNombre, setEmpNombre] = useState('');
  const [empPuesto, setEmpPuesto] = useState('');
  const [empDepartamento, setEmpDepartamento] = useState('');

  const handleAddGiro = (e: React.FormEvent) => {
    e.preventDefault();
    if (!giroNombre.trim()) return;
    addGiro({
      nombre: giroNombre,
      codigo: giroCodigo || `G-${Math.floor(10 + Math.random() * 90)}`,
      color: giroColor,
      activo: true
    });
    setGiroNombre('');
    setGiroCodigo('');
  };

  const handleAddProveedor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!provNombre.trim()) return;
    addProveedor({
      nombre: provNombre,
      rfc: provRfc || 'XAXX010101000',
      categoria: provCategoria || 'General'
    });
    setProvNombre('');
    setProvRfc('');
    setProvCategoria('');
  };

  const handleAddEmpleado = (e: React.FormEvent) => {
    e.preventDefault();
    if (!empNombre.trim()) return;
    addEmpleado({
      nombre: empNombre,
      puesto: empPuesto || 'Operativo',
      departamento: empDepartamento || 'Operaciones',
      activo: true
    });
    setEmpNombre('');
    setEmpPuesto('');
    setEmpDepartamento('');
  };

  return (
    <div className="space-y-6">
      {/* TABS SELECTOR */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 p-2 shadow-xs flex items-center justify-around max-w-lg mx-auto">
        <button
          onClick={() => setActiveTab('giros')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'giros' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Tags className="w-4 h-4" />
          <span>Giros / Costos</span>
        </button>

        <button
          onClick={() => setActiveTab('proveedores')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'proveedores' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Store className="w-4 h-4" />
          <span>Proveedores</span>
        </button>

        <button
          onClick={() => setActiveTab('empleados')}
          className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-medium transition-all cursor-pointer ${
            activeTab === 'empleados' ? 'bg-zinc-900 text-white font-semibold' : 'text-zinc-600 hover:text-zinc-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Personal</span>
        </button>
      </div>

      {/* TAB 1: GIROS / CENTROS DE COSTOS */}
      {activeTab === 'giros' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs h-fit">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Crear Giro / Centro de Costos
            </h3>
            <form onSubmit={handleAddGiro} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Nombre del Giro *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Publikrea / Taller Proyecta / Coteyuc"
                  value={giroNombre}
                  onChange={(e) => setGiroNombre(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Código</label>
                  <input
                    type="text"
                    placeholder="Ej: PUB-01"
                    value={giroCodigo}
                    onChange={(e) => setGiroCodigo(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900"
                  />
                </div>
                <div>
                  <label className="block text-zinc-600 font-medium mb-1">Color Distintivo</label>
                  <input
                    type="color"
                    value={giroColor}
                    onChange={(e) => setGiroColor(e.target.value)}
                    className="w-full h-9 bg-zinc-50 border border-zinc-200 rounded-xl p-1 cursor-pointer"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Guardar Giro
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Catálogo de Giros Activos ({giros.length})
            </h3>
            <div className="space-y-2">
              {giros.map((g) => (
                <div key={g.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: g.color }}
                    />
                    <div>
                      <span className="font-semibold text-xs text-zinc-900 block">{g.nombre}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">Código: {g.codigo}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar giro ${g.nombre}?`)) deleteGiro(g.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: DIRECTORIO DE PROVEEDORES */}
      {activeTab === 'proveedores' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs h-fit">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Agregar Proveedor
            </h3>
            <form onSubmit={handleAddProveedor} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Razón Social / Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Comercial Oxxo S.A. de C.V."
                  value={provNombre}
                  onChange={(e) => setProvNombre(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">RFC Fiscal</label>
                <input
                  type="text"
                  placeholder="Ej: CCO8605231N4"
                  value={provRfc}
                  onChange={(e) => setProvRfc(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono uppercase focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Categoría</label>
                <input
                  type="text"
                  placeholder="Ej: Combustibles / Papelería"
                  value={provCategoria}
                  onChange={(e) => setProvCategoria(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Guardar Proveedor
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Directorio Homologado de Proveedores ({proveedores.length})
            </h3>
            <div className="space-y-2">
              {proveedores.map((p) => (
                <div key={p.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 block">{p.nombre}</span>
                    <span className="text-[10px] text-zinc-400 font-mono">RFC: {p.rfc} • {p.categoria}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar proveedor ${p.nombre}?`)) deleteProveedor(p.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PERSONAL Y SOLICITANTES */}
      {activeTab === 'empleados' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs h-fit">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Alta de Personal / Solicitante
            </h3>
            <form onSubmit={handleAddEmpleado} className="space-y-3 text-xs">
              <div>
                <label className="block text-zinc-600 font-medium mb-1">Nombre Completo *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Ing. Carlos Mendoza"
                  value={empNombre}
                  onChange={(e) => setEmpNombre(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Puesto / Cargo</label>
                <input
                  type="text"
                  placeholder="Ej: Jefe de Taller"
                  value={empPuesto}
                  onChange={(e) => setEmpPuesto(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <div>
                <label className="block text-zinc-600 font-medium mb-1">Departamento</label>
                <input
                  type="text"
                  placeholder="Ej: Operaciones / Mantenimiento"
                  value={empDepartamento}
                  onChange={(e) => setEmpDepartamento(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                + Guardar Personal
              </button>
            </form>
          </div>

          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs">
            <h3 className="text-sm font-semibold text-zinc-900 mb-3 pb-2 border-b border-zinc-100">
              Directorio de Personal Autorizado ({empleados.length})
            </h3>
            <div className="space-y-2">
              {empleados.map((emp) => (
                <div key={emp.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-xs text-zinc-900 block">{emp.nombre}</span>
                    <span className="text-[10px] text-zinc-400">{emp.puesto} • {emp.departamento}</span>
                  </div>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar personal ${emp.nombre}?`)) deleteEmpleado(emp.id);
                    }}
                    className="p-1.5 text-zinc-400 hover:text-rose-600 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
