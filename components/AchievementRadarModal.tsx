import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import RadarChart from './RadarChart';
import GradeSelector from './GradeSelector';
import { FIELDS, defaultGrades, normalizeGrades, gradesToRadarData } from '../lib/grades';
import type { Grade, GradeField, GradeMap } from '../lib/grades';

type Achievement = {
  apiname: string;
  displayName: string;
};

type AchievementRadarModalProps = {
  steamId: string | null;
  appid: number;
  achievement: Achievement;
  onClose: () => void;
};

const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 50,
};

const panelStyle: CSSProperties = {
  background: '#12201F',
  color: '#F1EDE2',
  padding: 24,
  borderRadius: 8,
  width: 380,
  maxWidth: '90vw',
  maxHeight: '85vh',
  overflowY: 'auto',
};

const headerStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 12,
  gap: 12,
};

const closeButtonStyle: CSSProperties = {
  background: 'none',
  border: 'none',
  color: '#F1EDE2',
  fontSize: 22,
  cursor: 'pointer',
  lineHeight: 1,
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

  const canEdit = !!steamId;
  const radarData = gradesToRadarData(grades);

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{ margin: 0, fontSize: 18 }}>{achievement.displayName}</h2>
          <button onClick={onClose} style={closeButtonStyle} aria-label="Close">
            ×
          </button>
        </div>

        {loading ? (
          <p>Loading grades…</p>
        ) : (
          <>
            <div style={{ maxWidth: 320, margin: '0 auto' }}>
              <RadarChart data={radarData} />
            </div>

            {canEdit ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                {FIELDS.map((field) => (
                  <div key={field} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>{field}</span>
                    <GradeSelector value={grades[field]} onChange={(g) => updateGrade(field, g)} />
                  </div>
                ))}
                <button onClick={save} disabled={saving} style={saveButtonStyle}>
                  {saving ? 'Saving…' : saved ? 'Saved ✓' : 'Save'}
                </button>
              </div>
            ) : (
              <p style={{ color: '#8FA8A2', fontSize: 13 }}>Log in to edit these grades.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
