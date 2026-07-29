import type { CSSProperties } from 'react';
import { FIELDS, GRADES, TAG_LABELS } from '../lib/grades';
import type { Grade, GradeField } from '../lib/grades';
import { createDefaultCondition } from '../lib/achievementFilterConditions';
import type { FilterCondition, FilterRelative } from '../lib/achievementFilterConditions';

type AchievementFilterBuilderProps = {
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
  onSave: () => void;
};

const RELATIVE_LABEL: Record<FilterRelative, string> = {
  gt: 'greater than',
  lt: 'less than',
  eq: 'equal to',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
};

const removeButtonStyle: CSSProperties = {
  border: 'none',
  background: 'transparent',
  color: '#8FA8A2',
  cursor: 'pointer',
  fontSize: 16,
  lineHeight: 1,
};

const addButtonStyle: CSSProperties = {
  padding: '6px 12px',
  border: '1px solid #3E5C57',
  borderRadius: 4,
  background: 'transparent',
  color: '#F1EDE2',
  cursor: 'pointer',
};

const saveButtonStyle: CSSProperties = {
  padding: '6px 12px',
  border: 'none',
  borderRadius: 4,
  background: '#E3A83B',
  color: '#12201F',
  fontWeight: 700,
  cursor: 'pointer',
};

const actionsRowStyle: CSSProperties = {
  display: 'flex',
  gap: 8,
};

function GradeConditionFields({
  condition,
  onChange,
}: {
  condition: Extract<FilterCondition, { identifier: 'grade' }>;
  onChange: (condition: FilterCondition) => void;
}) {
  return (
    <>
      <select
        aria-label="Grade field"
        value={condition.field}
        onChange={(event) => onChange({ ...condition, field: event.target.value as GradeField })}
        className="dlc-selectbox"
      >
        {FIELDS.map((field) => (
          <option key={field} value={field}>
            {field}
          </option>
        ))}
      </select>

      <select
        aria-label="Comparison"
        value={condition.relative}
        onChange={(event) => onChange({ ...condition, relative: event.target.value as FilterRelative })}
        className="dlc-selectbox"
      >
        {(['gt', 'lt', 'eq'] as const).map((relative) => (
          <option key={relative} value={relative}>
            {RELATIVE_LABEL[relative]}
          </option>
        ))}
      </select>

      <select
        aria-label="Grade value"
        value={condition.value}
        onChange={(event) => onChange({ ...condition, value: event.target.value as Grade })}
        className="dlc-selectbox"
      >
        {GRADES.map((grade) => (
          <option key={grade} value={grade}>
            {grade}
          </option>
        ))}
      </select>
    </>
  );
}

function TagConditionFields({
  condition,
  onChange,
}: {
  condition: Extract<FilterCondition, { identifier: 'tag' }>;
  onChange: (condition: FilterCondition) => void;
}) {
  return (
    <select
      aria-label="Tag value"
      value={condition.value}
      onChange={(event) => onChange({ ...condition, value: event.target.value })}
      className="dlc-selectbox"
    >
      {TAG_LABELS.map((tag) => (
        <option key={tag} value={tag}>
          {tag}
        </option>
      ))}
    </select>
  );
}

function AchievementConditionFields({
  condition,
  onChange,
}: {
  condition: Extract<FilterCondition, { identifier: 'achievement' }>;
  onChange: (condition: FilterCondition) => void;
}) {
  return (
    <select
      aria-label="Achievement value"
      value={String(condition.value)}
      onChange={(event) => onChange({ ...condition, value: event.target.value === 'true' })}
      className="dlc-selectbox"
    >
      <option value="true">Achieved</option>
      <option value="false">Locked</option>
    </select>
  );
}

export default function AchievementFilterBuilder({ conditions, onChange, onSave }: AchievementFilterBuilderProps) {
  const isEditing = conditions.length > 0;

  function updateCondition(index: number, updated: FilterCondition) {
    onChange(conditions.map((condition, i) => (i === index ? updated : condition)));
  }

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function changeIdentifier(index: number, identifier: FilterCondition['identifier']) {
    updateCondition(index, createDefaultCondition(identifier));
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'row', gap: 8 }}>
      {conditions.map((condition, index) => (
        <div key={index} style={rowStyle}>
          <select
            aria-label="Filter identifier"
            value={condition.identifier}
            onChange={(event) => changeIdentifier(index, event.target.value as FilterCondition['identifier'])}
            className="dlc-selectbox"
          >
            <option value="grade">Grade</option>
            <option value="tag">Tag</option>
            <option value="achievement">Achievement</option>
          </select>

          {condition.identifier === 'grade' && (
            <GradeConditionFields condition={condition} onChange={(updated) => updateCondition(index, updated)} />
          )}
          {condition.identifier === 'tag' && (
            <TagConditionFields condition={condition} onChange={(updated) => updateCondition(index, updated)} />
          )}
          {condition.identifier === 'achievement' && (
            <AchievementConditionFields condition={condition} onChange={(updated) => updateCondition(index, updated)} />
          )}

          <button type="button" onClick={() => removeCondition(index)} style={removeButtonStyle} aria-label="Remove filter">
            ✕
          </button>
        </div>
      ))}

      <div style={actionsRowStyle}>
        {!isEditing && (
          <button type="button" onClick={() => onChange([...conditions, createDefaultCondition('grade')])} style={addButtonStyle}>
            + Add filter
          </button>
        )}
        {isEditing && (
          <button type="button" onClick={onSave} style={saveButtonStyle}>
            Save Filter
          </button>
        )}
      </div>
    </div>
  );
}