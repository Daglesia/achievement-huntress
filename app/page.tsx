'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.scss';
import AchievementRadarModal from '../components/AchievementRadarModal';
import { getAchievementTags, normalizeGrades } from '../lib/grades';
import type { GradeMap } from '../lib/grades';
import {
  filterAchievements,
  getAvailableGrades,
  type AchievementFilterState,
  type AchievementGradesByApiname,
} from '../lib/achievementFilters';
import { signInWithAuthentik } from '../lib/actions';

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
  const [achievementGradesByApiname, setAchievementGradesByApiname] = useState<AchievementGradesByApiname>({});
  const [achMessage, setAchMessage] = useState<string | null>(null);
  const [schemaSource, setSchemaSource] = useState<'cache' | 'steam' | null>(null);
  const [openAchievement, setOpenAchievement] = useState<SteamAchievement | null>(null);
  const [filters, setFilters] = useState<AchievementFilterState>({ status: 'all', grade: 'all', search: '' });
  const [gameSearch, setGameSearch] = useState('');

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
      setAchievementGradesByApiname({});
      return;
    }

    let cancelled = false;
    setAchievementTags({});
    setAchievementGradesByApiname({});

    (async () => {
      const tagsByAchievement: Record<string, string[]> = {};
      const gradesByAchievement: AchievementGradesByApiname = {};
      await Promise.all(
        achievements.map(async (achievement) => {
          if (cancelled) return;
          try {
            const res = await fetch(
              `/api/achievement-grades?appid=${selectedGame.appid}&apiname=${achievement.apiname}`
            );
            if (!res.ok || cancelled) return;
            const data = (await res.json()) as { grades?: GradeMap };
            const normalizedGrades = normalizeGrades(data.grades);
            const tags = getAchievementTags(normalizedGrades);
            if (tags.length) {
              tagsByAchievement[achievement.apiname] = tags;
            }
            gradesByAchievement[achievement.apiname] = normalizedGrades;
          } catch {
            // ignore network failures and leave tags empty
          }
        })
      );

      if (!cancelled) {
        setAchievementTags(tagsByAchievement);
        setAchievementGradesByApiname(gradesByAchievement);
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
    setAchievementGradesByApiname({});
    setAchMessage(null);
    setSchemaSource(null);
    setFilters({ status: 'all', grade: 'all', search: '' });
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

  const availableGrades = getAvailableGrades(achievementGradesByApiname);
  const filteredAchievements = achievements
    ? filterAchievements(sortAchievements(achievements), {
        ...filters,
        achievementGradesByApiname,
      })
    : [];
  const filteredGames = games
    .slice()
    .sort((a, b) => b.playtime_forever - a.playtime_forever)
    .filter((game) => {
      if (!gameSearch.trim()) return true;
      const query = gameSearch.trim().toLowerCase();
      return game.name.toLowerCase().includes(query);
    });

  if (!steamId) {
    return (
      <main className={styles.page}>
        <h1 className={styles.page__title}>Steam Login Demo</h1>
        <p className={styles.page__subtitle}>Sign in with your Steam account to see your games and achievements.</p>
        <a href="/api/auth/steam" className={styles.page__authButton}>
          Login with Steam
        </a>

        <form action={signInWithAuthentik}>
          <button
            type="submit"
            style={{
              display: 'inline-block',
              padding: '10px 18px',
              background: '#fd4b2d',
              color: '#fff',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
            }}
          >
            Login with Authentik
          </button>
        </form>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.page__header}>
        <h1 className={styles.page__title}>Your Steam Library</h1>
        <button className={styles.page__logoutButton} onClick={logout}>Log out</button>
      </div>
      <p className={styles.page__subtitle}>SteamID64: {steamId}</p>

      {loadingGames && <p className={styles.page__emptyState}>Loading games…</p>}
      {!loadingGames && games.length === 0 && (
        <p className={styles.page__emptyState}>
          No games found. Your Steam profile's &quot;Game details&quot; privacy
          setting may need to be set to Public.
        </p>
      )}

      <div className={styles.page__content}>
        <div style={{ minWidth: 280 }}>
          <label className={styles.page__searchField}>
            <span className={styles.page__searchLabel}>Search games</span>
            <input
              type="text"
              value={gameSearch}
              onChange={(event) => setGameSearch(event.target.value)}
              placeholder="Search games"
              className={styles.page__input}
            />
          </label>

          <ul className={styles.page__games}>
            {filteredGames.map((g) => (
              <li key={g.appid} className={styles.page__gameItem}>
                <div
                  onClick={() => loadAchievements(g)}
                  className={`${styles.page__gameButton} ${selectedGame?.appid === g.appid ? styles['page__gameButton--active'] : ''}`}
                >
                  {g.img_icon_url && (
                    <img
                      src={`https://media.steampowered.com/steamcommunity/public/images/apps/${g.appid}/${g.img_icon_url}.jpg`}
                      alt=""
                      width={32}
                      height={32}
                      className={styles.page__gameImage}
                    />
                  )}
                  <span className={styles.page__gameLabel}>
                    <span className={styles.page__gameName}>{g.name}</span>
                    <small className={styles.page__gameMeta}>{Math.round(g.playtime_forever / 60)} hours played</small>
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {selectedGame && (
          <div className={styles.page__details}>
            <div className={styles.page__detailsHeader}>
              <h2 className={styles.page__detailsTitle}>
                {openAchievement ? `${selectedGame.name} - ${openAchievement.displayName}` : `${selectedGame.name} - Achievements`}
              </h2>
              {schemaSource && (
                <span
                  title="Whether achievement names/icons came from the local DB cache or a fresh Steam API call"
                  className={`${styles.page__schemaBadge} ${schemaSource === 'steam' ? styles['page__schemaBadge--steam'] : ''}`}
                >
                  schema: {schemaSource === 'cache' ? 'from cache' : 'fetched from Steam'}
                </span>
              )}
            </div>
            {achMessage && <p className={styles.page__message}>{achMessage}</p>}

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
                <>
                  <div className={styles.page__filters}>
                    <label className={styles.page__filterField}>
                      <span className={styles.page__filterLabel}>Status</span>
                      <select
                        value={filters.status}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, status: event.target.value as AchievementFilterState['status'] }))
                        }
                        className={styles.page__select}
                      >
                        <option value="all">All</option>
                        <option value="complete">Complete</option>
                        <option value="incomplete">Incomplete</option>
                      </select>
                    </label>

                    <label className={styles.page__filterField}>
                      <span className={styles.page__filterLabel}>Grade</span>
                      <select
                        value={filters.grade}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, grade: event.target.value as AchievementFilterState['grade'] }))
                        }
                        className={styles.page__select}
                      >
                        <option value="all">All grades</option>
                        {availableGrades.map((grade) => (
                          <option key={grade} value={grade}>
                            {grade}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className={styles.page__searchField}>
                      <span className={styles.page__searchLabel}>Search</span>
                      <input
                        type="text"
                        value={filters.search}
                        onChange={(event) =>
                          setFilters((prev) => ({ ...prev, search: event.target.value }))
                        }
                        placeholder="Search achievements"
                        className={styles.page__input}
                      />
                    </label>
                  </div>

                  <ul className={styles.page__achievements}>
                    {filteredAchievements.map((a) => (
                      <li key={a.apiname} className={styles.page__achievementItem}>
                      <button
                        onClick={() => setOpenAchievement(a)}
                        className={styles.page__achievementButton}
                      >
                        {a.icon && <img src={a.icon} alt="" width={32} height={32} />}
                        <span className={styles.page__achievementContent}>
                          <span className={styles.page__achievementTitle}>
                            {a.achieved ? '✅' : '⬜️'} {a.displayName}
                          </span>
                          {achievementTags[a.apiname]?.length ? (
                            <span className={styles.page__achievementTags}>
                              {achievementTags[a.apiname].map((tag) => (
                                <span key={tag} className={styles.page__achievementTag}>
                                  {tag}
                                </span>
                              ))}
                            </span>
                          ) : null}
                          {a.description && (
                            <small className={styles.page__achievementMeta}>{a.description}</small>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                  </ul>
                </>
              )
            )}
          </div>
        )}
      </div>
    </main>
  );
}
