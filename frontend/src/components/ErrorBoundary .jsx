import React, { Component } from 'react';
import { Container, Button, Card } from 'react-bootstrap';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can also log the error to an error reporting service
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return this.props.fallback || (
        <Container className="py-5 text-center">
          <Card className="shadow-sm border-0 p-4">
            <Card.Body>
              <i className="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
              <h2>Something went wrong</h2>
              <p className="mb-4 text-muted">
                {this.state.error && this.state.error.toString()}
              </p>
              <Button 
                variant="primary" 
                onClick={() => window.location.reload()}
                className="me-2"
              >
                Reload Page
              </Button>
              <Button 
                variant="outline-secondary" 
                onClick={() => this.setState({ hasError: false })}
              >
                Try Again
              </Button>
            </Card.Body>
          </Card>
        </Container>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;