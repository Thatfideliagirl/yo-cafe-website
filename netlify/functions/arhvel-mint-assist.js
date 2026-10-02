// Proxies mint-checkout-assist -- starts the "Can't find my street? Pin it"
// fallback flow. Called when address-search has no matches for what the
// customer typed.
const BASE = 'https://arhvel.com/api/partner/v1';

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const key = process.env.ARHVEL_PCODE;
  if (!key) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Address pin lookup is not configured yet' }) };
  }

  let payload;
  try {
    payload = JSON.parse(event.body || '{}');
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { external_customer_id, return_url } = payload;
  if (!external_customer_id || !return_url) {
    return { statusCode: 400, body: JSON.stringify({ error: 'external_customer_id and return_url are required' }) };
  }

  try {
    const res = await fetch(`${BASE}?endpoint=mint-checkout-assist`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ external_customer_id, return_url }),
    });
    const data = await res.json();
    return { statusCode: res.status, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach address lookup service' }) };
  }
};
