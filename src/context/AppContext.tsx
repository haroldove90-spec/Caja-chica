import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  RoleType,
  Gasto,
  ReembolsoRequest,
  Abono,
  CajaChica,
  Giro,
  Proveedor,
  Empleado,
  Usuario,
  AuditLog,
  RegistroGasolina,
  ComprobanteGastos,
  ClienteProfile,
  ComprobanteCombustibleCliente,
  SupabaseSaveTelemetry
} from '../types';
import {
  INITIAL_CAJAS,
  INITIAL_GIROS,
  INITIAL_PROVEEDORES,
  INITIAL_EMPLEADOS,
  INITIAL_USUARIOS,
  INITIAL_GASTOS,
  INITIAL_REEMBOLSOS,
  INITIAL_ABONOS,
  INITIAL_AUDIT_LOGS,
  INITIAL_GASOLINA,
  INITIAL_COMPROBANTES,
  INITIAL_CLIENTE_PROFILE,
  INITIAL_COMPROBANTES_COMBUSTIBLE_CLIENTE
} from '../data/initialData';
import {
  fetchSupabaseTable,
  insertSupabaseRecord,
  bulkInsertSupabaseRecords,
  deleteSupabaseRecord,
  gastoToDb,
  dbToGasto,
  gasolinaToDb,
  dbToGasolina,
  comprobanteToDb,
  dbToComprobante,
  clienteCombustibleToDb,
  dbToClienteCombustible,
  cajaToDb,
  dbToCaja,
  abonoToDb,
  dbToAbono,
  reembolsoToDb,
  dbToReembolso,
  auditToDb,
  dbToAudit,
  usuarioToDb,
  dbToUsuario,
  syncAllDataToSupabase
} from '../lib/supabaseSync';

interface AppContextType {
  role: RoleType;
  currentUser: Usuario | null;
  setCurrentUser: (usr: Usuario | null) => void;
  setRole: (role: RoleType, user?: Usuario | null) => void;
  activeModule: string;
  setActiveModule: (mod: string) => void;
  activeCajaId: string;
  setActiveCajaId: (id: string) => void;

  cajas: CajaChica[];
  giros: Giro[];
  proveedores: Proveedor[];
  empleados: Empleado[];
  usuarios: Usuario[];
  gastos: Gasto[];
  reembolsos: ReembolsoRequest[];
  abonos: Abono[];
  auditLogs: AuditLog[];
  gasolinaRecords: RegistroGasolina[];
  comprobantesGastos: ComprobanteGastos[];
  clienteProfile: ClienteProfile;
  comprobantesCombustibleCliente: ComprobanteCombustibleCliente[];

  // Active Caja Helper
  activeCaja: CajaChica | undefined;
  activeCajaGastos: Gasto[];
  activeCajaGastosAcumulados: number;
  activeCajaSaldoDisponible: number;

  // Supabase Save Telemetry
  lastSupabaseSave: SupabaseSaveTelemetry | null;
  supabaseSaveHistory: SupabaseSaveTelemetry[];
  dismissLastSupabaseSave: () => void;

  // Actions: Gastos (CRUD + Desactivar)
  addGasto: (gasto: Omit<Gasto, 'id' | 'estado'>) => void;
  updateGasto: (gasto: Gasto) => void;
  deleteGasto: (id: string) => void;
  toggleActivoGasto: (id: string) => void;
  
  solicitarReembolso: (cajaId: string, observaciones: string, folioPersonalizado?: string) => void;
  aprobarReembolso: (reembolsoId: string, firma: string) => void;
  rechazarGasto: (gastoId: string, motivo: string) => void;
  aprobarGasto: (gastoId: string) => void;

  // Actions: Abonos / Fondos (CRUD + Desactivar)
  addAbono: (abono: Omit<Abono, 'id'>) => void;
  updateAbono: (abono: Abono) => void;
  deleteAbono: (id: string) => void;
  toggleActivoAbono: (id: string) => void;
  updateFondoBase: (cajaId: string, nuevoFondo: number) => void;

  // Actions: Cajas Chicas (CRUD + Desactivar)
  addCaja: (caja: Omit<CajaChica, 'id' | 'saldoActual' | 'estado'>) => void;
  updateCaja: (caja: CajaChica) => void;
  deleteCaja: (id: string) => void;
  toggleActivoCaja: (id: string) => void;

  // Actions: Giros (CRUD + Desactivar)
  addGiro: (giro: Omit<Giro, 'id'>) => void;
  updateGiro: (giro: Giro) => void;
  deleteGiro: (id: string) => void;
  toggleActivoGiro: (id: string) => void;

  // Actions: Proveedores (CRUD + Desactivar)
  addProveedor: (prov: Omit<Proveedor, 'id'>) => void;
  updateProveedor: (prov: Proveedor) => void;
  deleteProveedor: (id: string) => void;
  toggleActivoProveedor: (id: string) => void;

  // Actions: Empleados (CRUD + Desactivar)
  addEmpleado: (emp: Omit<Empleado, 'id'>) => void;
  updateEmpleado: (emp: Empleado) => void;
  deleteEmpleado: (id: string) => void;
  toggleActivoEmpleado: (id: string) => void;

  // Actions: Usuarios (CRUD + Desactivar)
  addUsuario: (usr: Omit<Usuario, 'id'>) => void;
  updateUsuario: (usr: Usuario) => void;
  deleteUsuario: (id: string) => void;
  toggleActivoUsuario: (id: string) => void;

  // Actions: Gasolina (CRUD + Desactivar)
  addRegistroGasolina: (rec: Omit<RegistroGasolina, 'id'>) => void;
  updateRegistroGasolina: (rec: RegistroGasolina) => void;
  deleteRegistroGasolina: (id: string) => void;
  toggleActivoRegistroGasolina: (id: string) => void;

  // Actions: Comprobantes Gastos (CRUD + Desactivar)
  addComprobanteGastos: (comp: Omit<ComprobanteGastos, 'id'>) => void;
  updateComprobanteGastos: (comp: ComprobanteGastos) => void;
  deleteComprobanteGastos: (id: string) => void;
  toggleActivoComprobanteGastos: (id: string) => void;

  // Actions: Clientes & Comprobantes Cliente (CRUD + Desactivar)
  updateClienteProfile: (profile: Partial<ClienteProfile>) => void;
  addComprobanteCombustibleCliente: (comp: Omit<ComprobanteCombustibleCliente, 'id' | 'estado'>) => void;
  updateComprobanteCombustibleCliente: (comp: ComprobanteCombustibleCliente) => void;
  updateComprobanteCombustibleClienteEstado: (id: string, estado: 'enviado' | 'revisado' | 'aprobado' | 'rechazado') => void;
  deleteComprobanteCombustibleCliente: (id: string) => void;
  toggleActivoComprobanteCombustibleCliente: (id: string) => void;

  resetData: () => void;
  syncWithSupabaseNow: () => Promise<void>;

  // Evidencia Modal Preview
  previewEvidencia: { url: string; type?: 'image' | 'pdf'; title?: string } | null;
  setPreviewEvidencia: (data: { url: string; type?: 'image' | 'pdf'; title?: string } | null) => void;

