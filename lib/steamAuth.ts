const STEAM_OPENID_URL = 'https://steamcommunity.com/openid/login';

// Step 1: build the URL we send the user to in order to log in with Steam.
export function buildSteamLoginUrl(baseUrl) {
  const returnTo = `${baseUrl}/api/auth/steam/callback`;

  const params = new URLSearchParams({
    'openid.ns': 'http://specs.openid.net/auth/2.0',
    'openid.mode': 'checkid_setup',
    'openid.return_to': returnTo,
    'openid.realm': baseUrl,
    'openid.identity': 'http://specs.openid.net/auth/2.0/identifier_select',
    'openid.claimed_id': 'http://specs.openid.net/auth/2.0/identifier_select',
  });

  return `${STEAM_OPENID_URL}?${params.toString()}`;
}

// Step 2: Steam redirects back to /api/auth/steam/callback with openid.* query
// params. We must echo them back to Steam (with mode switched to
// check_authentication) so Steam can confirm the assertion is genuine.
// Doing this server-to-server is required -- it can't be done from the browser.
export async function verifySteamAssertion(searchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of searchParams.entries()) {
    params.set(key, value);
  }
  params.set('openid.mode', 'check_authentication');

  const res = await fetch(STEAM_OPENID_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  const text = await res.text();
  const isValid = /is_valid\s*:\s*true/.test(text);
  if (!isValid) return null;

  // claimed_id looks like: https://steamcommunity.com/openid/id/76561198012345678
  const claimedId = searchParams.get('openid.claimed_id') || '';
  const match = claimedId.match(/\/id\/(\d+)$/);
  return match ? match[1] : null; // steamid64
}
