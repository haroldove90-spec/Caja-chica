import React from 'react';
import { Wallet, Landmark, ShieldCheck } from 'lucide-react';
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
  }
];

export const HomeRoleSelector: React.FC = () => {
  const { setRole } = useApp();

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 sm:p-12">
      <div className="w-full max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {ROLES.map((role) => {
            const Icon = role.icon;
            return (
              <button
                key={role.id}
                id={`role-btn-${role.id}`}
                onClick={() => setRole(role.id)}
                className="group relative bg-white rounded-2xl p-8 border border-zinc-200/80 hover:border-zinc-900/80 shadow-xs hover:shadow-xl transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[220px] cursor-pointer"
              >
                <div className="w-16 h-16 rounded-2xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center transition-colors duration-200 mb-6">
                  <Icon className="w-8 h-8 stroke-[1.75]" />
                </div>
                <h2 className="text-lg font-semibold text-zinc-900 tracking-tight group-hover:text-zinc-900">
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
