import React, { useState } from 'react';
import { User, Building, Mail, Phone, MapPin, FileCheck, Save, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ClientePerfil: React.FC = () => {
  const { clienteProfile, updateClienteProfile } = useApp();

  const [formData, setFormData] = useState({
    nombre: clienteProfile.nombre || '',
    email: clienteProfile.email || '',
    telefono: clienteProfile.telefono || '',
    empresa: clienteProfile.empresa || '',
    rfc: clienteProfile.rfc || '',
    direccion: clienteProfile.direccion || ''
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#024182] text-white flex items-center justify-center font-bold text-xl shadow-md">
            {formData.nombre ? formData.nombre.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Perfil del Cliente
            </h1>
            <p className="text-xs text-zinc-500">
              Consulte y actualice sus datos personales y fiscales de facturación
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
            <h2 className="text-sm font-semibold text-zinc-900">Datos Personales y de Contacto</h2>
          </div>
          <span className="text-[11px] font-medium text-zinc-400">Rol: Cliente</span>
        </div>

        <div className="p-6 space-y-5">
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
            <span>Guardar Datos del Perfil</span>
          </button>
        </div>
      </form>
    </div>
  );
};
