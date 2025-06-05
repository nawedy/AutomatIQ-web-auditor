// src/lib/logger.ts
// Simple logger utility for consistent logging across the application

/**
 * Logger class for consistent logging across the application
 * Provides methods for different log levels with context
 */
export class Logger {
  private context: string;
  
  /**
   * Create a new logger instance with a specific context
   * @param context The context name for this logger (e.g., 'auth', 'api', 'monitoring')
   */
  constructor(context: string) {
    this.context = context;
  }
  
  /**
   * Format a log message with timestamp and context
   * @param level The log level
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   * @returns Formatted log message
   */
  private formatMessage(level: string, message: string, ...optionalParams: any[]): string[] {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level}] [${this.context}]`;
    return [prefix, message, ...optionalParams];
  }
  
  /**
   * Log an info message
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public info(message: string, ...optionalParams: any[]): void {
    console.info(...this.formatMessage('INFO', message, ...optionalParams));
  }
  
  /**
   * Log a warning message
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public warn(message: string, ...optionalParams: any[]): void {
    console.warn(...this.formatMessage('WARN', message, ...optionalParams));
  }
  
  /**
   * Log an error message
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public error(message: string, ...optionalParams: any[]): void {
    console.error(...this.formatMessage('ERROR', message, ...optionalParams));
  }
  
  /**
   * Log a debug message
   * @param message The message to log
   * @param optionalParams Additional parameters to log
   */
  public debug(message: string, ...optionalParams: any[]): void {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(...this.formatMessage('DEBUG', message, ...optionalParams));
    }
  }
  
  /**
   * Create a child logger with a sub-context
   * @param subContext The sub-context to append to the current context
   * @returns A new Logger instance with the combined context
   */
  public createChildLogger(subContext: string): Logger {
    return new Logger(`${this.context}:${subContext}`);
  }
}
