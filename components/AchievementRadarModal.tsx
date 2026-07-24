import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import RadarChart from './RadarChart';
import GradeSelector from './GradeSelector';
import { FIELDS, defaultGrades, normalizeGrades, gradesToRadarData } from '../lib/grades';
import type { Grade, GradeField, GradeMap } from '../lib/grades';

type Achievement = {
  apiname: string;
  displayName: string;
  achieved?: boolean;
  unlocktime?: number | null;
};

type AchievementRadarModalProps = {
  steamId: string | null;
  appid: number;
  achievement: Achievement;
  onClose: () => void;
};

const panelStyle: CSSProperties = {
  background: '#12201F',
  color: '#F1EDE2',
  padding: 24,
  borderRadius: 8,
  width: '100%',
  maxWidth: 420,
  maxHeight: '85vh',
  overflowY: 'auto',
  boxSizing: 'border-box',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  gap: 12,
};

const backButtonStyle: CSSProperties = {
  background: 'none',
  border: '1px solid #E3A83B',
  color: '#F1EDE2',
  padding: '6px 10px',
  borderRadius: 6,
  cursor: 'pointer',
  fontWeight: 700,
};

const saveButtonStyle: CSSProperties = {
  marginTop: 8,
  padding: '8px 14px',
  borderRadius: 6,
  border: 'none',
  background: '#E3A83B',
  color: '#12201F',
  fontWeight: 700,
  cursor: 'pointer',
};

export default function AchievementRadarModal({ steamId, appid, achievement, onClose }: AchievementRadarModalProps) {
  const [grades, setGrades] = useState<GradeMap>(defaultGrades());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetch(`/api/achievement-grades?appid=${appid}&apiname=${achievement.apiname}`)
      .then((res) => res.json() as Promise<{ grades?: GradeMap }>)
      .then((data) => {
        if (!cancelled) setGrades(normalizeGrades(data.grades));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [appid, achievement.apiname]);

  function updateGrade(field: GradeField, grade: Grade) {
    setSaved(false);
    setGrades((prev) => ({ ...prev, [field]: grade }));
  }

  async function save() {
    setSaving(true);
    const res = await fetch('/api/achievement-grades', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ appid, apiname: achievement.apiname, grades }),
    });
    setSaving(false);
    if (res.ok) setSaved(true);
  }

  const isLoggedIn = !!steamId;
  const achievementUnlocked = achievement.achieved === true || (typeof achievement.unlocktime === 'number' && achievement.unlocktime > 0);
  const canEdit = isLoggedIn && achievementUnlocked;
  const lockedForEditing = isLoggedIn && !achievementUnlocked;
  const radarData = gradesToRadarData(grades);

  return (
    <div style={panelStyle}>
      <div style={headerStyle}>
        <button onClick={onClose} style={backButtonStyle} aria-label="Back">
          ← Back
        </button>
        <h2 style={{ margin: 0, fontSize: 18 }}>{achievement.displayName}</h2>
      </div>

      {loading ? (
        <p>Loading grades…</p>
      ) : (
        <>
          <div style={{ maxWidth: 320, margin: '0 auto' }}>
            <RadarChart data={radarData} />
          </div>

          {isLoggedIn ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
              {FIELDS.map((field) => (
                <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{field}</span>
                  <GradeSelector value={grades[field]} onChange={(g) => updateGrade(field, g)} disabled={!canEdit} />
                </div>
              ))}
              {canEdit && (
                <button onClick={save} disabled={saving} style={saveButtonStyle}>
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                </button>
              )}
              {lockedForEditing && (
                <p style={{ color: '#8FA8A2', fontSize: 13 }}>
                  This achievement is not unlocked yet, so its radar values are locked.
                </p>
              )}
            </div>
          ) : (
            <p style={{ color: '#8FA8A2', fontSize: 13 }}>Log in to edit these grades.</p>
          )}
        </>
      )}
    </div>
  );
}
