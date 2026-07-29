import { useState } from 'react';
import type { CSSProperties } from 'react';
import { FIELDS, GRADES, TAG_LABELS } from '../lib/grades';
import type { Grade, GradeField } from '../lib/grades';
import { createDefaultCondition, describeFilterCondition, RELATIVE_LABEL } from '../lib/achievementFilterConditions';
import type { FilterCondition, FilterRelative } from '../lib/achievementFilterConditions';
import Tag from './Tag';

type AchievementFilterBuilderProps = {
  conditions: FilterCondition[];
  onChange: (conditions: FilterCondition[]) => void;
};

const containerStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'row',
  gap: 8,
  flexWrap: 'wrap',
  alignItems: 'center',
};

const rowStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  flexWrap: 'wrap',
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

export default function AchievementFilterBuilder({ conditions, onChange }: AchievementFilterBuilderProps) {
  const [draft, setDraft] = useState<FilterCondition | null>(null);

  function removeCondition(index: number) {
    onChange(conditions.filter((_, i) => i !== index));
  }

  function saveDraft() {
    if (!draft) return;
    onChange([...conditions, draft]);
    setDraft(null);
  }

  return (
    <div style={containerStyle}>
      {!draft && (
        <button type="button" onClick={() => setDraft(createDefaultCondition('grade'))} style={addButtonStyle}>
          + Add filter
        </button>
      )}

      {conditions.map((condition, index) => (
        <Tag key={index} label={describeFilterCondition(condition)} onRemove={() => removeCondition(index)} />
      ))}

      {draft && (
        <div style={rowStyle}>
          <select
            aria-label="Filter identifier"
            value={draft.identifier}
            onChange={(event) => setDraft(createDefaultCondition(event.target.value as FilterCondition['identifier']))}
            className="dlc-selectbox"
          >
            <option value="grade">Grade</option>
            <option value="tag">Tag</option>
            <option value="achievement">Achievement</option>
          </select>

          {draft.identifier === 'grade' && <GradeConditionFields condition={draft} onChange={setDraft} />}
          {draft.identifier === 'tag' && <TagConditionFields condition={draft} onChange={setDraft} />}
          {draft.identifier === 'achievement' && <AchievementConditionFields condition={draft} onChange={setDraft} />}

          <button type="button" onClick={saveDraft} style={saveButtonStyle}>
            Save Filter
          </button>
        </div>
      )}
    </div>
  );
}