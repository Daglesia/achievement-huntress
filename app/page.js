'use client';

import { useEffect, useState } from 'react';

function getCookie(name) {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function Home() {
  const [steamId, setSteamId] = useState(null);
  const [games, setGames] = useState([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState(null);
  const [achievements, setAchievements] = useState(null);
  const [achMessage, setAchMessage] = useState(null);

  useEffect(() => {
    setSteamId(getCookie('steamid'));
  }, []);

  useEffect(() => {
    if (!steamId) return;
    setLoadingGames(true);
    fetch(`/api/games?steamid=${steamId}`)
      .then((r) => r.json())
      .then((data) => setGames(data.games || []))
      .finally(() => setLoadingGames(false));
  }, [steamId]);

  async function loadAchievements(game) {
    setSelectedGame(game);
    setAchievements(null);
    setAchMessage(null);
    const res = await fetch(
      `/api/achievements?steamid=${steamId}&appid=${game.appid}`
    );
    const data = await res.json();
    if (data.message) setAchMessage(data.message);
    setAchievements(data.achievements || []);
  }

  function logout() {
    document.cookie = 'steamid=; Max-Age=0; path=/';
    setSteamId(null);
    setGames([]);
    setSelectedGame(null);
    setAchievements(null);
  }

  if (!steamId) {
    return (
      <main>
        <h1>Steam Login Demo</h1>
        <p>Sign in with your Steam account to see your games and achievements.</p>
        <a
          href="/api/auth/steam"
          style={{
            display: 'inline-block',
            padding: '10px 18px',
            background: '#171a21',
            color: '#fff',
            borderRadius: 4,
            textDecoration: 'none',
          }}
        >
          Login with Steam
        </a>
      </main>
    );
  }

  return (
    <main>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Your Steam Library</h1>
        <button onClick={logout}>Log out</button>
      </div>
      <p>SteamID64: {steamId}</p>

      {loadingGames && <p>Loading games…</p>}
      {!loadingGames && games.length === 0 && (
        <p>
          No games found. Your Steam profile's &quot;Game details&quot; privacy
          setting may need to be set to Public.
        </p>
      )}

      <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
        <ul style={{ listStyle: 'none', padding: 0, minWidth: 280 }}>
          {games
            .sort((a, b) => b.playtime_forever - a.playtime_forever)
            .map((g) => (
              <li key={g.appid} style={{ marginBottom: 8 }}>
                <button
                  onClick={() => loadAchievements(g)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    width: '100%',
                    textAlign: 'left',
                    padding: 6,
                    background: selectedGame?.appid === g.appid ? '#eee' : 'transparent',
                    border: '1px solid #ddd',
                    borderRadius: 4,
                    cursor: 'pointer',
                  }}
                >
                  {g.img_icon_url && (
                    <img
                      src={`https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`}
                      alt=""
                      width={32}
                      height={32}
                    />
                  )}
                  <span>
                    {g.name}
                    <br />
                    <small>{Math.round(g.playtime_forever / 60)} hrs played</small>
                  </span>
                </button>
              </li>
            ))}
        </ul>

        {selectedGame && (
          <div style={{ flex: 1 }}>
            <h2>{selectedGame.name} — Achievements</h2>
            {achMessage && <p>{achMessage}</p>}
            {achievements && achievements.length > 0 && (
              <ul>
                {achievements.map((a) => (
                  <li key={a.apiname}>
                    {a.achieved ? '✅' : '⬜️'} {a.apiname}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
