import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './index.css';

interface ErrorBoundaryState {
  hasError: boolean;
}

class PortfolioErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#0b0b0a] text-[#ecebe6] flex items-center justify-center p-6">
          <div className="max-w-md border border-[rgba(236,235,230,0.2)] rounded-xl p-8 bg-[#121211]">
            <p className="mono text-[#ff5b25] mb-2">Portfolio Recovery</p>
            <h1 className="text-2xl font-medium tracking-tight mb-3">Sakthi Kumaran</h1>
            <p className="text-[#a4a39d] text-sm leading-relaxed mb-6">
              Something interrupted rendering in this browser session. Reload to restore the full interactive view.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="btn text-sm py-2.5 px-5"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const container = document.getElementById('root');
if (container) {
  createRoot(container).render(
    <PortfolioErrorBoundary>
      <App />
    </PortfolioErrorBoundary>
  );
}
