import { AxiosError } from 'axios';

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error'
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
}

export class LoggingService {
  private static instance: LoggingService;
  private logs: LogEntry[] = [];
  private maxLogs: number = 1000;
  private logToConsole: boolean = true;

  private constructor() {}

  public static getInstance(): LoggingService {
    if (!LoggingService.instance) {
      LoggingService.instance = new LoggingService();
    }
    return LoggingService.instance;
  }

  private formatError(error: Error | AxiosError): Record<string, any> {
    const errorInfo: Record<string, any> = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    };

    if (this.isAxiosError(error)) {
      errorInfo.status = error.response?.status;
      errorInfo.statusText = error.response?.statusText;
      errorInfo.url = error.config?.url;
      errorInfo.method = error.config?.method;
      errorInfo.responseData = error.response?.data;
    }

    return errorInfo;
  }

  private isAxiosError(error: any): error is AxiosError {
    return error.isAxiosError === true;
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error,
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    if (this.logToConsole) {
      const consoleMethod = console[entry.level] || console.log;
      const logData = {
        timestamp: entry.timestamp,
        message: entry.message,
        ...(entry.context && { context: entry.context }),
        ...(entry.error && { error: this.formatError(entry.error) }),
      };
      consoleMethod(logData);
    }
  }

  public debug(message: string, context?: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.DEBUG, message, context));
  }

  public info(message: string, context?: Record<string, any>) {
    this.addLog(this.createLogEntry(LogLevel.INFO, message, context));
  }

  public warn(message: string, context?: Record<string, any>, error?: Error) {
    this.addLog(this.createLogEntry(LogLevel.WARN, message, context, error));
  }

  public error(message: string, context?: Record<string, any>, error?: Error) {
    this.addLog(this.createLogEntry(LogLevel.ERROR, message, context, error));
  }

  public getLogs(level?: LogLevel): LogEntry[] {
    return level
      ? this.logs.filter(log => log.level === level)
      : [...this.logs];
  }

  public clearLogs() {
    this.logs = [];
  }

  public setLogToConsole(enabled: boolean) {
    this.logToConsole = enabled;
  }
}

export const logger = LoggingService.getInstance();
