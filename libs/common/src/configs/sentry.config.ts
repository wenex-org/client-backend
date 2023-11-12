import { SentryModuleOptions } from '@ntegral/nestjs-sentry';

export function SENTRY_CONFIG(): SentryModuleOptions {
  const isDev = (process.env.NODE_ENV || 'dev').toLowerCase().startsWith('dev');

  return {
    debug: isDev,
    release: process.env.npm_package_version,
    environment: isDev ? 'dev' : 'production',
    dsn: isDev ? undefined : process.env.SENTRY_DSN,
    logLevels: ['log', 'error', 'warn', 'debug', 'verbose'],
    maxBreadcrumbs: +(process.env.SENTRY_MAX_BREADCRUMBS || 100),
    tracesSampleRate: +(process.env.SENTRY_TRACES_SAMPLE_RATE || 1.0),
  };
}
