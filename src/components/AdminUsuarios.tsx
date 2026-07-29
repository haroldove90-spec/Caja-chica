import React, { useState } from 'react';
import { ShieldCheck, UserCheck, History, Plus, Trash2, Key } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const AdminUsuarios: React.FC = () => {
  const { usuarios, addUsuario, deleteUsuario, auditLogs, cajas } = useApp();

  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [rol, setRol] = useState<'custodio' | 'contador' | 'admin'>('custodio');
  const [cajaId, setCajaId] = useState('');

  const handleAddUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    addUsuario({
      nombre,
      email,
      rol,
      cajaId: rol === 'custodio' ? cajaId : undefined,
      activo: true
    });

    setNombre('');
    setEmail('');
    setRol('custodio');
    setCajaId('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* CONTROL DE ACCESOS Y USUARIOS */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 h-fit">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Crear Usuario de Sistema</h3>
            <p className="text-[11px] text-zinc-500">Asignación de credenciales y roles</p>
          </div>
          <UserCheck className="w-4 h-4 text-zinc-500" />
        </div>

        <form onSubmit={handleAddUsuario} className="space-y-3 text-xs">
          <div>
            <label className="block text-zinc-600 font-medium mb-1">Nombre Completo *</label>
            <input
              type="text"
              required
              placeholder="Ej: Lic. Sofía Rodríguez"
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-zinc-600 font-medium mb-1">Correo Electrónico *</label>
            <input
              type="email"
              required
              placeholder="sofia.rodriguez@empresa.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
            />
          </div>

          <div>
            <label className="block text-zinc-600 font-medium mb-1">Rol Asignado *</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as any)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-medium text-zinc-800"
            >
              <option value="custodio">1. Custodio de Caja (Operativo)</option>
              <option value="contador">2. Contador / Auditor (Finanzas)</option>
              <option value="admin">3. Super Administrador (Dirección)</option>
            </select>
          </div>

          {rol === 'custodio' && (
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Caja Chica Asignada</label>
              <select
                value={cajaId}
                onChange={(e) => setCajaId(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              >
                <option value="">Seleccionar caja chica...</option>
                {cajas.map(c => (
                  <option key={c.id} value={c.id}>{c.nombre}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
          >
            + Dar de Alta Usuario
          </button>
        </form>

        {/* LISTA DE USUARIOS */}
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <h4 className="text-xs font-semibold text-zinc-800">Usuarios Registrados ({usuarios.length})</h4>
          {usuarios.map((u) => (
            <div key={u.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs">
              <div>
                <span className="font-semibold text-zinc-900 block">{u.nombre}</span>
                <span className="text-[10px] text-zinc-400">{u.email} • <span className="font-medium text-zinc-700">{u.rol.toUpperCase()}</span></span>
              </div>
              <button
                onClick={() => {
                  if (confirm(`¿Eliminar usuario ${u.nombre}?`)) deleteUsuario(u.id);
                }}
                className="p-1 text-zinc-400 hover:text-rose-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* LOG DE AUDITORÍA Y REGISTRO DE CAMBIOS */}
      <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">Log de Auditoría de Seguridad</h3>
            <p className="text-[11px] text-zinc-500">Trazabilidad cronológica de quién modificó, eliminó o aprobó</p>
          </div>
          <History className="w-4 h-4 text-zinc-400" />
        </div>

        <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
          {auditLogs.map((log) => (
            <div key={log.id} className="p-3 rounded-xl border border-zinc-200/60 bg-zinc-50/40 space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900">{log.usuario} <span className="text-[10px] font-normal text-zinc-400">({log.rol})</span></span>
                <span className="text-[10px] font-mono text-zinc-400">{log.fecha}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="bg-zinc-200 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                  {log.accion}
                </span>
                <span className="text-[11px] text-zinc-600 font-medium">{log.modulo}</span>
              </div>
              <p className="text-[11px] text-zinc-500">{log.detalles}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
