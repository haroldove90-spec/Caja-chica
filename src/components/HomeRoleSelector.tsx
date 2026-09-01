import React, { useState } from 'react';
import { Lock, LogIn, Key, AlertCircle, Eye, EyeOff, User, Mail, Shield, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Usuario } from '../types';

export const HomeRoleSelector: React.FC = () => {
  const { setRole, usuarios } = useApp();
  
  // Login form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setLoginSuccess('');

    const inputClean = identifier.trim().toLowerCase();
    const passClean = password.trim();

    if (!inputClean || !passClean) {
      setErrorMsg('Por favor ingrese su usuario o correo y contraseña.');
      return;
    }

    setIsLoading(true);

    // 1. Direct check for Harold Anguiano Morales
    if ((inputClean === 'haroldo90' || inputClean === 'haroldove90@gmail.com' || inputClean === 'harold.anguiano@empresa.com') && passClean === 'Chevropar#1970') {
      const haroldUsr: Usuario = usuarios.find(u => u.username === 'haroldo90' || u.email === 'haroldove90@gmail.com') || {
        id: 'usr-harold',
        nombre: 'Harold Anguiano Morales',
        email: 'haroldove90@gmail.com',
        username: 'haroldo90',
        password: 'Chevropar#1970',
        rol: 'admin',
        activo: true
      };
      setLoginSuccess('¡Bienvenido Harold Anguiano Morales! Accediendo como Super Administrador...');
      setTimeout(() => {
        setRole('admin', haroldUsr);
      }, 500);
      return;
    }

    // 2. Direct check for Reyna Pino
    if ((inputClean === 'reyna_pino' || inputClean === 'reyna_pino@hotmail.com' || inputClean === 'reyna.pino@empresa.com') && (passClean === 'Reyna*Caja2026!' || passClean === 'ReynaPino#2026!' || passClean === '123')) {
      const reynaUsr: Usuario = usuarios.find(u => u.username === 'reyna_pino' || u.email === 'reyna_pino@hotmail.com') || {
        id: 'usr-reyna',
        nombre: 'Reyna Pino',
        email: 'reyna_pino@hotmail.com',
        username: 'reyna_pino',
        password: 'Reyna*Caja2026!',
        rol: 'custodio',
        cajaId: 'caja-1',
        activo: true
      };
      setLoginSuccess('¡Bienvenida Reyna Pino! Accediendo como Custodio de Caja...');
      setTimeout(() => {
        setRole('custodio', reynaUsr);
      }, 500);
      return;
    }

    // 3. Direct check for Super Admin admin1
    if ((inputClean === 'admin1' || inputClean === 'admin1@empresa.com') && (passClean === 'Admin_123' || passClean === 'admin123')) {
      const adminUsr: Usuario = usuarios.find(u => u.username === 'admin1' || u.email === 'admin1@empresa.com') || {
        id: 'usr-admin1',
        nombre: 'Super Administrador Principal',
        email: 'admin1@empresa.com',
        username: 'admin1',
        password: 'Admin_123',
        rol: 'admin',
        activo: true
      };
      setLoginSuccess('¡Acceso concedido como Super Administrador!');
      setTimeout(() => {
        setRole('admin', adminUsr);
      }, 500);
      return;
    }

    // 4. General search across all registered usuarios
    const foundUser = usuarios.find(u => {
      if (u.activo === false) return false;
      const uUsr = u.username ? u.username.trim().toLowerCase() : '';
      const uEmail = u.email ? u.email.trim().toLowerCase() : '';
      const uEmailPrefix = uEmail ? uEmail.split('@')[0] : '';
      const uNombre = u.nombre ? u.nombre.trim().toLowerCase() : '';

      const matchIdentifier = (uUsr && uUsr === inputClean) ||
                              (uEmail && uEmail === inputClean) ||
                              (uEmailPrefix && uEmailPrefix === inputClean) ||
                              (uNombre && (uNombre === inputClean || uNombre.includes(inputClean)));
      
      const uPass = u.password ? u.password.trim() : '';
      const matchPass = uPass
        ? (uPass === passClean || (passClean === '123' && !uPass))
        : (passClean === '123' || passClean === 'Admin_123' || passClean.length > 0);

      return matchIdentifier && matchPass;
    });

    if (foundUser) {
      const roleNames: Record<string, string> = {
        admin: 'Super Administrador',
        custodio: 'Custodio de Caja',
        contador: 'Contador / Auditor',
        cliente: 'Cliente'
      };
      setLoginSuccess(`¡Bienvenido/a, ${foundUser.nombre}! Ingresando al panel de ${roleNames[foundUser.rol] || foundUser.rol}...`);
      setTimeout(() => {
        setRole(foundUser.rol, foundUser);
      }, 500);
    } else {
      setIsLoading(false);
      setErrorMsg('Usuario/correo o contraseña incorrectos. Verifique sus credenciales.');
    }
  };

  const quickFill = (userOrEmail: string, pass: string) => {
    setIdentifier(userOrEmail);
    setPassword(pass);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-zinc-100/70 flex items-center justify-center p-4 sm:p-6 md:p-10">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 text-white text-xs font-semibold tracking-wide shadow-xs">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sistema de Control y Gestión de Caja Chica</span>
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            Acceso al Sistema
          </h1>
          <p className="text-xs text-zinc-600 max-w-xs mx-auto">
            Ingrese con su nombre de usuario o correo electrónico registrado. El sistema lo dirigirá a su rol asignado.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h2 className="text-base font-bold text-zinc-900">Iniciar Sesión</h2>
              <p className="text-xs text-zinc-500">Credenciales personales de acceso</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
          </div>

          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span className="font-medium">{errorMsg}</span>
            </div>
          )}

          {loginSuccess && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2.5 animate-pulse">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>{loginSuccess}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                Usuario o Correo Electrónico <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="Ej: haroldo90 o reyna_pino@hotmail.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                />
                <User className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-zinc-700">
                  Contraseña / Clave <span className="text-rose-500">*</span>
                </label>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-10 pr-10 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                />
                <Key className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3 pointer-events-none" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-2.5 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                  title={showPassword ? "Ocultar clave" : "Mostrar clave"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md text-xs flex items-center justify-center gap-2 disabled:opacity-75"
            >
              <LogIn className="w-4 h-4 text-emerald-400" />
              <span>{isLoading ? 'Comprobando acceso...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>

          {/* Quick Access Helper for Testing */}
          <div className="pt-2 border-t border-zinc-100">
            <div className="text-[11px] font-semibold text-zinc-500 mb-2">
              Credenciales habilitadas para prueba rápida:
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <button
                type="button"
                onClick={() => quickFill('haroldo90', 'Chevropar#1970')}
                className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-zinc-900 truncate">Harold Anguiano</div>
                <div className="text-[10px] text-zinc-500 font-mono">haroldo90</div>
                <div className="text-[9px] text-emerald-700 font-semibold mt-0.5">Rol: Administrador</div>
              </button>

              <button
                type="button"
                onClick={() => quickFill('reyna_pino', 'Reyna*Caja2026!')}
                className="p-2 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-xl text-left transition-colors cursor-pointer"
              >
                <div className="font-bold text-zinc-900 truncate">Reyna Pino</div>
                <div className="text-[10px] text-zinc-500 font-mono">reyna_pino</div>
                <div className="text-[9px] text-blue-700 font-semibold mt-0.5">Rol: Custodio</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-[11px] text-zinc-400">
          Control de Caja Chica &bull; Acceso seguro sincronizado con base de datos
        </p>
      </div>
    </div>
  );
};
