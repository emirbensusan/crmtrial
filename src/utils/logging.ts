// Logging and Observability
export interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  requestId?: string;
  userId?: string;
  metadata?: Record<string, any>;
}

export class Logger {
  private static instance: Logger;
  private requestId: string = '';
  private userId: string = '';

  static getInstance(): Logger {
    if (!Logger.instance) {
      Logger.instance = new Logger();
    }
    return Logger.instance;
  }

  setRequestId(requestId: string) {
    this.requestId = requestId;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(level: LogEntry['level'], message: string, metadata?: Record<string, any>): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      requestId: this.requestId,
      userId: this.userId,
      metadata: this.sanitizeMetadata(metadata)
    };
  }

  private sanitizeMetadata(metadata?: Record<string, any>): Record<string, any> | undefined {
    if (!metadata) return undefined;

    // Remove PII and sensitive data
    const sanitized = { ...metadata };
    const sensitiveKeys = ['password', 'token', 'secret', 'key', 'email', 'phone', 'ssn', 'credit_card'];
    
    const sanitizeObject = (obj: any): any => {
      if (typeof obj !== 'object' || obj === null) return obj;
      
      if (Array.isArray(obj)) {
        return obj.map(sanitizeObject);
      }
      
      const result: any = {};
      Object.keys(obj).forEach(key => {
        const lowerKey = key.toLowerCase();
        if (sensitiveKeys.some(sensitive => lowerKey.includes(sensitive))) {
          result[key] = '[REDACTED]';
        } else {
          result[key] = sanitizeObject(obj[key]);
        }
      });
      
      return result;
    };

    return sanitizeObject(sanitized);
  }

  private log(entry: LogEntry) {
    // In development, log to console
    if (import.meta.env.DEV) {
      const style = {
        debug: 'color: #6b7280',
        info: 'color: #3b82f6',
        warn: 'color: #f59e0b',
        error: 'color: #ef4444'
      };
      
      console.log(
        `%c[${entry.level.toUpperCase()}] ${entry.timestamp} ${entry.message}`,
        style[entry.level],
        entry.metadata
      );
    }

    // In production, send to logging service
    if (import.meta.env.PROD) {
      this.sendToLoggingService(entry);
    }
  }

  private async sendToLoggingService(entry: LogEntry) {
    try {
      // Replace with your logging service endpoint
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry)
      });
    } catch (error) {
      console.error('Failed to send log to service:', error);
    }
  }

  debug(message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('debug', message, metadata));
  }

  info(message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('info', message, metadata));
  }

  warn(message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('warn', message, metadata));
  }

  error(message: string, metadata?: Record<string, any>) {
    this.log(this.createLogEntry('error', message, metadata));
  }

  // Log API requests
  logApiRequest(method: string, url: string, status: number, duration: number, metadata?: Record<string, any>) {
    this.info(`API ${method} ${url} - ${status} (${duration}ms)`, {
      type: 'api_request',
      method,
      url,
      status,
      duration,
      ...metadata
    });
  }

  // Log user actions
  logUserAction(action: string, resource: string, metadata?: Record<string, any>) {
    this.info(`User action: ${action} ${resource}`, {
      type: 'user_action',
      action,
      resource,
      ...metadata
    });
  }

  // Log business events
  logBusinessEvent(event: string, metadata?: Record<string, any>) {
    this.info(`Business event: ${event}`, {
      type: 'business_event',
      event,
      ...metadata
    });
  }
}

// Request ID generator
export const generateRequestId = (): string => {
  return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Performance tracking
export const trackPerformance = (name: string) => {
  const start = performance.now();
  
  return {
    end: (metadata?: Record<string, any>) => {
      const duration = performance.now() - start;
      Logger.getInstance().info(`Performance: ${name}`, {
        type: 'performance',
        operation: name,
        duration: Math.round(duration),
        ...metadata
      });
      return duration;
    }
  };
};