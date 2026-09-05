import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, RotateCcw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  componentDidMount() {
    // Intercept uncaught promise rejections gracefully
    window.addEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  componentWillUnmount() {
    window.removeEventListener('unhandledrejection', this.handleUnhandledRejection);
  }

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    console.warn('Unhandled promise rejection captured by application guard:', event.reason);
    // Prevent browser default error banner if not fatal
    if (event.reason) {
      event.preventDefault();
    }
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleResetCache = () => {
    try {
      // Clear app specific keys
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('control_caja_app_v1')) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(k => localStorage.removeItem(k));
    } catch (e) {
      console.error('Error clearing localStorage:', e);
    }
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-zinc-100 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-zinc-200 text-center space-y-6 animate-in fade-in">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center mx-auto shadow-xs">
              <AlertTriangle className="w-8 h-8" />
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-zinc-900 tracking-tight">
                Se detectó una discrepancia en la sesión
              </h2>
              <p className="text-xs text-zinc-600 leading-relaxed">
                El sistema detectó un estado inesperado o datos en caché desactualizados. Puedes reintentar la carga inmediatamente o restablecer la memoria local para sincronizar los datos limpios desde Supabase.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-zinc-50 border border-zinc-200 rounded-xl text-left text-[11px] text-zinc-700 font-mono overflow-x-auto max-h-24">
                {this.state.error.message || String(this.state.error)}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-700 text-white text-xs font-bold hover:bg-blue-800 transition-colors shadow-xs cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Recargar Sistema</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetCache}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 text-zinc-800 border border-zinc-300 text-xs font-semibold hover:bg-zinc-200 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-zinc-600" />
                <span>Restablecer Caché Local</span>
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
