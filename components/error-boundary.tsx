"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { EmptyCard } from "@/components/empty-card";
import { AlertTriangle, RefreshCw } from "lucide-react";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="flex items-center justify-center p-8">
          <EmptyCard
            icon={<AlertTriangle className="size-10 text-destructive" />}
            title="Error en el componente"
            description={
              this.state.error?.message ||
              "Ocurrió un error al cargar este componente."
            }
            actions={
              <Button
                onClick={() => this.setState({ hasError: false })}
                className="gap-2"
              >
                <RefreshCw className="size-4" />
                Reintentar
              </Button>
            }
          />
        </div>
      );
    }

    return this.props.children;
  }
}
