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
      .select('*')
      .order('created_at', { ascending: false });

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
    solicitante: c.solicitante,
    giro: c.giro,
    monto_letra: c.montoLetra,
    autorizado_por: c.autorizadoPor,
    recibido_por: c.recibidoPor,
    concepto: c.concepto,
    importe: c.importe,
    evidencia_url: c.evidenciaUrl || null
  };
}

export function dbToComprobante(db: any): ComprobanteGastos {
  return {
    id: db.id,
    cajaId: db.caja_id,
    folio: db.folio,
    fecha: db.fecha,
    solicitante: db.solicitante,
    giro: db.giro,
    montoLetra: db.monto_letra,
    autorizadoPor: db.autorizado_por,
    recibidoPor: db.recibido_por,
    concepto: db.concepto,
    importe: Number(db.importe || 0),
    evidenciaUrl: db.evidencia_url || undefined
  };
}
