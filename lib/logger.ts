type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'SUCCESS' | 'DEBUG';

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  info: '\x1b[34m',    // Blue
  success: '\x1b[32m', // Green
  warn: '\x1b[33m',    // Yellow
  error: '\x1b[31m',   // Red
  debug: '\x1b[35m',   // Magenta
  gray: '\x1b[90m',    // Gray
};

class Logger {
  private formatMessage(level: LogLevel, module: string, message: string) {
    const timestamp = new Date().toISOString();
    const color = colors[level.toLowerCase() as keyof typeof colors] || colors.reset;
    
    return `${colors.gray}[${timestamp}]${colors.reset} ${color}${level.padEnd(7)}${colors.reset} ${colors.bright}[${module}]${colors.reset} ${message}`;
  }

  info(module: string, message: string) {
    console.log(this.formatMessage('INFO', module, message));
  }

  success(module: string, message: string) {
    console.log(this.formatMessage('SUCCESS', module, message));
  }

  warn(module: string, message: string) {
    console.warn(this.formatMessage('WARN', module, message));
  }

  error(module: string, message: string, error?: any) {
    console.error(this.formatMessage('ERROR', module, message));
    if (error) {
      if (error instanceof Error) {
        console.error(`${colors.error}${error.stack}${colors.reset}`);
      } else {
        console.error(error);
      }
    }
  }

  debug(module: string, message: string) {
    if (process.env.NODE_ENV !== 'production') {
      console.log(this.formatMessage('DEBUG', module, message));
    }
  }
}

export const logger = new Logger();
