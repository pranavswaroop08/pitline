type LogLevel = "info" | "error" | "warn" | "debug" | "action";

export class Logger {
  private context: string;
  private isServer: boolean;
  private reset = "\x1b[0m";

  constructor(context: string) {
    this.context = context;
    this.isServer = typeof window === "undefined";
  }

  private getTimestamp(): string {
    return new Date().toISOString();
  }

  private getColorCode(level: LogLevel): string {
    if (!this.isServer) return "";
    const colors: Record<LogLevel, string> = {
      info: "\x1b[34m",   // Blue
      error: "\x1b[31m",  // Red
      warn: "\x1b[33m",   // Yellow
      debug: "\x1b[90m",  // Gray
      action: "\x1b[35m", // Magenta
    };
    return colors[level];
  }

  private formatServerMessage(level: LogLevel, message: string, data?: unknown): string {
    const timestamp = this.getTimestamp();
    const colorCode = this.getColorCode(level);
    const baseMessage = `${colorCode}[${timestamp}] [SERVER] [${this.context}] ${message}${this.reset}`;
    
    if (data) {
      return `${baseMessage} ${JSON.stringify(data)}`;
    }
    return baseMessage;
  }

  private formatClientPrefix(level: LogLevel): string {
    return `[${this.getTimestamp()}] [CLIENT] [${this.context}] [${level.toUpperCase()}]`;
  }

  info(message: string, data?: unknown): void {
    if (this.isServer) {
      console.log(this.formatServerMessage("info", message, data));
    } else {
      if (data) console.log(this.formatClientPrefix("info"), message, data);
      else console.log(this.formatClientPrefix("info"), message);
    }
  }

  error(message: string, error?: unknown): void {
    if (this.isServer) {
      if (error instanceof Error) {
        console.error(
          this.formatServerMessage("error", message, {
            name: error.name,
            message: error.message,
            stack: error.stack,
          })
        );
      } else {
        console.error(this.formatServerMessage("error", message, error));
      }
    } else {
      const prefix = this.formatClientPrefix("error");
      if (error instanceof Error) {
        console.error(prefix, message, {
          name: error.name,
          message: error.message,
          stack: error.stack,
        });
      } else if (error) {
        console.error(prefix, message, error);
      } else {
        console.error(prefix, message);
      }
    }
  }

  warn(message: string, data?: unknown): void {
    if (this.isServer) {
      console.warn(this.formatServerMessage("warn", message, data));
    } else {
      if (data) console.warn(this.formatClientPrefix("warn"), message, data);
      else console.warn(this.formatClientPrefix("warn"), message);
    }
  }

  debug(message: string, data?: unknown): void {
    if (this.isServer) {
      console.debug(this.formatServerMessage("debug", message, data));
    } else {
      if (data) console.debug(this.formatClientPrefix("debug"), message, data);
      else console.debug(this.formatClientPrefix("debug"), message);
    }
  }

  action(message: string, data?: unknown): void {
    if (this.isServer) {
      console.log(this.formatServerMessage("action", message, data));
    } else {
      // In browser dev tools, we use CSS styling tags for custom levels like "action"
      const prefix = `%c[CLIENT] [${this.context}] [ACTION]%c ${message}`;
      const style = "background: #a855f7; color: #ffffff; padding: 2px 4px; rounded: 3px; font-weight: bold;";
      
      if (data) console.log(prefix, style, "", data);
      else console.log(prefix, style, "");
    }
  }
}