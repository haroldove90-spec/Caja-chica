import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { HomeRoleSelector } from './components/HomeRoleSelector';
import { Navigation } from './components/Navigation';

// Custodio Components
import { CustodioMovimientos } from './components/CustodioMovimientos';
import { CustodioGastos } from './components/CustodioGastos';
import { CustodioCierre } from './components/CustodioCierre';

// Contador Components
import { ContadorAuditoria } from './components/ContadorAuditoria';
import { ContadorInyecciones } from './components/ContadorInyecciones';
import { ContadorReportes } from './components/ContadorReportes';

// Admin Components
import { AdminMultiCajas } from './components/AdminMultiCajas';
import { AdminCatalogos } from './components/AdminCatalogos';
import { AdminUsuarios } from './components/AdminUsuarios';

// Shared Modals
import { EvidenceModal } from './components/EvidenceModal';
import { PDFReportModal } from './components/PDFReportModal';

function MainAppContent() {
  const { role, activeModule } = useApp();

  // If role is 'home', display Home without header
  if (role === 'home') {
    return <HomeRoleSelector />;
  }

  // Active module view renderer
  const renderModuleView = () => {
    switch (role) {
      case 'custodio':
        if (activeModule === 'gastos') return <CustodioGastos />;
        if (activeModule === 'cierre') return <CustodioCierre />;
        return <CustodioMovimientos />;

      case 'contador':
        if (activeModule === 'inyecciones') return <ContadorInyecciones />;
        if (activeModule === 'reportes') return <ContadorReportes />;
        return <ContadorAuditoria />;

      case 'admin':
        if (activeModule === 'catalogos') return <AdminCatalogos />;
        if (activeModule === 'usuarios') return <AdminUsuarios />;
        return <AdminMultiCajas />;

      default:
        return <CustodioMovimientos />;
    }
  };

  return (
    <Navigation>
      {renderModuleView()}
      <EvidenceModal />
      <PDFReportModal />
    </Navigation>
  );
}

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
