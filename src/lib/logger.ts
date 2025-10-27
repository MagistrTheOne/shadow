type LogLevel = "debug" | "info" | "warn" | "error";

interface LogEntry {
  level: LogLevel;
  message: string;
  data?: any;
  timestamp: string;
  userId?: string;
  sessionId?: string;
  requestId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";
  private logQueue: LogEntry[] = [];
  private maxQueueSize = 100;

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}`;

    if (data) {
      return `${prefix}: ${message}\n${JSON.stringify(data, null, 2)}`;
    }

    return `${prefix}: ${message}`;
  }

  private log(level: LogLevel, message: string, data?: any) {
    const entry: LogEntry = {
      level,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    // Add to queue for potential batch sending
    this.logQueue.push(entry);
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue.shift();
    }

    // Console logging
    if (this.isDevelopment) {
      const formatted = this.formatMessage(level, message, data);
      switch (level) {
        case "debug":
          console.debug(formatted);
          break;
        case "info":
          console.info(formatted);
          break;
        case "warn":
          console.warn(formatted);
          break;
        case "error":
          console.error(formatted);
          break;
      }
    } else {
      // In production, you might want to send logs to a service
      this.sendToLogService(entry);
    }
  }

  private async sendToLogService(entry: LogEntry) {
    // Placeholder for log aggregation service (e.g., LogRocket, DataDog, etc.)
    // In a real implementation, you would send logs to your preferred logging service

    if (entry.level === "error") {
      // For errors, you might want immediate sending
      try {
        // Example: send to your error tracking service
        // await fetch('/api/logs', { method: 'POST', body: JSON.stringify(entry) });
      } catch (error) {
        console.error("Failed to send log to service:", error);
      }
    }
  }

  debug(message: string, data?: any) {
    this.log("debug", message, data);
  }

  info(message: string, data?: any) {
    this.log("info", message, data);
  }

  warn(message: string, data?: any) {
    this.log("warn", message, data);
  }

  error(message: string, data?: any) {
    this.log("error", message, data);
  }

  // Specialized logging methods
  auth(message: string, userId?: string, data?: any) {
    this.info(`AUTH: ${message}`, { userId, ...data });
  }

  api(message: string, method?: string, path?: string, statusCode?: number, data?: any) {
    const level = statusCode && statusCode >= 400 ? "warn" : "info";
    this.log(level, `API: ${message}`, { method, path, statusCode, ...data });
  }

  meeting(message: string, meetingId?: string, userId?: string, data?: any) {
    this.info(`MEETING: ${message}`, { meetingId, userId, ...data });
  }

  agent(message: string, agentId?: string, userId?: string, data?: any) {
    this.info(`AGENT: ${message}`, { agentId, userId, ...data });
  }

  payment(message: string, userId?: string, amount?: number, currency?: string, data?: any) {
    this.info(`PAYMENT: ${message}`, { userId, amount, currency, ...data });
  }

  performance(message: string, duration?: number, operation?: string, data?: any) {
    this.info(`PERF: ${message}`, { duration, operation, ...data });
  }

  // Flush logs (useful for testing or manual log sending)
  flush() {
    const logs = [...this.logQueue];
    this.logQueue = [];
    return logs;
  }

  // Get recent logs
  getRecentLogs(count: number = 50) {
    return this.logQueue.slice(-count);
  }
}

// Export singleton instance
export const logger = new Logger();

// Export types for use in other files
export type { LogLevel, LogEntry };
