import React, { useState, useRef } from 'react';
import { 
  Users, 
  UserCheck, 
  History, 
  Plus, 
  Trash2, 
  Key, 
  Send, 
  Copy, 
  Check, 
  MessageSquare, 
  Mail, 
  Share2, 
  X, 
  Eye, 
  EyeOff, 
  Camera, 
  Upload, 
  User, 
  Power, 
  Edit3, 
  Sparkles, 
  Search, 
  Filter, 
  Building2, 
  CheckCircle2, 
  Shield 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { RoleType, Usuario } from '../types';

export const AdminUsuarios: React.FC = () => {
  const { 
    usuarios, 
    addUsuario, 
    updateUsuario, 
    deleteUsuario, 
    toggleActivoUsuario, 
    auditLogs, 
    cajas,
    empleados,
    addEmpleado,
    updateEmpleado
  } = useApp();
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [activeTab, setActiveTab] = useState<'personal' | 'auditoria'>('personal');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('todos');

  // Form state
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
  const [puesto, setPuesto] = useState('');
  const [departamento, setDepartamento] = useState('Administración');

  // Modal / Toast state for sharing credentials
  const [selectedUserShare, setSelectedUserShare] = useState<Usuario | null>(null);
  const [copied, setCopied] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

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
    setPuesto('');
    setDepartamento('Administración');
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

    // Find linked empleado metadata if exists
    const emp = empleados.find(e => e.nombre.toLowerCase() === u.nombre.toLowerCase());
    if (emp) {
      setPuesto(emp.puesto || '');
      setDepartamento(emp.departamento || 'Administración');
    } else {
      setPuesto('');
      setDepartamento('Administración');
    }
  };

  const generateSecurePassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let newPass = '';
    for (let i = 0; i < 10; i++) {
      newPass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPass);
    setShowPassword(true);
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

  const handleSaveUsuario = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim() || !email.trim()) return;

    // Clean username
    const finalUsername = username.trim() || email.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '');
    // Clean password
    const finalPassword = password.trim() || `Clave_${Math.floor(1000 + Math.random() * 9000)}`;

    if (editingId) {
      const existing = usuarios.find(u => u.id === editingId);
      if (existing) {
        const updated: Usuario = {
          ...existing,
          nombre: nombre.trim(),
          email: email.trim(),
          telefono: telefono.trim() || undefined,
          username: finalUsername,
          password: finalPassword,
          rol,
          cajaId: (rol === 'custodio' || rol === 'cliente') ? (cajaId || undefined) : undefined,
          fotoUrl: fotoUrl || undefined
        };
        updateUsuario(updated);
        
        // Also update or add empleado record
        const emp = empleados.find(e => e.nombre.toLowerCase() === existing.nombre.toLowerCase());
        if (emp) {
          updateEmpleado({
            ...emp,
            nombre: nombre.trim(),
            puesto: puesto.trim() || emp.puesto,
            departamento: departamento.trim() || emp.departamento
          });
        }

        setActionSuccess(`¡Usuario ${nombre} actualizado y sincronizado exitosamente!`);
        setTimeout(() => setActionSuccess(null), 3500);
      }
      handleResetForm();
    } else {
      const newUser: Omit<Usuario, 'id'> = {
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim() || undefined,
        username: finalUsername,
        password: finalPassword,
        rol,
        cajaId: (rol === 'custodio' || rol === 'cliente') ? (cajaId || undefined) : undefined,
        fotoUrl: fotoUrl || undefined,
        activo: true
      };

      const newId = `usr-${Date.now()}`;
      addUsuario({
        id: newId,
        ...newUser
      });

      // Also register in empleados table
      addEmpleado({
        id: `emp-${Date.now()}`,
        nombre: nombre.trim(),
        puesto: puesto.trim() || (rol === 'custodio' ? 'Custodio de Caja' : rol === 'contador' ? 'Contador / Auditor' : 'Personal Administrativo'),
        departamento: departamento.trim() || 'Administración',
        activo: true
      });

      setActionSuccess(`¡Empleado ${nombre} registrado con éxito y sincronizado a Supabase!`);
      setTimeout(() => setActionSuccess(null), 3500);

      // Auto-open share modal for the newly created user
      setSelectedUserShare({
        id: newId,
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
      case 'cliente': return 'Cliente / Facturación';
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

👤 Usuario o Correo: ${usrName} (${user.email})${telStr}
🔒 Contraseña / Clave: ${pass}
🎭 Rol Asignado: ${getRoleLabel(user.rol)}

Ingresa directamente con tu usuario o correo electrónico para acceder automáticamente a tu módulo asignado.`;
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

  // Filtered users
  const filteredUsers = usuarios.filter(u => {
    const matchesSearch = 
      u.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (u.username && u.username.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesRole = roleFilter === 'todos' || u.rol === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Stats calculation
  const totalUsers = usuarios.length;
  const activeUsersCount = usuarios.filter(u => u.activo !== false).length;
  const adminCount = usuarios.filter(u => u.rol === 'admin').length;
  const custodioCount = usuarios.filter(u => u.rol === 'custodio').length;
  const contadorCount = usuarios.filter(u => u.rol === 'contador').length;
  const clienteCount = usuarios.filter(u => u.rol === 'cliente').length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Header Banner */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-zinc-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center shadow-xs">
              <Users className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
                Módulo de Personal y Asignación de Roles
              </h1>
              <p className="text-xs text-zinc-500">
                Registre a sus empleados, defina sus accesos, asigne roles y genere contraseñas seguras sincronizadas con Supabase.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-zinc-100 p-1 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('personal')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'personal'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Personal y Accesos</span>
          </button>
          <button
            onClick={() => setActiveTab('auditoria')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'auditoria'
                ? 'bg-white text-zinc-900 shadow-xs'
                : 'text-zinc-600 hover:text-zinc-900'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Log de Auditoría</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Total Personal</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{totalUsers}</p>
          <span className="text-[10px] text-emerald-700 font-semibold">{activeUsersCount} activos</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-[10px] font-bold text-purple-600 uppercase">Super Admins</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{adminCount}</p>
          <span className="text-[10px] text-zinc-400">Control Total</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-[10px] font-bold text-blue-600 uppercase">Custodios</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{custodioCount}</p>
          <span className="text-[10px] text-zinc-400">Operación Cajas</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-[10px] font-bold text-emerald-600 uppercase">Contadores</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{contadorCount}</p>
          <span className="text-[10px] text-zinc-400">Auditoría y PDF</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs">
          <span className="text-[10px] font-bold text-amber-600 uppercase">Clientes</span>
          <p className="text-lg font-bold text-zinc-900 mt-0.5">{clienteCount}</p>
          <span className="text-[10px] text-zinc-400">Comprobantes</span>
        </div>

        <div className="bg-white p-3.5 rounded-xl border border-zinc-200 shadow-2xs flex flex-col justify-between">
          <span className="text-[10px] font-bold text-zinc-400 uppercase">Base de Datos</span>
          <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 mt-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Sync</span>
          </div>
        </div>
      </div>

      {actionSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-2xl text-xs font-semibold flex items-center gap-2.5 shadow-xs animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {activeTab === 'personal' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* FORMULARIO DE REGISTRO / EDICIÓN */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4 h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  {editingId ? 'Editar Datos del Empleado' : 'Registrar Nuevo Empleado / Usuario'}
                </h3>
                <p className="text-[11px] text-zinc-500">Asigne rol, credenciales y caja correspondiente</p>
              </div>
              {editingId ? (
                <button
                  type="button"
                  onClick={handleResetForm}
                  className="text-xs text-zinc-500 hover:text-zinc-900 flex items-center gap-1 cursor-pointer bg-zinc-100 px-2 py-1 rounded-lg"
                >
                  <X className="w-3.5 h-3.5" />
                  Cancelar
                </button>
              ) : (
                <div className="p-1.5 bg-emerald-50 text-emerald-700 rounded-lg">
                  <UserCheck className="w-4 h-4" />
                </div>
              )}
            </div>

            <form onSubmit={handleSaveUsuario} className="space-y-3.5 text-xs">
              {/* Foto Upload */}
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  {fotoUrl ? (
                    <img
                      src={fotoUrl}
                      alt="Foto empleado"
                      className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-xs">
                      {nombre ? nombre.charAt(0).toUpperCase() : <User className="w-4 h-4 text-zinc-400" />}
                    </div>
                  )}
                  <div>
                    <p className="text-[11px] font-semibold text-zinc-800">Fotografía de Perfil</p>
                    <p className="text-[10px] text-zinc-400">Opcional para credenciales</p>
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
                <label className="block text-zinc-700 font-bold mb-1">Nombre Completo del Empleado *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Reyna Pino o Harold Anguiano"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Correo Electrónico *</label>
                  <input
                    type="email"
                    required
                    placeholder="reyna_pino@hotmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">WhatsApp / Teléfono</label>
                  <input
                    type="tel"
                    placeholder="Ej: +52 999 123 4567"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Puesto / Cargo</label>
                  <input
                    type="text"
                    placeholder="Ej: Custodia de Caja Chica"
                    value={puesto}
                    onChange={(e) => setPuesto(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Departamento</label>
                  <select
                    value={departamento}
                    onChange={(e) => setDepartamento(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors"
                  >
                    <option value="Administración">Administración</option>
                    <option value="Finanzas">Finanzas y Contabilidad</option>
                    <option value="Dirección General">Dirección General</option>
                    <option value="Operaciones">Operaciones / Logística</option>
                    <option value="Mantenimiento">Mantenimiento</option>
                    <option value="Comercial">Comercial / Clientes</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Nombre de Usuario</label>
                  <input
                    type="text"
                    placeholder="Ej: reyna_pino o haroldo90"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors font-mono"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-zinc-700 font-bold">Contraseña / Clave</label>
                    <button
                      type="button"
                      onClick={generateSecurePassword}
                      className="text-[10px] text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-0.5 cursor-pointer"
                      title="Generar contraseña segura aleatoria"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generar Clave</span>
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Clave de acceso"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-colors pr-7 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 top-2 text-zinc-400 hover:text-zinc-600 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-zinc-700 font-bold mb-1">Rol Asignado en el Sistema *</label>
                <select
                  value={rol}
                  onChange={(e) => setRol(e.target.value as RoleType)}
                  className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-bold text-zinc-800"
                >
                  <option value="custodio">1. Custodio de Caja (Operación de gastos y gasolina)</option>
                  <option value="contador">2. Contador / Auditor (Auditoría, inyecciones y reportes PDF)</option>
                  <option value="admin">3. Super Administrador (Control total, multi-cajas y personal)</option>
                  <option value="cliente">4. Cliente / Facturación (Comprobantes y perfil)</option>
                </select>
              </div>

              {(rol === 'custodio' || rol === 'cliente') && (
                <div>
                  <label className="block text-zinc-700 font-bold mb-1">Caja Chica Asignada</label>
                  <select
                    value={cajaId}
                    onChange={(e) => setCajaId(e.target.value)}
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 font-medium text-zinc-800"
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
                className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold py-3 rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs mt-2"
              >
                <Plus className="w-4 h-4 text-emerald-400" />
                <span>{editingId ? 'Guardar Cambios de Empleado' : 'Dar de Alta y Generar Credenciales'}</span>
              </button>
            </form>
          </div>

          {/* LISTADO DE PERSONAL REGISTRADO */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100">
              <div>
                <h3 className="text-sm font-bold text-zinc-900">
                  Directorio de Personal y Accesos ({filteredUsers.length})
                </h3>
                <p className="text-[11px] text-zinc-500">
                  Usuarios activos que pueden iniciar sesión con su correo o usuario
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Buscar personal..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-zinc-50 border border-zinc-300 rounded-xl pl-8 pr-3 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 w-36 sm:w-44"
                  />
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-2 pointer-events-none" />
                </div>

                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-zinc-50 border border-zinc-300 rounded-xl px-2.5 py-1.5 text-xs text-zinc-800 focus:outline-none focus:border-zinc-900 font-medium"
                >
                  <option value="todos">Todos los roles</option>
                  <option value="admin">Admins</option>
                  <option value="custodio">Custodios</option>
                  <option value="contador">Contadores</option>
                  <option value="cliente">Clientes</option>
                </select>
              </div>
            </div>

            <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
              {filteredUsers.length === 0 ? (
                <div className="p-8 text-center text-zinc-400 space-y-2">
                  <Users className="w-8 h-8 mx-auto text-zinc-300" />
                  <p className="text-xs">No se encontraron empleados con los filtros aplicados.</p>
                </div>
              ) : (
                filteredUsers.map((u) => {
                  const assignedCajaObj = cajas.find(c => c.id === u.cajaId);
                  return (
                    <div 
                      key={u.id} 
                      className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/60 hover:bg-zinc-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-3"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {u.fotoUrl ? (
                          <img
                            src={u.fotoUrl}
                            alt={u.nombre}
                            className="w-10 h-10 rounded-full object-cover border-2 border-emerald-500 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-900 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                            {u.nombre ? u.nombre.charAt(0).toUpperCase() : 'U'}
                          </div>
                        )}

                        <div className="min-w-0 flex-1 space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-bold text-zinc-900 text-xs">{u.nombre}</span>
                            
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                              u.rol === 'admin' ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                              u.rol === 'custodio' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                              u.rol === 'contador' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                              'bg-amber-100 text-amber-800 border border-amber-200'
                            }`}>
                              {getRoleLabel(u.rol)}
                            </span>

                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                u.activo !== false
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : 'bg-zinc-200 text-zinc-600 line-through'
                              }`}
                            >
                              {u.activo !== false ? '● Activo' : '○ Inactivo'}
                            </span>
                          </div>

                          <div className="text-[11px] text-zinc-600 font-mono flex items-center gap-2 flex-wrap">
                            <span>Usuario: <strong className="text-zinc-900">{u.username || u.email.split('@')[0]}</strong></span>
                            <span>• Correo: <strong className="text-zinc-900">{u.email}</strong></span>
                            <span>• Clave: <strong className="text-zinc-900">{u.password || '123'}</strong></span>
                          </div>

                          {assignedCajaObj && (
                            <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                              <Building2 className="w-3 h-3" />
                              <span>Caja: {assignedCajaObj.nombre}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        <button
                          onClick={() => toggleActivoUsuario(u.id)}
                          title={u.activo !== false ? 'Desactivar Empleado' : 'Activar Empleado'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.activo !== false
                              ? 'text-zinc-600 hover:bg-zinc-200 bg-zinc-100'
                              : 'text-emerald-700 hover:bg-emerald-100 bg-emerald-50'
                          }`}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => handleStartEdit(u)}
                          title="Editar Empleado"
                          className="p-1.5 text-zinc-600 hover:text-zinc-900 hover:bg-zinc-200 rounded-lg transition-colors cursor-pointer"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => setSelectedUserShare(u)}
                          title="Compartir Credenciales (WhatsApp / Email)"
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 transition-all text-xs font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <Share2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Credenciales</span>
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar al empleado ${u.nombre}?`)) deleteUsuario(u.id);
                          }}
                          title="Eliminar empleado"
                          className="p-1.5 text-zinc-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      ) : (
        /* TAB AUDITORÍA */
        <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Log de Auditoría y Trazabilidad</h3>
              <p className="text-[11px] text-zinc-500">Historial cronológico de cambios, registros y accesos</p>
            </div>
            <History className="w-4 h-4 text-zinc-400" />
          </div>

          <div className="space-y-2.5 max-h-[500px] overflow-y-auto pr-1">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-3.5 rounded-xl border border-zinc-200 bg-zinc-50/50 space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-zinc-900">
                    {log.usuario} <span className="text-[10px] font-normal text-zinc-400">({log.rol})</span>
                  </span>
                  <span className="text-[10px] font-mono text-zinc-400">{log.fecha}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="bg-zinc-200 text-zinc-800 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                    {log.accion}
                  </span>
                  <span className="text-[11px] text-zinc-600 font-semibold">{log.modulo}</span>
                </div>
                <p className="text-[11px] text-zinc-500">{log.detalles}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL ENVIAR CREDENCIALES AL EMPLEADO */}
      {selectedUserShare && (
        <div className="fixed inset-0 z-50 bg-zinc-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full border border-zinc-200 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
                  <Share2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Enviar Credenciales de Acceso</h3>
                  <p className="text-[11px] text-zinc-500">Credenciales listas para {selectedUserShare.nombre}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserShare(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2">
              <label className="block text-[11px] font-bold text-zinc-700">
                Mensaje de invitación y link de acceso:
              </label>
              <textarea
                readOnly
                rows={8}
                value={formatShareMessage(selectedUserShare)}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl p-3 text-[11px] font-mono text-zinc-800 focus:outline-none resize-none leading-relaxed"
              />
            </div>

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