  // Printable PDF Modals
  pdfModalData: { reembolso?: ReembolsoRequest; caja?: CajaChica; gastos?: Gasto[] } | null;
  setPdfModalData: (data: { reembolso?: ReembolsoRequest; caja?: CajaChica; gastos?: Gasto[] } | null) => void;

  pdfGasolinaModalData: { record?: RegistroGasolina; list?: RegistroGasolina[]; vehiculo?: string } | null;
  setPdfGasolinaModalData: (data: { record?: RegistroGasolina; list?: RegistroGasolina[]; vehiculo?: string } | null) => void;

  pdfComprobanteModalData: ComprobanteGastos | null;
  setPdfComprobanteModalData: (data: ComprobanteGastos | null) => void;
}


const STORAGE_KEY = 'control_caja_app_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [role, setRoleState] = useState<RoleType>('home');
  const [currentUser, setCurrentUser] = useState<Usuario | null>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_currentUser`);
    return saved ? JSON.parse(saved) : null;
  });
  const [activeModule, setActiveModuleState] = useState<string>('movimientos');
  const [activeCajaId, setActiveCajaId] = useState<string>('caja-1');

  // State collections
  const [cajas, setCajas] = useState<CajaChica[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cajas`);
    return saved !== null ? JSON.parse(saved) : INITIAL_CAJAS;
  });

  const [giros, setGiros] = useState<Giro[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_giros`);
    return saved !== null ? JSON.parse(saved) : INITIAL_GIROS;
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_proveedores`);
    return saved !== null ? JSON.parse(saved) : INITIAL_PROVEEDORES;
  });

  const [empleados, setEmpleados] = useState<Empleado[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_empleados`);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_EMPLEADOS;
      }
    }
    return INITIAL_EMPLEADOS;
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_usuarios`);
    if (saved !== null) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_USUARIOS;
      }
    }
    return INITIAL_USUARIOS;
  });

  const [gastos, setGastos] = useState<Gasto[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gastos`);
    return saved !== null ? JSON.parse(saved) : INITIAL_GASTOS;
  });

  const [reembolsos, setReembolsos] = useState<ReembolsoRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reembolsos`);
    return saved !== null ? JSON.parse(saved) : INITIAL_REEMBOLSOS;
  });

  const [abonos, setAbonos] = useState<Abono[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_abonos`);
    return saved !== null ? JSON.parse(saved) : INITIAL_ABONOS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved !== null ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [gasolinaRecords, setGasolinaRecords] = useState<RegistroGasolina[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gasolinaRecords`);
    return saved !== null ? JSON.parse(saved) : INITIAL_GASOLINA;
  });

  const [comprobantesGastos, setComprobantesGastos] = useState<ComprobanteGastos[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comprobantesGastos`);
    return saved !== null ? JSON.parse(saved) : INITIAL_COMPROBANTES;
  });

  const [clienteProfile, setClienteProfile] = useState<ClienteProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clienteProfile`);
    return saved !== null ? JSON.parse(saved) : INITIAL_CLIENTE_PROFILE;
  });

  const [comprobantesCombustibleCliente, setComprobantesCombustibleCliente] = useState<ComprobanteCombustibleCliente[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comprobantesCombustibleCliente`);
    return saved !== null ? JSON.parse(saved) : INITIAL_COMPROBANTES_COMBUSTIBLE_CLIENTE;
  });

  // Modal preview state
  const [previewEvidencia, setPreviewEvidencia] = useState<{ url: string; type?: 'image' | 'pdf'; title?: string } | null>(null);
  const [pdfModalData, setPdfModalData] = useState<{ reembolso?: ReembolsoRequest; caja?: CajaChica; gastos?: Gasto[] } | null>(null);
  const [pdfGasolinaModalData, setPdfGasolinaModalData] = useState<{ record?: RegistroGasolina; list?: RegistroGasolina[]; vehiculo?: string } | null>(null);
  const [pdfComprobanteModalData, setPdfComprobanteModalData] = useState<ComprobanteGastos | null>(null);

  // Initial Fetch from Supabase & Periodic Sync for Multi-Browser / Realtime
  useEffect(() => {
    let isMounted = true;
    async function loadFromSupabase() {
      if (!isMounted) return;

      // Fetch gastos
      const dbGastos = await fetchSupabaseTable('gastos');
      if (dbGastos && isMounted) {
        const mapped = dbGastos.map(dbToGasto);
        setGastos(mapped);
      }

      // Fetch gasolina
      const dbGasolina = await fetchSupabaseTable('registros_gasolina');
      if (dbGasolina && isMounted) {
        const mapped = dbGasolina.map(dbToGasolina);
        setGasolinaRecords(mapped);
      }

      // Fetch comprobantes
      const dbComprobantes = await fetchSupabaseTable('comprobantes_gastos');
      if (dbComprobantes && isMounted) {
        const mapped = dbComprobantes.map(dbToComprobante);
        setComprobantesGastos(mapped);
      }

      // Fetch comprobantes combustible cliente
      const dbClienteComb = await fetchSupabaseTable('comprobantes_combustible_cliente');
      if (dbClienteComb && isMounted) {
        const mapped = dbClienteComb.map(dbToClienteCombustible);
        mapped.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
        setComprobantesCombustibleCliente(mapped);
      }

      // Fetch cajas
      const dbCajas = await fetchSupabaseTable('cajas_chicas');
      if (dbCajas && isMounted) {
        if (dbCajas.length > 0) {
          const mapped = dbCajas.map(dbToCaja);
          // Merge missing initial cajas so all standard company cajas are available
          const missingDefaults = INITIAL_CAJAS.filter(ic => !mapped.some(m => m.id === ic.id));
          setCajas([...mapped, ...missingDefaults]);
        } else {
          // If table exists but has 0 rows, use INITIAL_CAJAS as base so system is always functional
          setCajas(INITIAL_CAJAS);
        }
      }

      // Fetch giros
      const dbGiros = await fetchSupabaseTable<any>('giros');
      if (dbGiros && isMounted) {
        if (dbGiros.length > 0) {
          setGiros(dbGiros.map(db => ({
            id: db.id,
            nombre: db.nombre,
            color: db.color || '#024182',
            activo: db.activo ?? true
          })));
        } else {
          setGiros(prev => prev.length > 0 ? prev : INITIAL_GIROS);
        }
      }

      // Fetch abonos
      const dbAbonos = await fetchSupabaseTable('abonos');
      if (dbAbonos && isMounted) {
        const mapped = dbAbonos.map(dbToAbono);
        setAbonos(mapped);
      }

      // Fetch reembolsos
      const dbReembolsos = await fetchSupabaseTable('reembolsos');
      if (dbReembolsos && isMounted) {
        const mapped = dbReembolsos.map(dbToReembolso);
        setReembolsos(mapped);
      }

      // Fetch audit logs
      const dbAudit = await fetchSupabaseTable('audit_logs');
      if (dbAudit && isMounted) {
        const mapped = dbAudit.map(dbToAudit);
        setAuditLogs(mapped);
      }

      // Fetch usuarios
      const dbUsuarios = await fetchSupabaseTable<any>('usuarios');
      if (dbUsuarios && isMounted) {
        setUsuarios(prev => {
          return dbUsuarios.map(dbRow => {
            const parsed = dbToUsuario(dbRow);
            const localMatch = prev.find(p => p.id === parsed.id || (p.email && p.email.toLowerCase() === parsed.email.toLowerCase()));
            return {
              ...parsed,
              username: parsed.username || localMatch?.username,
              password: parsed.password || localMatch?.password,
              telefono: parsed.telefono || localMatch?.telefono,
            };
          });
        });
      }

      // Fetch empleados
      const dbEmpleados = await fetchSupabaseTable<any>('empleados');
      if (dbEmpleados && isMounted) {
        setEmpleados(dbEmpleados.map(db => ({
          id: db.id,
          nombre: db.nombre,
          puesto: db.puesto,
          departamento: db.departamento,
          activo: db.activo ?? true
        })));
      }

      // Fetch proveedores
      const dbProveedores = await fetchSupabaseTable<any>('proveedores');
      if (dbProveedores && isMounted) {
        setProveedores(dbProveedores.map(db => ({
          id: db.id,
          nombre: db.nombre,
          rfc: db.rfc,
          categoria: db.categoria,
          activo: db.activo ?? true
        })));
      }
    }

    loadFromSupabase();

    // Auto-polling every 6 seconds and on window focus to keep multiple browsers in sync
    const interval = setInterval(() => {
      if (isMounted) loadFromSupabase();
    }, 6000);

    const handleFocus = () => {
      if (isMounted) loadFromSupabase();
    };
    window.addEventListener('focus', handleFocus);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cajas`, JSON.stringify(cajas));
  }, [cajas]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_giros`, JSON.stringify(giros));
  }, [giros]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_proveedores`, JSON.stringify(proveedores));
  }, [proveedores]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_empleados`, JSON.stringify(empleados));
  }, [empleados]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_usuarios`, JSON.stringify(usuarios));
  }, [usuarios]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gastos`, JSON.stringify(gastos));
  }, [gastos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_reembolsos`, JSON.stringify(reembolsos));
  }, [reembolsos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_abonos`, JSON.stringify(abonos));
  }, [abonos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_auditLogs`, JSON.stringify(auditLogs));
  }, [auditLogs]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_gasolinaRecords`, JSON.stringify(gasolinaRecords));
  }, [gasolinaRecords]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_comprobantesGastos`, JSON.stringify(comprobantesGastos));
  }, [comprobantesGastos]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_clienteProfile`, JSON.stringify(clienteProfile));
  }, [clienteProfile]);

  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_comprobantesCombustibleCliente`, JSON.stringify(comprobantesCombustibleCliente));
  }, [comprobantesCombustibleCliente]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(`${STORAGE_KEY}_currentUser`, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(`${STORAGE_KEY}_currentUser`);
    }
  }, [currentUser]);

  const setRole = (newRole: RoleType, user?: Usuario | null) => {
    setRoleState(newRole);
    if (user !== undefined) {
      setCurrentUser(user);
      if (user && user.rol === 'cliente') {
        setClienteProfile(prev => ({
          ...prev,
          nombre: user.nombre || prev.nombre,
          email: user.email || prev.email,
          telefono: user.telefono || prev.telefono
        }));
      }
    } else if (newRole === 'home') {
      setCurrentUser(null);
    }

    if (newRole === 'custodio') setActiveModuleState('movimientos');
    else if (newRole === 'contador') setActiveModuleState('auditoria');
    else if (newRole === 'admin') setActiveModuleState('multicajas');
    else if (newRole === 'cliente') setActiveModuleState('comprobantes_combustible');
  };

  const setActiveModule = (mod: string) => {
    setActiveModuleState(mod);
  };

  const logAudit = (accion: string, modulo: string, detalles: string) => {
    const userDisplayName = currentUser?.nombre || (
      role === 'custodio' ? 'Lic. Sofía Rodríguez' :
      role === 'contador' ? 'CP. Alberto Vargas' :
      role === 'cliente' ? 'Cliente Registrado' : 'Admin General'
    );

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario: userDisplayName,
      rol: role === 'custodio' ? 'Custodio' : role === 'contador' ? 'Contador' : role === 'cliente' ? 'Cliente' : 'Admin',
      accion,
      modulo,
      detalles
    };
    setAuditLogs(prev => [newLog, ...prev]);
  };

  // Supabase Save Telemetry State
  const [lastSupabaseSave, setLastSupabaseSave] = useState<SupabaseSaveTelemetry | null>(null);
  const [supabaseSaveHistory, setSupabaseSaveHistory] = useState<SupabaseSaveTelemetry[]>([]);

  const dismissLastSupabaseSave = () => setLastSupabaseSave(null);

  const recordSupabaseTelemetry = (
    tableName: string,
    moduleName: string,
    action: 'insert' | 'update' | 'delete' | 'toggle_active',
    recordIdentifier: string,
    previousCount: number,
    newCount: number,
    latencyMs: number,
    status: 'success' | 'syncing' | 'error' = 'success',
    errorMessage?: string
  ) => {
    const now = new Date();
    const diasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    
    const dayOfWeek = diasSemana[now.getDay()];
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const monthName = meses[now.getMonth()];
    const year = now.getFullYear();
    const time = now.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
    const date = `${day}/${month}/${year}`;
    const formattedDateTime = `${dayOfWeek}, ${day} de ${monthName} de ${year} - ${time}`;
    const timestamp = `${year}-${month}-${day} ${time}`;

    const telemetry: SupabaseSaveTelemetry = {
      id: `tel-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      tableName,
      moduleName,
      action,
      recordIdentifier,
      previousCount,
      newCount,
      timestamp,
      formattedDateTime,
      dayOfWeek,
      time,
      date,
      latencyMs,
      status,
      errorMessage
    };

    setLastSupabaseSave(telemetry);
    setSupabaseSaveHistory(prev => [telemetry, ...prev.slice(0, 29)]);
  };

  // Helper fallback caja
  const defaultFallbackCaja: CajaChica = {
    id: 'caja-1',
    nombre: 'Caja Chica - Matriz',
    responsable: 'Lic. Sofía Rodríguez',
    fondoBase: 15000,
    saldoActual: 15000,
    estado: 'Abierta',
    ubicacion: 'Oficina Central'
  };

  // Helper calculations for active caja - guaranteed to always return a valid CajaChica object
  const activeCaja: CajaChica = cajas.find(c => c.id === activeCajaId) || cajas[0] || defaultFallbackCaja;
  const activeCajaGastos = gastos.filter(g => g.cajaId === activeCaja.id && !g.reembolsoId && g.activo !== false);
  const activeCajaGastosAcumulados = activeCajaGastos.reduce((acc, curr) => acc + curr.importe, 0);
  const activeCajaSaldoDisponible = activeCaja ? (activeCaja.fondoBase - activeCajaGastosAcumulados) : 0;

  // Actions: GASTOS (CRUD + Desactivar)
  const addGasto = async (gastoData: Omit<Gasto, 'id' | 'estado'>) => {
    const prevCount = gastos.length;
    const newId = `gst-${Date.now().toString().slice(-4)}`;
    const newGasto: Gasto = {
      ...gastoData,
      id: newId,
      estado: 'borrador',
      activo: true
    };
    // Prepend so new record is always FIRST
    setGastos(prev => [newGasto, ...prev]);

    // Save to Supabase DB asynchronously
    const res = await insertSupabaseRecord('gastos', gastoToDb(newGasto));
    recordSupabaseTelemetry('gastos', 'Registro de Gastos', 'insert', newGasto.nroOrden || newGasto.id, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    // recalculate caja saldo
    let updatedCaja: CajaChica | undefined;
    setCajas(prev => prev.map(c => {
      if (c.id === gastoData.cajaId) {
        updatedCaja = {
          ...c,
          saldoActual: Math.max(0, Number(((c.saldoActual || 0) - gastoData.importe).toFixed(2)))
        };
        return updatedCaja;
      }
      return c;
    }));

    if (updatedCaja) {
      await insertSupabaseRecord('cajas_chicas', cajaToDb(updatedCaja));
    }

    logAudit('CREAR_GASTO', 'Registro de Gastos', `Registró gasto ${newGasto.nroOrden} por $${newGasto.importe.toFixed(2)} (${newGasto.proveedor})`);
  };

  const updateGasto = async (updated: Gasto) => {
    const prevCount = gastos.length;
    // Keep updated item at top if required or preserve top position
    setGastos(prev => [updated, ...prev.filter(g => g.id !== updated.id)]);

    // Save to Supabase DB asynchronously
    const res = await insertSupabaseRecord('gastos', gastoToDb(updated));
    recordSupabaseTelemetry('gastos', 'Registro de Gastos', 'update', updated.nroOrden || updated.id, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    logAudit('EDITAR_GASTO', 'Registro de Gastos', `Editó gasto ${updated.nroOrden}`);
  };

  const deleteGasto = async (id: string) => {
    const target = gastos.find(g => g.id === id);
    if (!target) return;
    const prevCount = gastos.length;
    setGastos(prev => prev.filter(g => g.id !== id));

    // Delete from Supabase DB asynchronously
    const res = await deleteSupabaseRecord('gastos', id);
    recordSupabaseTelemetry('gastos', 'Registro de Gastos', 'delete', target.nroOrden || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    // Restore balance
    let updatedCaja: CajaChica | undefined;
    setCajas(prev => prev.map(c => {
      if (c.id === target.cajaId) {
        updatedCaja = {
          ...c,
          saldoActual: Number(((c.saldoActual || 0) + target.importe).toFixed(2))
        };
        return updatedCaja;
      }
      return c;
    }));

    if (updatedCaja) {
      await insertSupabaseRecord('cajas_chicas', cajaToDb(updatedCaja));
    }

    logAudit('ELIMINAR_GASTO', 'Registro de Gastos', `Eliminó gasto ${target.nroOrden} por $${target.importe.toFixed(2)}`);
  };

  const toggleActivoGasto = async (id: string) => {
    const target = gastos.find(g => g.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = gastos.length;
    setGastos(prev => prev.map(g => g.id === id ? updated : g));

    const res = await insertSupabaseRecord('gastos', gastoToDb(updated));
    recordSupabaseTelemetry('gastos', 'Registro de Gastos', 'toggle_active', `${target.nroOrden} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CAMBIAR_ESTADO_GASTO', 'Registro de Gastos', `${updated.activo ? 'Activó' : 'Desactivó'} gasto ${target.nroOrden}`);
  };

  const solicitarReembolso = async (cajaId: string, observaciones: string, folioPersonalizado?: string) => {
    const unsubmittedGastos = gastos.filter(g => g.cajaId === cajaId && !g.reembolsoId && g.activo !== false);
    if (unsubmittedGastos.length === 0) return;

    const prevCount = reembolsos.length;
    const total = unsubmittedGastos.reduce((a, b) => a + b.importe, 0);
    const rmbId = `rmb-${Date.now().toString().slice(-4)}`;
    const nro = (folioPersonalizado && folioPersonalizado.trim())
      ? folioPersonalizado.trim()
      : `REEMB-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: ReembolsoRequest = {
      id: rmbId,
      nroReembolso: nro,
      cajaId,
      fechaSolicitud: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalGastos: total,
      cantGastos: unsubmittedGastos.length,
      observaciones,
      estado: 'pendiente',
      activo: true
    };

    // Attach refund ID to expenses
    const updatedGastosList = gastos.map(g => {
      if (g.cajaId === cajaId && !g.reembolsoId) {
        return { ...g, reembolsoId: rmbId };
      }
      return g;
    });

    setGastos(updatedGastosList);
    setReembolsos(prev => [newRequest, ...prev]);

    // Freeze caja status to Pendiente
    setCajas(prev => prev.map(c => c.id === cajaId ? { ...c, estado: 'Pendiente' } : c));

    // Persist refund request to Supabase
    const res = await insertSupabaseRecord('reembolsos', reembolsoToDb(newRequest));
    recordSupabaseTelemetry('reembolsos', 'Cierre de Caja', 'insert', newRequest.nroReembolso, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    // Also persist gastos with updated reembolso_id to Supabase so background sync doesn't detach them
    const affectedGastos = unsubmittedGastos.map(g => ({ ...g, reembolsoId: rmbId }));
    await bulkInsertSupabaseRecords('gastos', affectedGastos.map(g => gastoToDb(g)));

    logAudit('SOLICITAR_REEMBOLSO', 'Cierre de Caja', `Solicitó reembolso ${nro} por $${total.toFixed(2)} (${unsubmittedGastos.length} comprobantes)`);
  };

  const aprobarReembolso = async (reembolsoId: string, firma: string) => {
    const rmb = reembolsos.find(r => r.id === reembolsoId);
    if (!rmb) return;

    const updatedRmb: ReembolsoRequest = {
      ...rmb,
      estado: 'aprobado',
      fechaAprobacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      aprobadoPor: 'CP. Alberto Vargas',
      firmaElectronica: firma
    };

    // Approve reimbursement
    setReembolsos(prev => prev.map(r => r.id === reembolsoId ? updatedRmb : r));

    // Mark expenses as approved
    const affectedGastos = gastos.filter(g => g.reembolsoId === reembolsoId).map(g => ({ ...g, estado: 'aprobado' as const }));
    setGastos(prev => prev.map(g => g.reembolsoId === reembolsoId ? { ...g, estado: 'aprobado' } : g));

    // Reopen caja & restore balance to fondoBase
    let updatedReembolsoCaja: CajaChica | undefined;
    setCajas(prev => prev.map(c => {
      if (c.id === rmb.cajaId) {
        updatedReembolsoCaja = {
          ...c,
          estado: 'Abierta',
          saldoActual: c.fondoBase
        };
        return updatedReembolsoCaja;
      }
      return c;
    }));

    if (updatedReembolsoCaja) {
      await insertSupabaseRecord('cajas_chicas', cajaToDb(updatedReembolsoCaja));
    }

    const res = await insertSupabaseRecord('reembolsos', reembolsoToDb(updatedRmb));
    recordSupabaseTelemetry('reembolsos', 'Auditoría', 'update', `Aprobado ${rmb.nroReembolso}`, reembolsos.length, reembolsos.length, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    if (affectedGastos.length > 0) {
      await bulkInsertSupabaseRecords('gastos', affectedGastos.map(g => gastoToDb(g)));
    }

    logAudit('APROBAR_REEMBOLSO', 'Auditoría', `Aprobó Reembolso ${rmb.nroReembolso} por $${rmb.totalGastos.toFixed(2)}`);
  };

  const rechazarGasto = async (gastoId: string, motivo: string) => {
    const target = gastos.find(g => g.id === gastoId);
    if (!target) return;
    const updated = { ...target, estado: 'rechazado' as const, notaRechazo: motivo };
    setGastos(prev => prev.map(g => g.id === gastoId ? updated : g));
    await insertSupabaseRecord('gastos', gastoToDb(updated));
    logAudit('RECHAZAR_GASTO', 'Auditoría', `Rechazó gasto ${gastoId} por: "${motivo}"`);
  };

  const aprobarGasto = async (gastoId: string) => {
    const target = gastos.find(g => g.id === gastoId);
    if (!target) return;
    const updated = { ...target, estado: 'aprobado' as const, notaRechazo: undefined };
    setGastos(prev => prev.map(g => g.id === gastoId ? updated : g));
    await insertSupabaseRecord('gastos', gastoToDb(updated));
    logAudit('APROBAR_GASTO', 'Auditoría', `Aprobó individualmente gasto ${gastoId}`);
  };

  // Actions: ABONOS / FONDOS (CRUD + Desactivar)
  const addAbono = async (abonoData: Omit<Abono, 'id'>) => {
    const prevCount = abonos.length;
    const newAbono: Abono = {
      ...abonoData,
      id: `abn-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    setAbonos(prev => [newAbono, ...prev]);

    // Inject to caja balance and save to database
    let updatedCaja: CajaChica | undefined;
    setCajas(prev => prev.map(c => {
      if (c.id === abonoData.cajaId) {
        updatedCaja = {
          ...c,
          saldoActual: Number(((c.saldoActual || 0) + abonoData.monto).toFixed(2))
        };
        return updatedCaja;
      }
      return c;
    }));

    const res = await insertSupabaseRecord('abonos', abonoToDb(newAbono));
    recordSupabaseTelemetry('abonos', 'Inyecciones de Fondo', 'insert', `$${newAbono.monto} - ${newAbono.concepto}`, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    // Persist new saldo to Supabase
    if (updatedCaja) {
      await insertSupabaseRecord('cajas_chicas', cajaToDb(updatedCaja));
    }

    logAudit('ABONAR_FONDO', 'Inyecciones de Fondo', `Abonó $${abonoData.monto.toFixed(2)} a caja ${abonoData.cajaId}`);
  };

  const updateAbono = async (updated: Abono) => {
    const prevCount = abonos.length;
    setAbonos(prev => prev.map(a => a.id === updated.id ? updated : a));
    const res = await insertSupabaseRecord('abonos', abonoToDb(updated));
    recordSupabaseTelemetry('abonos', 'Inyecciones de Fondo', 'update', `$${updated.monto} - ${updated.concepto}`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_ABONO', 'Inyecciones de Fondo', `Editó abono ${updated.id} por $${updated.monto}`);
  };

  const deleteAbono = async (id: string) => {
    const target = abonos.find(a => a.id === id);
    if (!target) return;
    const prevCount = abonos.length;
    setAbonos(prev => prev.filter(a => a.id !== id));
    const res = await deleteSupabaseRecord('abonos', id);
    recordSupabaseTelemetry('abonos', 'Inyecciones de Fondo', 'delete', target.concepto || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    // Revert injected balance from caja
    let updatedCaja: CajaChica | undefined;
    setCajas(prev => prev.map(c => {
      if (c.id === target.cajaId) {
        updatedCaja = {
          ...c,
          saldoActual: Math.max(0, Number(((c.saldoActual || 0) - target.monto).toFixed(2)))
        };
        return updatedCaja;
      }
      return c;
    }));

    if (updatedCaja) {
      await insertSupabaseRecord('cajas_chicas', cajaToDb(updatedCaja));
    }

    logAudit('ELIMINAR_ABONO', 'Inyecciones de Fondo', `Eliminó abono de $${target.monto}`);
  };

  const toggleActivoAbono = async (id: string) => {
    const target = abonos.find(a => a.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = abonos.length;
    setAbonos(prev => prev.map(a => a.id === id ? updated : a));
    const res = await insertSupabaseRecord('abonos', abonoToDb(updated));
    recordSupabaseTelemetry('abonos', 'Inyecciones de Fondo', 'toggle_active', `${target.concepto} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const updateFondoBase = async (cajaId: string, nuevoFondo: number) => {
    setCajas(prev => prev.map(c => {
      if (c.id === cajaId) {
        const updated = { ...c, fondoBase: nuevoFondo };
        insertSupabaseRecord('cajas_chicas', cajaToDb(updated));
        return updated;
      }
      return c;
    }));
    logAudit('AJUSTAR_FONDO_BASE', 'Inyecciones de Fondo', `Actualizó fondo base de caja ${cajaId} a $${nuevoFondo.toFixed(2)}`);
  };

  // Actions: CAJAS CHICAS (CRUD + Desactivar)
  const addCaja = async (cajaData: Omit<CajaChica, 'id' | 'saldoActual' | 'estado'>) => {
    const prevCount = cajas.length;
    const newCaja: CajaChica = {
      ...cajaData,
      id: `caja-${Date.now().toString().slice(-4)}`,
      saldoActual: cajaData.fondoBase,
      estado: 'Abierta',
      activo: true
    };
    setCajas(prev => [...prev, newCaja]);
    const res = await insertSupabaseRecord('cajas_chicas', cajaToDb(newCaja));
    recordSupabaseTelemetry('cajas_chicas', 'Multi-Cajas', 'insert', newCaja.nombre, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CREAR_CAJA', 'Multi-Cajas', `Creó nueva caja chica: ${newCaja.nombre}`);
  };

  const updateCaja = async (updated: CajaChica) => {
    const prevCount = cajas.length;
    setCajas(prev => prev.map(c => c.id === updated.id ? updated : c));
    const res = await insertSupabaseRecord('cajas_chicas', cajaToDb(updated));
    recordSupabaseTelemetry('cajas_chicas', 'Multi-Cajas', 'update', updated.nombre, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_CAJA', 'Multi-Cajas', `Actualizó parámetros de caja ${updated.nombre}`);
  };

  const deleteCaja = async (id: string) => {
    const target = cajas.find(c => c.id === id);
    if (!target) return;
    const prevCount = cajas.length;
    setCajas(prev => prev.filter(c => c.id !== id));
    const res = await deleteSupabaseRecord('cajas_chicas', id);
    recordSupabaseTelemetry('cajas_chicas', 'Multi-Cajas', 'delete', target.nombre || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('ELIMINAR_CAJA', 'Multi-Cajas', `Eliminó caja ${target.nombre}`);
  };

  const toggleActivoCaja = async (id: string) => {
    const target = cajas.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = cajas.length;
    setCajas(prev => prev.map(c => c.id === id ? updated : c));
    const res = await insertSupabaseRecord('cajas_chicas', cajaToDb(updated));
    recordSupabaseTelemetry('cajas_chicas', 'Multi-Cajas', 'toggle_active', `${target.nombre} (${updated.activo ? 'Activada' : 'Desactivada'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: GIROS (CRUD + Desactivar)
  const addGiro = async (giroData: Omit<Giro, 'id'>) => {
    const prevCount = giros.length;
    const newGiro: Giro = {
      ...giroData,
      id: `giro-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    setGiros(prev => [...prev, newGiro]);
    const res = await insertSupabaseRecord('giros', {
      id: newGiro.id,
      nombre: newGiro.nombre,
      codigo: newGiro.codigo,
      color: newGiro.color,
      activo: newGiro.activo
    });
    recordSupabaseTelemetry('giros', 'Catálogos - Giros', 'insert', newGiro.nombre, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CREAR_GIRO', 'Catálogos', `Creó giro/centro de costo: ${newGiro.nombre}`);
  };

  const updateGiro = async (updated: Giro) => {
    const prevCount = giros.length;
    setGiros(prev => prev.map(g => g.id === updated.id ? updated : g));
    const res = await insertSupabaseRecord('giros', {
      id: updated.id,
      nombre: updated.nombre,
      codigo: updated.codigo,
      color: updated.color,
      activo: updated.activo
    });
    recordSupabaseTelemetry('giros', 'Catálogos - Giros', 'update', updated.nombre, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_GIRO', 'Catálogos', `Actualizó giro ${updated.nombre}`);
  };

  const deleteGiro = async (id: string) => {
    const target = giros.find(g => g.id === id);
    const prevCount = giros.length;
    setGiros(prev => prev.filter(g => g.id !== id));
    const res = await deleteSupabaseRecord('giros', id);
    recordSupabaseTelemetry('giros', 'Catálogos - Giros', 'delete', target?.nombre || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('ELIMINAR_GIRO', 'Catálogos', `Eliminó giro ${id}`);
  };

  const toggleActivoGiro = async (id: string) => {
    const target = giros.find(g => g.id === id);
    if (!target) return;
    const updated = { ...target, activo: !target.activo };
    const prevCount = giros.length;
    setGiros(prev => prev.map(g => g.id === id ? updated : g));
    const res = await insertSupabaseRecord('giros', {
      id: updated.id,
      nombre: updated.nombre,
      codigo: updated.codigo,
      color: updated.color,
      activo: updated.activo
    });
    recordSupabaseTelemetry('giros', 'Catálogos - Giros', 'toggle_active', `${target.nombre} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: PROVEEDORES (CRUD + Desactivar)
  const addProveedor = async (provData: Omit<Proveedor, 'id'>) => {
    const prevCount = proveedores.length;
    const newProv: Proveedor = {
      ...provData,
      id: `prov-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    setProveedores(prev => [...prev, newProv]);
    const res = await insertSupabaseRecord('proveedores', {
      id: newProv.id,
      nombre: newProv.nombre,
      rfc: newProv.rfc,
      categoria: newProv.categoria,
      activo: newProv.activo
    });
    recordSupabaseTelemetry('proveedores', 'Catálogos - Proveedores', 'insert', newProv.nombre, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CREAR_PROVEEDOR', 'Catálogos', `Agregó proveedor: ${newProv.nombre}`);
  };

  const updateProveedor = async (updated: Proveedor) => {
    const prevCount = proveedores.length;
    setProveedores(prev => prev.map(p => p.id === updated.id ? updated : p));
    const res = await insertSupabaseRecord('proveedores', {
      id: updated.id,
      nombre: updated.nombre,
      rfc: updated.rfc,
      categoria: updated.categoria,
      activo: updated.activo ?? true
    });
    recordSupabaseTelemetry('proveedores', 'Catálogos - Proveedores', 'update', updated.nombre, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_PROVEEDOR', 'Catálogos', `Editó proveedor: ${updated.nombre}`);
  };

  const deleteProveedor = async (id: string) => {
    const target = proveedores.find(p => p.id === id);
    const prevCount = proveedores.length;
    setProveedores(prev => prev.filter(p => p.id !== id));
    const res = await deleteSupabaseRecord('proveedores', id);
    recordSupabaseTelemetry('proveedores', 'Catálogos - Proveedores', 'delete', target?.nombre || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const toggleActivoProveedor = async (id: string) => {
    const target = proveedores.find(p => p.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = proveedores.length;
    setProveedores(prev => prev.map(p => p.id === id ? updated : p));
    const res = await insertSupabaseRecord('proveedores', {
      id: updated.id,
      nombre: updated.nombre,
      rfc: updated.rfc,
      categoria: updated.categoria,
      activo: updated.activo
    });
    recordSupabaseTelemetry('proveedores', 'Catálogos - Proveedores', 'toggle_active', `${target.nombre} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: EMPLEADOS (CRUD + Desactivar)
  const addEmpleado = async (empData: Omit<Empleado, 'id'>) => {
    const prevCount = empleados.length;
    const newEmp: Empleado = {
      ...empData,
      id: `emp-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    setEmpleados(prev => [...prev, newEmp]);
    const res = await insertSupabaseRecord('empleados', {
      id: newEmp.id,
      nombre: newEmp.nombre,
      puesto: newEmp.puesto,
      departamento: newEmp.departamento,
      activo: newEmp.activo
    });
    recordSupabaseTelemetry('empleados', 'Catálogos - Empleados', 'insert', newEmp.nombre, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CREAR_EMPLEADO', 'Catálogos', `Agregó empleado: ${newEmp.nombre}`);
  };

  const updateEmpleado = async (updated: Empleado) => {
    const prevCount = empleados.length;
    setEmpleados(prev => prev.map(e => e.id === updated.id ? updated : e));
    const res = await insertSupabaseRecord('empleados', {
      id: updated.id,
      nombre: updated.nombre,
      puesto: updated.puesto,
      departamento: updated.departamento,
      activo: updated.activo
    });
    recordSupabaseTelemetry('empleados', 'Catálogos - Empleados', 'update', updated.nombre, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const deleteEmpleado = async (id: string) => {
    const target = empleados.find(e => e.id === id);
    const prevCount = empleados.length;
    setEmpleados(prev => prev.filter(e => e.id !== id));
    const res = await deleteSupabaseRecord('empleados', id);
    recordSupabaseTelemetry('empleados', 'Catálogos - Empleados', 'delete', target?.nombre || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const toggleActivoEmpleado = async (id: string) => {
    const target = empleados.find(e => e.id === id);
    if (!target) return;
    const updated = { ...target, activo: !target.activo };
    const prevCount = empleados.length;
    setEmpleados(prev => prev.map(e => e.id === id ? updated : e));
    const res = await insertSupabaseRecord('empleados', {
      id: updated.id,
      nombre: updated.nombre,
      puesto: updated.puesto,
      departamento: updated.departamento,
      activo: updated.activo
    });
    recordSupabaseTelemetry('empleados', 'Catálogos - Empleados', 'toggle_active', `${target.nombre} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: USUARIOS (CRUD + Desactivar)
  const addUsuario = async (usrData: Omit<Usuario, 'id'>) => {
    const prevCount = usuarios.length;
    const newUsr: Usuario = {
      ...usrData,
      id: `usr-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    setUsuarios(prev => [...prev, newUsr]);
    const res = await insertSupabaseRecord('usuarios', usuarioToDb(newUsr));
    recordSupabaseTelemetry('usuarios', 'Seguridad y Usuarios', 'insert', newUsr.email, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('CREAR_USUARIO', 'Seguridad', `Creó usuario: ${newUsr.email} con rol ${newUsr.rol}`);
  };

  const updateUsuario = async (updated: Usuario) => {
    const prevCount = usuarios.length;
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
    const res = await insertSupabaseRecord('usuarios', usuarioToDb(updated));
    recordSupabaseTelemetry('usuarios', 'Seguridad y Usuarios', 'update', updated.email, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const deleteUsuario = async (id: string) => {
    const target = usuarios.find(u => u.id === id);
    const prevCount = usuarios.length;
    setUsuarios(prev => prev.filter(u => u.id !== id));
    const res = await deleteSupabaseRecord('usuarios', id);
    recordSupabaseTelemetry('usuarios', 'Seguridad y Usuarios', 'delete', target?.email || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const toggleActivoUsuario = async (id: string) => {
    const target = usuarios.find(u => u.id === id);
    if (!target) return;
    const updated = { ...target, activo: !target.activo };
    const prevCount = usuarios.length;
    setUsuarios(prev => prev.map(u => u.id === id ? updated : u));
    const res = await insertSupabaseRecord('usuarios', usuarioToDb(updated));
    recordSupabaseTelemetry('usuarios', 'Seguridad y Usuarios', 'toggle_active', `${target.email} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: GASOLINA (CRUD + Desactivar)
  const addRegistroGasolina = async (recData: Omit<RegistroGasolina, 'id'>) => {
    const prevCount = gasolinaRecords.length;
    const newRec: RegistroGasolina = {
      ...recData,
      id: `gas-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    // Prepend so new record is always FIRST
    setGasolinaRecords(prev => [newRec, ...prev]);

    // Save to Supabase DB asynchronously
    const res = await insertSupabaseRecord('registros_gasolina', gasolinaToDb(newRec));
    await insertSupabaseRecord('registro_gasolina', gasolinaToDb(newRec));
    recordSupabaseTelemetry('registros_gasolina', 'Control de Gasolina', 'insert', `${newRec.vehiculo} - $${newRec.importe}`, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    logAudit('CREAR_GASOLINA', 'Control de Gasolina', `Registró $${newRec.importe.toFixed(2)} para ${newRec.vehiculo} (KM: ${newRec.km})`);
  };

  const updateRegistroGasolina = async (updated: RegistroGasolina) => {
    const prevCount = gasolinaRecords.length;
    setGasolinaRecords(prev => [updated, ...prev.filter(g => g.id !== updated.id)]);
    const res = await insertSupabaseRecord('registros_gasolina', gasolinaToDb(updated));
    await insertSupabaseRecord('registro_gasolina', gasolinaToDb(updated));
    recordSupabaseTelemetry('registros_gasolina', 'Control de Gasolina', 'update', `${updated.vehiculo} - $${updated.importe}`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_GASOLINA', 'Control de Gasolina', `Editó registro de gasolina ${updated.vehiculo}`);
  };

  const deleteRegistroGasolina = async (id: string) => {
    const target = gasolinaRecords.find(g => g.id === id);
    const prevCount = gasolinaRecords.length;
    setGasolinaRecords(prev => prev.filter(g => g.id !== id));

    // Delete from Supabase DB asynchronously
    const res = await deleteSupabaseRecord('registros_gasolina', id);
    await deleteSupabaseRecord('registro_gasolina', id);
    recordSupabaseTelemetry('registros_gasolina', 'Control de Gasolina', 'delete', target?.vehiculo || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    if (target) {
      logAudit('ELIMINAR_GASOLINA', 'Control de Gasolina', `Eliminó registro de gasolina ${target.vehiculo} del ${target.fecha}`);
    }
  };

  const toggleActivoRegistroGasolina = async (id: string) => {
    const target = gasolinaRecords.find(g => g.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = gasolinaRecords.length;
    setGasolinaRecords(prev => prev.map(g => g.id === id ? updated : g));
    const res = await insertSupabaseRecord('registros_gasolina', gasolinaToDb(updated));
    await insertSupabaseRecord('registro_gasolina', gasolinaToDb(updated));
    recordSupabaseTelemetry('registros_gasolina', 'Control de Gasolina', 'toggle_active', `${target.vehiculo} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: COMPROBANTES DE GASTOS (CRUD + Desactivar)
  const addComprobanteGastos = async (compData: Omit<ComprobanteGastos, 'id'>) => {
    const prevCount = comprobantesGastos.length;
    const newComp: ComprobanteGastos = {
      ...compData,
      id: `cmp-${Date.now().toString().slice(-4)}`,
      activo: true
    };
    // Prepend so new record is always FIRST
    setComprobantesGastos(prev => [newComp, ...prev]);

    // Save to Supabase DB asynchronously
    const res = await insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(newComp));
    recordSupabaseTelemetry('comprobantes_gastos', 'Comprobante de Gastos', 'insert', newComp.folio, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    logAudit('CREAR_COMPROBANTE', 'Comprobante de Gastos', `Generó comprobante ${newComp.folio} por $${newComp.importe.toFixed(2)}`);
  };

  const updateComprobanteGastos = async (updated: ComprobanteGastos) => {
    const prevCount = comprobantesGastos.length;
    setComprobantesGastos(prev => [updated, ...prev.filter(c => c.id !== updated.id)]);
    const res = await insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(updated));
    recordSupabaseTelemetry('comprobantes_gastos', 'Comprobante de Gastos', 'update', updated.folio, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
    logAudit('EDITAR_COMPROBANTE', 'Comprobante de Gastos', `Editó comprobante ${updated.folio}`);
  };

  const deleteComprobanteGastos = async (id: string) => {
    const target = comprobantesGastos.find(c => c.id === id);
    const prevCount = comprobantesGastos.length;
    setComprobantesGastos(prev => prev.filter(c => c.id !== id));

    // Delete from Supabase DB asynchronously
    const res = await deleteSupabaseRecord('comprobantes_gastos', id);
    recordSupabaseTelemetry('comprobantes_gastos', 'Comprobante de Gastos', 'delete', target?.folio || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    if (target) {
      logAudit('ELIMINAR_COMPROBANTE', 'Comprobante de Gastos', `Eliminó comprobante ${target.folio}`);
    }
  };

  const toggleActivoComprobanteGastos = async (id: string) => {
    const target = comprobantesGastos.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = comprobantesGastos.length;
    setComprobantesGastos(prev => prev.map(c => c.id === id ? updated : c));
    const res = await insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(updated));
    recordSupabaseTelemetry('comprobantes_gastos', 'Comprobante de Gastos', 'toggle_active', `${target.folio} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  // Actions: CLIENTES (CRUD + Desactivar)
  const updateClienteProfile = async (profileData: Partial<ClienteProfile>) => {
    setClienteProfile(prev => ({ ...prev, ...profileData }));
    logAudit('ACTUALIZAR_PERFIL', 'Perfil Cliente', `Cliente actualizó su perfil`);
  };

  const addComprobanteCombustibleCliente = async (compData: Omit<ComprobanteCombustibleCliente, 'id' | 'estado'>) => {
    const prevCount = comprobantesCombustibleCliente.length;
    const newComp: ComprobanteCombustibleCliente = {
      ...compData,
      id: `cc-${Date.now()}`,
      estado: 'enviado',
      activo: true
    };
    // Prepend so new items are always FIRST
    setComprobantesCombustibleCliente(prev => [newComp, ...prev]);

    // Save to Supabase DB asynchronously
    const res = await insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(newComp));
    recordSupabaseTelemetry('comprobantes_combustible_cliente', 'Comprobantes Cliente', 'insert', `${newComp.vehiculo} - $${newComp.importe}`, prevCount, prevCount + 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);

    logAudit('ENVIAR_COMBUSTIBLE_CLIENTE', 'Comprobantes Combustible', `Cliente ${newComp.clienteNombre} envió comprobante de $${newComp.importe.toFixed(2)} (${newComp.vehiculo})`);
  };

  const updateComprobanteCombustibleCliente = async (updated: ComprobanteCombustibleCliente) => {
    const prevCount = comprobantesCombustibleCliente.length;
    setComprobantesCombustibleCliente(prev => [updated, ...prev.filter(c => c.id !== updated.id)]);
    const res = await insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(updated));
    recordSupabaseTelemetry('comprobantes_combustible_cliente', 'Comprobantes Cliente', 'update', `${updated.vehiculo} - $${updated.importe}`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const updateComprobanteCombustibleClienteEstado = async (id: string, estado: 'enviado' | 'revisado' | 'aprobado' | 'rechazado') => {
    const prevCount = comprobantesCombustibleCliente.length;
    setComprobantesCombustibleCliente(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, estado };
        insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(updated)).then(res => {
          recordSupabaseTelemetry('comprobantes_combustible_cliente', 'Comprobantes Cliente', 'update', `Estado ${estado} en ${c.vehiculo}`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
        });
        return updated;
      }
      return c;
    }));
    logAudit('CAMBIAR_ESTADO_COMBUSTIBLE', 'Control Combustible Cliente', `Actualizó estado a ${estado} para el comprobante ${id}`);
  };

  const deleteComprobanteCombustibleCliente = async (id: string) => {
    const target = comprobantesCombustibleCliente.find(c => c.id === id);
    const prevCount = comprobantesCombustibleCliente.length;
    setComprobantesCombustibleCliente(prev => prev.filter(c => c.id !== id));
    const res = await deleteSupabaseRecord('comprobantes_combustible_cliente', id);
    recordSupabaseTelemetry('comprobantes_combustible_cliente', 'Comprobantes Cliente', 'delete', target?.vehiculo || id, prevCount, prevCount - 1, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const toggleActivoComprobanteCombustibleCliente = async (id: string) => {
    const target = comprobantesCombustibleCliente.find(c => c.id === id);
    if (!target) return;
    const updated = { ...target, activo: target.activo === false ? true : false };
    const prevCount = comprobantesCombustibleCliente.length;
    setComprobantesCombustibleCliente(prev => prev.map(c => c.id === id ? updated : c));
    const res = await insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(updated));
    recordSupabaseTelemetry('comprobantes_combustible_cliente', 'Comprobantes Cliente', 'toggle_active', `${target.vehiculo} (${updated.activo ? 'Activado' : 'Desactivado'})`, prevCount, prevCount, res.latencyMs, res.ok ? 'success' : 'error', res.error?.message);
  };

  const resetData = () => {
    localStorage.clear();
    setCajas(INITIAL_CAJAS);
    setGiros(INITIAL_GIROS);
    setProveedores(INITIAL_PROVEEDORES);
    setEmpleados(INITIAL_EMPLEADOS);
    setUsuarios(INITIAL_USUARIOS);
    setGastos(INITIAL_GASTOS);
    setReembolsos(INITIAL_REEMBOLSOS);
    setAbonos(INITIAL_ABONOS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setGasolinaRecords(INITIAL_GASOLINA);
    setComprobantesGastos(INITIAL_COMPROBANTES);
    setClienteProfile(INITIAL_CLIENTE_PROFILE);
    setComprobantesCombustibleCliente(INITIAL_COMPROBANTES_COMBUSTIBLE_CLIENTE);
    setRoleState('home');
  };

  const syncWithSupabaseNow = async () => {
    await syncAllDataToSupabase({
      cajas,
      gastos,
      gasolinaRecords,
      comprobantesGastos,
      comprobantesCombustibleCliente,
      reembolsos,
      abonos,
      auditLogs,
      giros,
      proveedores,
      empleados,
      usuarios,
      clienteProfile
    });
  };

  return (
    <AppContext.Provider
      value={{
        role,
        currentUser,
        setCurrentUser,
        setRole,
        activeModule,
        setActiveModule,
        activeCajaId,
        setActiveCajaId,
        cajas,
        giros,
        proveedores,
        empleados,
        usuarios,
        gastos,
        reembolsos,
        abonos,
        auditLogs,
        gasolinaRecords,
        comprobantesGastos,
        clienteProfile,
        comprobantesCombustibleCliente,
        activeCaja,
        activeCajaGastos,
        activeCajaGastosAcumulados,
        activeCajaSaldoDisponible,
        lastSupabaseSave,
        supabaseSaveHistory,
        dismissLastSupabaseSave,
        addGasto,
        updateGasto,
        deleteGasto,
        toggleActivoGasto,
        solicitarReembolso,
        aprobarReembolso,
        rechazarGasto,
        aprobarGasto,
        addAbono,
        updateAbono,
        deleteAbono,
        toggleActivoAbono,
        updateFondoBase,
        addCaja,
        updateCaja,
        deleteCaja,
        toggleActivoCaja,
        addGiro,
        updateGiro,
        deleteGiro,
        toggleActivoGiro,
        addProveedor,
        updateProveedor,
        deleteProveedor,
        toggleActivoProveedor,
        addEmpleado,
        updateEmpleado,
        deleteEmpleado,
        toggleActivoEmpleado,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        toggleActivoUsuario,
        addRegistroGasolina,
        updateRegistroGasolina,
        deleteRegistroGasolina,
        toggleActivoRegistroGasolina,
        addComprobanteGastos,
        updateComprobanteGastos,
        deleteComprobanteGastos,
        toggleActivoComprobanteGastos,
        updateClienteProfile,
        addComprobanteCombustibleCliente,
        updateComprobanteCombustibleCliente,
        updateComprobanteCombustibleClienteEstado,
        deleteComprobanteCombustibleCliente,
        toggleActivoComprobanteCombustibleCliente,
        resetData,
        syncWithSupabaseNow,
        previewEvidencia,
        setPreviewEvidencia,
        pdfModalData,
        setPdfModalData,
        pdfGasolinaModalData,
        setPdfGasolinaModalData,
        pdfComprobanteModalData,
        setPdfComprobanteModalData
      }}
    >
      {children}
    </AppContext.Provider>
  );

};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
