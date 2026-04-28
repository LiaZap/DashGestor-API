import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import type { MetaOverrides } from '../services/metaAds';
import { fetchMetaInsights, fetchMetaCampaigns, fetchMetaAdsets, fetchMetaAds, fetchMetaDemographics, fetchMetaAccountInfo } from '../services/metaAds';

export const metaRouter = Router();

function extractMetaOverrides(req: AuthRequest): MetaOverrides | undefined {
  const token = req.headers['x-meta-token'] as string | undefined;
  const accountId = req.headers['x-meta-account-id'] as string | undefined;
  if (!token && !accountId) return undefined;
  return { accessToken: token, adAccountId: accountId };
}

metaRouter.get('/insights', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaInsights(period, extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/campaigns', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaCampaigns(period, extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/adsets/:campaignId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await fetchMetaAdsets(req.params.campaignId as string, extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/ads/:adsetId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await fetchMetaAds(req.params.adsetId as string, extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/account', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await fetchMetaAccountInfo(extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/demographics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaDemographics(period, extractMetaOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
