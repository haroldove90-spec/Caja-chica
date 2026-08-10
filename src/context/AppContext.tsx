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
  ComprobanteCombustibleCliente
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

  // Actions
  addGasto: (gasto: Omit<Gasto, 'id' | 'estado'>) => void;
  updateGasto: (gasto: Gasto) => void;
  deleteGasto: (id: string) => void;
  
  solicitarReembolso: (cajaId: string, observaciones: string) => void;
  aprobarReembolso: (reembolsoId: string, firma: string) => void;
  rechazarGasto: (gastoId: string, motivo: string) => void;
  aprobarGasto: (gastoId: string) => void;

  addAbono: (abono: Omit<Abono, 'id'>) => void;
  updateFondoBase: (cajaId: string, nuevoFondo: number) => void;

  addCaja: (caja: Omit<CajaChica, 'id' | 'saldoActual' | 'estado'>) => void;
  updateCaja: (caja: CajaChica) => void;

  addGiro: (giro: Omit<Giro, 'id'>) => void;
  updateGiro: (giro: Giro) => void;
  deleteGiro: (id: string) => void;

  addProveedor: (prov: Omit<Proveedor, 'id'>) => void;
  updateProveedor: (prov: Proveedor) => void;
  deleteProveedor: (id: string) => void;

  addEmpleado: (emp: Omit<Empleado, 'id'>) => void;
  updateEmpleado: (emp: Empleado) => void;
  deleteEmpleado: (id: string) => void;

  addUsuario: (usr: Omit<Usuario, 'id'>) => void;
  updateUsuario: (usr: Usuario) => void;
  deleteUsuario: (id: string) => void;

  addRegistroGasolina: (rec: Omit<RegistroGasolina, 'id'>) => void;
  deleteRegistroGasolina: (id: string) => void;

  addComprobanteGastos: (comp: Omit<ComprobanteGastos, 'id'>) => void;
  deleteComprobanteGastos: (id: string) => void;

  updateClienteProfile: (profile: Partial<ClienteProfile>) => void;
  addComprobanteCombustibleCliente: (comp: Omit<ComprobanteCombustibleCliente, 'id' | 'estado'>) => void;
  updateComprobanteCombustibleClienteEstado: (id: string, estado: 'enviado' | 'revisado' | 'aprobado' | 'rechazado') => void;
  deleteComprobanteCombustibleCliente: (id: string) => void;

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
    return saved ? JSON.parse(saved) : INITIAL_CAJAS;
  });

  const [giros, setGiros] = useState<Giro[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_giros`);
    return saved ? JSON.parse(saved) : INITIAL_GIROS;
  });

  const [proveedores, setProveedores] = useState<Proveedor[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_proveedores`);
    return saved ? JSON.parse(saved) : INITIAL_PROVEEDORES;
  });

  const [empleados, setEmpleados] = useState<Empleado[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_empleados`);
    return saved ? JSON.parse(saved) : INITIAL_EMPLEADOS;
  });

  const [usuarios, setUsuarios] = useState<Usuario[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_usuarios`);
    return saved ? JSON.parse(saved) : INITIAL_USUARIOS;
  });

  const [gastos, setGastos] = useState<Gasto[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gastos`);
    return saved ? JSON.parse(saved) : INITIAL_GASTOS;
  });

  const [reembolsos, setReembolsos] = useState<ReembolsoRequest[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_reembolsos`);
    return saved ? JSON.parse(saved) : INITIAL_REEMBOLSOS;
  });

  const [abonos, setAbonos] = useState<Abono[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_abonos`);
    return saved ? JSON.parse(saved) : INITIAL_ABONOS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_auditLogs`);
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  const [gasolinaRecords, setGasolinaRecords] = useState<RegistroGasolina[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_gasolinaRecords`);
    return saved ? JSON.parse(saved) : INITIAL_GASOLINA;
  });

  const [comprobantesGastos, setComprobantesGastos] = useState<ComprobanteGastos[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comprobantesGastos`);
    return saved ? JSON.parse(saved) : INITIAL_COMPROBANTES;
  });

  const [clienteProfile, setClienteProfile] = useState<ClienteProfile>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_clienteProfile`);
    return saved ? JSON.parse(saved) : INITIAL_CLIENTE_PROFILE;
  });

  const [comprobantesCombustibleCliente, setComprobantesCombustibleCliente] = useState<ComprobanteCombustibleCliente[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_comprobantesCombustibleCliente`);
    return saved ? JSON.parse(saved) : INITIAL_COMPROBANTES_COMBUSTIBLE_CLIENTE;
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
      if (dbGastos && dbGastos.length > 0 && isMounted) {
        const mapped = dbGastos.map(dbToGasto);
        setGastos(prev => {
          const dbIds = new Set(mapped.map(m => m.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id));
          localOnly.forEach(item => insertSupabaseRecord('gastos', gastoToDb(item)));
          return [...mapped, ...localOnly];
        });
      } else if (dbGastos && dbGastos.length === 0 && isMounted) {
        gastos.forEach(item => insertSupabaseRecord('gastos', gastoToDb(item)));
      }

      // Fetch gasolina
      const dbGasolina = await fetchSupabaseTable('registros_gasolina');
      if (dbGasolina && dbGasolina.length > 0 && isMounted) {
        const mapped = dbGasolina.map(dbToGasolina);
        setGasolinaRecords(prev => {
          const dbIds = new Set(mapped.map(m => m.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id));
          localOnly.forEach(item => {
            insertSupabaseRecord('registros_gasolina', gasolinaToDb(item));
            insertSupabaseRecord('registro_gasolina', gasolinaToDb(item));
          });
          return [...mapped, ...localOnly];
        });
      } else if (dbGasolina && dbGasolina.length === 0 && isMounted) {
        gasolinaRecords.forEach(item => {
          insertSupabaseRecord('registros_gasolina', gasolinaToDb(item));
          insertSupabaseRecord('registro_gasolina', gasolinaToDb(item));
        });
      }

      // Fetch comprobantes
      const dbComprobantes = await fetchSupabaseTable('comprobantes_gastos');
      if (dbComprobantes && dbComprobantes.length > 0 && isMounted) {
        const mapped = dbComprobantes.map(dbToComprobante);
        setComprobantesGastos(prev => {
          const dbIds = new Set(mapped.map(m => m.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id));
          localOnly.forEach(item => insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(item)));
          return [...mapped, ...localOnly];
        });
      } else if (dbComprobantes && dbComprobantes.length === 0 && isMounted) {
        comprobantesGastos.forEach(item => insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(item)));
      }

      // Fetch comprobantes combustible cliente
      const dbClienteComb = await fetchSupabaseTable('comprobantes_combustible_cliente');
      if (dbClienteComb && dbClienteComb.length > 0 && isMounted) {
        const mapped = dbClienteComb.map(dbToClienteCombustible);
        setComprobantesCombustibleCliente(prev => {
          const dbIds = new Set(mapped.map(m => m.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id));
          localOnly.forEach(item => {
            insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(item));
          });
          const combined = [...mapped, ...localOnly];
          combined.sort((a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime());
          return combined;
        });
      } else if (dbClienteComb && dbClienteComb.length === 0 && isMounted) {
        comprobantesCombustibleCliente.forEach(item => {
          insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(item));
        });
      }

      // Fetch cajas
      const dbCajas = await fetchSupabaseTable('cajas_chicas');
      if (dbCajas && dbCajas.length > 0 && isMounted) {
        const mapped = dbCajas.map(dbToCaja);
        setCajas(mapped);
      } else if (dbCajas && dbCajas.length === 0 && isMounted) {
        cajas.forEach(item => insertSupabaseRecord('cajas_chicas', cajaToDb(item)));
      }

      // Fetch abonos
      const dbAbonos = await fetchSupabaseTable('abonos');
      if (dbAbonos && dbAbonos.length > 0 && isMounted) {
        const mapped = dbAbonos.map(dbToAbono);
        setAbonos(mapped);
      } else if (dbAbonos && dbAbonos.length === 0 && isMounted) {
        abonos.forEach(item => insertSupabaseRecord('abonos', abonoToDb(item)));
      }

      // Fetch reembolsos
      const dbReembolsos = await fetchSupabaseTable('reembolsos');
      if (dbReembolsos && dbReembolsos.length > 0 && isMounted) {
        const mapped = dbReembolsos.map(dbToReembolso);
        setReembolsos(mapped);
      } else if (dbReembolsos && dbReembolsos.length === 0 && isMounted) {
        reembolsos.forEach(item => insertSupabaseRecord('reembolsos', reembolsoToDb(item)));
      }

      // Fetch usuarios
      const dbUsuarios = await fetchSupabaseTable<any>('usuarios');
      if (dbUsuarios && dbUsuarios.length > 0 && isMounted) {
        setUsuarios(prev => {
          const mapped = dbUsuarios.map(dbRow => {
            const parsed = dbToUsuario(dbRow);
            const localMatch = prev.find(p => p.id === parsed.id || (p.email && p.email.toLowerCase() === parsed.email.toLowerCase()));
            return {
              ...parsed,
              username: parsed.username || localMatch?.username,
              password: parsed.password || localMatch?.password,
              telefono: parsed.telefono || localMatch?.telefono,
            };
          });
          const dbIds = new Set(mapped.map(m => m.id));
          const localOnly = prev.filter(p => !dbIds.has(p.id));
          localOnly.forEach(item => insertSupabaseRecord('usuarios', usuarioToDb(item)));
          return [...mapped, ...localOnly];
        });
      } else if (dbUsuarios && dbUsuarios.length === 0 && isMounted) {
        usuarios.forEach(item => insertSupabaseRecord('usuarios', usuarioToDb(item)));
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

  // Helper calculations for active caja
  const activeCaja = cajas.find(c => c.id === activeCajaId) || cajas[0];
  const activeCajaGastos = gastos.filter(g => g.cajaId === activeCajaId && !g.reembolsoId);
  const activeCajaGastosAcumulados = activeCajaGastos.reduce((acc, curr) => acc + curr.importe, 0);
  const activeCajaSaldoDisponible = activeCaja ? activeCaja.fondoBase - activeCajaGastosAcumulados : 0;

  // Actions
  const addGasto = (gastoData: Omit<Gasto, 'id' | 'estado'>) => {
    const newId = `gst-${Date.now().toString().slice(-4)}`;
    const newGasto: Gasto = {
      ...gastoData,
      id: newId,
      estado: 'borrador'
    };
    // Prepend so new record is always FIRST
    setGastos(prev => [newGasto, ...prev]);

    // Save to Supabase DB asynchronously
    insertSupabaseRecord('gastos', gastoToDb(newGasto));

    // recalculate caja saldo
    setCajas(prev => prev.map(c => {
      if (c.id === gastoData.cajaId) {
        return {
          ...c,
          saldoActual: Math.max(0, c.saldoActual - gastoData.importe)
        };
      }
      return c;
    }));

    logAudit('CREAR_GASTO', 'Registro de Gastos', `Registró gasto ${newGasto.nroOrden} por $${newGasto.importe.toFixed(2)} (${newGasto.proveedor})`);
  };

  const updateGasto = (updated: Gasto) => {
    // Keep updated item at top if required or preserve top position
    setGastos(prev => [updated, ...prev.filter(g => g.id !== updated.id)]);

    // Save to Supabase DB asynchronously
    insertSupabaseRecord('gastos', gastoToDb(updated));

    logAudit('EDITAR_GASTO', 'Registro de Gastos', `Editó gasto ${updated.nroOrden}`);
  };

  const deleteGasto = (id: string) => {
    const target = gastos.find(g => g.id === id);
    if (!target) return;
    setGastos(prev => prev.filter(g => g.id !== id));

    // Delete from Supabase DB asynchronously
    deleteSupabaseRecord('gastos', id);

    // Restore balance
    setCajas(prev => prev.map(c => {
      if (c.id === target.cajaId) {
        return {
          ...c,
          saldoActual: c.saldoActual + target.importe
        };
      }
      return c;
    }));

    logAudit('ELIMINAR_GASTO', 'Registro de Gastos', `Eliminó gasto ${target.nroOrden} por $${target.importe.toFixed(2)}`);
  };

  const solicitarReembolso = (cajaId: string, observaciones: string) => {
    const unsubmittedGastos = gastos.filter(g => g.cajaId === cajaId && !g.reembolsoId);
    if (unsubmittedGastos.length === 0) return;

    const total = unsubmittedGastos.reduce((a, b) => a + b.importe, 0);
    const rmbId = `rmb-${Date.now().toString().slice(-4)}`;
    const nro = `REEMB-${Math.floor(100 + Math.random() * 900)}`;

    const newRequest: ReembolsoRequest = {
      id: rmbId,
      nroReembolso: nro,
      cajaId,
      fechaSolicitud: new Date().toISOString().replace('T', ' ').substring(0, 16),
      totalGastos: total,
      cantGastos: unsubmittedGastos.length,
      observaciones,
      estado: 'pendiente'
    };

    // Attach refund ID to expenses
    setGastos(prev => prev.map(g => {
      if (g.cajaId === cajaId && !g.reembolsoId) {
        return { ...g, reembolsoId: rmbId };
      }
      return g;
    }));

    setReembolsos(prev => [newRequest, ...prev]);

    // Freeze caja status to Pendiente
    setCajas(prev => prev.map(c => c.id === cajaId ? { ...c, estado: 'Pendiente' } : c));

    logAudit('SOLICITAR_REEMBOLSO', 'Cierre de Caja', `Solicitó reembolso ${nro} por $${total.toFixed(2)} (${unsubmittedGastos.length} comprobantes)`);
  };

  const aprobarReembolso = (reembolsoId: string, firma: string) => {
    const rmb = reembolsos.find(r => r.id === reembolsoId);
    if (!rmb) return;

    // Approve reimbursement
    setReembolsos(prev => prev.map(r => r.id === reembolsoId ? {
      ...r,
      estado: 'aprobado',
      fechaAprobacion: new Date().toISOString().replace('T', ' ').substring(0, 16),
      aprobadoPor: 'CP. Alberto Vargas',
      firmaElectronica: firma
    } : r));

    // Mark expenses as approved
    setGastos(prev => prev.map(g => g.reembolsoId === reembolsoId ? { ...g, estado: 'aprobado' } : g));

    // Reopen caja & restore balance to fondoBase
    setCajas(prev => prev.map(c => {
      if (c.id === rmb.cajaId) {
        return {
          ...c,
          estado: 'Abierta',
          saldoActual: c.fondoBase
        };
      }
      return c;
    }));

    logAudit('APROBAR_REEMBOLSO', 'Auditoría', `Aprobó Reembolso ${rmb.nroReembolso} por $${rmb.totalGastos.toFixed(2)}`);
  };

  const rechazarGasto = (gastoId: string, motivo: string) => {
    setGastos(prev => prev.map(g => g.id === gastoId ? {
      ...g,
      estado: 'rechazado',
      notaRechazo: motivo
    } : g));
    logAudit('RECHAZAR_GASTO', 'Auditoría', `Rechazó gasto ${gastoId} por: "${motivo}"`);
  };

  const aprobarGasto = (gastoId: string) => {
    setGastos(prev => prev.map(g => g.id === gastoId ? {
      ...g,
      estado: 'aprobado',
      notaRechazo: undefined
    } : g));
    logAudit('APROBAR_GASTO', 'Auditoría', `Aprobó individualmente gasto ${gastoId}`);
  };

  const addAbono = (abonoData: Omit<Abono, 'id'>) => {
    const newAbono: Abono = {
      ...abonoData,
      id: `abn-${Date.now().toString().slice(-4)}`
    };
    setAbonos(prev => [newAbono, ...prev]);

    // Inject to caja balance
    setCajas(prev => prev.map(c => c.id === abonoData.cajaId ? {
      ...c,
      saldoActual: c.saldoActual + abonoData.monto
    } : c));

    logAudit('ABONAR_FONDO', 'Inyecciones de Fondo', `Abonó $${abonoData.monto.toFixed(2)} a caja ${abonoData.cajaId}`);
  };

  const updateFondoBase = (cajaId: string, nuevoFondo: number) => {
    setCajas(prev => prev.map(c => c.id === cajaId ? { ...c, fondoBase: nuevoFondo } : c));
    logAudit('AJUSTAR_FONDO_BASE', 'Inyecciones de Fondo', `Actualizó fondo base de caja ${cajaId} a $${nuevoFondo.toFixed(2)}`);
  };

  const addCaja = (cajaData: Omit<CajaChica, 'id' | 'saldoActual' | 'estado'>) => {
    const newCaja: CajaChica = {
      ...cajaData,
      id: `caja-${Date.now().toString().slice(-4)}`,
      saldoActual: cajaData.fondoBase,
      estado: 'Abierta'
    };
    setCajas(prev => [...prev, newCaja]);
    logAudit('CREAR_CAJA', 'Multi-Cajas', `Creó nueva caja chica: ${newCaja.nombre}`);
  };

  const updateCaja = (updated: CajaChica) => {
    setCajas(prev => prev.map(c => c.id === updated.id ? updated : c));
    logAudit('EDITAR_CAJA', 'Multi-Cajas', `Actualizó parámetros de caja ${updated.nombre}`);
  };

  const addGiro = (giroData: Omit<Giro, 'id'>) => {
    const newGiro: Giro = {
      ...giroData,
      id: `giro-${Date.now().toString().slice(-4)}`
    };
    setGiros(prev => [...prev, newGiro]);
    logAudit('CREAR_GIRO', 'Catálogos', `Creó giro/centro de costo: ${newGiro.nombre}`);
  };

  const updateGiro = (updated: Giro) => {
    setGiros(prev => prev.map(g => g.id === updated.id ? updated : g));
    logAudit('EDITAR_GIRO', 'Catálogos', `Actualizó giro ${updated.nombre}`);
  };

  const deleteGiro = (id: string) => {
    setGiros(prev => prev.filter(g => g.id !== id));
    logAudit('ELIMINAR_GIRO', 'Catálogos', `Eliminó giro ${id}`);
  };

  const addProveedor = (provData: Omit<Proveedor, 'id'>) => {
    const newProv: Proveedor = {
      ...provData,
      id: `prov-${Date.now().toString().slice(-4)}`
    };
    setProveedores(prev => [...prev, newProv]);
    logAudit('CREAR_PROVEEDOR', 'Catálogos', `Agregó proveedor: ${newProv.nombre}`);
  };

  const updateProveedor = (updated: Proveedor) => {
    setProveedores(prev => prev.map(p => p.id === updated.id ? updated : p));
  };

  const deleteProveedor = (id: string) => {
    setProveedores(prev => prev.filter(p => p.id !== id));
  };

  const addEmpleado = (empData: Omit<Empleado, 'id'>) => {
    const newEmp: Empleado = {
      ...empData,
      id: `emp-${Date.now().toString().slice(-4)}`
    };
    setEmpleados(prev => [...prev, newEmp]);
    logAudit('CREAR_EMPLEADO', 'Catálogos', `Agregó empleado: ${newEmp.nombre}`);
  };

  const updateEmpleado = (updated: Empleado) => {
    setEmpleados(prev => prev.map(e => e.id === updated.id ? updated : e));
  };

  const deleteEmpleado = (id: string) => {
    setEmpleados(prev => prev.filter(e => e.id !== id));
  };

  const addUsuario = (usrData: Omit<Usuario, 'id'>) => {
    const newUsr: Usuario = {
      ...usrData,
      id: `usr-${Date.now().toString().slice(-4)}`
    };
    setUsuarios(prev => [...prev, newUsr]);
    insertSupabaseRecord('usuarios', usuarioToDb(newUsr));
    logAudit('CREAR_USUARIO', 'Seguridad', `Creó usuario: ${newUsr.email} con rol ${newUsr.rol}`);
  };

  const updateUsuario = (updated: Usuario) => {
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
    insertSupabaseRecord('usuarios', usuarioToDb(updated));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
    deleteSupabaseRecord('usuarios', id);
  };

  const addRegistroGasolina = (recData: Omit<RegistroGasolina, 'id'>) => {
    const newRec: RegistroGasolina = {
      ...recData,
      id: `gas-${Date.now().toString().slice(-4)}`
    };
    // Prepend so new record is always FIRST
    setGasolinaRecords(prev => [newRec, ...prev]);

    // Save to Supabase DB asynchronously
    insertSupabaseRecord('registros_gasolina', gasolinaToDb(newRec));

    logAudit('CREAR_GASOLINA', 'Control de Gasolina', `Registró $${newRec.importe.toFixed(2)} para ${newRec.vehiculo} (KM: ${newRec.km})`);
  };

  const deleteRegistroGasolina = (id: string) => {
    const target = gasolinaRecords.find(g => g.id === id);
    setGasolinaRecords(prev => prev.filter(g => g.id !== id));

    // Delete from Supabase DB asynchronously
    deleteSupabaseRecord('registros_gasolina', id);

    if (target) {
      logAudit('ELIMINAR_GASOLINA', 'Control de Gasolina', `Eliminó registro de gasolina ${target.vehiculo} del ${target.fecha}`);
    }
  };

  const addComprobanteGastos = (compData: Omit<ComprobanteGastos, 'id'>) => {
    const newComp: ComprobanteGastos = {
      ...compData,
      id: `cmp-${Date.now().toString().slice(-4)}`
    };
    // Prepend so new record is always FIRST
    setComprobantesGastos(prev => [newComp, ...prev]);

    // Save to Supabase DB asynchronously
    insertSupabaseRecord('comprobantes_gastos', comprobanteToDb(newComp));

    logAudit('CREAR_COMPROBANTE', 'Comprobante de Gastos', `Generó comprobante ${newComp.folio} por $${newComp.importe.toFixed(2)}`);
  };

  const deleteComprobanteGastos = (id: string) => {
    const target = comprobantesGastos.find(c => c.id === id);
    setComprobantesGastos(prev => prev.filter(c => c.id !== id));

    // Delete from Supabase DB asynchronously
    deleteSupabaseRecord('comprobantes_gastos', id);

    if (target) {
      logAudit('ELIMINAR_COMPROBANTE', 'Comprobante de Gastos', `Eliminó comprobante ${target.folio}`);
    }
  };

  const updateClienteProfile = (profileData: Partial<ClienteProfile>) => {
    setClienteProfile(prev => ({ ...prev, ...profileData }));
    logAudit('ACTUALIZAR_PERFIL', 'Perfil Cliente', `Cliente ${clienteProfile.nombre} actualizó su perfil`);
  };

  const addComprobanteCombustibleCliente = (compData: Omit<ComprobanteCombustibleCliente, 'id' | 'estado'>) => {
    const newComp: ComprobanteCombustibleCliente = {
      ...compData,
      id: `cc-${Date.now()}`,
      estado: 'enviado'
    };
    // Prepend so new items are always FIRST
    setComprobantesCombustibleCliente(prev => [newComp, ...prev]);

    // Save to Supabase DB asynchronously
    insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(newComp));

    logAudit('ENVIAR_COMBUSTIBLE_CLIENTE', 'Comprobantes Combustible', `Cliente ${newComp.clienteNombre} envió comprobante de $${newComp.importe.toFixed(2)} (${newComp.vehiculo})`);
  };

  const updateComprobanteCombustibleClienteEstado = (id: string, estado: 'enviado' | 'revisado' | 'aprobado' | 'rechazado') => {
    setComprobantesCombustibleCliente(prev => prev.map(c => {
      if (c.id === id) {
        const updated = { ...c, estado };
        insertSupabaseRecord('comprobantes_combustible_cliente', clienteCombustibleToDb(updated));
        return updated;
      }
      return c;
    }));
    logAudit('CAMBIAR_ESTADO_COMBUSTIBLE', 'Control Combustible Cliente', `Actualizó estado a ${estado} para el comprobante ${id}`);
  };

  const deleteComprobanteCombustibleCliente = (id: string) => {
    setComprobantesCombustibleCliente(prev => prev.filter(c => c.id !== id));
    deleteSupabaseRecord('comprobantes_combustible_cliente', id);
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
        activeCaja,
        activeCajaGastos,
        activeCajaGastosAcumulados,
        activeCajaSaldoDisponible,
        addGasto,
        updateGasto,
        deleteGasto,
        solicitarReembolso,
        aprobarReembolso,
        rechazarGasto,
        aprobarGasto,
        addAbono,
        updateFondoBase,
        addCaja,
        updateCaja,
        addGiro,
        updateGiro,
        deleteGiro,
        addProveedor,
        updateProveedor,
        deleteProveedor,
        addEmpleado,
        updateEmpleado,
        deleteEmpleado,
        addUsuario,
        updateUsuario,
        deleteUsuario,
        addRegistroGasolina,
        deleteRegistroGasolina,
        addComprobanteGastos,
        deleteComprobanteGastos,
        clienteProfile,
        comprobantesCombustibleCliente,
        updateClienteProfile,
        addComprobanteCombustibleCliente,
        updateComprobanteCombustibleClienteEstado,
        deleteComprobanteCombustibleCliente,
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
