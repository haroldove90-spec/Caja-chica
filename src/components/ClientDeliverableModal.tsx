import React, { useState } from 'react';
import { X, Printer, CheckCircle2, FileText, Download, ShieldCheck, Zap, Layers, RefreshCw } from 'lucide-react';
import { LogoSelector } from './LogoSelector';
import { LOGOS_DISPONIBLES } from '../constants/logos';

interface ClientDeliverableModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ClientDeliverableModal: React.FC<ClientDeliverableModalProps> = ({ isOpen, onClose }) => {
  const [selectedLogoId, setSelectedLogoId] = useState<string>('proyecta');

  if (!isOpen) return null;

  const activeLogo = LOGOS_DISPONIBLES.find(l => l.id === selectedLogoId);

  const handlePrint = () => {
    window.print();
  };

  const checklistItems = [
    {
      title: '1. Inyecciones de Fondo Automáticas al Saldo',
      tag: 'FINANZAS & FLUJO',
      desc: 'Al registrar un abono o inyección de recursos, el saldo disponible de la caja seleccionada se incrementa de manera automática e instantánea. El formulario de "Ajuste de Fondo Base" queda reservado exclusivamente para cambios formales en el límite contractual o estructural de la caja chica.',
      status: 'Implementado y Verificado',
      modules: 'Módulo Inyecciones (Contador), Consulta de Fondo (Custodio)'
    },
    {
      title: '2. Reporte Mensual de Inyecciones y Abonos de Fondo',
      tag: 'REPORTES & AUDITORÍA',
      desc: 'Módulo y visualizador mensual con filtros por mes, año y caja chica. Proporciona métricas de total inyectado, conteo de abonos, promedio por inyección, tabla detallada con concepto/responsable y exportación a PDF con membrete corporativo e informe para el Contador.',
      status: 'Implementado y Verificado',
      modules: 'Reportes (Contador), Inyecciones de Fondo (Contador)'
    },
    {
      title: '3. Cajas Operativas sin Fondo Fijo (Flujo Semanal)',
      tag: 'MULTI-CAJA & OPERACIONES',
      desc: 'Soporte para cajas sin fondo asignado previo (ej. Taller Proyecta), donde el sistema opera registrando y acumulando los gastos en efectivo de la semana para generar su reembolso directo, sin exigir saldo disponible ni límite base.',
      status: 'Implementado y Verificado',
      modules: 'Multi-Cajas (Admin), Consulta y Movimientos (Custodio), Solicitud de Cierre'
    },
    {
      title: '4. Número / Folio de Reembolso Totalmente Personalizable',
      tag: 'CONTROL DE COMPROBANTES',
      desc: 'Al solicitar el corte y reembolso en Cierre de Caja, el custodio o contador puede editar manualmente el folio (ej. REEMB-2026-001, CORTE-SEM-35) adaptándolo a los códigos internos de la organización.',
      status: 'Implementado y Verificado',
      modules: 'Cierre de Caja (Custodio), Auditoría (Contador)'
    },
    {
      title: '5. Restauración y Persistencia Integral de Cajas Chicas',
      tag: 'BASE DE DATOS & SINCRONIZACIÓN',
      desc: 'Garantía de disponibilidad y persistencia en el selector global para todas las unidades de negocio (Reina Pino Matriz, Taller Proyecta, Coteyuc Sur), con sincronización en tiempo real hacia Supabase.',
      status: 'Implementado y Verificado',
      modules: 'Barra de Navegación, Sincronización Supabase, AppContext'
    }
  ];

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full shadow-2xl relative my-auto max-h-[96vh] flex flex-col overflow-hidden printable-modal-container">
        {/* Top Header Toolbar */}
        <div className="bg-white border-b border-zinc-200 p-4 sm:p-5 space-y-3 shrink-0 print:hidden z-30 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-[#024182] text-white rounded-xl">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Acta de Entrega de Mejoras y Checklist del Sistema</h3>
                <p className="text-[11px] text-zinc-500">Documento de conformidad y resumen técnico para entrega al cliente</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#024182] hover:bg-[#013266] text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-all active:scale-95"
              >
                <Printer className="w-4 h-4" />
                <span>Descargar / Imprimir PDF para Cliente</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="p-2 text-zinc-400 hover:text-zinc-700 rounded-xl hover:bg-zinc-100 transition-all cursor-pointer"
                title="Cerrar documento"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100">
            <LogoSelector
              selectedLogoId={selectedLogoId}
              onSelectLogo={setSelectedLogoId}
            />
          </div>
        </div>

