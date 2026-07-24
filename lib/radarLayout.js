export function polarPoint(cx, cy, radius, angle) {
  return [cx + radius * Math.cos(angle), cy + radius * Math.sin(angle)];
}

export function axisAngle(index, total) {
  return -Math.PI / 2 + index * ((2 * Math.PI) / total);
}

export function gradeRadius(grade, maxRadius, gradeValue) {
  return (gradeValue[grade] / 5) * maxRadius;
}
