"use client";

import React, { Suspense, ComponentType, lazy } from 'react';
import { LoadingState } from './loading-state';

interface LazyWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  errorFallback?: React.ReactNode;
}

// Wrapper for lazy loading components
export function LazyWrapper({
  children,
  fallback,
  errorFallback
}: LazyWrapperProps) {
  return (
    <Suspense
      fallback={fallback || <LoadingState title="Loading..." description="Please wait" />}
    >
      {errorFallback ? (
        <ErrorBoundary fallback={errorFallback}>
          {children}
        </ErrorBoundary>
      ) : (
        children
      )}
    </Suspense>
  );
}

// Lazy load a component
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = lazy(importFunc);

  return function LazyComponentWrapper(props: React.ComponentProps<T>) {
    return (
      <LazyWrapper fallback={fallback}>
        <LazyComponent {...props} />
      </LazyWrapper>
    );
  };
}

// Simple error boundary for lazy components
class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Lazy component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
