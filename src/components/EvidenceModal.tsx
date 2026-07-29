import React from 'react';
import { X, Download, FileText, ExternalLink } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const EvidenceModal: React.FC = () => {
  const { previewEvidencia, setPreviewEvidencia } = useApp();

  if (!previewEvidencia) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl relative max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-zinc-100 shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-zinc-500" />
            <h3 className="text-sm font-semibold text-zinc-900">
              {previewEvidencia.title || 'Visor de Evidencia Adjunta'}
            </h3>
          </div>
          <button
            onClick={() => setPreviewEvidencia(null)}
            className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Preview */}
        <div className="flex-1 overflow-auto rounded-xl bg-zinc-900/5 p-2 border border-zinc-200/80 flex items-center justify-center min-h-[300px]">
          {previewEvidencia.type === 'pdf' ? (
            <div className="text-center p-8 space-y-3">
              <FileText className="w-12 h-12 text-zinc-400 mx-auto" />
              <p className="text-xs font-semibold text-zinc-800">Documento PDF Adjunto</p>
              <a
                href={previewEvidencia.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-zinc-800 cursor-pointer"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Abrir PDF en Nueva Pestaña</span>
              </a>
            </div>
          ) : (
            <img
              src={previewEvidencia.url}
              alt="Evidencia ticket / factura"
              className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-xs"
            />
          )}
        </div>

        {/* Footer */}
        <div className="flex justify-end shrink-0 pt-2 border-t border-zinc-100">
          <button
            onClick={() => setPreviewEvidencia(null)}
            className="bg-zinc-900 text-white text-xs font-medium px-4 py-2 rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
};
