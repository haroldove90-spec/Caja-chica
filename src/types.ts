export type RoleType = 'home' | 'custodio' | 'contador' | 'admin' | 'cliente';

export interface ClienteProfile {
  id: string;
  nombre: string;
  email: string;
  telefono: string;
  empresa: string;
  rfc: string;
  direccion: string;
}

export interface ComprobanteCombustibleCliente {
  id: string;
  cajaId: string;
  clienteId: string;
  clienteNombre: string;
  fecha: string;
  vehiculo: string;
  placas?: string;
  estacion?: string;
  tipoCombustible: string;
  litros?: number;
  importe: number;
  evidenciaUrl: string;
  evidenciaType?: 'image' | 'pdf';
  estado: 'enviado' | 'revisado' | 'aprobado' | 'rechazado';
  observaciones?: string;
}

export type EstadoGasto = 'borrador' | 'aprobado' | 'rechazado';
export type EstadoCaja = 'Abierta' | 'Pendiente' | 'Cerrada';
export type EstadoReembolso = 'pendiente' | 'aprobado' | 'rechazado';

export interface Gasto {
  id: string;
  cajaId: string;
  nroOrden: string;
  fecha: string;
  proveedor: string;
  concepto: string;
  importe: number;
  solicitante: string;
  giroId: string;
  facturado: boolean;
  evidenciaUrl?: string;
  evidenciaType?: 'image' | 'pdf';
  evidenciaNombre?: string;
  estado: EstadoGasto;
  notaRechazo?: string;
  reembolsoId?: string;
}

export interface ReembolsoRequest {
  id: string;
  nroReembolso: string;
  cajaId: string;
  fechaSolicitud: string;
  totalGastos: number;
  cantGastos: number;
  observaciones?: string;
  estado: EstadoReembolso;
  fechaAprobacion?: string;
  aprobadoPor?: string;
  firmaElectronica?: string;
}

export interface Abono {
  id: string;
  cajaId: string;
  fecha: string;
  monto: number;
  concepto: string;
  registradoPor: string;
  comprobante?: string;
}

export interface CajaChica {
  id: string;
  nombre: string;
  responsable: string;
  fondoBase: number;
  saldoActual: number;
  estado: EstadoCaja;
  ubicacion: string;
}

export interface Giro {
  id: string;
  nombre: string;
  codigo: string;
  color: string;
  activo: boolean;
}

export interface Proveedor {
  id: string;
  nombre: string;
  rfc: string;
  categoria: string;
}

export interface Empleado {
  id: string;
  nombre: string;
  puesto: string;
  departamento: string;
  activo: boolean;
}

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  username?: string;
  password?: string;
  rol: RoleType;
  cajaId?: string;
  activo: boolean;
}

export interface AuditLog {
  id: string;
  fecha: string;
  usuario: string;
  rol: string;
  accion: string;
  modulo: string;
  detalles: string;
}

export type NivelTanque = 'E' | '1/4' | '1/2' | '3/4' | 'F';

export interface RegistroGasolina {
  id: string;
  cajaId: string;
  fecha: string;
  vehiculo: string;
  formaPago: string;
  descripcionUso: string;
  nivelAntes: NivelTanque;
  nivelDespues: NivelTanque;
  km: number;
  importe: number;
  registradoPor: string;
  evidenciaUrl?: string;
  evidenciaType?: 'image' | 'pdf';
}

export interface ComprobanteGastosItem {
  noCuenta: string;
  noOrden?: string;
  noCotizacion?: string;
  nombreProyecto?: string;
  nombre: string;
  importe: number;
}

export interface ComprobanteGastos {
  id: string;
  cajaId: string;
  folio: string;
  fecha: string;
  importe: number;
  importeLetra: string;
  concepto: string;
  solicitadoA: string;
  items: ComprobanteGastosItem[];
  autorizadoPor: string;
  recibidoPor: string;
  evidenciaUrl?: string;
  evidenciaType?: 'image' | 'pdf';
}
