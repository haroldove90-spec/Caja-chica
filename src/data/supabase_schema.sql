-- SCRIPT SQL COMPLETO PARA CONTROL DE CAJA CHICA EN SUPABASE
-- Copia y pega todo este contenido en el Editor SQL de Supabase y presiona "RUN".

-- 1. TABLA CAJAS CHICAS
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

-- 2. TABLA GIROS / CENTROS DE COSTO
CREATE TABLE IF NOT EXISTS giros (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  color VARCHAR(50) DEFAULT '#024182',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TABLA PROVEEDORES
CREATE TABLE IF NOT EXISTS proveedores (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rfc VARCHAR(50),
  categoria VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. TABLA EMPLEADOS / SOLICITANTES
CREATE TABLE IF NOT EXISTS empleados (
  id VARCHAR(100) PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  puesto VARCHAR(100),
  departamento VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA USUARIOS DE SISTEMA
CREATE TABLE IF NOT EXISTS usuarios (
  id VARCHAR(100) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  nombre VARCHAR(255) NOT NULL,
  rol VARCHAR(50) DEFAULT 'custodio',
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. TABLA DE GASTOS Y COMPROBANTES
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

-- 7. TABLA DE REEMBOLSOS Y CIERRES
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

-- 8. TABLA DE ABONOS / INYECCIONES
CREATE TABLE IF NOT EXISTS abonos (
  id VARCHAR(100) PRIMARY KEY,
  caja_id VARCHAR(100) NOT NULL,
  monto NUMERIC(12,2) NOT NULL,
  fecha VARCHAR(50) NOT NULL,
  observaciones TEXT,
  registrado_por VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. TABLA DE REGISTROS DE GASOLINA Y COMBUSTIBLE
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

-- 10. TABLA DE COMPROBANTES DIVERSOS DE GASTOS
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

-- 11. TABLA DE COMPROBANTES DE COMBUSTIBLE PARA CLIENTES EXTERNOS
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

-- 12. TABLA DE LOGS DE AUDITORIA
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

-- MIGRACIÓN DE SEGURIDAD Y REGLAS DE ACCESO PÚBLICO (ANON/AUTHENTICATED)
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, postgres;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, postgres;

-- HABILITAR Y PERMITIR ACCESO EN RLS PARA TODAS LAS TABLAS
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

-- CREACIÓN DE POLÍTICAS PERMISIVAS EN SUPABASE
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_cajas') THEN
    CREATE POLICY allow_all_cajas ON cajas_chicas FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_giros') THEN
    CREATE POLICY allow_all_giros ON giros FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_gastos') THEN
    CREATE POLICY allow_all_gastos ON gastos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_gasolina') THEN
    CREATE POLICY allow_all_gasolina ON registros_gasolina FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_comprobantes') THEN
    CREATE POLICY allow_all_comprobantes ON comprobantes_gastos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_reembolsos') THEN
    CREATE POLICY allow_all_reembolsos FROM reembolsos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_abonos') THEN
    CREATE POLICY allow_all_abonos ON abonos FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_audit') THEN
    CREATE POLICY allow_all_audit ON audit_logs FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_prov') THEN
    CREATE POLICY allow_all_prov ON proveedores FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_emp') THEN
    CREATE POLICY allow_all_emp ON empleados FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_usr') THEN
    CREATE POLICY allow_all_usr ON usuarios FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'allow_all_ccc') THEN
    CREATE POLICY allow_all_ccc ON comprobantes_combustible_cliente FOR ALL USING (true) WITH CHECK (true);
  END IF;
END $$;
