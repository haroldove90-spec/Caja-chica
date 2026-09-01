// SCRIPT SQL COMPLETO E IDEMPOTENTE PARA SUPABASE
// Incluye tablas, RLS, permisos y todos los registros de muestra

export const FULL_SUPABASE_SQL_SCRIPT = `-- ====================================================================
-- SCRIPT COMPLETO E IDEMPOTENTE PARA SUPABASE (100% SIN ERRORES)
-- Control de Cajas Chicas, Gastos, Combustible y Registros de Muestra
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
  activo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);
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

-- 5. PERMISOS Y ROLES PÚBLICOS
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

-- ====================================================================
-- 6. CARGA DE REGISTROS DE MUESTRA COMPLETOS (UPSERT / IDEMPOTENTE)
-- ====================================================================

-- LOGOS
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

-- CAJAS CHICAS
INSERT INTO public.cajas_chicas (id, nombre, responsable, fondo_base, saldo_actual, estado, ubicacion)
VALUES 
  ('caja-1', 'Caja Chica - Reina Pino (Matriz)', 'Lic. Sofía Rodríguez', 15000.00, 8420.50, 'Abierta', 'Oficina Central'),
  ('caja-2', 'Caja Chica - Taller Proyecta', 'Ing. Carlos Mendoza', 20000.00, 4150.00, 'Pendiente', 'Sucursal Taller'),
  ('caja-3', 'Caja Chica - Coteyuc Sur', 'Alejandro Torres', 10000.00, 10000.00, 'Abierta', 'Planta Sur')
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    responsable = EXCLUDED.responsable,
    fondo_base = EXCLUDED.fondo_base,
    saldo_actual = EXCLUDED.saldo_actual,
    estado = EXCLUDED.estado,
    ubicacion = EXCLUDED.ubicacion;

-- GIROS / CATEGORÍAS
INSERT INTO public.giros (id, nombre, codigo, color, activo)
VALUES 
  ('giro-1', 'Publikrea', 'PUB-01', '#3b82f6', true),
  ('giro-2', 'Taller Proyecta', 'TAL-02', '#10b981', true),
  ('giro-3', 'Coteyuc', 'COT-03', '#f59e0b', true),
  ('giro-4', 'Despacho', 'DES-04', '#8b5cf6', true),
  ('giro-5', 'Mantenimiento General', 'MAN-05', '#ec4899', true),
  ('giro-6', 'Servicios Básicos', 'SER-06', '#64748b', true)
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    codigo = EXCLUDED.codigo,
    color = EXCLUDED.color,
    activo = EXCLUDED.activo;

-- PROVEEDORES
INSERT INTO public.proveedores (id, nombre, rfc, categoria)
VALUES 
  ('prov-1', 'Comercial OXXO S.A. de C.V.', 'CCO8605231N4', 'Alimentos y Consumibles'),
  ('prov-2', 'Super Willys', 'SWI921104AB3', 'Insumos de Limpieza'),
  ('prov-3', 'Servicio Pemex No. 4812', 'GPE820301KL9', 'Combustibles'),
  ('prov-4', 'Papelería Yza', 'PYZ990112CC8', 'Papelería y Oficina'),
  ('prov-5', 'Ferretería El Candado', 'FCA010515DD2', 'Herramientas y Refacciones'),
  ('prov-6', 'Teléfonos de México S.A.B.', 'TME840315KT6', 'Telecomunicaciones')
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    rfc = EXCLUDED.rfc,
    categoria = EXCLUDED.categoria;

-- EMPLEADOS
INSERT INTO public.empleados (id, nombre, puesto, departamento, activo)
VALUES 
  ('emp-reyna', 'Reyna Pino', 'Custodia de Caja Chica Matriz', 'Administración', true),
  ('emp-harold', 'Harold Anguiano Morales', 'Super Administrador General', 'Dirección General', true),
  ('emp-1', 'Lic. Sofía Rodríguez', 'Custodio de Caja Matriz', 'Administración', true),
  ('emp-2', 'Ing. Carlos Mendoza', 'Jefe de Taller', 'Mantenimiento', true),
  ('emp-3', 'CP. Alberto Vargas', 'Contador General', 'Finanzas', true),
  ('emp-4', 'Alejandro Torres', 'Encargado de Compras', 'Operaciones', true),
  ('emp-5', 'Beatriz Hernández', 'Auxiliar Administrativo', 'Administración', true)
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    puesto = EXCLUDED.puesto,
    departamento = EXCLUDED.departamento,
    activo = EXCLUDED.activo;

-- USUARIOS DEL SISTEMA
INSERT INTO public.usuarios (id, nombre, email, telefono, username, password, rol, caja_id, activo)
VALUES 
  ('usr-harold', 'Harold Anguiano Morales', 'haroldove90@gmail.com', '9991234567', 'haroldo90', 'Chevropar#1970', 'admin', NULL, true),
  ('usr-reyna', 'Reyna Pino', 'reyna_pino@hotmail.com', '9992345678', 'reyna_pino', 'Reyna*Caja2026!', 'custodio', 'caja-1', true),
  ('usr-admin1', 'Super Administrador Principal', 'admin1@empresa.com', '9991234567', 'admin1', 'Admin_123', 'admin', NULL, true),
  ('usr-1', 'Sofía Rodríguez', 'sofia.rodriguez@empresa.com', '9992345678', 'custodio1', '123', 'custodio', 'caja-1', true),
  ('usr-2', 'CP. Alberto Vargas', 'alberto.vargas@empresa.com', '9993456789', 'contador1', '123', 'contador', NULL, true),
  ('usr-3', 'Cliente Usuario', 'cliente@empresa.com', '9994567890', 'cliente1', '123', 'cliente', NULL, true)
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    telefono = EXCLUDED.telefono,
    username = EXCLUDED.username,
    password = EXCLUDED.password,
    rol = EXCLUDED.rol,
    caja_id = EXCLUDED.caja_id,
    activo = EXCLUDED.activo;

-- GASTOS REGISTRADOS
INSERT INTO public.gastos (id, caja_id, nro_orden, fecha, proveedor, concepto, importe, solicitante, giro_id, facturado, evidencia_url, evidencia_type, evidencia_nombre, estado, reembolso_id)
VALUES 
  ('gst-101', 'caja-1', 'ORD-2026-001', '2026-07-28', 'Servicio Pemex No. 4812', 'Gasolina para camioneta de entregas Publikrea', 1250.00, 'Alejandro Torres', 'giro-1', true, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Factura_Pemex_4812.pdf', 'borrador', NULL),
  ('gst-102', 'caja-1', 'ORD-2026-002', '2026-07-28', 'Comercial OXXO S.A. de C.V.', 'Insumos de café y galletas para reunión cliente Despacho', 380.50, 'Lic. Sofía Rodríguez', 'giro-4', false, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Ticket_Oxxo_Reunion.jpg', 'borrador', NULL),
  ('gst-103', 'caja-1', 'ORD-2026-003', '2026-07-29', 'Papelería Yza', 'Hojas tamaño carta y tóner negro impresoras', 1450.00, 'Beatriz Hernández', 'giro-6', true, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Factura_PapeleriaYza_2026.pdf', 'borrador', NULL),
  ('gst-104', 'caja-1', 'ORD-2026-004', '2026-07-29', 'Ferretería El Candado', 'Tornillería y brocas para montaje Coteyuc', 899.00, 'Ing. Carlos Mendoza', 'giro-3', true, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Factura_Ferreteria_Candado.pdf', 'borrador', NULL),
  ('gst-105', 'caja-1', 'ORD-2026-005', '2026-07-29', 'Super Willys', 'Jabón líquido, papel higiénico y sanitizante', 600.00, 'Lic. Sofía Rodríguez', 'giro-5', false, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Nota_Willys_Limpieza.jpg', 'borrador', NULL),
  ('gst-201', 'caja-2', 'ORD-TAL-188', '2026-07-26', 'Ferretería El Candado', 'Repuesto de brocas y aceite industrial Taller', 8450.00, 'Ing. Carlos Mendoza', 'giro-2', true, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Factura_Brocas_Taller.pdf', 'borrador', 'rmb-239'),
  ('gst-202', 'caja-2', 'ORD-TAL-189', '2026-07-27', 'Servicio Pemex No. 4812', 'Diesel para grúa de traslado', 7400.00, 'Ing. Carlos Mendoza', 'giro-2', true, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'Factura_Diesel.pdf', 'borrador', 'rmb-239')
ON CONFLICT (id) DO UPDATE 
SET nro_orden = EXCLUDED.nro_orden,
    fecha = EXCLUDED.fecha,
    proveedor = EXCLUDED.proveedor,
    concepto = EXCLUDED.concepto,
    importe = EXCLUDED.importe,
    solicitante = EXCLUDED.solicitante,
    giro_id = EXCLUDED.giro_id,
    facturado = EXCLUDED.facturado,
    evidencia_url = EXCLUDED.evidencia_url,
    evidencia_type = EXCLUDED.evidencia_type,
    evidencia_nombre = EXCLUDED.evidencia_nombre,
    estado = EXCLUDED.estado,
    reembolso_id = EXCLUDED.reembolso_id;

-- REEMBOLSOS
INSERT INTO public.reembolsos (id, nro_reembolso, caja_id, fecha_solicitud, total_gastos, cant_gastos, observaciones, estado)
VALUES 
  ('rmb-239', 'REEMB-239', 'caja-2', '2026-07-27 18:30:00+00', 15850.00, 2, 'Se entrega documentación física completa con tickets fiscales adheridos.', 'pendiente')
ON CONFLICT (id) DO UPDATE 
SET nro_reembolso = EXCLUDED.nro_reembolso,
    caja_id = EXCLUDED.caja_id,
    fecha_solicitud = EXCLUDED.fecha_solicitud,
    total_gastos = EXCLUDED.total_gastos,
    cant_gastos = EXCLUDED.cant_gastos,
    observaciones = EXCLUDED.observaciones,
    estado = EXCLUDED.estado;

-- ABONOS / INYECCIONES DE FONDO
INSERT INTO public.abonos (id, caja_id, fecha, monto, concepto, registrado_por)
VALUES 
  ('abn-1', 'caja-1', '2026-07-21 10:15:00+00', 10000.00, 'CP. Alberto entregó $10,000.00 por transferencia para apertura mensual', 'CP. Alberto Vargas'),
  ('abn-2', 'caja-1', '2026-07-25 14:00:00+00', 5000.00, 'Reembolso complementario en cheque #4912', 'CP. Alberto Vargas')
ON CONFLICT (id) DO UPDATE 
SET caja_id = EXCLUDED.caja_id,
    fecha = EXCLUDED.fecha,
    monto = EXCLUDED.monto,
    concepto = EXCLUDED.concepto,
    registrado_por = EXCLUDED.registrado_por;

-- REGISTROS DE GASOLINA (AMBAS TABLAS)
INSERT INTO public.registros_gasolina (id, caja_id, fecha, vehiculo, forma_pago, descripcion_uso, nivel_antes, nivel_despues, km, importe, registrado_por, evidencia_url, evidencia_type)
VALUES 
  ('gas-101', 'caja-1', '2026-07-28', 'CAMIONETA PARTNER', 'EFECTIVO', 'Surtido de prendas y entregas a clientes en zona norte', '1/4', 'F', 142850, 850.00, 'Lic. Sofía Rodríguez', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image'),
  ('gas-102', 'caja-1', '2026-07-25', 'CAMIONETA PARTNER', 'TARJETA DE CAJA', 'Ruta de cobro y traslado de material publicitario Taller', 'E', '3/4', 142410, 720.00, 'Alejandro Torres', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image'),
  ('gas-103', 'caja-1', '2026-07-20', 'CAMIONETA PARTNER', 'TRANSFERENCIA', 'Mantenimiento preventivo y carga de combustible en Pemex 4812', '1/4', '1/2', 141980, 500.00, 'Lic. Sofía Rodríguez', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image')
ON CONFLICT (id) DO UPDATE 
SET caja_id = EXCLUDED.caja_id,
    fecha = EXCLUDED.fecha,
    vehiculo = EXCLUDED.vehiculo,
    forma_pago = EXCLUDED.forma_pago,
    descripcion_uso = EXCLUDED.descripcion_uso,
    nivel_antes = EXCLUDED.nivel_antes,
    nivel_despues = EXCLUDED.nivel_despues,
    km = EXCLUDED.km,
    importe = EXCLUDED.importe,
    registrado_por = EXCLUDED.registrado_por,
    evidencia_url = EXCLUDED.evidencia_url,
    evidencia_type = EXCLUDED.evidencia_type;

INSERT INTO public.registro_gasolina (id, caja_id, fecha, vehiculo, forma_pago, descripcion_uso, nivel_antes, nivel_despues, km, importe, registrado_por, evidencia_url, evidencia_type)
VALUES 
  ('gas-101', 'caja-1', '2026-07-28', 'CAMIONETA PARTNER', 'EFECTIVO', 'Surtido de prendas y entregas a clientes en zona norte', '1/4', 'F', 142850, 850.00, 'Lic. Sofía Rodríguez', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image'),
  ('gas-102', 'caja-1', '2026-07-25', 'CAMIONETA PARTNER', 'TARJETA DE CAJA', 'Ruta de cobro y traslado de material publicitario Taller', 'E', '3/4', 142410, 720.00, 'Alejandro Torres', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image'),
  ('gas-103', 'caja-1', '2026-07-20', 'CAMIONETA PARTNER', 'TRANSFERENCIA', 'Mantenimiento preventivo y carga de combustible en Pemex 4812', '1/4', '1/2', 141980, 500.00, 'Lic. Sofía Rodríguez', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image')
ON CONFLICT (id) DO UPDATE 
SET caja_id = EXCLUDED.caja_id,
    fecha = EXCLUDED.fecha,
    vehiculo = EXCLUDED.vehiculo,
    forma_pago = EXCLUDED.forma_pago,
    descripcion_uso = EXCLUDED.descripcion_uso,
    nivel_antes = EXCLUDED.nivel_antes,
    nivel_despues = EXCLUDED.nivel_despues,
    km = EXCLUDED.km,
    importe = EXCLUDED.importe,
    registrado_por = EXCLUDED.registrado_por,
    evidencia_url = EXCLUDED.evidencia_url,
    evidencia_type = EXCLUDED.evidencia_type;

-- COMPROBANTES DE GASTOS
INSERT INTO public.comprobantes_gastos (id, caja_id, folio, fecha, importe, importe_letra, concepto, solicitado_a, autorizado_por, recibido_por, evidencia_url, evidencia_type)
VALUES 
  ('cmp-101', 'caja-1', 'CG-2026-001', '2026-07-28', 1250.00, 'UN MIL DOSCIENTOS CINCUENTA PESOS 00/100 M.N.', 'Pago de viáticos, alimentos y casetas por viaje de entregas express', 'Ing. Carlos Mendoza', 'CP. Alberto Vargas', 'Ing. Carlos Mendoza', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image'),
  ('cmp-102', 'caja-1', 'CG-2026-002', '2026-07-26', 890.00, 'OCHO CIENTOS NOVENTA PESOS 00/100 M.N.', 'Compra urgente de papelería y consumibles de impresión', 'Beatriz Hernández', 'Lic. Sofía Rodríguez', 'Beatriz Hernández', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image')
ON CONFLICT (id) DO UPDATE 
SET caja_id = EXCLUDED.caja_id,
    folio = EXCLUDED.folio,
    fecha = EXCLUDED.fecha,
    importe = EXCLUDED.importe,
    importe_letra = EXCLUDED.importe_letra,
    concepto = EXCLUDED.concepto,
    solicitado_a = EXCLUDED.solicitado_a,
    autorizado_por = EXCLUDED.autorizado_por,
    recibido_por = EXCLUDED.recibido_por,
    evidencia_url = EXCLUDED.evidencia_url,
    evidencia_type = EXCLUDED.evidencia_type;

-- ITEMS DE COMPROBANTES DE GASTOS
DELETE FROM public.comprobante_gastos_items WHERE comprobante_id IN ('cmp-101', 'cmp-102');
INSERT INTO public.comprobante_gastos_items (comprobante_id, no_cuenta, no_orden, no_cotizacion, nombre_proyecto, nombre, importe)
VALUES 
  ('cmp-101', '602-01', 'ORD-101', 'COT-201', 'Publikrea Norte', 'Alimentos y Comida en Ruta', 450.00),
  ('cmp-101', '602-05', 'ORD-102', 'COT-202', 'Publikrea Norte', 'Peajes y Casetas de Autopista', 380.00),
  ('cmp-101', '602-09', 'ORD-103', 'COT-203', 'Planta Sur', 'Estacionamiento y Valet', 420.00),
  ('cmp-102', '501-12', 'ORD-201', 'COT-301', 'Oficinas Centrales', 'Papelería General y Cartuchos', 650.00),
  ('cmp-102', '501-15', 'ORD-202', 'COT-302', 'Oficinas Centrales', 'Encuadernación de Manuales', 240.00);

-- PERFIL CLIENTE
INSERT INTO public.clientes_perfil (id, nombre, email, telefono, empresa, rfc, direccion)
VALUES 
  ('cli-001', 'Distribuciones Peninsulares S.A. de C.V.', 'contacto@distribucionespeninsulares.com', '9999123456', 'Distribuidora Peninsular', 'DPE180412KJ8', 'Calle 60 #340 x 43 y 45, Centro, Mérida, Yucatán')
ON CONFLICT (id) DO UPDATE 
SET nombre = EXCLUDED.nombre,
    email = EXCLUDED.email,
    telefono = EXCLUDED.telefono,
    empresa = EXCLUDED.empresa,
    rfc = EXCLUDED.rfc,
    direccion = EXCLUDED.direccion;

-- COMPROBANTES DE COMBUSTIBLE ENVIADOS POR CLIENTES
INSERT INTO public.comprobantes_combustible_cliente (id, caja_id, cliente_id, cliente_nombre, fecha, vehiculo, placas, estacion, tipo_combustible, litros, importe, evidencia_url, evidencia_type, estado, observaciones)
VALUES 
  ('cc-001', 'caja-1', 'cli-001', 'Distribuciones Peninsulares S.A. de C.V.', '2026-07-28 09:30:00+00', 'Nissan NP300 Chasis', 'YS-4891-B', 'Hidrosina Montejo', 'Diesel', 45.50, 1120.00, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'aprobado', 'Ticket validado correctamente en la estación'),
  ('cc-002', 'caja-1', 'cli-001', 'Distribuciones Peninsulares S.A. de C.V.', '2026-07-29 11:15:00+00', 'Tsuru Sedán Utilitario', 'ZAM-104-A', 'Pemex Circuito Colonias', 'Magna', 32.00, 780.00, 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80', 'image', 'enviado', 'Carga semanal para supervisión')
ON CONFLICT (id) DO UPDATE 
SET caja_id = EXCLUDED.caja_id,
    cliente_id = EXCLUDED.cliente_id,
    cliente_nombre = EXCLUDED.cliente_nombre,
    fecha = EXCLUDED.fecha,
    vehiculo = EXCLUDED.vehiculo,
    placas = EXCLUDED.placas,
    estacion = EXCLUDED.estacion,
    tipo_combustible = EXCLUDED.tipo_combustible,
    litros = EXCLUDED.litros,
    importe = EXCLUDED.importe,
    evidencia_url = EXCLUDED.evidencia_url,
    evidencia_type = EXCLUDED.evidencia_type,
    estado = EXCLUDED.estado,
    observaciones = EXCLUDED.observaciones;

-- BITÁCORA DE AUDITORÍA INICIAL
INSERT INTO public.audit_logs (id, fecha, usuario, rol, accion, modulo, detalles)
VALUES 
  ('aud-1', '2026-07-28 08:00:00+00', 'Super Administrador Principal', 'admin', 'INICIALIZACION_BD', 'Sistema General', 'Base de datos inicializada y sincronizada con registros de muestra'),
  ('aud-2', '2026-07-28 10:15:00+00', 'Lic. Sofía Rodríguez', 'custodio', 'CREAR_GASTO', 'Registro de Gastos', 'Registró gasto por $1,250.00 (ORD-2026-001)'),
  ('aud-3', '2026-07-28 14:00:00+00', 'CP. Alberto Vargas', 'contador', 'APROBAR_REEMBOLSO', 'Auditoría', 'Aprobó solicitud de reembolso REEMB-239')
ON CONFLICT (id) DO NOTHING;
`;
