import React, { useState, useRef } from 'react';
import { Fuel, Camera, Upload, Send, CheckCircle2, History, Eye, Truck, AlertCircle, X, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ComprobanteCombustibleCliente } from '../types';

export const ClienteCombustible: React.FC = () => {
  const {
    activeCajaId,
    clienteProfile,
    comprobantesCombustibleCliente,
    addComprobanteCombustibleCliente,
    setPreviewEvidencia,
    setPdfGasolinaModalData
  } = useApp();

  // Form state - Empty by default so user can fill in from scratch
  const [vehiculo, setVehiculo] = useState('');
  const [placas, setPlacas] = useState('');
  const [estacion, setEstacion] = useState('');
  const [tipoCombustible, setTipoCombustible] = useState('Magna');
  const [litros, setLitros] = useState<number | ''>('');
  const [importe, setImporte] = useState<number | ''>('');
  const [observaciones, setObservaciones] = useState('');
  
  // Camera & photo evidence
  const [evidenciaUrl, setEvidenciaUrl] = useState<string>('');
  const [evidenciaNombre, setEvidenciaNombre] = useState<string>('');
  const [subiendoFoto, setSubiendoFoto] = useState<boolean>(false);
  const [sentSuccess, setSentSuccess] = useState<boolean>(false);

  // Live Camera state
  const [showLiveCameraModal, setShowLiveCameraModal] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const cameraInputRef = useRef<HTMLInputElement | null>(null);
  const galleryInputRef = useRef<HTMLInputElement | null>(null);

  const startLiveCamera = async () => {
    setShowLiveCameraModal(true);
    setCameraError(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err: any) {
      console.warn('Error accessing camera:', err);
      setCameraError('No se pudo acceder a la cámara. Por favor otorgue permisos a la aplicación o utilice la opción de subir imagen.');
    }
  };

  const stopLiveCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    setShowLiveCameraModal(false);
  };

  const captureCameraSnapshot = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setEvidenciaUrl(dataUrl);
      setEvidenciaNombre(`ticket_camara_${Date.now()}.jpg`);
      stopLiveCamera();
    }
  };

  // Filter client's records
  const myRecords = comprobantesCombustibleCliente.filter(
    c => c.clienteId === clienteProfile.id || c.clienteNombre === clienteProfile.nombre
  );

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSubiendoFoto(true);
      setEvidenciaNombre(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setEvidenciaUrl(reader.result as string);
        setSubiendoFoto(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClearPhoto = () => {
    setEvidenciaUrl('');
    setEvidenciaNombre('');
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!evidenciaUrl) {
      alert('Por favor tome o suba una foto del ticket de combustible antes de enviar.');
      return;
    }
    if (!importe || Number(importe) <= 0) {
      alert('Por favor ingrese un importe válido.');
      return;
    }

    const now = new Date();
    const fechaStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

    addComprobanteCombustibleCliente({
      cajaId: activeCajaId,
      clienteId: clienteProfile.id || 'cli-001',
      clienteNombre: clienteProfile.nombre || 'Cliente Registrado',
      fecha: fechaStr,
      vehiculo,
      placas,
      estacion,
      tipoCombustible,
      litros: litros ? Number(litros) : undefined,
      importe: Number(importe),
      evidenciaUrl,
      evidenciaType: 'image',
      observaciones
    });

    setSentSuccess(true);
    // Reset form after successful submission
    setVehiculo('');
    setPlacas('');
    setEstacion('');
    setTipoCombustible('Magna');
    setLitros('');
    setImporte('');
    setObservaciones('');
    setEvidenciaUrl('');
    setEvidenciaNombre('');
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';

    setTimeout(() => setSentSuccess(false), 4000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-zinc-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-[#024182] text-white flex items-center justify-center font-bold text-xl shadow-md">
            <Fuel className="w-7 h-7" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 tracking-tight">
              Comprobantes de Combustible
            </h1>
            <p className="text-xs text-zinc-500">
              Registre sus cargas de gasolina, capture la foto del ticket con la cámara de su móvil y envíelas al Custodio de Caja.
            </p>
          </div>
        </div>

        {sentSuccess && (
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold rounded-xl animate-fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>¡Comprobante enviado al Custodio!</span>
          </div>
        )}
      </div>

      {/* Main Form: Grid Inputs + Photo Capture + Submit Action */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form Column */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden flex flex-col">
            <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Fuel className="w-4 h-4 text-[#024182]" />
                <h2 className="text-sm font-semibold text-zinc-900">Registrar Carga de Combustible</h2>
              </div>
              <span className="text-[11px] font-mono text-zinc-500">
                Cliente: {clienteProfile.nombre}
              </span>
            </div>

            <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Vehículo */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Vehículo / Marca *
                    </label>
                    <input
                      type="text"
                      required
                      value={vehiculo}
                      onChange={(e) => setVehiculo(e.target.value)}
                      placeholder="Ej. Nissan NP300 2023"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>

                  {/* Placas */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Placas / ID Vehículo
                    </label>
                    <input
                      type="text"
                      value={placas}
                      onChange={(e) => setPlacas(e.target.value)}
                      placeholder="Ej. VS-4580-B"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Tipo de Combustible */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Tipo Combustible *
                    </label>
                    <select
                      value={tipoCombustible}
                      onChange={(e) => setTipoCombustible(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white"
                    >
                      <option value="Magna">Magna (Verde)</option>
                      <option value="Premium">Premium (Roja)</option>
                      <option value="Diesel">Diesel (Negro)</option>
                    </select>
                  </div>

                  {/* Litros */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Litros Cargados
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={litros}
                      onChange={(e) => setLitros(e.target.value ? Number(e.target.value) : '')}
                      placeholder="Ej. 40"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>

                  {/* Importe Total $ */}
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">
                      Importe Total ($) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={importe}
                      onChange={(e) => setImporte(e.target.value ? Number(e.target.value) : '')}
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 font-mono focus:outline-none focus:border-zinc-900 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Estación de Servicio */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Estación de Servicio / Gasolinera
                  </label>
                  <input
                    type="text"
                    value={estacion}
                    onChange={(e) => setEstacion(e.target.value)}
                    placeholder="Ej. Pemex Servicio Tabasco Est. 4521"
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white"
                  />
                </div>

                {/* Observaciones */}
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 mb-1">
                    Observaciones / Motivo del viaje
                  </label>
                  <textarea
                    rows={2}
                    value={observaciones}
                    onChange={(e) => setObservaciones(e.target.value)}
                    placeholder="Ej. Carga de combustible para traslado a proyecto sur..."
                    className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:border-zinc-900 focus:bg-white resize-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Camera / Photo Capture Column */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-zinc-200/80 shadow-xs p-5 flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100 mb-4">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-[#024182]" />
                <h2 className="text-sm font-semibold text-zinc-900">Foto del Ticket de Combustible</h2>
              </div>
              <span className="text-[10px] text-zinc-400 font-medium">Requerido</span>
            </div>

            <p className="text-xs text-zinc-500 mb-4">
              Utilice la cámara de su dispositivo móvil o suba una foto clara del ticket de compra.
            </p>

            {/* Hidden HTML Inputs for Camera & File Gallery */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
              id="mobile-ticket-camera-input"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="mobile-ticket-gallery-input"
            />

            {/* Photo Preview / Upload Area */}
            <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-zinc-300 rounded-2xl bg-zinc-50 p-4 relative min-h-[220px]">
              {subiendoFoto ? (
                <div className="text-center space-y-2 py-8">
                  <div className="w-8 h-8 border-2 border-[#024182] border-t-transparent rounded-full animate-spin mx-auto"></div>
                  <p className="text-xs text-zinc-500 font-medium">Cargando foto del ticket...</p>
                </div>
              ) : evidenciaUrl ? (
                <div className="relative w-full h-full flex flex-col items-center justify-center">
                  <img
                    src={evidenciaUrl}
                    alt="Ticket de combustible"
                    className="max-h-[200px] w-auto object-contain rounded-xl shadow-md border border-zinc-200 cursor-pointer"
                    onClick={() => setPreviewEvidencia({ url: evidenciaUrl, type: 'image', title: 'Ticket de Combustible Capturado' })}
                  />
                  <button
                    type="button"
                    onClick={handleClearPhoto}
                    className="absolute top-1 right-1 bg-rose-600 text-white p-1.5 rounded-full shadow-md hover:bg-rose-700 transition-colors cursor-pointer"
                    title="Eliminar foto"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewEvidencia({ url: evidenciaUrl, type: 'image', title: 'Ticket de Combustible Capturado' })}
                      className="text-xs font-semibold text-[#024182] hover:underline flex items-center gap-1"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Ver imagen ampliada / Zoom</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-3 py-6">
                  <div className="w-14 h-14 rounded-full bg-blue-50 text-[#024182] flex items-center justify-center mx-auto border border-blue-100">
                    <Camera className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-zinc-800">Adjuntar Ticket de Compra</p>
                    <p className="text-[11px] text-zinc-400 max-w-[220px] mx-auto">
                      Tome una foto directa con la cámara de su móvil o elija un archivo existente.
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={startLiveCamera}
                      className="inline-flex items-center gap-1.5 bg-[#024182] hover:bg-[#013266] text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Cámara en Vivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Camera className="w-4 h-4" />
                      <span>Cámara Nativa Móvil</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => galleryInputRef.current?.click()}
                      className="inline-flex items-center gap-1.5 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                    >
                      <Upload className="w-4 h-4" />
                      <span>Subir de Galería</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
              {evidenciaUrl ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => cameraInputRef.current?.click()}
                    className="text-xs font-semibold text-[#024182] hover:text-[#013266] flex items-center gap-1"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Tomar Otra</span>
                  </button>
                  <span className="text-zinc-300">•</span>
                  <button
                    type="button"
                    onClick={() => galleryInputRef.current?.click()}
                    className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 flex items-center gap-1"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Cambiar Imagen</span>
                  </button>
                </div>
              ) : (
                <span className="text-xs text-zinc-400">Sin foto seleccionada aún</span>
              )}
              {evidenciaNombre && (
                <span className="text-[10px] font-mono text-zinc-400 truncate max-w-[140px]">
                  {evidenciaNombre}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Action Button Section AFTER the photo capture card */}
        <div className="bg-white p-4 rounded-2xl border border-zinc-200/80 shadow-xs flex justify-end items-center">
          <button
            type="submit"
            className="flex items-center gap-2 bg-[#024182] hover:bg-[#013266] text-white text-xs sm:text-sm font-semibold px-8 py-3 rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar Comprobante al Custodio</span>
          </button>
        </div>
      </form>

      {/* Submitted Fuel Tickets History Table */}
      <div className="bg-white rounded-2xl border border-zinc-200/80 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-[#024182]" />
            <h2 className="text-sm font-semibold text-zinc-900">Mis Comprobantes de Combustible Enviados</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-zinc-500">
              Total: {myRecords.length}
            </span>
            {myRecords.length > 0 && (
              <button
                type="button"
                onClick={() => setPdfGasolinaModalData({
                  list: myRecords.map(r => ({
                    id: r.id,
                    cajaId: r.cajaId || 'caja-1',
                    vehiculoId: 'v-cliente',
                    fecha: r.fecha,
                    formaPago: 'Efectivo',
                    descripcionUso: `Carga ${r.tipoCombustible} - ${r.vehiculo}`,
                    nivelAntes: 2,
                    nivelDespues: 8,
                    km: 0,
                    importe: r.importe
                  })),
                  vehiculo: `CLIENTE ${clienteProfile.nombre.toUpperCase()}`
                })}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#024182] hover:bg-[#013266] text-white rounded-xl text-xs font-bold cursor-pointer transition-all shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Ver PDF Mis Cargas</span>
              </button>
            )}
          </div>
        </div>

        {myRecords.length === 0 ? (
          <div className="p-12 text-center space-y-2">
            <Fuel className="w-10 h-10 text-zinc-300 mx-auto" />
            <p className="text-xs font-semibold text-zinc-600">No ha registrado comprobantes de combustible aún</p>
            <p className="text-[11px] text-zinc-400">Complete el formulario arriba y adjunte la foto de su ticket.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-100/70 text-zinc-600 text-[11px] font-semibold uppercase tracking-wider border-b border-zinc-200">
                  <th className="p-3">Fecha</th>
                  <th className="p-3">Vehículo / Placas</th>
                  <th className="p-3">Estación</th>
                  <th className="p-3">Tipo</th>
                  <th className="p-3 text-right">Litros</th>
                  <th className="p-3 text-right">Importe</th>
                  <th className="p-3 text-center">Ticket Foto</th>
                  <th className="p-3 text-center">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-xs text-zinc-800 font-medium">
                {myRecords.map((rec) => (
                  <tr key={rec.id} className="hover:bg-zinc-50/80 transition-colors">
                    <td className="p-3 font-mono text-zinc-600">{rec.fecha}</td>
                    <td className="p-3 font-semibold text-zinc-900">
                      <div>{rec.vehiculo}</div>
                      {rec.placas && <div className="text-[10px] font-mono text-zinc-500">{rec.placas}</div>}
                    </td>
                    <td className="p-3 text-zinc-600">{rec.estacion || 'Gasolinera'}</td>
                    <td className="p-3">
                      <span className={`inline-block px-2 py-0.5 rounded-md text-[10px] font-bold ${
                        rec.tipoCombustible === 'Magna' ? 'bg-emerald-100 text-emerald-800' :
                        rec.tipoCombustible === 'Premium' ? 'bg-rose-100 text-rose-800' :
                        'bg-zinc-200 text-zinc-800'
                      }`}>
                        {rec.tipoCombustible}
                      </span>
                    </td>
                    <td className="p-3 text-right font-mono">{rec.litros ? `${rec.litros} L` : '-'}</td>
                    <td className="p-3 text-right font-bold text-zinc-900 font-mono">
                      ${rec.importe.toFixed(2)}
                    </td>
                    <td className="p-3 text-center">
                      {rec.evidenciaUrl ? (
                        <button
                          type="button"
                          onClick={() => setPreviewEvidencia({ url: rec.evidenciaUrl, type: 'image', title: `Ticket Combustible - ${rec.vehiculo} ($${rec.importe.toFixed(2)})` })}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-[#024182] hover:bg-blue-100 rounded-lg text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Ver / Zoom</span>
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400">Sin foto</span>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide ${
                        rec.estado === 'aprobado' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' :
                        rec.estado === 'rechazado' ? 'bg-rose-100 text-rose-800 border border-rose-200' :
                        rec.estado === 'revisado' ? 'bg-blue-100 text-blue-800 border border-blue-200' :
                        'bg-amber-100 text-amber-800 border border-amber-200'
                      }`}>
                        {rec.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Live Camera Stream Modal */}
      {showLiveCameraModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-zinc-200">
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-blue-400 animate-pulse" />
                <h3 className="text-sm font-bold">Cámara en Vivo - Capturar Ticket</h3>
              </div>
              <button
                type="button"
                onClick={stopLiveCamera}
                className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-zinc-950 flex flex-col items-center justify-center min-h-[300px] relative">
              {cameraError ? (
                <div className="text-center p-6 space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
                  <p className="text-xs text-rose-300 font-medium">{cameraError}</p>
                  <button
                    type="button"
                    onClick={() => {
                      stopLiveCamera();
                      cameraInputRef.current?.click();
                    }}
                    className="mt-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    Abrir Cámara Nativa del Móvil
                  </button>
                </div>
              ) : (
                <div className="relative w-full rounded-xl overflow-hidden bg-black flex items-center justify-center">
                  <video
                    ref={videoRef}
                    playsInline
                    muted
                    className="w-full max-h-[360px] object-cover rounded-xl"
                  />
                  <div className="absolute inset-0 border-2 border-dashed border-white/40 pointer-events-none rounded-xl m-4 flex items-center justify-center">
                    <span className="text-[10px] text-white/70 bg-black/50 px-2 py-1 rounded-md backdrop-blur-xs">
                      Encuadre el ticket de combustible aquí
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-zinc-100 p-4 flex items-center justify-between">
              <button
                type="button"
                onClick={stopLiveCamera}
                className="px-4 py-2 text-xs font-semibold text-zinc-700 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer"
              >
                Cancelar
              </button>
              {!cameraError && (
                <button
                  type="button"
                  onClick={captureCameraSnapshot}
                  className="inline-flex items-center gap-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  <Camera className="w-4 h-4" />
                  <span>Capturar Foto del Ticket</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
