-- ====================================================================
-- SCRIPT DE ESTRUCTURA PURA (100% SEGURO: CERO RIESGO DE BORRADO DE DATOS)
-- Solo crea tablas si no existen, añade columnas y configura RLS/permisos.
-- NO INSERTA, NO MODIFICA Y NO BORRA NINGÚN DATO REGISTRADO POR EL USUARIO.
-- ====================================================================

-- 1. EXTENSIONES REQUERIDAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- CONVERSIÓN SEGURA DE COLUMNAS UUID A TEXT (Para bases de datos existentes)
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'clientes_perfil' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.clientes_perfil ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comprobantes_combustible_cliente' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.comprobantes_combustible_cliente ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comprobantes_combustible_cliente' AND column_name = 'cliente_id' AND data_type = 'uuid') THEN
    ALTER TABLE public.comprobantes_combustible_cliente ALTER COLUMN cliente_id TYPE TEXT USING cliente_id::text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comprobantes_gastos' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.comprobantes_gastos ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'comprobante_gastos_items' AND column_name = 'comprobante_id' AND data_type = 'uuid') THEN
    ALTER TABLE public.comprobante_gastos_items ALTER COLUMN comprobante_id TYPE TEXT USING comprobante_id::text;
  END IF;
  
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'audit_logs' AND column_name = 'id' AND data_type = 'uuid') THEN
    ALTER TABLE public.audit_logs ALTER COLUMN id TYPE TEXT USING id::text;
  END IF;
END $$;

-- 2. TABLAS PRINCIPALES DEL SISTEMA
CREATE TABLE IF NOT EXISTS public.cajas_chicas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  responsable TEXT NOT NULL,
  fondo_base NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  saldo_actual NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'Abierta',
  ubicacion TEXT NOT NULL DEFAULT '',
  tipo_fondo TEXT DEFAULT 'fijo',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.cajas_chicas ADD COLUMN IF NOT EXISTS tipo_fondo TEXT DEFAULT 'fijo';
ALTER TABLE public.cajas_chicas ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.giros (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.giros ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rfc TEXT NOT NULL,
  categoria TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.proveedores ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.empleados (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  puesto TEXT NOT NULL,
  departamento TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.empleados ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  username TEXT,
  password TEXT,
  rol TEXT NOT NULL DEFAULT 'custodio',
  caja_id TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Asegurar columnas en usuarios si ya existía
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS telefono TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS username TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS password TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.usuarios ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

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
  evidencia_type TEXT DEFAULT 'image',
  evidencia_nombre TEXT,
  evidencias JSONB,
  estado TEXT NOT NULL DEFAULT 'borrador',
  nota_rechazo TEXT,
  reembolso_id TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.gastos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.gastos ADD COLUMN IF NOT EXISTS evidencias JSONB;

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
  firma_electronica TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.reembolsos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.abonos (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  monto NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  concepto TEXT NOT NULL,
  registrado_por TEXT NOT NULL,
  comprobante TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.abonos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario TEXT NOT NULL,
  rol TEXT NOT NULL,
  accion TEXT NOT NULL,
  modulo TEXT NOT NULL,
  detalles TEXT NOT NULL
);

-- TABLAS DE COMBUSTIBLE / GASOLINA (SOPORTE PLURAL Y SINGULAR)
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
  evidencia_type TEXT DEFAULT 'image',
  evidencia_nombre TEXT,
  evidencias JSONB,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.registros_gasolina ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.registros_gasolina ADD COLUMN IF NOT EXISTS evidencia_nombre TEXT;
ALTER TABLE public.registros_gasolina ADD COLUMN IF NOT EXISTS evidencias JSONB;

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
  evidencia_type TEXT DEFAULT 'image',
  evidencia_nombre TEXT,
  evidencias JSONB,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.registro_gasolina ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.registro_gasolina ADD COLUMN IF NOT EXISTS evidencia_nombre TEXT;
ALTER TABLE public.registro_gasolina ADD COLUMN IF NOT EXISTS evidencias JSONB;

-- TABLAS DE COMPROBANTES DE GASTOS Y SUS ITEMS
CREATE TABLE IF NOT EXISTS public.comprobantes_gastos (
  id TEXT PRIMARY KEY,
  caja_id TEXT NOT NULL,
  folio TEXT NOT NULL UNIQUE,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  importe NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  importe_letra TEXT NOT NULL,
  concepto TEXT NOT NULL,
  solicitado_a TEXT NOT NULL,
  items JSONB DEFAULT '[]'::jsonb,
  autorizado_por TEXT,
  recibido_por TEXT,
  evidencia_url TEXT,
  evidencia_type TEXT DEFAULT 'image',
  evidencia_nombre TEXT,
  evidencias JSONB,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
ALTER TABLE public.comprobantes_gastos ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.comprobantes_gastos ADD COLUMN IF NOT EXISTS items JSONB DEFAULT '[]'::jsonb;
ALTER TABLE public.comprobantes_gastos ADD COLUMN IF NOT EXISTS evidencia_nombre TEXT;
ALTER TABLE public.comprobantes_gastos ADD COLUMN IF NOT EXISTS evidencias JSONB;

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

-- TABLAS DE PERFIL CLIENTE Y COMPROBANTES DE COMBUSTIBLE CLIENTES
CREATE TABLE IF NOT EXISTS public.clientes_perfil (
  id TEXT PRIMARY KEY DEFAULT 'cli-001',
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  empresa TEXT,
  rfc TEXT,
  direccion TEXT,
  foto_url TEXT,
  activo BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.clientes_perfil ADD COLUMN IF NOT EXISTS foto_url TEXT;
ALTER TABLE public.clientes_perfil ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;

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
  evidencia_nombre TEXT,
  evidencias JSONB,
  estado TEXT NOT NULL DEFAULT 'enviado',
  observaciones TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
ALTER TABLE public.comprobantes_combustible_cliente ADD COLUMN IF NOT EXISTS activo BOOLEAN DEFAULT TRUE;
ALTER TABLE public.comprobantes_combustible_cliente ADD COLUMN IF NOT EXISTS evidencia_nombre TEXT;
ALTER TABLE public.comprobantes_combustible_cliente ADD COLUMN IF NOT EXISTS evidencias JSONB;

-- TABLA DE LOGOTIPOS OFICIALES PARA PDF
CREATE TABLE IF NOT EXISTS public.logos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. HABILITAR SEGURIDAD POR FILA (RLS)
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

-- 4. POLÍTICAS DE ACCESO TOTAL (IDEMPOTENTES)
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

-- 5. TRIGGER AUTOMÁTICO: SUMAR ABONOS/INYECCIONES AL SALDO ACTUAL DE LA CAJA CHICA
CREATE OR REPLACE FUNCTION public.actualizar_saldo_caja_por_abono()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT') THEN
    UPDATE public.cajas_chicas
    SET saldo_actual = COALESCE(saldo_actual, 0) + NEW.monto
    WHERE id = NEW.caja_id;
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    UPDATE public.cajas_chicas
    SET saldo_actual = GREATEST(0, COALESCE(saldo_actual, 0) - OLD.monto)
    WHERE id = OLD.caja_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_actualizar_saldo_abono ON public.abonos;
CREATE TRIGGER trg_actualizar_saldo_abono
AFTER INSERT OR DELETE ON public.abonos
FOR EACH ROW
EXECUTE FUNCTION public.actualizar_saldo_caja_por_abono();

-- 6. PERMISOS Y ROLES PÚBLICOS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;
