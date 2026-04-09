import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { fetchMetaInsights } from '../services/metaAds';
import { fetchGoogleMetrics } from '../services/googleAds';

export const dashboardRouter = Router();

dashboardRouter.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '7d', platform = 'all' } = req.query;

    const results: { meta?: any; google?: any } = {};

    if (platform === 'all' || platform === 'meta') {
      try {
        results.meta = await fetchMetaInsights(period as string);
      } catch (e) {
        results.meta = { error: 'Meta Ads não configurado', details: (e as Error).message };
      }
    }

    if (platform === 'all' || platform === 'google') {
      try {
        results.google = await fetchGoogleMetrics(period as string);
      } catch (e) {
        results.google = { error: 'Google Ads não configurado', details: (e as Error).message };
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados', details: (error as Error).message });
  }
});
