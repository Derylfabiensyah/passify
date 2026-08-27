import React from 'react';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-[var(--canvas,#f8fbf5)] px-4 py-12">
          <div className="max-w-lg w-full rounded-2xl border border-[#d6e2cf] bg-white p-8 text-center shadow-lg">
            <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-red-100 text-red-600 mb-4">
              <AlertCircle className="h-8 w-8" />
            </div>
            <h1 className="font-serif text-2xl font-bold text-[#102d20]">
              Terjadi Kendala Memuat Halaman
            </h1>
            <p className="mt-2 text-sm text-[#586d5d] leading-relaxed">
              {this.state.error?.message || 'Terjadi kesalahan saat merender komponen ini.'}
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => window.location.reload()}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#1e4b35] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#102d20]"
              >
                <RotateCcw className="h-4 w-4" />
                Muat Ulang Halaman
              </button>
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-[#d6e2cf] bg-white px-5 py-2.5 text-xs font-bold text-[#1e4b35] transition-colors hover:bg-[#e8f1dc]"
              >
                <Home className="h-4 w-4" />
                Kembali ke Beranda
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
