import { rateLimit, ipKeyGenerator } from 'express-rate-limit';
import type { Request } from 'express';

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: { error: 'Trop de requêtes, attends 1 minute.' },
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req: Request) => (req as any).userId || ipKeyGenerator(req.ip || 'unknown'),
});
