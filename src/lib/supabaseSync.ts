import { supabase } from './supabase';
import {
  Gasto,
  RegistroGasolina,
  ComprobanteGastos,
  ComprobanteCombustibleCliente,
  ReembolsoRequest,
  Abono,
  CajaChica,
  Giro,
  Proveedor,
  Empleado,
  Usuario,
  AuditLog
} from '../types';

// Async Supabase Sync Helpers

export async function fetchSupabaseTable<T>(tableName: string): Promise<T[] | null> {
  try {
    const { data, error } = await supabase
      .from(tableName)
      .select('*');

    if (error) {
      console.warn(`Supabase fetch notice [${tableName}]:`, error.message);
      return null;
    }
    return data as T[];
  } catch (err) {
    console.warn(`Supabase connection offline or table missing [${tableName}]:`, err);
    return null;
  }
}

export async function insertSupabaseRecord(tableName: string, record: Record<string, any>) {
  try {
    const { error } = await supabase.from(tableName).upsert([record], { onConflict: 'id' });
    if (error) {
      console.warn(`Error inserting into Supabase [${tableName}]:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase insert error [${tableName}]:`, err);
  }
}

export async function bulkInsertSupabaseRecords(tableName: string, records: Record<string, any>[]) {
  if (!records || records.length === 0) return;
  try {
    const { error } = await supabase.from(tableName).upsert(records, { onConflict: 'id' });
    if (error) {
      console.warn(`Error bulk inserting into Supabase [${tableName}]:`, error.message);
    } else {
      console.log(`Successfully synced ${records.length} records to Supabase [${tableName}]`);
    }
  } catch (err) {
    console.warn(`Supabase bulk insert error [${tableName}]:`, err);
  }
}

export async function deleteSupabaseRecord(tableName: string, id: string) {
  try {
    const { error } = await supabase.from(tableName).delete().eq('id', id);
    if (error) {
      console.warn(`Error deleting from Supabase [${tableName}]:`, error.message);
    }
  } catch (err) {
    console.warn(`Supabase delete error [${tableName}]:`, err);
  }
}

// Convert CajaChica
export function cajaToDb(c: CajaChica) {
  return {
    id: c.id,
    nombre: c.nombre,
    responsable: c.responsable,
    fondo_base: Number(c.fondoBase || 0),
    saldo_actual: Number(c.saldoActual || 0),
    estado: c.estado || 'Abierta',
    ubicacion: c.ubicacion || ''
  };
}

export function dbToCaja(db: any): CajaChica {
  return {
    id: db.id,
    nombre: db.nombre || '',
    responsable: db.responsable || '',
    fondoBase: Number(db.fondo_base || 0),
    saldoActual: Number(db.saldo_actual || 0),
    estado: db.estado || 'Abierta',
    ubicacion: db.ubicacion || ''
  };
}

// Convert camelCase Gasto to snake_case DB columns
export function gastoToDb(g: Gasto) {
  return {
    id: g.id,
    caja_id: g.cajaId,
    nro_orden: g.nroOrden,
    fecha: g.fecha,
    proveedor: g.proveedor,
    concepto: g.concepto,
    importe: g.importe,
    solicitante: g.solicitante,
    giro_id: g.giroId,
    facturado: g.facturado,
    estado: g.estado,
    reembolso_id: g.reembolsoId || null,
    evidencia_url: g.evidenciaUrl || null,
    evidencia_nombre: g.evidenciaNombre || null,
    evidencia_type: g.evidenciaType || 'image'
  };
}

export function dbToGasto(db: any): Gasto {
  return {
    id: db.id,
    cajaId: db.caja_id,
    nroOrden: db.nro_orden,
    fecha: db.fecha,
    proveedor: db.proveedor,
    concepto: db.concepto,
    importe: Number(db.importe || 0),
    solicitante: db.solicitante,
    giroId: db.giro_id,
    facturado: Boolean(db.facturado),
    estado: db.estado || 'borrador',
    reembolsoId: db.reembolso_id || undefined,
    evidenciaUrl: db.evidencia_url || undefined,
    evidenciaNombre: db.evidencia_nombre || undefined,
    evidenciaType: db.evidencia_type || 'image'
  };
}

// Convert camelCase RegistroGasolina to snake_case DB
export function gasolinaToDb(r: RegistroGasolina) {
  return {
    id: r.id,
    caja_id: r.cajaId,
    fecha: r.fecha,
    vehiculo: r.vehiculo,
    forma_pago: r.formaPago,
    descripcion_uso: r.descripcionUso,
    nivel_antes: r.nivelAntes,
    nivel_despues: r.nivelDespues,
    km: r.km,
    importe: r.importe,
    registrado_por: r.registradoPor,
    evidencia_url: r.evidenciaUrl || null,
    evidencia_type: r.evidenciaType || 'image'
  };
}

export function dbToGasolina(db: any): RegistroGasolina {
  return {
    id: db.id,
    cajaId: db.caja_id,
    fecha: db.fecha,
    vehiculo: db.vehiculo,
    formaPago: db.forma_pago,
    descripcionUso: db.descripcion_uso,
    nivelAntes: db.nivel_antes,
    nivelDespues: db.nivel_despues,
    km: Number(db.km || 0),
    importe: Number(db.importe || 0),
    registradoPor: db.registrado_por,
    evidenciaUrl: db.evidencia_url || undefined,
    evidenciaType: db.evidencia_type || 'image'
  };
}

// Convert ComprobanteGastos
export function comprobanteToDb(c: ComprobanteGastos) {
  return {
    id: c.id,
    caja_id: c.cajaId,
    folio: c.folio,
    fecha: c.fecha,
    importe: Number(c.importe || 0),
    importe_letra: c.importeLetra || '',
    concepto: c.concepto || '',
    solicitado_a: c.solicitadoA || '',
    autorizado_por: c.autorizadoPor || null,
    recibido_por: c.recibidoPor || null,
    evidencia_url: c.evidenciaUrl || null,
    evidencia_type: c.evidenciaType || 'image'
  };
}

export function dbToComprobante(db: any): ComprobanteGastos {
  return {
    id: db.id,
    cajaId: db.caja_id,
    folio: db.folio,
    fecha: db.fecha,
    importe: Number(db.importe || 0),
    importeLetra: db.importe_letra || '',
    concepto: db.concepto || '',
    solicitadoA: db.solicitado_a || '',
    items: [],
    autorizadoPor: db.autorizado_por || '',
    recibidoPor: db.recibido_por || '',
    evidenciaUrl: db.evidencia_url || undefined,
    evidenciaType: db.evidencia_type || 'image'
  };
}

// Convert Abono
export function abonoToDb(a: Abono) {
  return {
    id: a.id,
    caja_id: a.cajaId,
    fecha: a.fecha,
    monto: Number(a.monto || 0),
    concepto: a.concepto,
    registrado_por: a.registradoPor,
    comprobante: a.comprobante || null
  };
}

export function dbToAbono(db: any): Abono {
  return {
    id: db.id,
    cajaId: db.caja_id,
    fecha: db.fecha,
    monto: Number(db.monto || 0),
    concepto: db.concepto,
    registradoPor: db.registrado_por,
    comprobante: db.comprobante || undefined
  };
}

// Convert ReembolsoRequest
export function reembolsoToDb(r: ReembolsoRequest) {
  return {
    id: r.id,
    nro_reembolso: r.nroReembolso,
    caja_id: r.cajaId,
    fecha_solicitud: r.fechaSolicitud,
    total_gastos: Number(r.totalGastos || 0),
    cant_gastos: Number(r.cantGastos || 0),
    observaciones: r.observaciones || null,
    estado: r.estado || 'pendiente',
    fecha_aprobacion: r.fechaAprobacion || null,
    aprobado_por: r.aprobadoPor || null,
    firma_electronica: r.firmaElectronica || null
  };
}

export function dbToReembolso(db: any): ReembolsoRequest {
  return {
    id: db.id,
    nroReembolso: db.nro_reembolso,
    cajaId: db.caja_id,
    fechaSolicitud: db.fecha_solicitud,
    totalGastos: Number(db.total_gastos || 0),
    cantGastos: Number(db.cant_gastos || 0),
    observaciones: db.observaciones || undefined,
    estado: db.estado || 'pendiente',
    fechaAprobacion: db.fecha_aprobacion || undefined,
    aprobadoPor: db.aprobado_por || undefined,
    firmaElectronica: db.firma_electronica || undefined
  };
}

// Convert AuditLog
export function auditToDb(a: AuditLog) {
  return {
    id: a.id,
    fecha: a.fecha,
    usuario: a.usuario,
    rol: a.rol,
    accion: a.accion,
    modulo: a.modulo,
    detalles: a.detalles
  };
}

export function dbToAudit(db: any): AuditLog {
  return {
    id: db.id,
    fecha: db.fecha,
    usuario: db.usuario,
    rol: db.rol,
    accion: db.accion,
    modulo: db.modulo,
    detalles: db.detalles
  };
}

// Sync all local state to Supabase
export async function syncAllDataToSupabase(state: {
  cajas: CajaChica[];
  gastos: Gasto[];
  gasolinaRecords: RegistroGasolina[];
  comprobantesGastos: ComprobanteGastos[];
  comprobantesCombustibleCliente: ComprobanteCombustibleCliente[];
  reembolsos: ReembolsoRequest[];
  abonos: Abono[];
  auditLogs: AuditLog[];
  giros?: Giro[];
  proveedores?: Proveedor[];
  empleados?: Empleado[];
  usuarios?: Usuario[];
  clienteProfile?: any;
}) {
  console.log('Initiating full Supabase sync...');
  if (state.cajas?.length) await bulkInsertSupabaseRecords('cajas_chicas', state.cajas.map(cajaToDb));
  if (state.gastos?.length) await bulkInsertSupabaseRecords('gastos', state.gastos.map(gastoToDb));
  if (state.gasolinaRecords?.length) {
    await bulkInsertSupabaseRecords('registros_gasolina', state.gasolinaRecords.map(gasolinaToDb));
    await bulkInsertSupabaseRecords('registro_gasolina', state.gasolinaRecords.map(gasolinaToDb));
  }
  if (state.comprobantesGastos?.length) await bulkInsertSupabaseRecords('comprobantes_gastos', state.comprobantesGastos.map(comprobanteToDb));
  if (state.comprobantesCombustibleCliente?.length) await bulkInsertSupabaseRecords('comprobantes_combustible_cliente', state.comprobantesCombustibleCliente.map(clienteCombustibleToDb));
  if (state.reembolsos?.length) await bulkInsertSupabaseRecords('reembolsos', state.reembolsos.map(reembolsoToDb));
  if (state.abonos?.length) await bulkInsertSupabaseRecords('abonos', state.abonos.map(abonoToDb));
  if (state.auditLogs?.length) await bulkInsertSupabaseRecords('audit_logs', state.auditLogs.map(auditToDb));

  if (state.giros?.length) {
    await bulkInsertSupabaseRecords('giros', state.giros.map(g => ({
      id: g.id,
      nombre: g.nombre,
      codigo: g.codigo,
      color: g.color || 'bg-zinc-100 text-zinc-800',
      activo: g.activo ?? true
    })));
  }

  if (state.proveedores?.length) {
    await bulkInsertSupabaseRecords('proveedores', state.proveedores.map(p => ({
      id: p.id,
      nombre: p.nombre,
      rfc: p.rfc,
      categoria: p.categoria
    })));
  }

  if (state.empleados?.length) {
    await bulkInsertSupabaseRecords('empleados', state.empleados.map(e => ({
      id: e.id,
      nombre: e.nombre,
      puesto: e.puesto,
      departamento: e.departamento,
      activo: e.activo ?? true
    })));
  }

  if (state.usuarios?.length) {
    await bulkInsertSupabaseRecords('usuarios', state.usuarios.map(u => ({
      id: u.id,
      nombre: u.nombre,
      email: u.email,
      rol: u.rol,
      caja_id: u.cajaId || null,
      activo: u.activo ?? true
    })));
  }

  if (state.clienteProfile) {
    await bulkInsertSupabaseRecords('clientes_perfil', [{
      id: 'cli-001',
      nombre: state.clienteProfile.nombre,
      email: state.clienteProfile.email,
      telefono: state.clienteProfile.telefono || '',
      empresa: state.clienteProfile.empresa || '',
      rfc: state.clienteProfile.rfc || '',
      direccion: state.clienteProfile.direccion || ''
    }]);
  }

  console.log('Full Supabase sync finished.');
}

// Convert ComprobanteCombustibleCliente
export function clienteCombustibleToDb(c: ComprobanteCombustibleCliente) {
  let formattedFecha = c.fecha;
  try {
    if (c.fecha && !c.fecha.includes('T')) {
      formattedFecha = new Date(c.fecha.replace(' ', 'T')).toISOString();
    } else if (c.fecha) {
      formattedFecha = new Date(c.fecha).toISOString();
    } else {
      formattedFecha = new Date().toISOString();
    }
  } catch {
    formattedFecha = new Date().toISOString();
  }

  return {
    id: c.id,
    caja_id: c.cajaId || null,
    cliente_id: c.clienteId || 'cli-001',
    cliente_nombre: c.clienteNombre || 'Cliente',
    fecha: formattedFecha,
    vehiculo: c.vehiculo || 'Vehículo',
    placas: c.placas || null,
    estacion: c.estacion || null,
    tipo_combustible: c.tipoCombustible || 'Magna',
    litros: c.litros || null,
    importe: Number(c.importe || 0),
    evidencia_url: c.evidenciaUrl || 'https://images.unsplash.com/photo-1527018601619-a508a2be00e6?auto=format&fit=crop&w=800&q=80',
    evidencia_type: c.evidenciaType || 'image',
    estado: c.estado || 'enviado',
    observaciones: c.observaciones || null
  };
}

export function dbToClienteCombustible(db: any): ComprobanteCombustibleCliente {
  return {
    id: db.id,
    cajaId: db.caja_id || undefined,
    clienteId: db.cliente_id || 'cli-001',
    clienteNombre: db.cliente_nombre || 'Cliente',
    vehiculo: db.vehiculo || '',
    placas: db.placas || '',
    fecha: db.fecha || new Date().toISOString(),
    importe: Number(db.importe || 0),
    litros: db.litros ? Number(db.litros) : undefined,
    tipoCombustible: db.tipo_combustible || 'Magna',
    estacion: db.estacion || undefined,
    observaciones: db.observaciones || undefined,
    evidenciaUrl: db.evidencia_url || '',
    evidenciaType: db.evidencia_type || 'image',
    estado: db.estado || 'enviado'
  };
}

