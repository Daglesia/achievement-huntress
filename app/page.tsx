'use client';

import { useEffect, useState } from 'react';
import AchievementRadarModal from '../components/AchievementRadarModal';
import { getAchievementTags, normalizeGrades } from '../lib/grades';
import type { GradeMap } from '../lib/grades';

type SteamGame = {
  appid: number;
  name: string;
  img_icon_url?: string;
  playtime_forever: number;
};

type SteamAchievement = {
  apiname: string;
  achieved: boolean;
  displayName: string;
  description?: string;
  icon?: string;
};

type ApiGamesResponse = { games?: SteamGame[] };
type ApiAchievementsResponse = {
  achievements?: SteamAchievement[];
  message?: string;
  schemaSource?: 'cache' | 'steam' | null;
};

import { sortAchievements } from '../lib/sortAchievements';

function getCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? match[2] : null;
}

export default function Home() {
  const [steamId, setSteamId] = useState<string | null>(null);
  const [games, setGames] = useState<SteamGame[]>([]);
  const [loadingGames, setLoadingGames] = useState(false);
  const [selectedGame, setSelectedGame] = useState<SteamGame | null>(null);
  const [achievements, setAchievements] = useState<SteamAchievement[] | null>(null);
  const [achievementTags, setAchievementTags] = useState<Record<string, string[]>>({});
  const [achMessage, setAchMessage] = useState<string | null>(null);
  const [schemaSource, setSchemaSource] = useState<'cache' | 'steam' | null>(null);
  const [openAchievement, setOpenAchievement] = useState<SteamAchievement | null>(null);

  useEffect(() => {
    setSteamId(getCookie('steamid'));
  }, []);

  useEffect(() => {
    if (!steamId) return;
    setLoadingGames(true);
    fetch(`/api/games?steamid=${steamId}`)
      .then((r) => r.json() as Promise<ApiGamesResponse>)
      .then((data) => setGames(data.games || []))
      .finally(() => setLoadingGames(false));
  }, [steamId]);

  useEffect(() => {
    if (!steamId || !selectedGame || !achievements || achievements.length === 0) {
      setAchievementTags({});
      return;
    }

    let cancelled = false;
    setAchievementTags({});

    (async () => {
      const tagsByAchievement: Record<string, string[]> = {};
      await Promise.all(
        achievements.map(async (achievement) => {
          if (cancelled) return;
          try {
            const res = await fetch(
              `/api/achievement-grades?appid=${selectedGame.appid}&apiname=${achievement.apiname}`
            );
            if (!res.ok || cancelled) return;
            const data = (await res.json()) as { grades?: GradeMap };
            const tags = getAchievementTags(normalizeGrades(data.grades));
            if (tags.length) {
              tagsByAchievement[achievement.apiname] = tags;
            }
          } catch {
            // ignore network failures and leave tags empty
          }
        })
      );

      if (!cancelled) {
        setAchievementTags(tagsByAchievement);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [steamId, selectedGame?.appid, achievements]);

  async function loadAchievements(game: SteamGame) {
    setSelectedGame(game);
    setAchievements(null);
    setAchievementTags({});
    setAchMessage(null);
    setSchemaSource(null);
    const res = await fetch(`/api/achievements?steamid=${steamId}&appid=${game.appid}`);
    const data = (await res.json()) as ApiAchievementsResponse;
    if (data.message) setAchMessage(data.message);
    setAchievements(data.achievements || []);
    setSchemaSource(data.schemaSource || null);
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <h2 style={{ margin: 0 }}>
                {openAchievement ? `${selectedGame.name} - ${openAchievement.displayName}` : `${selectedGame.name} - Achievements`}
              </h2>
              {schemaSource && (
                <span
                  title="Whether achievement names/icons came from the local DB cache or a fresh Steam API call"
                  style={{
                    fontSize: 12,
                    padding: '2px 8px',
                    borderRadius: 12,
                    background: schemaSource === 'cache' ? '#e6f4ea' : '#fff4e5',
                    color: schemaSource === 'cache' ? '#1e7e34' : '#a05a00',
                  }}
                >
                  schema: {schemaSource === 'cache' ? 'from cache' : 'fetched from Steam'}
                </span>
              )}
            </div>
            {achMessage && <p>{achMessage}</p>}

            {openAchievement ? (
              <AchievementRadarModal
                steamId={steamId}
                appid={selectedGame.appid}
                achievement={openAchievement}
                onClose={() => setOpenAchievement(null)}
              />
            ) : (
              achievements &&
              achievements.length > 0 && (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {sortAchievements(achievements).map((a) => (
                    <li key={a.apiname} style={{ marginBottom: 8 }}>
                      <button
                        onClick={() => setOpenAchievement(a)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          width: '100%',
                          textAlign: 'left',
                          padding: 6,
                          background: 'transparent',
                          border: '1px solid #ddd',
                          borderRadius: 4,
                          cursor: 'pointer',
                        }}
                      >
                        {a.icon && <img src={a.icon} alt="" width={32} height={32} />}
                        <span>
                          {a.achieved ? '✅' : '⬜️'} <strong>{a.displayName}</strong>
                      {achievementTags[a.apiname]?.map((tag) => (
                        <span
                          key={tag}
                          style={{
                            marginLeft: 8,
                            padding: '2px 6px',
                            background: '#E3A83B',
                            color: '#12201F',
                            borderRadius: 999,
                            fontSize: 12,
                            fontWeight: 700,
                          }}
                        >
                          {tag}
                        </span>
                      ))}
                          {a.description && (
                            <>
                              <br />
                              <small>{a.description}</small>
                            </>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
