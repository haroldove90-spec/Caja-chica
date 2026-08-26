import React, { useState, useRef } from 'react';
import { ShieldCheck, UserCheck, History, Plus, Trash2, Key, Send, Copy, Check, MessageSquare, Mail, Share2, X, Eye, EyeOff, Camera, Upload, User, Power, Edit3 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType, Usuario } from '../types';

export const AdminUsuarios: React.FC = () => {
  const { usuarios, addUsuario, updateUsuario, deleteUsuario, toggleActivoUsuario, auditLogs, cajas } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [telefono, setTelefono] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rol, setRol] = useState<RoleType>('custodio');
  const [cajaId, setCajaId] = useState('');
  const [fotoUrl, setFotoUrl] = useState<string | undefined>(undefined);

  // Modal / Toast state for sharing credentials
  const [selectedUserShare, setSelectedUserShare] = useState<Usuario | null>(null);
  const [copied, setCopied] = useState(false);

  const appLink = window.location.origin;

  const handleResetForm = () => {
    setEditingId(null);
    setNombre('');
    setEmail('');
    setTelefono('');
    setUsername('');
    setPassword('');
    setRol('custodio');
    setCajaId('');
    setFotoUrl(undefined);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleStartEdit = (u: Usuario) => {
    setEditingId(u.id);
    setNombre(u.nombre);
    setEmail(u.email);
    setTelefono(u.telefono || '');
    setUsername(u.username || '');
    setPassword(u.password || '');
    setRol(u.rol);
    setCajaId(u.cajaId || '');
    setFotoUrl(u.fotoUrl);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFotoUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleAddUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    // Default username if empty
    const finalUsername = username.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
    // Default password if empty
    const finalPassword = password.trim() || `Clave_${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingId) {
      const existing = usuarios.find(u => u.id === editingId);
      if (existing) {
        updateUsuario({
          ...existing,
          nombre,
          email,
          telefono: telefono.trim() || undefined,
          username: finalUsername,
          password: finalPassword,
          rol,
          cajaId: (rol === 'custodio' || rol === 'cliente') ? cajaId : undefined,
          fotoUrl: fotoUrl || undefined
        });
      }
      handleResetForm();
    } else {
      const newUser: Omit<Usuario, 'id'> = {
        nombre,
        email,
        telefono: telefono.trim() || undefined,
        username: finalUsername,
        password: finalPassword,
        rol,
        cajaId: (rol === 'custodio' || rol === 'cliente') ? cajaId : undefined,
        fotoUrl: fotoUrl || undefined,
        activo: true
      };

      addUsuario(newUser);

      // Auto-open share modal for the newly created user
      setSelectedUserShare({
        id: `usr-${Date.now()}`,
        ...newUser
      });

      handleResetForm();
    }
  };

  const getRoleLabel = (r: RoleType) => {
    switch (r) {
      case 'custodio': return 'Custodio de Caja';
      case 'contador': return 'Contador / Auditor';
      case 'admin': return 'Super Administrador';
      case 'cliente': return 'Cliente / Usuario';
      default: return r;
    }
  };

  const formatShareMessage = (user: Usuario) => {
    const usrName = user.username || user.email.split('@')[0];
    const pass = user.password || '123';
    const telStr = user.telefono ? `\n📱 WhatsApp / Tel: ${user.telefono}` : '';
    return `🔑 ACCESO AL SISTEMA DE CAJA CHICA

¡Hola ${user.nombre}! Se han generado tus credenciales para ingresar a la plataforma:

🌐 Link de la Aplicación:
${appLink}

👤 Usuario / Correo: ${usrName} (${user.email})${telStr}
🔒 Contraseña: ${pass}
🎭 Rol Asignado: ${getRoleLabel(user.rol)}

Ingresa directamente al link para comenzar a operar.`;
  };

  const handleCopyCredentials = (user: Usuario) => {
    const text = formatShareMessage(user);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  };

  const handleSendWhatsApp = (user: Usuario) => {
    const text = encodeURIComponent(formatShareMessage(user));
    const cleanPhone = user.telefono ? user.telefono.replace(/[^0-9]/g, '') : '';
    if (cleanPhone) {
      window.open(`https://wa.me/${cleanPhone}?text=${text}`, '_blank');
    } else {
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  };

  const handleSendEmail = (user: Usuario) => {
    const subject = encodeURIComponent('Credenciales de Acceso - Sistema de Caja Chica');
    const body = encodeURIComponent(formatShareMessage(user));
    window.open(`mailto:${user.email}?subject=${subject}&body=${body}`, '_blank');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative">
      {/* CONTROL DE ACCESOS Y USUARIOS */}
      <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 p-5 shadow-xs space-y-4 h-fit">
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
          <div>
            <h3 className="text-sm font-semibold text-zinc-900">
              {editingId ? 'Editar Usuario de Sistema' : 'Crear Usuario de Sistema'}
            </h3>
            <p className="text-[11px] text-zinc-500">Asignación de credenciales, contraseña y rol</p>
          </div>
          {editingId ? (
            <button
              onClick={handleResetForm}
              className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              Cancelar
            </button>
          ) : (
            <UserCheck className="w-4 h-4 text-zinc-500" />
          )}
        </div>

        <form onSubmit={handleAddUsuario} className="space-y-3 text-xs">
          {/* FOTOGRAFÍA DE PERFIL DEL USUARIO */}
          <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              {fotoUrl ? (
                <img
                  src={fotoUrl}
                  alt="Foto usuario"
                  className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs">
                  {nombre ? nombre.charAt(0).toUpperCase() : <User className="w-4 h-4 text-zinc-400" />}
                </div>
              )}
              <div>
                <p className="text-[11px] font-semibold text-zinc-800">Fotografía de Usuario</p>
                <p className="text-[10px] text-zinc-400">Opcional para avatar y perfil</p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
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
                className="px-2.5 py-1.5 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-700 text-[11px] font-medium rounded-lg transition-all cursor-pointer flex items-center gap-1"
              >
                <Camera className="w-3 h-3 text-zinc-500" />
                <span>{fotoUrl ? 'Cambiar' : 'Subir Foto'}</span>
              </button>

              {fotoUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setFotoUrl(undefined);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                  title="Quitar foto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
              <label className="block text-zinc-600 font-medium mb-1">WhatsApp / Teléfono</label>
              <input
                type="tel"
                placeholder="Ej: +52 55 1234 5678"
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-zinc-600 font-medium mb-1">Nombre de Usuario</label>
              <input
                type="text"
                placeholder="sofia1 (opcional)"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900"
              />
            </div>

            <div>
              <label className="block text-zinc-600 font-medium mb-1">Contraseña / Clave</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Clave asignada"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 pr-7"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-zinc-600 font-medium mb-1">Rol Asignado *</label>
            <select
              value={rol}
              onChange={(e) => setRol(e.target.value as RoleType)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-medium text-zinc-800"
            >
              <option value="custodio">1. Custodio de Caja (Operativo)</option>
              <option value="contador">2. Contador / Auditor (Finanzas)</option>
              <option value="admin">3. Super Administrador (Dirección)</option>
              <option value="cliente">4. Cliente / Usuario (Comprobantes)</option>
            </select>
          </div>

          {(rol === 'custodio' || rol === 'cliente') && (
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
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-medium py-2.5 rounded-xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>{editingId ? 'Guardar Cambios de Usuario' : 'Dar de Alta Usuario y Generar Credenciales'}</span>
          </button>
        </form>

        {/* LISTA DE USUARIOS CON BOTÓN ENVIAR CREDENCIALES */}
        <div className="pt-3 border-t border-zinc-100 space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-semibold text-zinc-800">Usuarios Registrados ({usuarios.length})</h4>
            <span className="text-[10px] text-zinc-400">Click en <Share2 className="w-3 h-3 inline text-emerald-600" /> para enviar acceso</span>
          </div>

          <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
            {usuarios.map((u) => (
              <div key={u.id} className="p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/50 flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {u.fotoUrl ? (
                    <img
                      src={u.fotoUrl}
                      alt={u.nombre}
                      className="w-8 h-8 rounded-full object-cover border border-emerald-500 shrink-0"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-zinc-200 text-zinc-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold text-zinc-900 truncate">{u.nombre}</span>
                      <span className="text-[9px] px-1.5 py-0.5 rounded bg-zinc-200 text-zinc-800 font-bold uppercase shrink-0">
                        {u.rol}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          u.activo !== false
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            : 'bg-zinc-200 text-zinc-600 line-through'
                        }`}
                      >
                        {u.activo !== false ? '● Activo' : '○ Inactivo'}
                      </span>
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono truncate mt-0.5">
                      Usr: <span className="font-bold text-zinc-800">{u.username || u.email}</span> • Clave: <span className="font-bold text-zinc-800">{u.password || '123'}</span>{u.telefono ? <span className="text-emerald-700"> • WA: {u.telefono}</span> : ''}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => toggleActivoUsuario(u.id)}
                    title={u.activo !== false ? 'Desactivar Usuario' : 'Activar Usuario'}
                    className={`p-1.5 rounded-lg transition-colors cursor-pointer text-[10px] font-bold ${
                      u.activo !== false
                        ? 'text-zinc-600 hover:bg-zinc-200 bg-zinc-100'
                        : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                    }`}
                  >
                    <Power className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleStartEdit(u)}
                    title="Editar Usuario"
                    className="p-1.5 text-zinc-500 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => setSelectedUserShare(u)}
                    title="Enviar Credenciales y Link"
                    className="px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Acceso</span>
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar usuario ${u.nombre}?`)) deleteUsuario(u.id);
                    }}
                    title="Eliminar usuario"
                    className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
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

      {/* MODAL / DISPATCH DE CREDENCIALES AL USUARIO */}
      {selectedUserShare && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Enviar Credenciales de Acceso</h3>
                  <p className="text-[11px] text-zinc-500">Credenciales generadas para {selectedUserShare.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserShare(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* PREVIEW BOX OF INVITATION TEXT */}
            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700">
                Mensaje de Acceso y Link de Aplicación:
              </label>
              <textarea
                readOnly
                rows={7}
                value={formatShareMessage(selectedUserShare)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px] font-mono text-zinc-800 focus:outline-none resize-none leading-relaxed"
              />
            </div>

            {/* ACTION BUTTONS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-2">
              <button
                onClick={() => handleCopyCredentials(selectedUserShare)}
                className={`px-3 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-zinc-900 hover:bg-zinc-800 text-white'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? '¡Copiado!' : 'Copiar'}</span>
              </button>

              <button
                onClick={() => handleSendWhatsApp(selectedUserShare)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <MessageSquare className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>

              <button
                onClick={() => handleSendEmail(selectedUserShare)}
                className="px-3 py-2.5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <Mail className="w-4 h-4" />
                <span>Email</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

