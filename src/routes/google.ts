import { Router, Response } from 'express';
import type { AuthRequest } from '../middleware/auth';
import type { GoogleOverrides } from '../services/googleAds';
import { fetchGoogleMetrics, fetchGoogleCampaigns, fetchGoogleAdGroups, fetchGoogleKeywords } from '../services/googleAds';

export const googleRouter = Router();

function extractGoogleOverrides(req: AuthRequest): GoogleOverrides | undefined {
  const token = req.headers['x-google-token'] as string | undefined;
  const devToken = req.headers['x-google-dev-token'] as string | undefined;
  const customerId = req.headers['x-google-customer-id'] as string | undefined;
  if (!token && !customerId) return undefined;
  return { accessToken: token, developerToken: devToken, customerId };
}

googleRouter.get('/metrics', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleMetrics(period, extractGoogleOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/campaigns', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleCampaigns(period, extractGoogleOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/adgroups/:campaignId', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleAdGroups(req.params.campaignId as string, period, extractGoogleOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});

googleRouter.get('/keywords', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const period = (req.query.period as string) || '7d';
    const data = await fetchGoogleKeywords(period, extractGoogleOverrides(req));
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: (error as Error).message });
  }
});
