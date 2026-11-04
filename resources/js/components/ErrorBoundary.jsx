import React from 'react';
import { Button } from '@idds/react';
import { IconAlertTriangle, IconRefresh } from '@tabler/icons-react';

export class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('SIMATA UI Runtime Error:', error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                    <div className="max-w-md w-full bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4">
                            <IconAlertTriangle size={24} />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 mb-2">
                            Terjadi Kendala Tampilan
                        </h2>
                        <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                            Aplikasi mengalami galat saat memuat komponen antarmuka. Silakan muat ulang halaman.
                        </p>
                        {this.state.error && (
                            <div className="p-3 bg-red-50 text-red-800 text-xs font-mono rounded border border-red-200 text-left overflow-x-auto mb-4 max-h-32">
                                {this.state.error.toString()}
                            </div>
                        )}
                        <Button
                            hierarchy="primary"
                            size="md"
                            prefixIcon={<IconRefresh size={16} />}
                            onClick={this.handleReload}
                            className="w-full justify-center"
                        >
                            Muat Ulang Halaman
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
