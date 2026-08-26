import React, { useState } from 'react';
import { X, FileText, ExternalLink, ZoomIn, ZoomOut, RotateCw, RefreshCw, Download, Printer } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EvidenceModal: React.FC = () => {
  const { previewEvidencia, setPreviewEvidencia } = useApp();
  const [zoom, setZoom] = useState<number>(1);
  const [rotation, setRotation] = useState<number>(0);

  if (!previewEvidencia) return null;

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.5, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);
  const handleReset = () => {
    setZoom(1);
    setRotation(0);
  };

  const handleClose = () => {
    setZoom(1);
    setRotation(0);
    setPreviewEvidencia(null);
  };

  const handleDownload = () => {
    if (!previewEvidencia.url) return;
    const a = document.createElement('a');
    a.href = previewEvidencia.url;
    a.download = (previewEvidencia.title || 'evidencia_ticket').replace(/[^a-zA-Z0-9_-]/g, '_') + (previewEvidencia.type === 'pdf' ? '.pdf' : '.jpg');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-4xl w-full p-4 sm:p-5 space-y-3 shadow-2xl relative max-h-[92vh] flex flex-col border border-zinc-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#024182]" />
            <h3 className="text-xs sm:text-sm font-semibold text-zinc-900 truncate">
              {previewEvidencia.title || 'Visor de Evidencia Ticket / Factura'}
            </h3>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleDownload}
              title="Descargar Evidencia"
              className="p-1.5 rounded-lg text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar for Image Preview Zoom & Rotate */}
        {previewEvidencia.type !== 'pdf' && (
          <div className="flex items-center justify-between bg-zinc-100 px-3 py-1.5 rounded-xl text-xs shrink-0">
            <span className="text-[11px] font-medium text-zinc-600">
              Zoom: <strong className="text-zinc-900">{Math.round(zoom * 100)}%</strong> | Rotación: <strong className="text-zinc-900">{rotation}°</strong>
            </span>
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                type="button"
                onClick={handleZoomOut}
                title="Alejar (Zoom Out)"
                className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomIn}
                title="Acercar (Zoom In)"
                className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRotate}
                title="Rotar 90°"
                className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                <RotateCw className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleReset}
                title="Restablecer vista"
                className="p-1.5 rounded-lg bg-white border border-zinc-200 hover:bg-zinc-200 text-zinc-700 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Content Preview Container */}
        <div className="flex-1 overflow-auto rounded-xl bg-zinc-950/90 p-4 border border-zinc-200 flex items-center justify-center min-h-[320px] max-h-[65vh] relative">
          {previewEvidencia.type === 'pdf' ? (
            <div className="text-center p-8 space-y-3 bg-white rounded-xl max-w-sm">
              <FileText className="w-12 h-12 text-rose-500 mx-auto" />
              <p className="text-xs font-bold text-zinc-900">Documento PDF Adjunto</p>
              <p className="text-[11px] text-zinc-500">Puedes visualizar el PDF o abrirlo en una nueva pestaña</p>
              <a
                href={previewEvidencia.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-[#024182] text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-[#013266] cursor-pointer shadow-sm"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir PDF Completo</span>
              </a>
            </div>
          ) : (
            <div className="transition-transform duration-200 ease-out flex items-center justify-center w-full h-full overflow-auto">
              <img
                src={previewEvidencia.url}
                alt="Evidencia ticket"
                style={{
                  transform: `scale(${zoom}) rotate(${rotation}deg)`,
                  transformOrigin: 'center center'
                }}
                className="max-h-[55vh] max-w-full object-contain shadow-2xl transition-all rounded-lg"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between shrink-0 pt-2 border-t border-zinc-100 text-xs">
          <span className="text-[11px] text-zinc-500">
            Haga clic en la imagen o use la barra para ampliar detalles
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-medium px-3 py-2 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar</span>
            </button>
            <button
              onClick={handleClose}
              className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              Cerrar Visor
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
