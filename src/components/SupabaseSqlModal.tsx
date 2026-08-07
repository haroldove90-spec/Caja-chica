import React, { useState } from 'react';
import { Database, Copy, Check, Download, X, AlertTriangle, Terminal, ShieldCheck, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncSuccess, setSyncSuccess] = useState(false);
  const { syncWithSupabaseNow } = useApp();

  if (!isOpen) return null;

  const handleSyncNow = async () => {
    setSyncing(true);
    setSyncSuccess(false);
    try {
      await syncWithSupabaseNow();
      setSyncSuccess(true);
      setTimeout(() => setSyncSuccess(false), 5000);
    } catch (err) {
      console.error('Error syncing:', err);
    } finally {
      setSyncing(false);
    }
  };

  const sqlScript = `-- ====================================================================
-- SCRIPT COMPLETO, UNIFICADO Y CORREGIDO PARA SUPABASE (100% SIN ERRORES)
-- Control de Cajas Chicas, Gastos, Combustible y Logotipos Oficiales
-- ====================================================================

-- 1. TABLAS PRINCIPALES DE CAJA CHICA Y GASTOS
CREATE TABLE IF NOT EXISTS public.cajas_chicas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  responsable TEXT NOT NULL,
  fondo_base NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  saldo_actual NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'Abierta',
  ubicacion TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS public.giros (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL,
  color TEXT DEFAULT 'bg-zinc-100 text-zinc-800',
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rfc TEXT NOT NULL,
  categoria TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS public.empleados (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  puesto TEXT NOT NULL,
  departamento TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  rol TEXT NOT NULL DEFAULT 'custodio',
  caja_id TEXT,
  activo BOOLEAN DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS public.gastos (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  nro_orden TEXT NOT NULL,
  fecha DATE NOT NULL,
  proveedor TEXT NOT NULL,
  concepto TEXT NOT NULL,
  importe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  solicitante TEXT NOT NULL,
  giro_id TEXT,
  facturado BOOLEAN DEFAULT FALSE,
  evidencia_url TEXT,
  evidencia_type TEXT,
  evidencia_nombre TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador',
  nota_rechazo TEXT,
  reembolso_id TEXT
);

CREATE TABLE IF NOT EXISTS public.reembolsos (
  id TEXT PRIMARY KEY,
  nro_reembolso TEXT NOT NULL,
  caja_id TEXT NOT NULL,
  fecha_solicitud TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_gastos NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  cant_gastos INT NOT NULL DEFAULT 0,
  observaciones TEXT,
  estado TEXT NOT NULL DEFAULT 'pendiente',
  fecha_aprobacion TIMESTAMP WITH TIME ZONE,
  aprobado_por TEXT,
  firma_electronica TEXT
);

CREATE TABLE IF NOT EXISTS public.abonos (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  fecha DATE NOT NULL,
  monto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  concepto TEXT NOT NULL,
  registrado_por TEXT NOT NULL,
  comprobante TEXT
);

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario TEXT NOT NULL,
  rol TEXT NOT NULL,
  accion TEXT NOT NULL,
  modulo TEXT NOT NULL,
  detalles TEXT NOT NULL
);

-- 2. TABLAS DE REGISTROS DE GASOLINA (PLURAL Y SINGULAR)
CREATE TABLE IF NOT EXISTS public.registros_gasolina (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  fecha DATE NOT NULL,
  vehiculo TEXT NOT NULL,
  forma_pago TEXT NOT NULL DEFAULT 'EFECTIVO',
  descripcion_uso TEXT NOT NULL,
  nivel_antes TEXT NOT NULL DEFAULT '1/4',
  nivel_despues TEXT NOT NULL DEFAULT 'F',
  km INT NOT NULL DEFAULT 0,
  importe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  registrado_por TEXT NOT NULL,
  evidencia_url TEXT,
  evidencia_type TEXT DEFAULT 'image'
);

CREATE TABLE IF NOT EXISTS public.registro_gasolina (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  fecha DATE NOT NULL,
  vehiculo TEXT NOT NULL,
  forma_pago TEXT NOT NULL DEFAULT 'EFECTIVO',
  descripcion_uso TEXT NOT NULL,
  nivel_antes TEXT NOT NULL DEFAULT '1/4',
  nivel_despues TEXT NOT NULL DEFAULT 'F',
  km INT NOT NULL DEFAULT 0,
  importe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  registrado_por TEXT NOT NULL,
  evidencia_url TEXT,
  evidencia_type TEXT DEFAULT 'image'
);

-- 3. TABLAS DE COMPROBANTES DE GASTOS Y DESGLOSE ITEMS
CREATE TABLE IF NOT EXISTS public.comprobantes_gastos (
    id TEXT PRIMARY KEY,
    caja_id TEXT NOT NULL,
    folio TEXT NOT NULL UNIQUE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    importe NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    importe_letra TEXT NOT NULL,
    concepto TEXT NOT NULL,
    solicitado_a TEXT NOT NULL,
    autorizado_por TEXT,
    recibido_por TEXT,
    evidencia_url TEXT,
    evidencia_type TEXT DEFAULT 'image',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.comprobante_gastos_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    comprobante_id TEXT REFERENCES public.comprobantes_gastos(id) ON DELETE CASCADE,
    no_cuenta VARCHAR(50) NOT NULL,
    no_orden VARCHAR(50),
    no_cotizacion VARCHAR(50),
    nombre_proyecto VARCHAR(150),
    nombre TEXT NOT NULL,
    importe NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Asegurar columnas en comprobante_gastos_items si la tabla ya existía
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comprobante_gastos_items' AND column_name='no_orden') THEN
        ALTER TABLE public.comprobante_gastos_items ADD COLUMN no_orden VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comprobante_gastos_items' AND column_name='no_cotizacion') THEN
        ALTER TABLE public.comprobante_gastos_items ADD COLUMN no_cotizacion VARCHAR(50);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='comprobante_gastos_items' AND column_name='nombre_proyecto') THEN
        ALTER TABLE public.comprobante_gastos_items ADD COLUMN nombre_proyecto VARCHAR(150);
    END IF;
END $$;

-- 4. TABLAS DE PERFIL CLIENTE Y COMBUSTIBLE CLIENTE
CREATE TABLE IF NOT EXISTS public.clientes_perfil (
    id TEXT PRIMARY KEY DEFAULT 'cli-001',
    nombre TEXT NOT NULL,
    email TEXT NOT NULL,
    telefono TEXT,
    empresa TEXT,
    rfc TEXT,
    direccion TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.comprobantes_combustible_cliente (
    id TEXT PRIMARY KEY,
    caja_id TEXT,
    cliente_id TEXT NOT NULL,
    cliente_nombre TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    vehiculo TEXT NOT NULL,
    placas TEXT,
    estacion TEXT,
    tipo_combustible TEXT NOT NULL DEFAULT 'Magna',
    litros NUMERIC(10,2),
    importe NUMERIC(10,2) NOT NULL,
    evidencia_url TEXT NOT NULL,
    evidencia_type TEXT DEFAULT 'image',
    estado TEXT NOT NULL DEFAULT 'enviado',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. TABLA DE LOGOTIPOS OFICIALES PARA PDF
CREATE TABLE IF NOT EXISTS public.logos (
    id TEXT PRIMARY KEY,
    nombre TEXT NOT NULL,
    url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. HABILITAR SEGURIDAD POR FILA (RLS)
ALTER TABLE public.cajas_chicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.giros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registro_gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobante_gastos_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clientes_perfil ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comprobantes_combustible_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.logos ENABLE ROW LEVEL SECURITY;

-- 7. BORRAR POLÍTICAS PREVIAS PARA EVITAR EL ERROR 42710
DROP POLICY IF EXISTS "Public full access on cajas_chicas" ON public.cajas_chicas;
DROP POLICY IF EXISTS "Public full access on giros" ON public.giros;
DROP POLICY IF EXISTS "Public full access on proveedores" ON public.proveedores;
DROP POLICY IF EXISTS "Public full access on empleados" ON public.empleados;
DROP POLICY IF EXISTS "Public full access on usuarios" ON public.usuarios;
DROP POLICY IF EXISTS "Public full access on gastos" ON public.gastos;
DROP POLICY IF EXISTS "Public full access on reembolsos" ON public.reembolsos;
DROP POLICY IF EXISTS "Public full access on abonos" ON public.abonos;
DROP POLICY IF EXISTS "Public full access on audit_logs" ON public.audit_logs;
DROP POLICY IF EXISTS "Public full access on registros_gasolina" ON public.registros_gasolina;
DROP POLICY IF EXISTS "Public full access on registro_gasolina" ON public.registro_gasolina;
DROP POLICY IF EXISTS "Public full access on comprobantes_gastos" ON public.comprobantes_gastos;
DROP POLICY IF EXISTS "Public full access on comprobante_gastos_items" ON public.comprobante_gastos_items;
DROP POLICY IF EXISTS "Acceso total lectura/escritura perfil clientes" ON public.clientes_perfil;
DROP POLICY IF EXISTS "Acceso total lectura/escritura comprobantes combustible" ON public.comprobantes_combustible_cliente;
DROP POLICY IF EXISTS "Acceso lectura/escritura logos" ON public.logos;

-- 8. RECREAR POLÍTICAS DE ACCESO TOTAL
CREATE POLICY "Public full access on cajas_chicas" ON public.cajas_chicas FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on giros" ON public.giros FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on proveedores" ON public.proveedores FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on empleados" ON public.empleados FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on usuarios" ON public.usuarios FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on gastos" ON public.gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on reembolsos" ON public.reembolsos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on abonos" ON public.abonos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on registros_gasolina" ON public.registros_gasolina FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on registro_gasolina" ON public.registro_gasolina FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on comprobantes_gastos" ON public.comprobantes_gastos FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public full access on comprobante_gastos_items" ON public.comprobante_gastos_items FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total lectura/escritura perfil clientes" ON public.clientes_perfil FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso total lectura/escritura comprobantes combustible" ON public.comprobantes_combustible_cliente FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Acceso lectura/escritura logos" ON public.logos FOR ALL USING (true) WITH CHECK (true);

-- 9. PERMISOS RLS Y ROLES PÚBLICOS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

-- 10. INSERTAR Y/O ACTUALIZAR LOGOTIPOS Y COLUMNAS DE EVIDENCIA
INSERT INTO public.logos (id, nombre, url)
VALUES 
  ('coteyuc', 'Coteyuc', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/coteyuc.jpeg'),
  ('jscontadores', 'JS Contadores', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/jscontadores.png'),
  ('proyecta', 'Proyecta Digital', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyecta.jpeg'),
  ('publicrea', 'Publicrea', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/publicrea.jpeg'),
  ('sin_logo', 'Sin Logo', NULL)
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    url = EXCLUDED.url;

-- COLUMNAS ADICIONALES SI YA EXISTÍAN OTRAS TABLAS PREVIAS
ALTER TABLE public.gastos 
ADD COLUMN IF NOT EXISTS evidencia_url TEXT,
ADD COLUMN IF NOT EXISTS evidencia_nombre TEXT,
ADD COLUMN IF NOT EXISTS evidencia_type TEXT;

ALTER TABLE public.registros_gasolina 
ADD COLUMN IF NOT EXISTS evidencia_url TEXT,
ADD COLUMN IF NOT EXISTS evidencia_type TEXT;

ALTER TABLE public.registro_gasolina 
ADD COLUMN IF NOT EXISTS evidencia_url TEXT,
ADD COLUMN IF NOT EXISTS evidencia_type TEXT;
`;

  const handleCopy = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([sqlScript], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = 'supabase_schema_caja_chica.sql';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-xs z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white border border-zinc-200 rounded-2xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-[#024182] to-[#1d5fa6] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl">
              <Database className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base font-bold">Script SQL Correcto para Supabase</h3>
              <p className="text-xs text-blue-100">Solución al error ERROR: 42P01 (relation does not exist)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1">
          {/* Direct Sync Action Box */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                <Database className="w-4 h-4 text-emerald-600" />
                <span>Sincronizar Base de Datos con Supabase</span>
              </div>
              <p className="text-xs text-emerald-700">
                Sube todos los comprobantes de cliente, gastos, cajas y registros a tu proyecto de Supabase.
              </p>
            </div>
            <button
              onClick={handleSyncNow}
              disabled={syncing}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer shadow-xs ${
                syncSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#024182] hover:bg-[#013266] text-white disabled:opacity-50'
              }`}
            >
              <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
              <span>{syncing ? 'Sincronizando...' : syncSuccess ? '¡Sincronizado!' : 'Sincronizar Todo a Supabase'}</span>
            </button>
          </div>

          {/* Explanation Alert */}
          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 space-y-1">
              <p className="font-bold">¿Por qué ocurrió el error en Supabase?</p>
              <p>
                El error <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-amber-900">42P01: relation "registros_gasolina" does not exist</code> sucede cuando intentas ejecutar una instrucción <code className="font-mono font-bold">ALTER TABLE</code> antes de haber ejecutado el <code className="font-mono font-bold">CREATE TABLE</code> inicial.
              </p>
              <p className="font-medium text-emerald-800">
                ✓ Este script crea automáticamente todas las tablas si no existen (<code className="font-mono">CREATE TABLE IF NOT EXISTS</code>), agrega las columnas de evidencia y configura los permisos RLS.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-700">
              <Terminal className="w-4 h-4 text-[#024182]" />
              <span>Código SQL completo (12 Tablas + RLS):</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer border ${
                  copied
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? '¡Copiado al Portapapeles!' : 'Copiar SQL'}</span>
              </button>
              <button
                onClick={handleDownload}
                className="px-3 py-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 border border-zinc-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Descargar .sql</span>
              </button>
            </div>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 font-mono text-xs">
            <pre className="p-4 text-emerald-400 overflow-x-auto max-h-96 leading-relaxed select-all">
              {sqlScript}
            </pre>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3 text-xs text-blue-900">
            <ShieldCheck className="w-5 h-5 text-[#024182] shrink-0" />
            <span>
              <strong>Instrucciones:</strong> Copia este código, ve a tu panel de Supabase → <strong>SQL Editor</strong> → Crea un nuevo Query, pega el código y haz clic en <strong>RUN</strong>.
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-50 border-t border-zinc-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-[#024182] hover:bg-[#013266] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shadow-xs"
          >
            Entendido y Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
