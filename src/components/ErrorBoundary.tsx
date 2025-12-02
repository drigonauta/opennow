import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                    <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center">
                        <div className="bg-red-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-gray-600 mb-6">
                            Desculpe, encontramos um erro inesperado. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <div className="bg-gray-100 p-3 rounded text-left text-xs text-gray-500 font-mono mb-6 overflow-auto max-h-32">
                                {this.state.error.toString()}
                            </div>
                        )}

                        <button
                            onClick={() => window.location.reload()}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                        >
                            <RefreshCw size={20} />
                            Recarregar Página
                        </button>

                        <button
                            onClick={() => window.location.href = '/'}
                            className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
                        >
                            Voltar para o Início
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
