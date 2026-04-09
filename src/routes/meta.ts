import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { fetchMetaInsights, fetchMetaCampaigns, fetchMetaAdsets, fetchMetaAds, fetchMetaDemographics } from '../services/metaAds';

export const metaRouter = Router();

metaRouter.get('/insights', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaInsights(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/campaigns', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaCampaigns(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/adsets/:campaignId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await fetchMetaAdsets(req.params.campaignId as string);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/ads/:adsetId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const data = await fetchMetaAds(req.params.adsetId as string);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

metaRouter.get('/demographics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchMetaDemographics(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
