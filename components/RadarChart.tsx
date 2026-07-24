import type { GradeField, Grade } from '../lib/grades';
import { GRADES, GRADE_VALUE, GRADE_COLOR } from '../lib/grades';
import { polarPoint, axisAngle, gradeRadius } from '../lib/radarLayout';

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
    <svg viewBox={`0 0 ${size} ${size}`} width="100%" height="100%" style={{ overflow: 'visible', display: 'block' }}>
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
          fill="none"
          stroke={LINE}
          strokeWidth={ring.level === 5 ? 1.4 : 0.8}
          opacity={ring.level === 5 ? 0.9 : 0.45}
        />
      ))}

      {axisEnds.map((p, i) => (
        <line key={i} x1={cx} y1={cy} x2={p[0]} y2={p[1]} stroke={LINE} strokeWidth={0.8} opacity={0.5} />
      ))}

      {scaleTicks.map((t) => (
        <text
          key={t.level}
          x={t.x - 10}
          y={t.y + 3}
          textAnchor="end"
          fontSize="10"
          fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
          fill={MUTED}
        >
          {t.grade}
        </text>
      ))}

      <polygon points={dataPolygon} fill="url(#radarGlow)" stroke="none" />
      <polygon
        points={dataPolygon}
        fill={ACCENT}
        fillOpacity="0.28"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />

      {data.map((d, i) => {
        const [x, y] = dataPoints[i];
        const a = angleFor(i);
        const color = GRADE_COLOR[d.grade];
        const lx = x + Math.cos(a) * 15;
        const ly = y + Math.sin(a) * 15;
        return (
          <g key={d.field}>
            <circle cx={x} cy={y} r={5.5} fill={color} stroke={INK} strokeWidth={1.5} />
            <text
              x={lx}
              y={ly + 3.5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fontFamily="ui-monospace, SFMono-Regular, Menlo, monospace"
              fill={color}
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
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="15"
          fontWeight="700"
          fontFamily="ui-sans-serif, system-ui, sans-serif"
          fill={TEXT}
        >
          {f.field}
        </text>
      ))}
    </svg>
  );
}
