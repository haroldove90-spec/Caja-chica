import { CajaChica, Giro, Proveedor, Empleado, Usuario, Gasto, ReembolsoRequest, Abono, AuditLog } from '../types';

export const INITIAL_CAJAS: CajaChica[] = [
  {
    id: 'caja-1',
    nombre: 'Caja Chica - Reina Pino (Matriz)',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 8420.50,
    estado: 'Abierta',
    ubicacion: 'Oficina Central'
  },
  {
    id: 'caja-2',
    nombre: 'Caja Chica - Taller Proyecta',
    responsable: 'Ing. Carlos Mendoza',
    fondoBase: 20000,
    saldoActual: 4150.00,
    estado: 'Pendiente',
    ubicacion: 'Sucursal Taller'
  },
  {
    id: 'caja-3',
    nombre: 'Caja Chica - Coteyuc Sur',
    responsable: 'Alejandro Torres',
    fondoBase: 10000,
    saldoActual: 10000.00,
    estado: 'Abierta',
    ubicacion: 'Planta Sur'
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
  { id: 'emp-1', nombre: 'Lic. Sofía Rodríguez', puesto: 'Custodio de Caja Matriz', departamento: 'Administración', activo: true },
  { id: 'emp-2', nombre: 'Ing. Carlos Mendoza', puesto: 'Jefe de Taller', departamento: 'Mantenimiento', activo: true },
  { id: 'emp-3', nombre: 'CP. Alberto Vargas', puesto: 'Contador General', departamento: 'Finanzas', activo: true },
  { id: 'emp-4', nombre: 'Alejandro Torres', puesto: 'Encargado de Compras', departamento: 'Operaciones', activo: true },
  { id: 'emp-5', nombre: 'Beatriz Hernández', puesto: 'Auxiliar Administrativo', departamento: 'Administración', activo: true }
];

export const INITIAL_USUARIOS: Usuario[] = [
  { id: 'usr-1', nombre: 'Sofía Rodríguez', email: 'sofia.rodriguez@empresa.com', rol: 'custodio', cajaId: 'caja-1', activo: true },
  { id: 'usr-2', nombre: 'CP. Alberto Vargas', email: 'alberto.vargas@empresa.com', rol: 'contador', activo: true },
  { id: 'usr-3', nombre: 'Admin General', email: 'admin@empresa.com', rol: 'admin', activo: true }
];

// Sample placeholder receipt image base64 or clean generated canvas preview
export const SAMPLE_TICKET_URL = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';

export const INITIAL_GASTOS: Gasto[] = [
  {
    id: 'gst-101',
    cajaId: 'caja-1',
    nroOrden: 'ORD-2026-001',
    fecha: '2026-07-28',
    proveedor: 'Servicio Pemex No. 4812',
    concepto: 'Gasolina para camioneta de entregas Publikrea',
    importe: 1250.00,
    solicitante: 'Alejandro Torres',
    giroId: 'giro-1',
    facturado: true,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Factura_Pemex_4812.pdf',
    estado: 'borrador'
  },
  {
    id: 'gst-102',
    cajaId: 'caja-1',
    nroOrden: 'ORD-2026-002',
    fecha: '2026-07-28',
    proveedor: 'Comercial OXXO S.A. de C.V.',
    concepto: 'Insumos de café y galletas para reunión cliente Despacho',
    importe: 380.50,
    solicitante: 'Lic. Sofía Rodríguez',
    giroId: 'giro-4',
    facturado: false,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Ticket_Oxxo_Reunion.jpg',
    estado: 'borrador'
  },
  {
    id: 'gst-103',
    cajaId: 'caja-1',
    nroOrden: 'ORD-2026-003',
    fecha: '2026-07-29',
    proveedor: 'Papelería Yza',
    concepto: 'Hojas tamaño carta y tóner negro impresoras',
    importe: 1450.00,
    solicitante: 'Beatriz Hernández',
    giroId: 'giro-6',
    facturado: true,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Factura_PapeleriaYza_2026.pdf',
    estado: 'borrador'
  },
  {
    id: 'gst-104',
    cajaId: 'caja-1',
    nroOrden: 'ORD-2026-004',
    fecha: '2026-07-29',
    proveedor: 'Ferretería El Candado',
    concepto: 'Tornillería y brocas para montaje Coteyuc',
    importe: 899.00,
    solicitante: 'Ing. Carlos Mendoza',
    giroId: 'giro-3',
    facturado: true,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Factura_Ferreteria_Candado.pdf',
    estado: 'borrador'
  },
  {
    id: 'gst-105',
    cajaId: 'caja-1',
    nroOrden: 'ORD-2026-005',
    fecha: '2026-07-29',
    proveedor: 'Super Willys',
    concepto: 'Jabón líquido, papel higiénico y sanitizante',
    importe: 600.00,
    solicitante: 'Lic. Sofía Rodríguez',
    giroId: 'giro-5',
    facturado: false,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Nota_Willys_Limpieza.jpg',
    estado: 'borrador'
  },
  // Pending reimbursement sample items for Caja 2
  {
    id: 'gst-201',
    cajaId: 'caja-2',
    nroOrden: 'ORD-TAL-188',
    fecha: '2026-07-26',
    proveedor: 'Ferretería El Candado',
    concepto: 'Repuesto de brocas y aceite industrial Taller',
    importe: 8450.00,
    solicitante: 'Ing. Carlos Mendoza',
    giroId: 'giro-2',
    facturado: true,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Factura_Brocas_Taller.pdf',
    estado: 'borrador',
    reembolsoId: 'rmb-239'
  },
  {
    id: 'gst-202',
    cajaId: 'caja-2',
    nroOrden: 'ORD-TAL-189',
    fecha: '2026-07-27',
    proveedor: 'Servicio Pemex No. 4812',
    concepto: 'Diesel para grúa de traslado',
    importe: 7400.00,
    solicitante: 'Ing. Carlos Mendoza',
    giroId: 'giro-2',
    facturado: true,
    evidenciaUrl: SAMPLE_TICKET_URL,
    evidenciaType: 'image',
    evidenciaNombre: 'Factura_Diesel.pdf',
    estado: 'borrador',
    reembolsoId: 'rmb-239'
  }
];

export const INITIAL_REEMBOLSOS: ReembolsoRequest[] = [
  {
    id: 'rmb-239',
    nroReembolso: 'REEMB-239',
    cajaId: 'caja-2',
    fechaSolicitud: '2026-07-27 18:30',
    totalGastos: 15850.00,
    cantGastos: 2,
    observaciones: 'Se entrega documentación física completa con tickets fiscales adheridos.',
    estado: 'pendiente'
  }
];

export const INITIAL_ABONOS: Abono[] = [
  {
    id: 'abn-1',
    cajaId: 'caja-1',
    fecha: '2026-07-21 10:15',
    monto: 10000.00,
    concepto: 'CP. Alberto entregó $10,000.00 por transferencia para aperutra mensual',
    registradoPor: 'CP. Alberto Vargas'
  },
  {
    id: 'abn-2',
    cajaId: 'caja-1',
    fecha: '2026-07-01 09:00',
    monto: 5000.00,
    concepto: 'Abono inicial de fondo fijo de caja chica',
    registradoPor: 'Admin General'
  }
];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    fecha: '2026-07-29 09:12:00',
    usuario: 'Lic. Sofía Rodríguez',
    rol: 'Custodio',
    accion: 'CREAR_GASTO',
    modulo: 'Registro de Gastos',
    detalles: 'Registró gasto ORD-2026-005 por $600.00 (Super Willys)'
  },
  {
    id: 'log-2',
    fecha: '2026-07-27 18:30:15',
    usuario: 'Ing. Carlos Mendoza',
    rol: 'Custodio',
    accion: 'SOLICITAR_REEMBOLSO',
    modulo: 'Cierre de Caja',
    detalles: 'Envió solicitud de Reembolso REEMB-239 por $15,850.00'
  },
  {
    id: 'log-3',
    fecha: '2026-07-21 10:15:00',
    usuario: 'CP. Alberto Vargas',
    rol: 'Contador',
    accion: 'ABONAR_FONDO',
    modulo: 'Inyecciones de Fondo',
    detalles: 'Abonó $10,000.00 a Caja Chica - Reina Pino'
  }
];
