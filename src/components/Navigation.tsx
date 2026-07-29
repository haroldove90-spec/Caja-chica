import React from 'react';
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
  ChevronDown
} from 'lucide-react';
import { useApp } from '../context/AppContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

export const Navigation: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { role, setRole, activeModule, setActiveModule, cajas, activeCajaId, setActiveCajaId } = useApp();

  // Define modules according to active role
  const getNavItems = (): NavItem[] => {
    switch (role) {
      case 'custodio':
        return [
          { id: 'movimientos', label: 'Consulta de Fondo', icon: Wallet },
          { id: 'gastos', label: 'Registro de Gastos', icon: Receipt },
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
          { id: 'multicajas', label: 'Multi-Cajas', icon: Building2 },
          { id: 'catalogos', label: 'Catálogos', icon: Tags },
          { id: 'usuarios', label: 'Usuarios y Seguridad', icon: Users }
        ];
      default:
        return [];
    }
  };

  const navItems = getNavItems();

  const getRoleName = () => {
    switch (role) {
      case 'custodio': return 'Custodio de Caja';
      case 'contador': return 'Contador / Auditor';
      case 'admin': return 'Super Administrador';
      default: return '';
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col md:flex-row antialiased text-zinc-900 selection:bg-zinc-900 selection:text-white">
      {/* FULLSCREEN DESKTOP SIDEBAR (md:flex) */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200/80 bg-white sticky top-0 h-screen shrink-0 z-30 select-none">
        {/* Top Role Header */}
        <div className="p-5 border-b border-zinc-100 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-100 text-zinc-800 border border-zinc-200">
              {getRoleName()}
            </span>
            <button
              onClick={() => setRole('home')}
              title="Cambiar de Rol"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          </div>

          {/* Active Caja Selector Dropdown */}
          <div className="relative">
            <select
              value={activeCajaId}
              onChange={(e) => setActiveCajaId(e.target.value)}
              className="w-full appearance-none bg-zinc-50 border border-zinc-200 text-xs font-medium text-zinc-800 py-2 pl-3 pr-8 rounded-lg focus:outline-none focus:border-zinc-900 transition-colors cursor-pointer"
            >
              {cajas.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-2.5 pointer-events-none" />
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

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-zinc-100">
          <button
            onClick={() => setRole('home')}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-zinc-600 border border-zinc-200 hover:border-zinc-900 hover:text-zinc-900 transition-all cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Cambiar Rol</span>
          </button>
        </div>
      </aside>

      {/* MOBILE / TABLET TOP COMPACT STRIP (< md) */}
      <div className="md:hidden bg-white border-b border-zinc-200/80 px-4 py-3 sticky top-0 z-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setRole('home')}
            className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <span className="text-xs font-semibold text-zinc-900 block leading-none">
              {getRoleName()}
            </span>
            <span className="text-[10px] text-zinc-500">
              {cajas.find(c => c.id === activeCajaId)?.nombre}
            </span>
          </div>
        </div>

        <select
          value={activeCajaId}
          onChange={(e) => setActiveCajaId(e.target.value)}
          className="bg-zinc-100 text-[11px] font-medium text-zinc-800 px-2 py-1 rounded-md border border-zinc-200 focus:outline-none"
        >
          {cajas.map((c) => (
            <option key={c.id} value={c.id}>
              {c.nombre.split('-')[1] || c.nombre}
            </option>
          ))}
        </select>
      </div>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 pb-24 md:pb-8 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {children}
      </main>

      {/* MOBILE / TABLET BOTTOM NAVIGATION BAR (< md) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 px-2 py-2 flex items-center justify-around shadow-lg">
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
    </div>
  );
};
