import React, { useState } from 'react';
import { Download, Smartphone, Check, HelpCircle, X, Share2, PlusSquare } from 'lucide-react';
import { usePwaInstall } from '../hooks/usePwaInstall';

interface PwaInstallButtonProps {
  variant?: 'home' | 'nav' | 'compact';
  className?: string;
}

export const PwaInstallButton: React.FC<PwaInstallButtonProps> = ({ variant = 'nav', className = '' }) => {
  const { isInstallable, isInstalled, installApp } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as unknown as { MSStream?: unknown }).MSStream;

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await installApp();
      if (!installed) {
        setShowInstructions(true);
      }
    } else {
      setShowInstructions(true);
    }
  };

  if (isInstalled) {
    if (variant === 'compact') return null;
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
        <Check className="w-3.5 h-3.5 text-emerald-600" />
        <span>App Instalada</span>
      </div>
    );
  }

  return (
    <>
      {variant === 'home' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full inline-flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl bg-gradient-to-r from-blue-700 via-blue-800 to-indigo-900 text-white text-xs font-bold shadow-md hover:shadow-lg hover:from-blue-800 hover:to-indigo-950 transition-all cursor-pointer ${className}`}
        >
          <div className="w-6 h-6 rounded-lg bg-white/15 flex items-center justify-center shrink-0">
            <Smartphone className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="truncate">Instalar Proyecta Digital en mi Dispositivo</span>
          <Download className="w-4 h-4 ml-auto text-blue-200" />
        </button>
      )}

      {variant === 'nav' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`w-full flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-blue-900 bg-blue-50/90 border border-blue-200 hover:bg-blue-100 hover:border-blue-300 transition-all cursor-pointer shadow-2xs ${className}`}
          title="Instalar como Aplicación Web Progresiva"
        >
          <div className="flex items-center gap-2 truncate">
            <Smartphone className="w-3.5 h-3.5 text-blue-700 shrink-0" />
            <span className="truncate">Instalar Aplicación</span>
          </div>
          <span className="text-[10px] bg-blue-700 text-white font-bold px-1.5 py-0.5 rounded-md shrink-0">
            PWA
          </span>
        </button>
      )}

      {variant === 'compact' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`p-1.5 rounded-lg text-blue-700 hover:text-blue-950 hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold ${className}`}
          title="Instalar App en este Navegador"
        >
          <Download className="w-3.5 h-3.5 text-blue-700" />
          <span className="hidden sm:inline">Instalar</span>
        </button>
      )}

      {/* Manual Install instructions modal for iOS / Desktop where prompt is not auto-available */}
      {showInstructions && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-zinc-200 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900">Instalar Proyecta Digital</h3>
                  <p className="text-[11px] text-zinc-500">Acceso rápido sin barra del navegador</p>
                </div>
              </div>
              <button
                onClick={() => setShowInstructions(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-zinc-600">
              {isIOS ? (
                <div className="bg-amber-50 border border-amber-200/80 rounded-xl p-3.5 space-y-2 text-amber-950">
                  <p className="font-semibold flex items-center gap-1.5 text-amber-900">
                    <Share2 className="w-4 h-4 text-amber-700" /> En iPhone o iPad (Safari):
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Presiona el botón <strong>Compartir</strong> <span className="inline-block px-1 bg-white border border-amber-300 rounded text-[11px]">📤</span> en la barra inferior de Safari.</li>
                    <li>Desplázate hacia abajo y selecciona <strong>"Agregar a pantalla de inicio"</strong> <PlusSquare className="w-3.5 h-3.5 inline text-amber-700" />.</li>
                    <li>Pulsa <strong>"Agregar"</strong> en la esquina superior derecha.</li>
                  </ol>
                </div>
              ) : (
                <div className="bg-blue-50 border border-blue-200/80 rounded-xl p-3.5 space-y-2 text-blue-950">
                  <p className="font-semibold flex items-center gap-1.5 text-blue-900">
                    <HelpCircle className="w-4 h-4 text-blue-700" /> En Chrome, Edge o Android:
                  </p>
                  <ol className="list-decimal list-inside space-y-1 text-xs">
                    <li>Busca el ícono de <strong>Instalar Aplicación</strong> (🖥️ o ⬇️) en la barra de direcciones del navegador.</li>
                    <li>O bien abre el menú de tres puntos <span className="font-bold">⋮</span> y selecciona <strong>"Instalar Proyecta Digital"</strong> o <strong>"Agregar a la pantalla principal"</strong>.</li>
                    <li>Confirma para que se guarde como app nativa en tu escritorio o celular.</li>
                  </ol>
                </div>
              )}

              <div className="flex items-center gap-3 pt-2">
                <img
                  src="https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyectaicono.png"
                  alt="Icono Proyecta Digital"
                  className="w-12 h-12 rounded-xl border border-zinc-200 shadow-xs shrink-0"
                />
                <div className="text-[11px] leading-relaxed text-zinc-500">
                  Al instalarla disfrutarás de pantalla completa, carga instantánea y funcionamiento continuo incluso con conexión lenta.
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={() => setShowInstructions(false)}
                className="w-full py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-semibold hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
