import dns from 'dns';
try { dns.setDefaultResultOrder('ipv4first'); } catch {}
import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger';
import { config } from './env';

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function getSecureDatabaseUrl(rawUrl: string): string {
  if (!rawUrl) return rawUrl;
  let url = rawUrl;
  if (!url.includes('connection_limit=')) {
    url += (url.includes('?') ? '&' : '?') + 'connection_limit=10';
  }
  if (!url.includes('pool_timeout=')) {
    url += '&pool_timeout=10';
  }
  return url;
}

const prisma = global.__prisma || new PrismaClient({
  datasources: {
    db: {
      url: getSecureDatabaseUrl(config.DATABASE_URL),
    },
  },
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV === 'development') {
  (prisma as any).$on('query', (e: any) => {
    logger.debug(`Query: ${e.query} | Duration: ${e.duration}ms`);
  });
}

if (process.env.NODE_ENV !== 'production') {
  global.__prisma = prisma;
}

export default prisma;
