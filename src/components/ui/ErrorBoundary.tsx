import { Component, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; message: string; }

export default class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: '' };

  static getDerivedStateFromError(err: Error): State {
    return { hasError: true, message: err.message };
  }

  handleReset = () => {
    this.setState({ hasError: false, message: '' });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-900 border border-gray-800 rounded-xl p-8 text-center shadow-2xl">
            <div className="text-4xl mb-4">⚠️</div>
            <h1 className="text-lg font-semibold text-white mb-2">Something went wrong</h1>
            <p className="text-sm text-gray-400 mb-1">An unexpected error occurred in the dashboard.</p>
            {this.state.message && (
              <p className="text-xs text-gray-600 font-mono bg-gray-800 rounded-lg px-3 py-2 mt-3 text-left break-all">
                {this.state.message}
              </p>
            )}
            <button
              onClick={this.handleReset}
              className="btn-primary mt-6 px-6"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
