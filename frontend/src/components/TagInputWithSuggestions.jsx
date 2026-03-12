import { useMemo, useState } from 'react';

const normalize = (value) => value.trim().toLowerCase();

const TagInputWithSuggestions = ({ label, placeholder, suggestions, values, onChange, variant = 'interest' }) => {
  const [query, setQuery] = useState('');

  const selectedSet = useMemo(() => new Set(values.map((item) => normalize(item))), [values]);

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = normalize(query);
    const list = suggestions.filter((item) => {
      const normalizedItem = normalize(item);
      const notSelected = !selectedSet.has(normalizedItem);
      const matches = normalizedQuery ? normalizedItem.includes(normalizedQuery) : true;
      return notSelected && matches;
    });

    return list.slice(0, 8);
  }, [query, selectedSet, suggestions]);

  const addTag = (rawValue) => {
    const nextValue = rawValue.trim();
    if (!nextValue) return;

    const normalized = normalize(nextValue);
    if (selectedSet.has(normalized)) {
      setQuery('');
      return;
    }

    onChange([...values, nextValue]);
    setQuery('');
  };

  const removeTag = (value) => {
    onChange(values.filter((item) => item !== value));
  };

  const onKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addTag(query);
      return;
    }

    if (event.key === 'Backspace' && !query && values.length > 0) {
      removeTag(values[values.length - 1]);
    }
  };

  const canCreateCustom = query.trim() && !selectedSet.has(normalize(query));

  return (
    <div className="stack">
      {label ? <label>{label}</label> : null}

      <div className="smart-input-row">
        <input
          placeholder={placeholder}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          onKeyDown={onKeyDown}
        />
        <button type="button" className="add-btn" onClick={() => addTag(query)}>
          Add
        </button>
      </div>

      <div className="chips-wrap">
        {values.map((item) => (
          <span key={item} className={`chip chip-${variant}`}>
            {item}
            <button type="button" className="chip-remove" onClick={() => removeTag(item)}>
              ×
            </button>
          </span>
        ))}
        {values.length === 0 ? <small>No items added yet.</small> : null}
      </div>

      <div className="suggestions-wrap">
        {filteredSuggestions.map((item) => (
          <button key={item} type="button" className="suggestion-pill" onClick={() => addTag(item)}>
            {item}
          </button>
        ))}
        {canCreateCustom ? (
          <button type="button" className="suggestion-pill suggestion-create" onClick={() => addTag(query)}>
            Create "{query.trim()}"
          </button>
        ) : null}
      </div>
    </div>
  );
};

export default TagInputWithSuggestions;
