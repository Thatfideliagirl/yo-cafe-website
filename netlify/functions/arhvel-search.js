// Proxies address-search to ArHvEl so the secret API key (ARHVEL_PCODE) never
// reaches the browser. Called while the customer is typing their delivery address.
const BASE = 'https://arhvel.com/api/partner/v1';

exports.handler = async (event) => {
  const key = process.env.ARHVEL_PCODE;
  if (!key) {
    // Not configured yet (no key issued) -- fail quietly so the address field
    // just behaves like a normal text box with no suggestions.
    return { statusCode: 200, body: JSON.stringify({ results: [], count: 0 }) };
  }

  const q = (event.queryStringParameters && event.queryStringParameters.q || '').trim();
  if (q.length < 2) {
    return { statusCode: 200, body: JSON.stringify({ results: [], count: 0 }) };
  }

  const state = (event.queryStringParameters && event.queryStringParameters.state) || 'Lagos';
  const url = `${BASE}?endpoint=address-search&q=${encodeURIComponent(q)}&state=${encodeURIComponent(state)}&limit=10`;

  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${key}` } });
    const data = await res.json();
    return { statusCode: res.status, body: JSON.stringify(data) };
  } catch (e) {
    return { statusCode: 200, body: JSON.stringify({ results: [], count: 0 }) };
  }
};
