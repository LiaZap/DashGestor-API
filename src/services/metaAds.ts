const META_API_VERSION = 'v21.0';
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export interface MetaOverrides {
  accessToken?: string;
  adAccountId?: string;
}

function getMetaToken(overrides?: MetaOverrides): string {
  const token = overrides?.accessToken || process.env.META_ACCESS_TOKEN;
  if (!token) throw new Error('META_ACCESS_TOKEN não configurado');
  return token;
}

function getMetaAdAccountId(overrides?: MetaOverrides): string {
  const id = overrides?.adAccountId || process.env.META_AD_ACCOUNT_ID;
  if (!id) throw new Error('META_AD_ACCOUNT_ID não configurado');
  return id.startsWith('act_') ? id : `act_${id}`;
}

function periodToDates(period: string): { since: string; until: string } {
  const now = new Date();
  const until = now.toISOString().split('T')[0];
  const days = period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 90;
  const since = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
  return { since, until };
}

async function metaFetch(endpoint: string, params: Record<string, string> = {}, overrides?: MetaOverrides) {
  const token = getMetaToken(overrides);
  const url = new URL(`${META_BASE_URL}/${endpoint}`);
  url.searchParams.set('access_token', token);
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v));

  const res = await fetch(url.toString());
  if (!res.ok) {
    const errBody: any = await res.json();
    throw new Error(errBody.error?.message || `Meta API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchMetaInsights(
  period: string,
  overrides?: MetaOverrides,
  customRange?: { since: string; until: string }
) {
  const accountId = getMetaAdAccountId(overrides);
  const { since, until } = customRange || periodToDates(period);

  const data = await metaFetch(`${accountId}/insights`, {
    fields: 'spend,impressions,clicks,ctr,cpc,cpm,actions,action_values,reach,frequency',
    time_range: JSON.stringify({ since, until }),
    time_increment: '1',
  }, overrides);

  return data;
}

export async function fetchMetaCampaigns(
  period: string,
  overrides?: MetaOverrides,
  customRange?: { since: string; until: string }
) {
  const accountId = getMetaAdAccountId(overrides);
  const { since, until } = customRange || periodToDates(period);

  const insightFields = 'spend,impressions,clicks,ctr,actions,action_values';
  const data = await metaFetch(`${accountId}/campaigns`, {
    fields: `name,status,objective,daily_budget,lifetime_budget,insights.time_range({"since":"${since}","until":"${until}"}){${insightFields}}`,
    limit: '100',
  }, overrides);

  return data;
}

export async function fetchMetaAdsets(campaignId: string, overrides?: MetaOverrides) {
  const data = await metaFetch(`${campaignId}/adsets`, {
    fields: 'name,status,daily_budget,targeting,insights{spend,impressions,clicks,ctr,actions}',
    limit: '100',
  }, overrides);
  return data;
}

export async function fetchMetaAds(adsetId: string, overrides?: MetaOverrides) {
  const data = await metaFetch(`${adsetId}/ads`, {
    fields: 'name,status,creative{title,body,image_url,thumbnail_url,video_id},insights{spend,impressions,clicks,ctr,actions,action_values}',
    limit: '100',
  }, overrides);
  return data;
}

export async function fetchMetaDemographics(period: string, overrides?: MetaOverrides) {
  const accountId = getMetaAdAccountId(overrides);
  const { since, until } = periodToDates(period);

  const data = await metaFetch(`${accountId}/insights`, {
    fields: 'spend,impressions,clicks,actions',
    time_range: JSON.stringify({ since, until }),
    breakdowns: 'age,gender',
  }, overrides);

  return data;
}
