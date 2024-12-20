import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: isDevelopment ? 'debug' : 'info',
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          ignore: 'pid,hostname',
          translateTime: 'SYS:standard',
        },
      }
    : undefined,
  base: {
    env: process.env.NODE_ENV,
  },
  redact: {
    paths: ['*.password', '*.secret', '*.token', '*.key'],
    remove: true,
  },
});
