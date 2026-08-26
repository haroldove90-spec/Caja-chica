-- ====================================================================
-- SCRIPT COMPLETO E IDEMPOTENTE PARA SUPABASE
-- Control de Cajas Chicas, Gastos, Combustible, Usuarios y Muestras
-- ====================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLAS PRINCIPALES
CREATE TABLE IF NOT EXISTS public.cajas_chicas (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  responsable TEXT NOT NULL,
  fondo_base NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  saldo_actual NUMERIC(12,2) NOT NULL DEFAULT 0.00,
  estado TEXT NOT NULL DEFAULT 'Abierta',
  ubicacion TEXT NOT NULL DEFAULT '',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.giros (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  codigo TEXT NOT NULL,
  color TEXT DEFAULT '#3b82f6',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.proveedores (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  rfc TEXT NOT NULL,
  categoria TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.empleados (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  puesto TEXT NOT NULL,
  departamento TEXT NOT NULL,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

CREATE TABLE IF NOT EXISTS public.usuarios (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  username TEXT,
  password TEXT,
  rol TEXT NOT NULL DEFAULT 'custodio',
  caja_id TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
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
  evidencia_type TEXT DEFAULT 'image',
  evidencia_nombre TEXT,
  estado TEXT NOT NULL DEFAULT 'borrador',
  nota_rechazo TEXT,
  reembolso_id TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
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
  firma_electronica TEXT,
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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

CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  fecha TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  usuario TEXT NOT NULL,
  rol TEXT NOT NULL,
  accion TEXT NOT NULL,
  modulo TEXT NOT NULL,
  detalles TEXT NOT NULL
);

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
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
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
  evidencia_type TEXT DEFAULT 'image',
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

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
  activo BOOLEAN DEFAULT TRUE,
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

CREATE TABLE IF NOT EXISTS public.clientes_perfil (
  id TEXT PRIMARY KEY DEFAULT 'cli-001',
  nombre TEXT NOT NULL,
  email TEXT NOT NULL,
  telefono TEXT,
  empresa TEXT,
  rfc TEXT,
  direccion TEXT,
  activo BOOLEAN DEFAULT TRUE,
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
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS public.logos (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL,
  url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- RLS Y POLÍTICAS DE ACCESO
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

DO $$ 
DECLARE
  t text;
  tables text[] := ARRAY[
    'cajas_chicas', 'giros', 'proveedores', 'empleados', 'usuarios', 
    'gastos', 'reembolsos', 'abonos', 'audit_logs', 'registros_gasolina', 
    'registro_gasolina', 'comprobantes_gastos', 'comprobante_gastos_items', 
    'clientes_perfil', 'comprobantes_combustible_cliente', 'logos'
  ];
BEGIN
  FOREACH t IN ARRAY tables LOOP
    EXECUTE format('DROP POLICY IF EXISTS "policy_full_%s" ON public.%I', t, t);
    EXECUTE format('CREATE POLICY "policy_full_%s" ON public.%I FOR ALL USING (true) WITH CHECK (true)', t, t);
  END LOOP;
END $$;

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

-- DATOS INICIALES
INSERT INTO public.logos (id, nombre, url) VALUES 
  ('coteyuc', 'Coteyuc', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/coteyuc.jpeg'),
  ('jscontadores', 'JS Contadores', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/jscontadores.png'),
  ('proyecta', 'Proyecta Digital', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/proyecta.jpeg'),
  ('publicrea', 'Publicrea', 'https://embjwhcaymeyfxpkcqap.supabase.co/storage/v1/object/public/logos/publicrea.jpeg')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, url = EXCLUDED.url;

INSERT INTO public.cajas_chicas (id, nombre, responsable, fondo_base, saldo_actual, estado, ubicacion) VALUES 
  ('caja-1', 'Caja Chica - Reina Pino (Matriz)', 'Lic. Sofía Rodríguez', 15000.00, 8420.50, 'Abierta', 'Oficina Central'),
  ('caja-2', 'Caja Chica - Taller Proyecta', 'Ing. Carlos Mendoza', 20000.00, 4150.00, 'Pendiente', 'Sucursal Taller'),
  ('caja-3', 'Caja Chica - Coteyuc Sur', 'Alejandro Torres', 10000.00, 10000.00, 'Abierta', 'Planta Sur')
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, fondo_base = EXCLUDED.fondo_base, saldo_actual = EXCLUDED.saldo_actual;

INSERT INTO public.giros (id, nombre, codigo, color, activo) VALUES 
  ('giro-1', 'Publikrea', 'PUB-01', '#3b82f6', true),
  ('giro-2', 'Taller Proyecta', 'TAL-02', '#10b981', true),
  ('giro-3', 'Coteyuc', 'COT-03', '#f59e0b', true),
  ('giro-4', 'Despacho', 'DES-04', '#8b5cf6', true)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, codigo = EXCLUDED.codigo, color = EXCLUDED.color;

INSERT INTO public.usuarios (id, nombre, email, telefono, username, password, rol, caja_id, activo) VALUES 
  ('usr-admin1', 'Super Administrador Principal', 'admin1@empresa.com', '9991234567', 'admin1', 'Admin_123', 'admin', NULL, true),
  ('usr-1', 'Sofía Rodríguez', 'sofia.rodriguez@empresa.com', '9992345678', 'custodio1', '123', 'custodio', 'caja-1', true),
  ('usr-2', 'CP. Alberto Vargas', 'alberto.vargas@empresa.com', '9993456789', 'contador1', '123', 'contador', NULL, true),
  ('usr-3', 'Cliente Usuario', 'cliente@empresa.com', '9994567890', 'cliente1', '123', 'cliente', NULL, true)
ON CONFLICT (id) DO UPDATE SET nombre = EXCLUDED.nombre, email = EXCLUDED.email, username = EXCLUDED.username, password = EXCLUDED.password, rol = EXCLUDED.rol;
