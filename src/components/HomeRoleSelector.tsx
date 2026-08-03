import React from 'react';
import { Wallet, Landmark, ShieldCheck, User } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType } from '../types';

interface RoleOption {
  id: RoleType;
  title: string;
  icon: React.ElementType;
}

const ROLES: RoleOption[] = [
  {
    id: 'custodio',
    title: 'Custodio de Caja',
    icon: Wallet
  },
  {
    id: 'contador',
    title: 'Contador / Auditor',
    icon: Landmark
  },
  {
    id: 'admin',
    title: 'Super Administrador',
    icon: ShieldCheck
  },
  {
    id: 'cliente',
    title: 'Cliente',
    icon: User
  }
];

export const HomeRoleSelector: React.FC = () => {
  const { setRole } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-5xl">
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight mb-2">
            Sistema de Control y Gestión de Caja Chica
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500">
            Seleccione su rol de acceso para continuar
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => setRole(role.id)}
                className="group relative bg-white rounded-2xl p-6 border border-zinc-200/80 hover:border-zinc-900 shadow-xs hover:shadow-xl transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[200px] cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center transition-colors duration-200 mb-4">
                  <Icon className="w-7 h-7 stroke-[1.75]" />
                </div>
                <h2 className="text-base font-semibold text-zinc-900 tracking-tight group-hover:text-zinc-900">
                  {role.title}
                </h2>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
