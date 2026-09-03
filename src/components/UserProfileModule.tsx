import React, { useState, useRef } from 'react';
import { User, Mail, Phone, Lock, Save, CheckCircle2, Camera, Trash2, Shield, Key, Eye, EyeOff, Building, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Usuario } from '../types';
import { normalizeMexicanPhone } from '../utils/phoneUtils';

export const UserProfileModule: React.FC = () => {
  const { currentUser, setCurrentUser, usuarios, updateUsuario, role, cajas } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Active user object from context or fallback
  const user = currentUser || usuarios.find(u => u.rol === role) || {
    id: 'usr-default',
    nombre: role === 'admin' ? 'Super Administrador' : role === 'custodio' ? 'Reyna Pino' : role === 'contador' ? 'CP. Alberto Vargas' : 'Cliente Registrado',
    email: `${role}@empresa.com`,
    username: role,
    password: '123',
    rol: role,
    activo: true
  };

  const [formData, setFormData] = useState({
    nombre: user.nombre || '',
    email: user.email || '',
    username: user.username || '',
    telefono: user.telefono || '',
    fotoUrl: user.fotoUrl || '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [showPasswords, setShowPasswords] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
    setErrorMsg('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
    setErrorMsg('');
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setFormData(prev => ({ ...prev, fotoUrl: result }));
      setSavedSuccess(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setFormData(prev => ({ ...prev, fotoUrl: '' }));
    if (fileInputRef.current) fileInputRef.current.value = '';
    setSavedSuccess(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.nombre.trim() || !formData.email.trim()) {
      setErrorMsg('Nombre y correo electrónico son obligatorios.');
      return;
    }

    let finalPassword = user.password || '123';

    // If changing password
    if (passwordData.newPassword.trim()) {
      if (passwordData.newPassword.length < 4) {
        setErrorMsg('La nueva contraseña debe tener al menos 4 caracteres.');
        return;
      }
      if (passwordData.newPassword !== passwordData.confirmPassword) {
        setErrorMsg('Las nuevas contraseñas no coinciden.');
        return;
      }
      finalPassword = passwordData.newPassword.trim();
    }

    const updatedUser: Usuario = {
      ...user,
      nombre: formData.nombre.trim(),
      email: formData.email.trim(),
      username: formData.username.trim() || formData.email.split('@')[0],
      telefono: normalizeMexicanPhone(formData.telefono) || undefined,
      fotoUrl: formData.fotoUrl || undefined,
      password: finalPassword
    };

    // Update in context & Supabase
    updateUsuario(updatedUser);
    setCurrentUser(updatedUser);

    setSavedSuccess(true);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  const getRoleBadge = () => {
    switch (user.rol) {
      case 'admin':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">Super Administrador</span>;
      case 'custodio':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200">Custodio de Caja</span>;
      case 'contador':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">Contador / Auditor</span>;
      case 'cliente':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Cliente Registrado</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-zinc-100 text-zinc-800">{user.rol}</span>;
    }
  };

  const assignedCaja = cajas.find(c => c.id === user.cajaId);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Header Profile Card */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {formData.fotoUrl ? (
              <img
                src={formData.fotoUrl}
                alt="Foto de Perfil"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-zinc-900 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-zinc-900 text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : 'U'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow cursor-pointer transition-transform active:scale-95"
              title="Cambiar fotografía"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                {formData.nombre || 'Mi Perfil de Usuario'}
              </h1>
              {getRoleBadge()}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Gestione sus datos personales, credenciales de acceso y clave de seguridad.
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-xl animate-fade-in shadow-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>¡Datos actualizados y sincronizados en la base de datos!</span>
          </div>
        )}
      </div>

      {errorMsg && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-2 font-medium">
          <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* Main Profile Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Datos Personales */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900">Información Personal</h2>
            </div>
            <span className="text-[11px] text-zinc-400">ID: {user.id}</span>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            {/* Foto Upload Bar */}
            <div className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {formData.fotoUrl ? (
                  <img
                    src={formData.fotoUrl}
                    alt="Avatar"
                    className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold">
                    <User className="w-5 h-5 text-zinc-400" />
                  </div>
                )}
                <div>
                  <p className="text-xs font-semibold text-zinc-900">Foto de Perfil</p>
                  <p className="text-[11px] text-zinc-500">Visible en la barra lateral y reportes</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-medium rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Camera className="w-3.5 h-3.5 text-zinc-600" />
                  <span>{formData.fotoUrl ? 'Cambiar Foto' : 'Subir Foto'}</span>
                </button>
                {formData.fotoUrl && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Nombre Completo <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Reyna Pino"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Correo Electrónico <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="email"
                    required
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="reyna_pino@hotmail.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Nombre de Usuario (Login)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="Ej: reyna_pino"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <Key className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-zinc-700">
                    WhatsApp / Teléfono
                  </label>
                  <span className="text-[10px] text-emerald-700 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded font-medium">
                    🇲🇽 +52 automático
                  </span>
                </div>
                <div className="relative">
                  <input
                    type="tel"
                    name="telefono"
                    value={formData.telefono}
                    onChange={handleChange}
                    onBlur={() => {
                      if (formData.telefono.trim()) {
                        setFormData(prev => ({
                          ...prev,
                          telefono: normalizeMexicanPhone(prev.telefono)
                        }));
                      }
                    }}
                    placeholder="Ej: 999 123 4567 o +52 999 123 4567"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <Phone className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
                <p className="text-[10px] text-zinc-500 mt-1">
                  Si no incluyes el +52, el sistema lo agregará automáticamente para envíos de WhatsApp.
                </p>
              </div>
            </div>

            {/* Read-Only Role & Caja Meta */}
            <div className="pt-2 border-t border-zinc-100 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                <span className="text-[10px] font-bold text-zinc-400 uppercase">Rol de Seguridad:</span>
                <p className="font-semibold text-zinc-800 mt-0.5">{getRoleBadge()}</p>
              </div>

              {assignedCaja ? (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Caja Chica Asignada:</span>
                  <p className="font-semibold text-zinc-800 mt-0.5 flex items-center gap-1.5">
                    <Building className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{assignedCaja.nombre}</span>
                  </p>
                </div>
              ) : (
                <div className="p-3 bg-zinc-50 rounded-xl border border-zinc-200">
                  <span className="text-[10px] font-bold text-zinc-400 uppercase">Alcance del Sistema:</span>
                  <p className="font-semibold text-zinc-800 mt-0.5">Acceso Multi-Caja Global</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Seguridad y Cambio de Contraseña */}
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-zinc-100 bg-zinc-50/70 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-zinc-700" />
              <h2 className="text-sm font-bold text-zinc-900">Seguridad y Cambio de Contraseña</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowPasswords(!showPasswords)}
              className="text-xs text-zinc-600 hover:text-zinc-900 flex items-center gap-1 cursor-pointer font-medium"
            >
              {showPasswords ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              <span>{showPasswords ? 'Ocultar claves' : 'Ver claves'}</span>
            </button>
          </div>

          <div className="p-5 sm:p-6 space-y-4">
            <p className="text-xs text-zinc-500">
              Deje estos campos en blanco si no desea cambiar su contraseña actual.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-zinc-700 mb-1.5">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <input
                    type={showPasswords ? "text" : "password"}
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    placeholder="Repita la nueva contraseña"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-3 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="submit"
            className="px-6 py-3 bg-zinc-900 hover:bg-zinc-800 active:scale-[0.99] text-white font-bold rounded-xl transition-all cursor-pointer shadow-md text-xs flex items-center gap-2"
          >
            <Save className="w-4 h-4 text-emerald-400" />
            <span>Guardar y Sincronizar Cambios</span>
          </button>
        </div>
      </form>
    </div>
  );
};
