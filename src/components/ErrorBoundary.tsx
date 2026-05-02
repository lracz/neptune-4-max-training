import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw } from 'lucide-react';
import { useAppStore } from '../store/appStore';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export default class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
        // Attempt to log via telemetry if available
        try {
            useAppStore.getState().logTelemetry('CRITICAL_ERROR', {
                message: error.message,
                stack: errorInfo.componentStack
            });
        } catch (e) {
            // Ignore if store isn't available
        }
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="w-full bg-red-50 rounded-3xl p-8 sm:p-12 text-center border-2 border-red-200 shadow-xl flex flex-col items-center justify-center min-h-[400px]">
                    <div className="bg-red-100 p-4 rounded-full mb-6 text-red-500">
                        <AlertOctagon className="w-16 h-16" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-red-800 mb-4">Hoppá, valami elromlott!</h2>
                    <p className="text-red-600 mb-8 max-w-md mx-auto">
                        A szimuláció váratlan hiba miatt megakadt.
                        Semmi gond, a technika már csak ilyen!
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-8 py-3 rounded-xl font-bold transition-colors shadow-md"
                    >
                        <RotateCcw className="w-5 h-5" />
                        Oldal Újratöltése
                    </button>
                </div>
            );
        }

        return this.props.children;
    }
}
