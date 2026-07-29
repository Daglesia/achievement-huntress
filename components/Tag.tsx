import type { CSSProperties } from 'react';

type TagProps = {
  label: string;
  onRemove: () => void;
};

const wrapperStyle: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 10px',
  borderRadius: 999,
  background: '#E3A83B',
  color: '#12201F',
  fontSize: 13,
  fontWeight: 700,
};

const removeButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: 'inherit',
  cursor: 'pointer',
  fontSize: 14,
  lineHeight: 1,
  padding: 0,
};

export default function Tag({ label, onRemove }: TagProps) {
  return (
    <span style={wrapperStyle}>
      {label}
      <button type="button" onClick={onRemove} style={removeButtonStyle} aria-label={`Remove ${label} filter`}>
        ✕
      </button>
    </span>
  );
}