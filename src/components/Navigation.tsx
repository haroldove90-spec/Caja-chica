import React, { useState } from 'react';
import {
  Receipt,
  Wallet,
  Lock,
  FileCheck2,
  TrendingUp,
  FileText,
  Building2,
  Tags,
  Users,
  ArrowLeft,
  ChevronDown,
  Fuel,
  FileBadge,
  User,
  Camera,
  Database,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { SupabaseSqlModal } from './SupabaseSqlModal';
import { SupabaseSmartButton } from './SupabaseSmartButton';
import { RoleType } from '../types';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Navigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    role,
    setRole,
    activeModule,
    setActiveModule,
    cajas,
    activeCajaId,
    setActiveCajaId,
    currentUser,
    clienteProfile
  } = useApp();
  const [isSqlModalOpen, setIsSqlModalOpen] = useState(false);

  // Define modules according to active role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'custodio':
        return [
          { id: 'movimientos', label: 'Consulta de Fondo', icon: Wallet },
          { id: 'gastos', label: 'Registro de Gastos', icon: Receipt },
          { id: 'gasolina', label: 'Control de Gasolina', icon: Fuel },
          { id: 'combustible_clientes', label: 'Comprobantes Clientes', icon: Camera },
          { id: 'comprobantes', label: 'Comprobante Gastos', icon: FileBadge },
          { id: 'cierre', label: 'Cierre y Reembolso', icon: Lock }
        ];

      case 'contador':
        return [
          { id: 'auditoria', label: 'Auditoría', icon: FileCheck2 },
          { id: 'inyecciones', label: 'Inyecciones Fondo', icon: TrendingUp },
          { id: 'reportes', label: 'Reportes y PDF', icon: FileText }
        ];
      case 'admin':
        return [
          { id: 'usuarios', label: 'Usuarios y Seguridad', icon: Users },
          { id: 'multicajas', label: 'Multi-Cajas', icon: Building2 },
          { id: 'catalogos', label: 'Catálogos', icon: Tags }
        ];
      case 'cliente':
        return [
          { id: 'comprobantes_combustible', label: 'Comprobantes Combustible', icon: Fuel },
          { id: 'perfil', label: 'Mi Perfil', icon: User }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const handleRoleChange = (newRole: RoleType) => {
    setRole(newRole);
    if (newRole === 'admin') setActiveModule('usuarios');
    else if (newRole === 'custodio') setActiveModule('gastos');
    else if (newRole === 'contador') setActiveModule('auditoria');
    else if (newRole === 'cliente') setActiveModule('perfil');
  };

  const currentPhoto = role === 'cliente' ? clienteProfile?.fotoUrl : currentUser?.fotoUrl;
  const currentDisplayName = role === 'cliente' ? (clienteProfile?.nombre || 'Cliente') : (currentUser?.nombre || 'Administrador');

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row antialiased text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* FULLSCREEN DESKTOP SIDEBAR (md:flex) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 bg-white sticky top-0 h-screen shrink-0 z-30 select-none print:hidden">
        {/* Top Role Header */}
        <div className="p-4 border-b border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
              Rol Activo
            </span>
            <button
              onClick={() => setRole('home')}
              title="Cerrar Sesión / Ir al Menú Principal"
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer flex items-center gap-1 text-[11px]"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Inicio</span>
            </button>
          </div>

          {/* Quick Role Switcher */}
          <div className="relative">
            <select
              value={role}
              onChange={(e) => handleRoleChange(e.target.value as RoleType)}
              className="w-full appearance-none bg-zinc-900 text-white text-xs font-semibold py-2 pl-3 pr-8 rounded-xl focus:outline-none cursor-pointer shadow-xs"
            >
              <option value="admin">🛡️ Super Administrador</option>
              <option value="custodio">💼 Custodio de Caja</option>
              <option value="contador">📊 Contador / Auditor</option>
              <option value="cliente">👤 Cliente / Facturación</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-300 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>

          {/* User Profile Avatar Card */}
          <div className="bg-zinc-50 rounded-xl p-2.5 border border-zinc-200/80 flex items-center gap-2.5">
            {currentPhoto ? (
              <img
                src={currentPhoto}
                alt="Avatar"
                className="w-9 h-9 rounded-full object-cover border border-emerald-500 shrink-0"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-[#024182] text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs">
                {currentDisplayName ? currentDisplayName.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-zinc-900 truncate">{currentDisplayName}</p>
              <p className="text-[10px] text-zinc-500 truncate">
                {role === 'cliente' ? 'Acceso Cliente' : (currentUser?.username ? `@${currentUser.username}` : currentUser?.email || 'admin')}
              </p>
            </div>
          </div>

          {/* Active Caja Selector Dropdown */}
          {(role === 'custodio' || role === 'contador' || role === 'admin') && (
            <div className="relative">
              <label className="block text-[10px] font-semibold text-zinc-400 mb-1">Caja Seleccionada:</label>
              <select
                value={activeCajaId}
                onChange={(e) => setActiveCajaId(e.target.value)}
                className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 py-1.5 pl-2.5 pr-7 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors cursor-pointer"
              >
                {cajas.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nombre}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 text-zinc-400 absolute right-2.5 top-6 pointer-events-none" />
            </div>
          )}

          {/* Supabase Smart Status & Diagnostic Button (All roles except 'cliente') */}
          <div className="pt-0.5">
            <SupabaseSmartButton />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeModule === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveModule(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-150 cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white font-semibold shadow-xs'
                    : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/80'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-zinc-500'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Shortcut to Usuarios y Seguridad if in another role */}
        {role !== 'admin' && (
          <div className="px-3 pb-2">
            <button
              onClick={() => {
                setRole('admin');
                setActiveModule('usuarios');
              }}
              className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 hover:bg-emerald-100 transition-all cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-emerald-600" />
                <span>Usuarios y Seguridad</span>
              </div>
              <span className="text-[9px] bg-emerald-200 text-emerald-900 px-1.5 py-0.5 rounded font-bold">Admin</span>
            </button>
          </div>
        )}

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-zinc-100 space-y-2">
          <button
            onClick={() => setRole('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Pantalla de Inicio</span>
          </button>
        </div>
      </aside>

      {/* MOBILE / TABLET TOP COMPACT STRIP (< md) */}
      <div className="md:hidden bg-white border-b border-zinc-200/80 px-3 py-2.5 sticky top-0 z-20 flex items-center justify-between gap-2 print:hidden">
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={() => setRole('home')}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          {currentPhoto ? (
            <img src={currentPhoto} alt="Avatar" className="w-7 h-7 rounded-full object-cover shrink-0 border" />
          ) : null}
          <div className="min-w-0">
            <span className="text-xs font-semibold text-zinc-900 block leading-none truncate">
              {currentDisplayName}
            </span>
            <span className="text-[10px] text-zinc-500 truncate block">
              {cajas.find(c => c.id === activeCajaId)?.nombre}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <select
            value={role}
            onChange={(e) => handleRoleChange(e.target.value as RoleType)}
            className="bg-zinc-900 text-white text-[11px] font-semibold px-2 py-1 rounded-lg focus:outline-none"
          >
            <option value="admin">Admin</option>
            <option value="custodio">Custodio</option>
            <option value="contador">Contador</option>
            <option value="cliente">Cliente</option>
          </select>
          <SupabaseSmartButton />
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-24 md:pb-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden print:p-0 print:m-0 print:max-w-none print:overflow-visible">
        {children}
      </main>

      {/* MOBILE / TABLET BOTTOM NAVIGATION BAR (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-2 flex items-center justify-around shadow-lg print:hidden">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeModule === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveModule(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg text-[10px] font-medium transition-all ${
                isActive
                  ? 'text-zinc-900 font-semibold'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              <div className={`p-1.5 rounded-full mb-0.5 ${isActive ? 'bg-zinc-900 text-white' : 'bg-transparent text-zinc-500'}`}>
                <Icon className="w-4 h-4" />
              </div>
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>

      <SupabaseSqlModal isOpen={isSqlModalOpen} onClose={() => setIsSqlModalOpen(false)} />
    </div>
  );
};
