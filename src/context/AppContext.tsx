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
  ComprobanteGastos
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
  INITIAL_COMPROBANTES
} from '../data/initialData';

interface AppContextType {
  role: RoleType;
  setRole: (role: RoleType) => void;
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

  resetData: () => void;

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

  // Modal preview state
  const [previewEvidencia, setPreviewEvidencia] = useState<{ url: string; type?: 'image' | 'pdf'; title?: string } | null>(null);
  const [pdfModalData, setPdfModalData] = useState<{ reembolso?: ReembolsoRequest; caja?: CajaChica; gastos?: Gasto[] } | null>(null);
  const [pdfGasolinaModalData, setPdfGasolinaModalData] = useState<{ record?: RegistroGasolina; list?: RegistroGasolina[]; vehiculo?: string } | null>(null);
  const [pdfComprobanteModalData, setPdfComprobanteModalData] = useState<ComprobanteGastos | null>(null);

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

  const setRole = (newRole: RoleType) => {
    setRoleState(newRole);
    if (newRole === 'custodio') setActiveModuleState('movimientos');
    else if (newRole === 'contador') setActiveModuleState('auditoria');
    else if (newRole === 'admin') setActiveModuleState('multicajas');
  };

  const setActiveModule = (mod: string) => {
    setActiveModuleState(mod);
  };

  const logAudit = (accion: string, modulo: string, detalles: string) => {
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      fecha: new Date().toISOString().replace('T', ' ').substring(0, 19),
      usuario: role === 'custodio' ? 'Lic. Sofía Rodríguez' : role === 'contador' ? 'CP. Alberto Vargas' : 'Admin General',
      rol: role === 'custodio' ? 'Custodio' : role === 'contador' ? 'Contador' : 'Admin',
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
    setGastos(prev => [newGasto, ...prev]);

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
    setGastos(prev => prev.map(g => g.id === updated.id ? updated : g));
    logAudit('EDITAR_GASTO', 'Registro de Gastos', `Editó gasto ${updated.nroOrden}`);
  };

  const deleteGasto = (id: string) => {
    const target = gastos.find(g => g.id === id);
    if (!target) return;
    setGastos(prev => prev.filter(g => g.id !== id));

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
    logAudit('CREAR_USUARIO', 'Seguridad', `Creó usuario: ${newUsr.email} con rol ${newUsr.rol}`);
  };

  const updateUsuario = (updated: Usuario) => {
    setUsuarios(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const deleteUsuario = (id: string) => {
    setUsuarios(prev => prev.filter(u => u.id !== id));
  };

  const addRegistroGasolina = (recData: Omit<RegistroGasolina, 'id'>) => {
    const newRec: RegistroGasolina = {
      ...recData,
      id: `gas-${Date.now().toString().slice(-4)}`
    };
    setGasolinaRecords(prev => [newRec, ...prev]);
    logAudit('CREAR_GASOLINA', 'Control de Gasolina', `Registró $${newRec.importe.toFixed(2)} para ${newRec.vehiculo} (KM: ${newRec.km})`);
  };

  const deleteRegistroGasolina = (id: string) => {
    const target = gasolinaRecords.find(g => g.id === id);
    setGasolinaRecords(prev => prev.filter(g => g.id !== id));
    if (target) {
      logAudit('ELIMINAR_GASOLINA', 'Control de Gasolina', `Eliminó registro de gasolina ${target.vehiculo} del ${target.fecha}`);
    }
  };

  const addComprobanteGastos = (compData: Omit<ComprobanteGastos, 'id'>) => {
    const newComp: ComprobanteGastos = {
      ...compData,
      id: `cmp-${Date.now().toString().slice(-4)}`
    };
    setComprobantesGastos(prev => [newComp, ...prev]);
    logAudit('CREAR_COMPROBANTE', 'Comprobante de Gastos', `Generó comprobante ${newComp.folio} por $${newComp.importe.toFixed(2)}`);
  };

  const deleteComprobanteGastos = (id: string) => {
    const target = comprobantesGastos.find(c => c.id === id);
    setComprobantesGastos(prev => prev.filter(c => c.id !== id));
    if (target) {
      logAudit('ELIMINAR_COMPROBANTE', 'Comprobante de Gastos', `Eliminó comprobante ${target.folio}`);
    }
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
    setRoleState('home');
  };

  return (
    <AppContext.Provider
      value={{
        role,
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
        resetData,
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
