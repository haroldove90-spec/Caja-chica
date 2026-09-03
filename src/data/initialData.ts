import { CajaChica, Giro, Proveedor, Empleado, Usuario, Gasto, ReembolsoRequest, Abono, AuditLog, RegistroGasolina, ComprobanteGastos, ClienteProfile, ComprobanteCombustibleCliente } from '../types';

// Sample placeholder receipt image base64 or clean generated canvas preview
export const SAMPLE_TICKET_URL = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';

export const INITIAL_GASOLINA: RegistroGasolina[] = [];

export const INITIAL_COMPROBANTES: ComprobanteGastos[] = [];

export const INITIAL_CAJAS: CajaChica[] = [
  {
    id: 'caja-1',
    nombre: 'Caja Chica - Reina Pino (Matriz)',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 15000,
    estado: 'Abierta',
    ubicacion: 'Oficina Central',
    tipoFondo: 'fijo'
  },
  {
    id: 'caja-2',
    nombre: 'Caja Chica - Taller Proyecta',
    responsable: 'Ing. Carlos Mendoza',
    fondoBase: 0,
    saldoActual: 0,
    estado: 'Abierta',
    ubicacion: 'Sucursal Taller',
    tipoFondo: 'sin_fondo'
  },
  {
    id: 'caja-3',
    nombre: 'Caja Chica - Coteyuc Sur',
    responsable: 'Alejandro Torres',
    fondoBase: 10000,
    saldoActual: 10000,
    estado: 'Abierta',
    ubicacion: 'Planta Sur',
    tipoFondo: 'fijo'
  }
];

export const INITIAL_GIROS: Giro[] = [
  { id: 'giro-1', nombre: 'Publikrea', codigo: 'PUB-01', color: '#3b82f6', activo: true },
  { id: 'giro-2', nombre: 'Taller Proyecta', codigo: 'TAL-02', color: '#10b981', activo: true },
  { id: 'giro-3', nombre: 'Coteyuc', codigo: 'COT-03', color: '#f59e0b', activo: true },
  { id: 'giro-4', nombre: 'Despacho', codigo: 'DES-04', color: '#8b5cf6', activo: true },
  { id: 'giro-5', nombre: 'Mantenimiento General', codigo: 'MAN-05', color: '#ec4899', activo: true },
  { id: 'giro-6', nombre: 'Servicios Básicos', codigo: 'SER-06', color: '#64748b', activo: true }
];

export const INITIAL_PROVEEDORES: Proveedor[] = [
  { id: 'prov-1', nombre: 'Comercial OXXO S.A. de C.V.', rfc: 'CCO8605231N4', categoria: 'Alimentos y Consumibles' },
  { id: 'prov-2', nombre: 'Super Willys', rfc: 'SWI921104AB3', categoria: 'Insumos de Limpieza' },
  { id: 'prov-3', nombre: 'Servicio Pemex No. 4812', rfc: 'GPE820301KL9', categoria: 'Combustibles' },
  { id: 'prov-4', nombre: 'Papelería Yza', rfc: 'PYZ990112CC8', categoria: 'Papelería y Oficina' },
  { id: 'prov-5', nombre: 'Ferretería El Candado', rfc: 'FCA010515DD2', categoria: 'Herramientas y Refacciones' },
  { id: 'prov-6', nombre: 'Teléfonos de México S.A.B.', rfc: 'TME840315KT6', categoria: 'Telecomunicaciones' }
];

export const INITIAL_EMPLEADOS: Empleado[] = [
  { id: 'emp-reyna', nombre: 'Reyna Pino', puesto: 'Custodia de Caja Chica Matriz', departamento: 'Administración', activo: true },
  { id: 'emp-harold', nombre: 'Harold Anguiano Morales', puesto: 'Super Administrador General', departamento: 'Dirección General', activo: true },
  { id: 'emp-1', nombre: 'Lic. Sofía Rodríguez', puesto: 'Custodio de Caja Matriz', departamento: 'Administración', activo: true },
  { id: 'emp-2', nombre: 'Ing. Carlos Mendoza', puesto: 'Jefe de Taller', departamento: 'Mantenimiento', activo: true },
  { id: 'emp-3', nombre: 'CP. Alberto Vargas', puesto: 'Contador General', departamento: 'Finanzas', activo: true },
  { id: 'emp-4', nombre: 'Alejandro Torres', puesto: 'Encargado de Compras', departamento: 'Operaciones', activo: true },
  { id: 'emp-5', nombre: 'Beatriz Hernández', puesto: 'Auxiliar Administrativo', departamento: 'Administración', activo: true }
];

export const INITIAL_USUARIOS: Usuario[] = [
  { id: 'usr-harold', nombre: 'Harold Anguiano Morales', email: 'haroldove90@gmail.com', username: 'haroldo90', password: 'Chevropar#1970', rol: 'admin', telefono: '+52 999 123 4567', activo: true },
  { id: 'usr-reyna', nombre: 'Reyna Pino', email: 'reyna_pino@hotmail.com', username: 'reyna_pino', password: 'Reyna*Caja2026!', rol: 'custodio', cajaId: 'caja-1', telefono: '+52 999 234 5678', activo: true },
  { id: 'usr-admin1', nombre: 'Super Administrador Principal', email: 'admin1@empresa.com', username: 'admin1', password: 'Admin_123', rol: 'admin', activo: true },
  { id: 'usr-1', nombre: 'Sofía Rodríguez', email: 'sofia.rodriguez@empresa.com', username: 'custodio1', password: '123', rol: 'custodio', cajaId: 'caja-1', activo: true },
  { id: 'usr-2', nombre: 'CP. Alberto Vargas', email: 'alberto.vargas@empresa.com', username: 'contador1', password: '123', rol: 'contador', activo: true },
  { id: 'usr-3', nombre: 'Cliente Usuario', email: 'cliente@empresa.com', username: 'cliente1', password: '123', rol: 'cliente', activo: true }
];

export const INITIAL_GASTOS: Gasto[] = [];

export const INITIAL_REEMBOLSOS: ReembolsoRequest[] = [];

export const INITIAL_ABONOS: Abono[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [];

export const INITIAL_CLIENTE_PROFILE: ClienteProfile = {
  id: 'cli-001',
  nombre: 'Alejandro Morales Ruíz',
  email: 'alejandro.morales@empresa.com',
  telefono: '9931234567',
  empresa: 'Constructora y Proyectos del Sur S.A. de C.V.',
  rfc: 'CPS180512AB3',
  direccion: 'Av. Paseo Tabasco 1205, Col. Lindavista, Villahermosa, Tabasco'
};

export const INITIAL_COMPROBANTES_COMBUSTIBLE_CLIENTE: ComprobanteCombustibleCliente[] = [];

