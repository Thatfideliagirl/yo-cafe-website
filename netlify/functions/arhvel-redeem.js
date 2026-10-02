// Proxies checkout-address / checkout-pin -- redeems the token ArHvEl sends
// back after the customer finishes the "pin it on a map" fallback flow.
const BASE = 'https://arhvel.com/api/partner/v1';

exports.handler = async (event) => {
  const key = process.env.ARHVEL_PCODE;
  if (!key) {
    return { statusCode: 503, body: JSON.stringify({ error: 'Address pin lookup is not configured yet' }) };
  }

  const params = event.queryStringParameters || {};
  const { selection_token, external_customer_id, kind } = params;
  if (!selection_token || !kind) {
    return { statusCode: 400, body: JSON.stringify({ error: 'selection_token and kind are required' }) };
  }
  if (kind !== 'address' && kind !== 'pin') {
    return { statusCode: 404, body: JSON.stringify({ error: 'Unknown kind' }) };
  }

  const endpoint = kind === 'address' ? 'checkout-address' : 'checkout-pin';
  const qs = new URLSearchParams({ selection_token });
  if (external_customer_id) qs.set('external_customer_id', external_customer_id);
  const url = `${BASE}?endpoint=${endpoint}&${qs.toString()}`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    const data = await res.json();
    return { statusCode: res.status, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 502, body: JSON.stringify({ error: 'Could not reach address lookup service' }) };
  }
};
