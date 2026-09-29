import React from 'react';
import { Image as ImageIcon, CheckCircle2, Ban } from 'lucide-react';
import { LOGOS_DISPONIBLES, LogoOption } from '../constants/logos';

interface LogoSelectorProps {
  selectedLogoId: string;
  onSelectLogo: (logo: LogoOption) => void;
}

export const LogoSelector: React.FC<LogoSelectorProps> = ({ selectedLogoId, onSelectLogo }) => {
  return (
    <div className="bg-zinc-50 border border-zinc-200/90 rounded-xl p-3 print:hidden space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-800">
          <ImageIcon className="w-4 h-4 text-[#024182]" />
          <span>Seleccionar Logotipo para el PDF / Impresión:</span>
        </div>
        <span className="text-[10px] text-zinc-400 font-medium">
          Seleccione una opción antes de guardar o imprimir
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {LOGOS_DISPONIBLES.map((logo) => {
          const isSelected = selectedLogoId === logo.id;
          return (
            <button
              type="button"
              key={logo.id}
              onClick={() => onSelectLogo(logo)}
              title={logo.nombre}
              className={`relative flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-white border-[#024182] shadow-xs ring-2 ring-[#024182]/20'
                  : 'bg-white/60 border-zinc-200 hover:border-zinc-400 hover:bg-white'
              }`}
            >
              {isSelected && (
                <CheckCircle2 className="w-3.5 h-3.5 text-[#024182] absolute top-1 right-1" />
              )}

              <div className="h-10 w-full flex items-center justify-center">
                {logo.url ? (
                  <img
                    src={logo.url}
                    alt={logo.nombre}
                    className="max-h-9 max-w-[85%] object-contain"
                  />
                ) : (
                  <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-medium">
                    <Ban className="w-4 h-4" />
                    <span>Sin Logo</span>
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
