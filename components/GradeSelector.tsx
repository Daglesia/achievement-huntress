import type { Grade } from '../lib/grades';
import { GRADES, GRADE_COLOR } from '../lib/grades';

const LINE = '#3E5C57';
const MUTED = '#8FA8A2';

type GradeSelectorProps = {
  value: Grade;
  onChange: (grade: Grade) => void;
};

export default function GradeSelector({ value, onChange }: GradeSelectorProps) {
  return (
    <div style={{ display: 'flex', gap: 6 }}>
      {GRADES.map((g) => {
        const active = g === value;
        const color = GRADE_COLOR[g];
        return (
          <button
            key={g}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(g)}
            style={{
              width: 30,
              height: 30,
              borderRadius: 6,
              border: active ? `2px solid ${color}` : `1px solid ${LINE}`,
              background: active ? `${color}26` : 'transparent',
              color: active ? color : MUTED,
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
              fontWeight: 700,
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            {g}
          </button>
        );
      })}
    </div>
  );
}
