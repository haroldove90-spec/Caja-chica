import React, { useState } from 'react';
import { Database, Copy, Check, Download, X, AlertTriangle, Terminal, ShieldCheck } from 'lucide-react';

interface SupabaseSqlModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseSqlModal: React.FC<SupabaseSqlModalProps> = ({ isOpen, onClose }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const sqlScript = `-- =======================================================
-- SCRIPT SQL COMPLETO Y CORREGIDO PARA SUPABASE (CAJA CHICA)
-- Ejecuta este script en el Editor SQL de tu proyecto Supabase:
-- https://supabase.com/dashboard/project/_/sql/new
-- =======================================================

-- 1. CREACIÓN DE TABLAS SI NO EXISTEN
CREATE TABLE IF NOT EXISTS cajas_chicas (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  responsable VARCHAR(255) NOT NULL,
  fondo_base NUMERIC(12,2) DEFAULT 0.00,
  saldo_actual NUMERIC(12,2) DEFAULT 0.00,
  empresa_logo VARCHAR(100) DEFAULT 'coteyuc',
  estado VARCHAR(50) DEFAULT 'Abierta',
  limite_alerta NUMERIC(12,2) DEFAULT 3000.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS giros (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT '#024182',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proveedores (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(50),
  categoria VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS empleados (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  puesto VARCHAR(100),
  departamento VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'custodio',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS gastos (
  id VARCHAR(100) PRIMARY KEY,
  caja_id VARCHAR(100) NOT NULL,
  nro_orden VARCHAR(100) NOT NULL,
  fecha VARCHAR(50) NOT NULL,
  proveedor VARCHAR(255) NOT NULL,
  concepto TEXT NOT NULL,
  importe NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  solicitante VARCHAR(255) NOT NULL,
  giro_id VARCHAR(100) NOT NULL,
  facturado BOOLEAN DEFAULT true,
  estado VARCHAR(50) DEFAULT 'borrador',
  reembolso_id VARCHAR(100),
  evidencia_url TEXT,
  evidencia_nombre VARCHAR(255),
  evidencia_type VARCHAR(50) DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reembolsos (
  id VARCHAR(100) PRIMARY KEY,
  nro_reembolso VARCHAR(100) NOT NULL,
  caja_id VARCHAR(100) NOT NULL,
  fecha_solicitud VARCHAR(50) NOT NULL,
  total_gastos NUMERIC(12,2) DEFAULT 0.00,
  cant_gastos INT DEFAULT 0,
  observaciones TEXT,
  estado VARCHAR(50) DEFAULT 'pendiente',
  fecha_aprobacion VARCHAR(50),
  aprobado_por VARCHAR(255),
  firma_electronica TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abonos (
  id VARCHAR(100) PRIMARY KEY,
  caja_id VARCHAR(100) NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha VARCHAR(50) NOT NULL,
  observaciones TEXT,
  registrado_por VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registros_gasolina (
  id VARCHAR(100) PRIMARY KEY,
  caja_id VARCHAR(100) NOT NULL,
  fecha VARCHAR(50) NOT NULL,
  vehiculo VARCHAR(255) NOT NULL,
  forma_pago VARCHAR(100) DEFAULT 'EFECTIVO',
  descripcion_uso TEXT NOT NULL,
  nivel_antes VARCHAR(20) DEFAULT '1/4',
  nivel_despues VARCHAR(20) DEFAULT 'F',
  km NUMERIC(12,2) DEFAULT 0.00,
  importe NUMERIC(12,2) DEFAULT 0.00,
  registrado_por VARCHAR(255) NOT NULL,
  evidencia_url TEXT,
  evidencia_type VARCHAR(50) DEFAULT 'image',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comprobantes_gastos (
  id VARCHAR(100) PRIMARY KEY,
  caja_id VARCHAR(100) NOT NULL,
  folio VARCHAR(100) NOT NULL,
  fecha VARCHAR(50) NOT NULL,
  solicitante VARCHAR(255) NOT NULL,
  giro VARCHAR(255) NOT NULL,
  monto_letra TEXT NOT NULL,
  autorizado_por VARCHAR(255) NOT NULL,
  recibido_por VARCHAR(255) NOT NULL,
  concepto TEXT NOT NULL,
  importe NUMERIC(12,2) DEFAULT 0.00,
  evidencia_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS comprobantes_combustible_cliente (
  id VARCHAR(100) PRIMARY KEY,
  cliente_id VARCHAR(100) NOT NULL,
  cliente_nombre VARCHAR(255) NOT NULL,
  vehiculo VARCHAR(255) NOT NULL,
  placas VARCHAR(100),
  fecha VARCHAR(50) NOT NULL,
  monto NUMERIC(12,2) DEFAULT 0.00,
  litros NUMERIC(12,2) DEFAULT 0.00,
  odometro NUMERIC(12,2) DEFAULT 0.00,
  estacion_servicio VARCHAR(255),
  evidencia_url TEXT,
  estado VARCHAR(50) DEFAULT 'enviado',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS audit_logs (
  id VARCHAR(100) PRIMARY KEY,
  fecha VARCHAR(50) NOT NULL,
  usuario VARCHAR(255) NOT NULL,
  rol VARCHAR(50) NOT NULL,
  accion VARCHAR(100) NOT NULL,
  modulo VARCHAR(100) NOT NULL,
  detalles TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ASEGURAR COLUMNAS PARA EVIDENCIAS
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS evidencia_url TEXT;
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS evidencia_nombre VARCHAR(255);
ALTER TABLE gastos ADD COLUMN IF NOT EXISTS evidencia_type VARCHAR(50);

ALTER TABLE registros_gasolina ADD COLUMN IF NOT EXISTS evidencia_url TEXT;
ALTER TABLE registros_gasolina ADD COLUMN IF NOT EXISTS evidencia_type VARCHAR(50);

-- 3. PERMISOS DE LECTURA Y ESCRITURA PÚBLICA (ANON)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

ALTER TABLE cajas_chicas ENABLE ROW LEVEL SECURITY;
ALTER TABLE giros ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE reembolsos ENABLE ROW LEVEL SECURITY;
ALTER TABLE abonos ENABLE ROW LEVEL SECURITY;
ALTER TABLE registros_gasolina ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes_gastos ENABLE ROW LEVEL SECURITY;
ALTER TABLE comprobantes_combustible_cliente ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_cajas') THEN
    CREATE POLICY policy_cajas ON cajas_chicas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_giros') THEN
    CREATE POLICY policy_giros ON giros FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_gastos') THEN
    CREATE POLICY policy_gastos ON gastos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_gasolina') THEN
    CREATE POLICY policy_gasolina ON registros_gasolina FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_comprobantes') THEN
    CREATE POLICY policy_comprobantes ON comprobantes_gastos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_reembolsos') THEN
    CREATE POLICY policy_reembolsos ON reembolsos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_abonos') THEN
    CREATE POLICY policy_abonos ON abonos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_audit') THEN
    CREATE POLICY policy_audit ON audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_prov') THEN
    CREATE POLICY policy_prov ON proveedores FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_emp') THEN
    CREATE POLICY policy_emp ON empleados FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_usr') THEN
    CREATE POLICY policy_usr ON usuarios FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'policy_ccc') THEN
    CREATE POLICY policy_ccc ON comprobantes_combustible_cliente FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
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
