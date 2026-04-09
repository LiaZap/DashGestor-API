const GOOGLE_ADS_API_VERSION = 'v18';
const GOOGLE_ADS_BASE_URL = `https://googleads.googleapis.com/${GOOGLE_ADS_API_VERSION}`;

export interface GoogleOverrides {
  accessToken?: string;
  developerToken?: string;
  customerId?: string;
  loginCustomerId?: string;
}

function getGoogleToken(overrides?: GoogleOverrides): string {
  const token = overrides?.accessToken || process.env.GOOGLE_ADS_ACCESS_TOKEN;
  if (!token) throw new Error('GOOGLE_ADS_ACCESS_TOKEN não configurado');
  return token;
}

function getGoogleCustomerId(overrides?: GoogleOverrides): string {
  const id = overrides?.customerId || process.env.GOOGLE_ADS_CUSTOMER_ID;
  if (!id) throw new Error('GOOGLE_ADS_CUSTOMER_ID não configurado');
  return id.replace(/-/g, '');
}

function periodToDateRange(period: string): { startDate: string; endDate: string } {
  const now = new Date();
  const endDate = now.toISOString().split('T')[0];
  const days = period === '7d' ? 7 : period === '14d' ? 14 : period === '30d' ? 30 : 90;
  const startDate = new Date(now.getTime() - days * 86400000).toISOString().split('T')[0];
  return { startDate, endDate };
}

async function googleQuery(query: string, overrides?: GoogleOverrides) {
  const token = getGoogleToken(overrides);
  const customerId = getGoogleCustomerId(overrides);
  const devToken = overrides?.developerToken || process.env.GOOGLE_ADS_DEVELOPER_TOKEN || '';
  const loginId = overrides?.loginCustomerId || process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID || customerId;

  const res = await fetch(
    `${GOOGLE_ADS_BASE_URL}/customers/${customerId}/googleAds:searchStream`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'developer-token': devToken,
        'login-customer-id': loginId,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query }),
    }
  );

  if (!res.ok) {
    const errBody: any = await res.json();
    throw new Error(errBody.error?.message || `Google Ads API error: ${res.status}`);
  }

  return res.json();
}

export async function fetchGoogleMetrics(period: string, overrides?: GoogleOverrides) {
  const { startDate, endDate } = periodToDateRange(period);

  const query = `
    SELECT
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion,
      segments.date
    FROM customer
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY segments.date
  `;

  return googleQuery(query, overrides);
}

export async function fetchGoogleCampaigns(period: string, overrides?: GoogleOverrides) {
  const { startDate, endDate } = periodToDateRange(period);

  const query = `
    SELECT
      campaign.id,
      campaign.name,
      campaign.status,
      campaign.advertising_channel_type,
      campaign_budget.amount_micros,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions,
      metrics.conversions_value,
      metrics.cost_per_conversion
    FROM campaign
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
      AND campaign.status != 'REMOVED'
    ORDER BY metrics.cost_micros DESC
  `;

  return googleQuery(query, overrides);
}

export async function fetchGoogleAdGroups(campaignId: string, period: string, overrides?: GoogleOverrides) {
  const { startDate, endDate } = periodToDateRange(period);

  const query = `
    SELECT
      ad_group.id,
      ad_group.name,
      ad_group.status,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions
    FROM ad_group
    WHERE campaign.id = ${campaignId}
      AND segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY metrics.cost_micros DESC
  `;

  return googleQuery(query, overrides);
}

export async function fetchGoogleKeywords(period: string, overrides?: GoogleOverrides) {
  const { startDate, endDate } = periodToDateRange(period);

  const query = `
    SELECT
      ad_group_criterion.keyword.text,
      ad_group_criterion.keyword.match_type,
      metrics.cost_micros,
      metrics.impressions,
      metrics.clicks,
      metrics.ctr,
      metrics.conversions
    FROM keyword_view
    WHERE segments.date BETWEEN '${startDate}' AND '${endDate}'
    ORDER BY metrics.impressions DESC
    LIMIT 50
  `;

  return googleQuery(query, overrides);
}
