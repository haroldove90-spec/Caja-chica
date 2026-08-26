import React, { useState, useRef } from 'react';
import { User, Building, Mail, Phone, MapPin, FileCheck, Save, CheckCircle2, Camera, Trash2, Upload, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClientePerfil: React.FC = () => {
  const { clienteProfile, updateClienteProfile } = useApp();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [formData, setFormData] = useState({
    nombre: clienteProfile.nombre || '',
    email: clienteProfile.email || '',
    telefono: clienteProfile.telefono || '',
    empresa: clienteProfile.empresa || '',
    rfc: clienteProfile.rfc || '',
    direccion: clienteProfile.direccion || '',
    fotoUrl: clienteProfile.fotoUrl || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setSavedSuccess(false);
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
    updateClienteProfile(formData);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Photo Avatar */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="relative group">
            {formData.fotoUrl ? (
              <img
                src={formData.fotoUrl}
                alt="Foto de Perfil"
                className="w-16 h-16 rounded-2xl object-cover border-2 border-[#024182] shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-[#024182] text-white flex items-center justify-center font-bold text-2xl shadow-md">
                {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : 'C'}
              </div>
            )}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1.5 -right-1.5 p-1.5 bg-zinc-900 text-white rounded-xl shadow hover:bg-zinc-800 transition-transform active:scale-95 cursor-pointer"
              title="Subir o cambiar fotografía"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Perfil del Cliente
            </h1>
            <p className="text-xs text-zinc-500">
              Consulte y actualice sus datos personales, fotografía y datos fiscales
            </p>
          </div>
        </div>

        {savedSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Datos guardados correctamente!</span>
          </div>
        )}
      </div>

      {/* Profile Form Card */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-6 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-[#024182]" />
            <h2 className="text-sm font-semibold text-zinc-900">Datos Personales y Fotografía</h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">Rol: Cliente</span>
        </div>

        <div className="p-6 space-y-6">
          {/* Subir Fotografía del Usuario */}
          <div className="p-4 rounded-xl border border-zinc-200 bg-zinc-50/60 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              {formData.fotoUrl ? (
                <img
                  src={formData.fotoUrl}
                  alt="Avatar Perfil"
                  className="w-14 h-14 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
                />
              ) : (
                <div className="w-14 h-14 rounded-full bg-zinc-200 text-zinc-600 flex items-center justify-center font-bold text-lg">
                  <User className="w-6 h-6 text-zinc-400" />
                </div>
              )}
              <div>
                <p className="text-xs font-semibold text-zinc-900">Fotografía de Perfil</p>
                <p className="text-[11px] text-zinc-500">Formatos permitidos: JPG, PNG o WebP (Max 5MB)</p>
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
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-zinc-300 hover:bg-zinc-100 text-zinc-800 text-xs font-semibold rounded-xl transition-all shadow-xs cursor-pointer"
              >
                <Upload className="w-3.5 h-3.5 text-zinc-600" />
                <span>{formData.fotoUrl ? 'Cambiar Fotografía' : 'Subir Fotografía'}</span>
              </button>

              {formData.fotoUrl && (
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-2 text-rose-600 hover:bg-rose-50 border border-rose-200 rounded-xl transition-all cursor-pointer"
                  title="Eliminar Fotografía"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Nombre Completo */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-zinc-400" />
                Nombre Completo *
              </label>
              <input
                type="text"
                name="nombre"
                required
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej. Alejandro Morales Ruíz"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>

            {/* Correo Electrónico */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-zinc-400" />
                Correo Electrónico *
              </label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="ejemplo@correo.com"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>

            {/* Teléfono */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-zinc-400" />
                Teléfono de Contacto
              </label>
              <input
                type="text"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                placeholder="Ej. 9931234567"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>

            {/* Empresa / Razon Social */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-zinc-400" />
                Empresa / Razón Social
              </label>
              <input
                type="text"
                name="empresa"
                value={formData.empresa}
                onChange={handleChange}
                placeholder="Ej. Constructora del Sur S.A."
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>

            {/* RFC */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5 text-zinc-400" />
                RFC Fiscal
              </label>
              <input
                type="text"
                name="rfc"
                value={formData.rfc}
                onChange={handleChange}
                placeholder="Ej. CPS180512AB3"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-mono font-medium text-zinc-900 uppercase focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>

            {/* Dirección */}
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                Dirección Fiscal / Ubicación
              </label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleChange}
                placeholder="Av. Principal #100, Col. Centro"
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-zinc-900 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-50/80 border-t border-zinc-100 flex items-center justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-semibold px-5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Guardar Datos y Fotografía</span>
          </button>
        </div>
      </form>
    </div>
  );
};
