import React from 'react';

type ErrorBoundaryProps = {
  children: React.ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Keep this as console output so it shows up in browser devtools and CI logs.
    console.error('[ARK_OMEGA] Unhandled error', error, errorInfo);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-black text-slate-200 flex items-center justify-center p-8">
        <div className="cyber-chip cyber-chip-screws max-w-xl w-full p-8 text-center">
          <div className="font-display text-2xl tracking-widest text-amber-400 glow-text-gold">
            SYSTEM_FAILURE
          </div>
          <div className="mt-4 text-sm text-slate-400 font-mono">
            The interface hit an unrecoverable runtime exception.
          </div>
          {this.state.error?.message && (
            <pre className="mt-4 text-left text-xs bg-black/40 border border-slate-800 rounded p-3 overflow-auto custom-scrollbar">
              {this.state.error.message}
            </pre>
          )}
          <div className="mt-6 flex justify-center">
            <button
              className="cyber-key px-6 py-3 text-amber-400 font-bold"
              onClick={() => window.location.reload()}
            >
              RELOAD
            </button>
          </div>
        </div>
      </div>
    );
  }
}