        {/* Printable Sheet */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 bg-zinc-100/50 print:bg-white print:p-0">
          <div className="bg-white max-w-3xl mx-auto p-6 sm:p-8 rounded-xl shadow-xs print:shadow-none print:p-0 space-y-6 text-zinc-900 font-sans border border-zinc-200 print:border-none">
            {/* Header Document */}
            <div className="flex justify-between items-start border-b-2 border-[#024182] pb-4">
              <div className="flex items-center gap-3">
                {activeLogo && activeLogo.url ? (
                  <img
                    src={activeLogo.url}
                    alt={activeLogo.nombre}
                    referrerPolicy="no-referrer"
                    className="h-12 w-auto object-contain max-w-[140px]"
                  />
                ) : (
                  <div className="h-10 w-24 bg-zinc-200 rounded flex items-center justify-center text-xs font-bold text-zinc-600">
                    LOGOTIPO
                  </div>
                )}
                <div>
                  <h1 className="text-base sm:text-lg font-black text-zinc-900 tracking-tight uppercase">
                    ACTA DE ENTREGA DE MEJORAS Y CHECKLIST DE VALIDACIÓN
                  </h1>
                  <p className="text-xs text-zinc-600 font-medium">Sistema Integral de Control de Caja Chica y Reembolsos</p>
                </div>
              </div>

              <div className="text-right text-xs">
                <span className="font-bold text-[#024182] bg-blue-50 px-2.5 py-1 rounded border border-blue-200 block mb-1">
                  ENTREGA: VERSIÓN 2.5
                </span>
                <span className="text-[11px] text-zinc-500">
                  Fecha: {new Date().toLocaleDateString('es-MX', { day: '2-digit', month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>

            {/* Recipient Box */}
            <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-200 text-xs grid grid-cols-2 gap-4">
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Cliente / Organización</span>
                <span className="font-bold text-zinc-900 text-sm">Proyecta Digital / Grupo Corporativo</span>
                <p className="text-[11px] text-zinc-600">Cajas: Reina Pino (Matriz), Taller Proyecta, Coteyuc Sur</p>
              </div>
              <div>
                <span className="text-[10px] text-zinc-500 font-bold uppercase block">Estatus de los Requerimientos</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1 text-sm mt-0.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  100% de requerimientos implementados y operativos
                </span>
              </div>
            </div>

            {/* Checklist of Changes */}
            <div className="space-y-4">
              <h2 className="text-xs font-bold text-zinc-800 uppercase tracking-wider flex items-center gap-1.5 border-b border-zinc-200 pb-2">
                <ShieldCheck className="w-4 h-4 text-[#024182]" />
                <span>Desglose Detallado del Checklist de Mejoras Implementadas</span>
              </h2>

              <div className="space-y-3">
                {checklistItems.map((item, index) => (
                  <div key={index} className="p-3.5 bg-zinc-50 rounded-xl border border-zinc-200/80 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-bold text-zinc-900">{item.title}</h3>
                      <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        {item.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-600 leading-relaxed">{item.desc}</p>
                    <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-1 border-t border-zinc-200/50">
                      <span className="font-medium text-zinc-700">Módulos impactados: {item.modules}</span>
                      <span className="font-semibold text-[#024182]">{item.tag}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instrucciones de Operación */}
            <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-200 text-xs space-y-1.5 text-blue-950">
              <h4 className="font-bold text-xs">Nota de Operatividad para el Contador y Custodios:</h4>
              <p className="text-[11px] leading-relaxed text-blue-900">
                1. <strong>Taller Proyecta:</strong> Ahora opera sin saldo base requerido. Se capturan los tickets de la semana y el botón de corte genera el reembolso directo por el total exacto gastado.<br />
                2. <strong>Matriz y Coteyuc:</strong> Operan con su fondo base respectivo ($15,000 y $10,000). Al recibir una inyección de recursos, el dinero se suma directamente al saldo sin necesidad de alterar el fondo base establecido.<br />
                3. <strong>Folios:</strong> Al solicitar el corte semanal, el custodio puede colocar el número de folio interno deseado antes de enviar la solicitud al auditor.
              </p>
            </div>

            {/* Signatures */}
            <div className="grid grid-cols-2 gap-8 pt-8 border-t border-zinc-200">
              <div className="text-center">
                <div className="border-b border-zinc-400 w-48 mx-auto mb-1 h-8"></div>
                <p className="text-[11px] font-bold text-zinc-800">Equipo de Desarrollo y Soporte</p>
                <p className="text-[10px] text-zinc-500">Entrega de Módulos</p>
              </div>

              <div className="text-center">
                <div className="border-b border-zinc-400 w-48 mx-auto mb-1 h-8"></div>
                <p className="text-[11px] font-bold text-zinc-800">Proyecta Digital / Administración</p>
                <p className="text-[10px] text-zinc-500">Recepción y Conformidad</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
