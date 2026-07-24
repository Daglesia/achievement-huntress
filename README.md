# Steam Login Demo (Next.js)

Signs a user in with Steam (OpenID 2.0), then lets them browse their owned
games and per-game achievements via the Steam Web API.

## Why a backend is required

Steam does **not** support OAuth or any purely client-side login — it uses
OpenID 2.0, and the verification step (confirming the callback really came
from Steam) has to happen server-to-server. The Steam Web API also has no
CORS headers, so it can't be called directly from the browser either. Next.js
Route Handlers (`app/api/.../route.js`) act as that backend here.

## Setup

1. Get a Steam Web API key: https://steamcommunity.com/dev/apikey
   (any domain works for local dev, e.g. `localhost`)
2. `cp .env.local.example .env.local` and fill in `STEAM_API_KEY`
3. `npm install`
4. `npm run dev` → open http://localhost:3000

## How it works

- `GET /api/auth/steam` — redirects the browser to Steam's login page
  (`lib/steamAuth.js: buildSteamLoginUrl`)
- Steam redirects back to `GET /api/auth/steam/callback` with `openid.*`
  query params
- The callback route POSTs those params back to Steam with
  `openid.mode=check_authentication` to verify they're genuine
  (`lib/steamAuth.js: verifySteamAssertion`), extracts the steamid64, and
  sets it in a cookie
- `GET /api/games?steamid=...` — proxies `IPlayerService/GetOwnedGames`
- `GET /api/achievements?steamid=...&appid=...` — proxies
  `ISteamUserStats/GetPlayerAchievements`
- `app/page.js` is a client component that reads the cookie, lists games,
  and fetches achievements when a game is clicked

## Schema caching (`GetSchemaForGame`)

Achievement *display names, descriptions, and icons* come from a separate
Steam endpoint, `ISteamUserStats/GetSchemaForGame`, which barely changes for
a given game -- so it's a perfect candidate for caching instead of calling
Steam on every request.

- `lib/db.js` — a tiny DB abstraction. If `DATABASE_URL` is set, it uses
  **Postgres** (via `pg`) against that existing database. If it's not set,
  it automatically creates and uses a **local SQLite file** at
  `./data/dev.db` using Node's own built-in `node:sqlite` module — no
  native compilation, no extra dependency, nothing to install for local dev
  (requires Node 22.13+ / 23.4+, where the flag requirement was dropped).
- `lib/schemaCache.js` — `getSchemaForGame(appid)`: checks the DB first; on
  a miss it calls Steam's `GetSchemaForGame`, stores the result, and returns
  it. On a hit it returns straight from the DB and never touches the
  network.
- `app/api/achievements/route.js` — uses the cached schema to attach
  `displayName` / `description` / `icon` to each of the player's
  achievements, and returns `schemaSource: 'cache' | 'steam'` so you can see
  which one happened.
- `app/api/schema/route.js` — a standalone endpoint for testing this
  directly: call `GET /api/schema?appid=440` twice — the first response
  says `"source": "steam"`, the second says `"source": "cache"`.

The `game_schemas` table is keyed by `appid`, so it's shared across all
users — once one person loads a game's achievements, everyone benefits from
the cache for that game.

To switch to Postgres, set `DATABASE_URL` in `.env.local`; the table is
created automatically on first use (`CREATE TABLE IF NOT EXISTS`), so no
separate migration step is needed either way.

## Notes / gotchas

- **Profile privacy**: a user's games/achievements only come back if their
  Steam profile's "Game details" setting is Public. Otherwise you'll get an
  empty list or a `success: false` response — the UI shows a friendly
  message for this instead of crashing.
- **Achievement display names**: `GetPlayerAchievements` only returns
  `apiname` + `achieved`/`unlocktime`, not a human-readable title. To show
  real names/icons, also call `ISteamUserStats/GetSchemaForGame` per app and
  merge on `apiname` — left out here to keep the demo small.
- **Cookie security**: the `steamid` cookie is intentionally *not*
  `httpOnly` so the demo page can read it client-side. For a real app, make
  it `httpOnly` and add an authenticated `/api/me` route instead, so
  JavaScript in the page never sees/needs the raw id.
- **Realm/return_to**: `NEXT_PUBLIC_BASE_URL` must exactly match the domain
  you deploy to (Steam checks this). Update it for production and use HTTPS.
- Rate limits: the Steam Web API is rate-limited; if you loop over many
  games fetching achievements, add delays/batching.
