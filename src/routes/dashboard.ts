import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import type { MetaOverrides } from '../services/metaAds';
import type { GoogleOverrides } from '../services/googleAds';
import { fetchMetaInsights, fetchMetaCampaigns } from '../services/metaAds';
import { fetchGoogleMetrics, fetchGoogleCampaigns } from '../services/googleAds';

export const dashboardRouter = Router();

function extractMetaOverrides(req: AuthRequest): MetaOverrides | undefined {
  const token = req.headers['x-meta-token'] as string | undefined;
  const accountId = req.headers['x-meta-account-id'] as string | undefined;
  if (!token && !accountId) return undefined;
  return { accessToken: token, adAccountId: accountId };
}

function extractGoogleOverrides(req: AuthRequest): GoogleOverrides | undefined {
  const token = req.headers['x-google-token'] as string | undefined;
  const devToken = req.headers['x-google-dev-token'] as string | undefined;
  const customerId = req.headers['x-google-customer-id'] as string | undefined;
  if (!token && !customerId) return undefined;
  return { accessToken: token, developerToken: devToken, customerId };
}

dashboardRouter.get('/overview', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { period = '7d', platform = 'all' } = req.query;
    const metaOv = extractMetaOverrides(req);
    const googleOv = extractGoogleOverrides(req);

    const results: { meta?: any; google?: any; metaCampaigns?: any; googleCampaigns?: any } = {};

    if (platform === 'all' || platform === 'meta') {
      try {
        results.meta = await fetchMetaInsights(period as string, metaOv);
      } catch (e) {
        results.meta = { error: 'Meta Ads não configurado', details: (e as Error).message };
      }
      try {
        results.metaCampaigns = await fetchMetaCampaigns(period as string, metaOv);
      } catch (e) {
        results.metaCampaigns = { error: 'Meta Campaigns não disponível', details: (e as Error).message };
      }
    }

    if (platform === 'all' || platform === 'google') {
      try {
        results.google = await fetchGoogleMetrics(period as string, googleOv);
      } catch (e) {
        results.google = { error: 'Google Ads não configurado', details: (e as Error).message };
      }
      try {
        results.googleCampaigns = await fetchGoogleCampaigns(period as string, googleOv);
      } catch (e) {
        results.googleCampaigns = { error: 'Google Campaigns não disponível', details: (e as Error).message };
      }
    }

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar dados', details: (error as Error).message });
  }
});
