import React from 'react';
import { FileText, Eye, Trash2, Upload, ExternalLink, Image as ImageIcon, CheckCircle, ZoomIn, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

export interface EvidenceItem {
  id?: string;
  url: string;
  nombre?: string;
  type?: 'image' | 'pdf';
  fecha?: string;
  monto?: number;
}

interface EvidenceGridProps {
  evidencias?: EvidenceItem[];
  evidenciaUrl?: string;
  evidenciaNombre?: string;
  evidenciaType?: 'image' | 'pdf';
  isEditing?: boolean;
  onRemove?: () => void;
  onFileSelect?: (file: File) => void;
  title?: string;
  recordIdentifier?: string;
  compact?: boolean;
}

export const EvidenceGrid: React.FC<EvidenceGridProps> = ({
  evidencias,
  evidenciaUrl,
  evidenciaNombre,
  evidenciaType = 'image',
  isEditing = false,
  onRemove,
  onFileSelect,
  title = 'Evidencias Guardadas',
  recordIdentifier,
  compact = false
}) => {
  const { setPreviewEvidencia } = useApp();

  // Normalize list of evidences
  const items: EvidenceItem[] = React.useMemo(() => {
    if (evidencias && evidencias.length > 0) {
      return evidencias;
    }
    if (evidenciaUrl) {
      return [
        {
          id: 'ev-primary',
          url: evidenciaUrl,
          nombre: evidenciaNombre || 'Ticket / Comprobante',
          type: evidenciaType
        }
      ];
    }
    return [];
  }, [evidencias, evidenciaUrl, evidenciaNombre, evidenciaType]);

  const handleOpenPreview = (item: EvidenceItem) => {
    setPreviewEvidencia({
      url: item.url,
      type: item.type || (item.url.endsWith('.pdf') ? 'pdf' : 'image'),
      title: `${recordIdentifier ? recordIdentifier + ' - ' : ''}${item.nombre || 'Evidencia de Respaldo'}`
    });
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileSelect) {
      onFileSelect(file);
    }
  };

  if (items.length === 0 && !isEditing) {
    return (
      <div className="p-3 bg-zinc-50 border border-dashed border-zinc-200 rounded-xl text-center">
        <ImageIcon className="w-5 h-5 text-zinc-300 mx-auto mb-1" />
        <p className="text-[11px] text-zinc-400 font-medium">Sin evidencias adjuntas</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <ImageIcon className="w-3.5 h-3.5 text-[#024182]" />
          <span className="text-xs font-semibold text-zinc-800">{title}</span>
          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-blue-100 text-[#024182] border border-blue-200">
            {items.length} {items.length === 1 ? 'archivo' : 'archivos'}
          </span>
        </div>
        {items.length > 0 && (
          <span className="text-[10px] text-emerald-600 font-medium flex items-center gap-0.5">
            <CheckCircle className="w-3 h-3 text-emerald-500" />
            Evidencia Lista
          </span>
        )}
      </div>

      {/* EVIDENCE GRID */}
      <div className={`grid gap-2 ${compact ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {items.map((item, idx) => {
          const isPdf = item.type === 'pdf' || item.url.startsWith('data:application/pdf') || item.url.endsWith('.pdf');

          return (
            <div
              key={item.id || idx}
              className="group relative rounded-xl border border-zinc-200/90 bg-white overflow-hidden shadow-xs hover:border-[#024182] hover:shadow-md transition-all flex flex-col"
            >
              {/* Thumbnail Container */}
              <div
                onClick={() => handleOpenPreview(item)}
                className="relative h-28 sm:h-32 bg-zinc-950/5 flex items-center justify-center cursor-pointer overflow-hidden group-hover:bg-zinc-900/5 transition-colors"
              >
                {isPdf ? (
                  <div className="text-center p-3 space-y-1">
                    <FileText className="w-8 h-8 text-rose-500 mx-auto" />
                    <span className="text-[10px] font-bold text-zinc-700 block uppercase">Documento PDF</span>
                    <span className="text-[9px] text-zinc-400">Clic para abrir visor</span>
                  </div>
                ) : (
                  <img
                    src={item.url}
                    alt={item.nombre || 'Evidencia'}
                    className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-200"
                    loading="lazy"
                  />
                )}

                {/* Hover overlay with quick zoom */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <span className="bg-white/95 text-zinc-900 text-[10px] font-bold px-2.5 py-1.5 rounded-lg shadow flex items-center gap-1">
                    <ZoomIn className="w-3.5 h-3.5 text-[#024182]" />
                    Ver Grande
                  </span>
                </div>

                {/* Badge file type */}
                <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase shadow-xs bg-white/90 text-zinc-800 backdrop-blur-xs">
                  {isPdf ? 'PDF' : 'FOTO'}
                </span>
              </div>

              {/* Info & Actions footer */}
              <div className="p-2 bg-zinc-50/90 border-t border-zinc-100 flex items-center justify-between gap-1 text-[11px]">
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-zinc-800 truncate text-[11px]" title={item.nombre}>
                    {item.nombre || (isPdf ? 'Documento Fiscal.pdf' : 'Ticket_Evidencia.jpg')}
                  </p>
                  {item.monto && (
                    <span className="text-[10px] font-bold text-emerald-700">
                      ${item.monto.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => handleOpenPreview(item)}
                    title="Ver pantalla completa"
                    className="p-1 rounded-lg hover:bg-zinc-200 text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                  </button>

                  {isEditing && onRemove && (
                    <button
                      type="button"
                      onClick={onRemove}
                      title="Eliminar evidencia"
                      className="p-1 rounded-lg hover:bg-rose-100 text-rose-500 hover:text-rose-700 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {/* Upload Slot if editing and onFileSelect is provided */}
        {isEditing && onFileSelect && (
          <div className="relative rounded-xl border-2 border-dashed border-zinc-200 hover:border-[#024182] hover:bg-blue-50/20 transition-all p-3 text-center flex flex-col items-center justify-center min-h-[112px] bg-zinc-50/40">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileInput}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <Upload className="w-5 h-5 text-zinc-400 mb-1 group-hover:text-[#024182]" />
            <span className="text-[11px] font-semibold text-zinc-700">
              {items.length > 0 ? 'Cambiar / Reemplazar' : 'Subir Evidencia'}
            </span>
            <span className="text-[9px] text-zinc-400">JPG, PNG o PDF</span>
          </div>
        )}
      </div>
    </div>
  );
};
