
import React from 'react';

/**
 * Error Boundary Component
 * Catches JavaScript errors anywhere in the child component tree
 */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="error-boundary-container" role="alert">
          <div className="error-boundary-content">
            <div className="error-icon" aria-hidden="true">!</div>
            <h2>Something went wrong</h2>
            <p className="error-message">
              {this.state.error?.message || 'An unexpected error occurred'}
            </p>
            <button
              className="btn btn-primary"
              onClick={this.handleReset}
              aria-label="Try again"
            >
              Try Again
            </button>
            <button
              className="btn btn-outline-secondary ms-2"
              onClick={() => window.location.reload()}
              aria-label="Reload page"
            >
              Reload Page
            </button>
          </div>
          <style>{`
            .error-boundary-container {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 50vh;
              padding: 2rem;
            }
            .error-boundary-content {
              text-align: center;
              max-width: 400px;
            }
            .error-icon {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            .error-message {
              color: var(--text-muted, #6c757d);
              margin-bottom: 1.5rem;
            }
          `}</style>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;