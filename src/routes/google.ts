import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import { fetchGoogleMetrics, fetchGoogleCampaigns, fetchGoogleAdGroups, fetchGoogleKeywords } from '../services/googleAds';

export const googleRouter = Router();

googleRouter.get('/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleMetrics(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/campaigns', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleCampaigns(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/adgroups/:campaignId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleAdGroups(req.params.campaignId as string, period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/keywords', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleKeywords(period);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
