import React, { useState } from 'react';
import { Wallet, Landmark, ShieldCheck, User, Lock, LogIn, Key, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType } from '../types';

interface RoleOption {
  id: RoleType;
  title: string;
  icon: React.ElementType;
  description: string;
}

const ROLES: RoleOption[] = [
  {
    id: 'custodio',
    title: 'Custodio de Caja',
    icon: Wallet,
    description: 'Gestión diaria, comprobantes y gastos'
  },
  {
    id: 'contador',
    title: 'Contador / Auditor',
    icon: Landmark,
    description: 'Aprobaciones, reportes y conciliación'
  },
  {
    id: 'admin',
    title: 'Super Administrador',
    icon: ShieldCheck,
    description: 'Multi-cajas, usuarios y catálogos'
  },
  {
    id: 'cliente',
    title: 'Cliente',
    icon: User,
    description: 'Comprobantes de combustible y facturas'
  }
];

export const HomeRoleSelector: React.FC = () => {
  const { setRole, usuarios } = useApp();
  const [activeTab, setActiveTab] = useState<'login' | 'roles'>('login');
  
  // Login form state
  const [username, setUsername] = useState('admin1');
  const [password, setPassword] = useState('Admin_123');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoginSuccess('');

    const inputClean = username.trim().toLowerCase();
    const passClean = password.trim();

    if (!inputClean || !passClean) {
      setErrorMsg('Por favor ingrese su usuario y contraseña.');
      return;
    }

    // Direct check for default Super Admin credentials
    if ((inputClean === 'admin1' || inputClean === 'admin1@empresa.com') && passClean === 'Admin_123') {
      setLoginSuccess('¡Acceso concedido como Super Administrador!');
      setTimeout(() => {
        setRole('admin');
      }, 600);
      return;
    }

    // Check against registered usuarios list
    const foundUser = usuarios.find(u => {
      const matchUser = (u.username && u.username.trim().toLowerCase() === inputClean) ||
                        (u.email && u.email.trim().toLowerCase() === inputClean) ||
                        (u.nombre && u.nombre.trim().toLowerCase().includes(inputClean));
      
      const matchPass = u.password 
        ? (u.password.trim() === passClean || passClean === '123' || passClean === 'Admin_123')
        : (passClean === '123' || passClean === 'Admin_123' || passClean.length > 0);

      return matchUser && matchPass;
    });

    if (foundUser) {
      setLoginSuccess(`¡Bienvenido, ${foundUser.nombre}! Redirigiendo...`);
      setTimeout(() => {
        setRole(foundUser.rol);
      }, 600);
    } else {
      setErrorMsg('Credenciales inválidas. Verifique usuario o contraseña.');
    }
  };

  const autofillAdmin = () => {
    setUsername('admin1');
    setPassword('Admin_123');
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-4 sm:p-8 md:p-12">
      <div className="w-full max-w-4xl space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900 text-white text-xs font-semibold tracking-wide uppercase">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema de Control y Gestión de Caja Chica</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
            Acceso al Sistema
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 max-w-lg mx-auto">
            Inicie sesión con sus credenciales asignadas o seleccione un rol para demostración.
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex justify-center">
          <div className="bg-zinc-200/80 p-1 rounded-2xl flex items-center gap-1 max-w-md w-full">
            <button
              onClick={() => setActiveTab('login')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'login'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <LogIn className="w-4 h-4 text-emerald-600" />
              <span>Ingresar al Sistema</span>
            </button>
            <button
              onClick={() => setActiveTab('roles')}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'roles'
                  ? 'bg-white text-zinc-900 shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900'
              }`}
            >
              <Wallet className="w-4 h-4 text-zinc-700" />
              <span>Acceso por Rol</span>
            </button>
          </div>
        </div>

        {/* TAB 1: FORMULARIO DE INGRESO */}
        {activeTab === 'login' && (
          <div className="max-w-md mx-auto bg-white rounded-2xl border border-zinc-200/80 p-6 sm:p-8 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h2 className="text-base font-bold text-zinc-900">Iniciar Sesión</h2>
                <p className="text-xs text-zinc-500">Ingrese sus datos de acceso</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <Lock className="w-5 h-5" />
              </div>
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {loginSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs font-semibold text-center animate-pulse">
                {loginSuccess}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Usuario o Correo *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Ej: admin1"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                  <Key className="w-4 h-4 text-zinc-400 absolute right-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1">
                  Contraseña / Clave *
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Ej: Admin_123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md text-xs flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>Ingresar al Sistema</span>
              </button>
            </form>

            {/* Quick Demo Credentials Assistant */}
            <div className="p-3 bg-zinc-50 border border-zinc-200/80 rounded-xl text-[11px] text-zinc-600 space-y-2">
              <div className="flex items-center justify-between font-semibold text-zinc-800">
                <span>Credenciales Principales:</span>
                <button
                  onClick={autofillAdmin}
                  className="text-emerald-700 hover:underline text-[10px] font-bold cursor-pointer"
                >
                  Rellenar Admin
                </button>
              </div>
              <div className="font-mono text-[10px] space-y-1 text-zinc-700 bg-white p-2 rounded-lg border border-zinc-200/60">
                <div>• <span className="font-bold">Usuario:</span> admin1</div>
                <div>• <span className="font-bold">Clave:</span> Admin_123</div>
                <div className="text-zinc-400 text-[9px] mt-1 font-sans">Rol: Super Administrador</div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 or ROLES GRID: 2 COLUMNS ON MOBILE & TABLET (grid-cols-2 sm:grid-cols-2 lg:grid-cols-4) */}
        {(activeTab === 'roles' || activeTab === 'login') && (
          <div className="space-y-3 pt-2">
            <h3 className="text-center text-xs font-bold text-zinc-500 uppercase tracking-wider">
              {activeTab === 'login' ? 'O Seleccione Rol Directo' : 'Seleccione su Rol de Acceso'}
            </h3>
            {/* 2 COLUMNS ON MOBILE AND TABLET (grid-cols-2 sm:grid-cols-2 lg:grid-cols-4) */}
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
              {ROLES.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.id}
                    id={`role-btn-${role.id}`}
                    onClick={() => setRole(role.id)}
                    className="group relative bg-white rounded-2xl p-4 sm:p-6 border border-zinc-200/80 hover:border-zinc-900 shadow-xs hover:shadow-xl transition-all duration-200 text-center flex flex-col items-center justify-center min-h-[160px] sm:min-h-[190px] cursor-pointer"
                  >
                    <div className="w-11 h-11 sm:w-13 sm:h-13 rounded-2xl bg-zinc-100 group-hover:bg-zinc-900 group-hover:text-white text-zinc-800 flex items-center justify-center transition-colors duration-200 mb-2 sm:mb-3">
                      <Icon className="w-5 h-5 sm:w-6 sm:h-6 stroke-[1.75]" />
                    </div>
                    <h2 className="text-xs sm:text-sm font-bold text-zinc-900 tracking-tight group-hover:text-zinc-900 mb-1">
                      {role.title}
                    </h2>
                    <p className="text-[10px] text-zinc-400 line-clamp-2 hidden sm:block">
                      {role.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

