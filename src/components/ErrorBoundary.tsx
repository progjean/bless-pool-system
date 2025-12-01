import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Em produção, enviar para serviço de logging (Sentry, etc.)
    console.error('ErrorBoundary capturou um erro:', error, errorInfo);
    
    // Log para console em desenvolvimento
    if (import.meta.env.DEV) {
      console.error('Stack trace:', error.stack);
      console.error('Component stack:', errorInfo.componentStack);
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
    });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return <ErrorFallback error={this.state.error} onReset={this.handleReset} />;
    }

    return this.props.children;
  }
}

interface ErrorFallbackProps {
  error: Error | null;
  onReset: () => void;
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, onReset }) => {
  // Detectar idioma do navegador como fallback
  const browserLang = navigator.language || 'en-US';
  const language = browserLang.startsWith('pt') ? 'pt-BR' : 'en-US';

  return (
    <div className="error-boundary">
      <div className="error-boundary-content">
        <div className="error-icon">⚠️</div>
        <h1>{language === 'pt-BR' ? 'Ops! Algo deu errado' : 'Oops! Something went wrong'}</h1>
        <p className="error-message">
          {language === 'pt-BR' 
            ? 'Ocorreu um erro inesperado. Por favor, tente recarregar a página.'
            : 'An unexpected error occurred. Please try reloading the page.'}
        </p>
        
        {import.meta.env.DEV && error && (
          <details className="error-details">
            <summary>{language === 'pt-BR' ? 'Detalhes do erro' : 'Error details'}</summary>
            <pre className="error-stack">{error.message}</pre>
            {error.stack && (
              <pre className="error-stack">{error.stack}</pre>
            )}
          </details>
        )}

        <div className="error-actions">
          <button onClick={onReset} className="retry-button">
            {language === 'pt-BR' ? 'Tentar novamente' : 'Try again'}
          </button>
          <button onClick={() => window.location.reload()} className="reload-button">
            {language === 'pt-BR' ? 'Recarregar página' : 'Reload page'}
          </button>
        </div>
      </div>
    </div>
  );
};

