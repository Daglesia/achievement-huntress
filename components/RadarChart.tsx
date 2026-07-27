import type { GradeField, Grade } from '../lib/grades';
import { GRADES, GRADE_VALUE, GRADE_COLOR } from '../lib/grades';
import { polarPoint, axisAngle, gradeRadius } from '../lib/radarLayout';
import styles from './RadarChart.module.scss';

const INK = '#12201F';
const LINE = '#3E5C57';
const MUTED = '#8FA8A2';
const TEXT = '#F1EDE2';
const ACCENT = '#E3A83B';

type RadarDatum = {
  field: GradeField;
  grade: Grade;
};

type RadarChartProps = {
  data: RadarDatum[];
  size?: number;
};

export default function RadarChart({ data, size = 320 }: RadarChartProps) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.325;
  const labelR = size * 0.4375;
  const n = data.length;
  const angleFor = (i: number) => axisAngle(i, n);

  const rings = [1, 2, 3, 4, 5].map((level) => {
    const r = (level / 5) * maxR;
    const points = data.map((_, i) => polarPoint(cx, cy, r, angleFor(i)).join(',')).join(' ');
    return { level, points };
  });

  const axisEnds = data.map((_, i) => polarPoint(cx, cy, maxR, angleFor(i)));

  const dataPoints = data.map((d) =>
    polarPoint(cx, cy, gradeRadius(d.grade, maxR, GRADE_VALUE), angleFor(data.indexOf(d)))
  );
  const dataPolygon = dataPoints.map((p) => p.join(',')).join(' ');

  const fieldLabels = data.map((d, i) => {
    const [x, y] = polarPoint(cx, cy, labelR, angleFor(i));
    return { ...d, x, y };
  });

  const scaleTicks = [1, 2, 3, 4, 5].map((level) => {
    const r = (level / 5) * maxR;
    const [x, y] = polarPoint(cx, cy, r, angleFor(0));
    return { level, x, y, grade: GRADES[level - 1] };
  });

  return (
    <svg className={styles.radar} viewBox={`0 0 ${size} ${size}`} width="100%" height="100%">
      <defs>
        <radialGradient id="radarGlow" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={ACCENT} stopOpacity="0.32" />
          <stop offset="100%" stopColor={ACCENT} stopOpacity="0.05" />
        </radialGradient>
      </defs>

      {rings.map((ring) => (
        <polygon
          key={ring.level}
          points={ring.points}
          className={`${styles.ring} ${ring.level === 5 ? styles.ringPrimary : ''}`}
        />
      ))}

      {axisEnds.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} className={styles.axis} />
      ))}

      {scaleTicks.map((t) => (
        <text
          key={t.level}
          x={t.x - 10}
          y={t.y + 3}
          className={styles.scaleTick}
        >
          {t.grade}
        </text>
      ))}

      <polygon points={dataPolygon} className={styles.dataGlow} />
      <polygon points={dataPolygon} className={styles.dataMain} />

      {data.map((d, i) => {
        const [x, y] = dataPoints[i];
        const a = angleFor(i);
        const color = GRADE_COLOR[d.grade];
        const lx = x + Math.cos(a) * 15;
        const ly = y + Math.sin(a) * 15;
        return (
          <g key={d.field}>
            <circle cx={x} cy={y} r={5.5} className={styles.dataPoint} style={{ fill: color }} />
            <text
              x={lx}
              y={ly + 3.5}
              className={styles.gradeLabel}
              style={{ fill: color }}
            >
              {d.grade}
            </text>
          </g>
        );
      })}

      {fieldLabels.map((f) => (
        <text
          key={f.field}
          x={f.x}
          y={f.y}
          className={styles.fieldLabel}
        >
          {f.field}
        </text>
      ))}
    </svg>
  );
}
