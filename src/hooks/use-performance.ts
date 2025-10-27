"use client";

import { useEffect, useRef } from 'react';
import { logger } from '@/lib/logger';

interface PerformanceMetrics {
  componentName: string;
  mountTime: number;
  renderCount: number;
  lastRenderTime: number;
  totalRenderTime: number;
  averageRenderTime: number;
}

export function usePerformance(componentName: string, enabled: boolean = true) {
  const metricsRef = useRef<PerformanceMetrics>({
    componentName,
    mountTime: Date.now(),
    renderCount: 0,
    lastRenderTime: 0,
    totalRenderTime: 0,
    averageRenderTime: 0,
  });

  const renderStartRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const metrics = metricsRef.current;
    metrics.mountTime = Date.now();

    // Log component mount
    logger.performance(`Component mounted: ${componentName}`, Date.now());

    return () => {
      const unmountTime = Date.now();
      const lifetime = unmountTime - metrics.mountTime;

      logger.performance(`Component unmounted: ${componentName}`, lifetime, 'component_lifetime', {
        renderCount: metrics.renderCount,
        averageRenderTime: metrics.averageRenderTime,
        totalRenderTime: metrics.totalRenderTime,
      });
    };
  }, [componentName, enabled]);

  useEffect(() => {
    if (!enabled) return;

    renderStartRef.current = performance.now();
  });

  useEffect(() => {
    if (!enabled || renderStartRef.current === 0) return;

    const renderEnd = performance.now();
    const renderTime = renderEnd - renderStartRef.current;

    const metrics = metricsRef.current;
    metrics.renderCount += 1;
    metrics.lastRenderTime = renderTime;
    metrics.totalRenderTime += renderTime;
    metrics.averageRenderTime = metrics.totalRenderTime / metrics.renderCount;

    // Log slow renders (>16ms)
    if (renderTime > 16) {
      logger.performance(`Slow render detected: ${componentName}`, renderTime, 'render_time', {
        renderCount: metrics.renderCount,
        averageRenderTime: metrics.averageRenderTime,
      });
    }
  });

  return metricsRef.current;
}

// Hook for measuring async operations
export function useAsyncPerformance(operationName: string, enabled: boolean = true) {
  const startTimeRef = useRef<number>(0);

  const start = () => {
    if (!enabled) return;
    startTimeRef.current = performance.now();
  };

  const end = (additionalData?: any) => {
    if (!enabled || startTimeRef.current === 0) return;

    const duration = performance.now() - startTimeRef.current;
    startTimeRef.current = 0;

    logger.performance(`Async operation completed: ${operationName}`, duration, operationName, additionalData);

    return duration;
  };

  return { start, end };
}

// Hook for measuring API calls
export function useApiPerformance(apiName: string, enabled: boolean = true) {
  const { start, end } = useAsyncPerformance(`API: ${apiName}`, enabled);

  const measureApiCall = async <T>(
    apiCall: () => Promise<T>,
    additionalData?: any
  ): Promise<T> => {
    start();
    try {
      const result = await apiCall();
      end({ success: true, ...additionalData });
      return result;
    } catch (error) {
      end({ success: false, error: error instanceof Error ? error.message : String(error), ...additionalData });
      throw error;
    }
  };

  return measureApiCall;
}
