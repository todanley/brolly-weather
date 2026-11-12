import { MapPin, RotateCw, Search, SearchX, X } from 'lucide-react';
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from 'react';
import { describeError } from '../../api/errors';
import { MIN_QUERY_LENGTH, useGeocoding } from '../../hooks/useGeocoding';
import { useClickOutside } from '../../hooks/useClickOutside';
import type { Place } from '../../types/weather';
import { formatPlaceSubtitle } from '../../utils/format';
import { SuggestionSkeleton } from '../Skeleton/Skeleton';
import styles from './SearchBar.module.css';

interface SearchBarProps {
  onSelect: (place: Place) => void;
}

/**
 * Location search implemented as a WAI-ARIA 1.2 combobox:
 * the input keeps focus while arrow keys move a virtual cursor
 * (aria-activedescendant) through the suggestion listbox.
 */
export function SearchBar({ onSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const { state, isPending, searchedQuery, retry } = useGeocoding(query);

  const formRef = useRef<HTMLFormElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const baseId = useId();
  const listboxId = `${baseId}-listbox`;
  const validationId = `${baseId}-validation`;
  const optionId = (index: number) => `${baseId}-option-${index}`;

  const results = state.status === 'success' ? state.data : [];
  const trimmed = query.trim();
  const isDropdownVisible = isOpen && trimmed.length >= MIN_QUERY_LENGTH;
  const isLoading = state.status === 'loading' || (isPending && results.length === 0);
  const hasOptions = isDropdownVisible && !isLoading && state.status === 'success' && results.length > 0;

  useEffect(() => setActiveIndex(-1), [state]);

  const close = useCallback(() => {
    setIsOpen(false);
    setActiveIndex(-1);
  }, []);

  useClickOutside(formRef, close, isOpen);

  const choose = (place: Place) => {
    onSelect(place);
    setQuery('');
    setValidationMessage(null);
    close();
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed.length === 0) {
      setValidationMessage('Type a city or place name to search.');
      inputRef.current?.focus();
      return;
    }
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setValidationMessage(`Type at least ${MIN_QUERY_LENGTH} characters.`);
      return;
    }
    const highlighted = results[activeIndex];
    if (highlighted) return choose(highlighted);

    const first = results[0];
    if (first && state.status === 'success' && searchedQuery === trimmed) return choose(first);
    setIsOpen(true);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        setIsOpen(true);
        if (results.length === 0) return;
        const last = results.length - 1;
        setActiveIndex((index) =>
          event.key === 'ArrowDown' ? (index >= last ? 0 : index + 1) : index <= 0 ? last : index - 1,
        );
        return;
      }
      case 'Enter': {
        const highlighted = results[activeIndex];
        if (isOpen && highlighted) {
          event.preventDefault();
          choose(highlighted);
        }
        return;
      }
      case 'Escape':
        if (isOpen) {
          event.preventDefault();
          close();
        } else if (query) {
          setQuery('');
        }
        return;
      default:
        return;
    }
  };

  const statusMessage = !isDropdownVisible
    ? ''
    : isLoading
      ? 'Searching…'
      : state.status === 'success'
        ? results.length === 0
          ? `No places found for ${searchedQuery}`
          : `${results.length} places found. Use up and down arrows to choose.`
        : state.status === 'error'
          ? describeError(state.error).title
          : '';

  return (
    <form ref={formRef} className={styles.root} role="search" onSubmit={handleSubmit} noValidate>
      <label htmlFor={`${baseId}-input`} className="visually-hidden">
        Search for a city or place
      </label>
      <div className={styles.field} data-invalid={validationMessage !== null}>
        <Search className={styles.leadingIcon} size={18} aria-hidden="true" />
        <input
          ref={inputRef}
          id={`${baseId}-input`}
          className={styles.input}
          type="text"
          role="combobox"
          placeholder="Search a city or town"
          value={query}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="search"
          aria-autocomplete="list"
          aria-expanded={hasOptions}
          aria-controls={hasOptions ? listboxId : undefined}
          aria-activedescendant={hasOptions && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-invalid={validationMessage !== null}
          aria-describedby={validationMessage ? validationId : undefined}
          onChange={(event) => {
            setQuery(event.target.value);
            setIsOpen(true);
            setValidationMessage(null);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
        />
        {query && (
          <button
            type="button"
            className={styles.clearButton}
            aria-label="Clear search"
            onClick={() => {
              setQuery('');
              inputRef.current?.focus();
            }}
          >
            <X size={16} aria-hidden="true" />
          </button>
        )}
        <button type="submit" className={styles.submitButton}>
          <span className={styles.submitLabel}>Search</span>
          <Search className={styles.submitIcon} size={18} aria-hidden="true" />
        </button>
      </div>

      {validationMessage && (
        <p id={validationId} className={styles.validation} role="alert">
          {validationMessage}
        </p>
      )}

      <div className="visually-hidden" aria-live="polite" role="status">
        {statusMessage}
      </div>

      {isDropdownVisible && (
        <div className={styles.popup}>
          {isLoading ? (
            <SuggestionSkeleton rows={3} />
          ) : state.status === 'error' ? (
            <div className={styles.message}>
              <span>{describeError(state.error).title}</span>
              {state.error.retryable && (
                <button type="button" className={styles.inlineAction} onClick={retry}>
                  <RotateCw size={14} aria-hidden="true" />
                  Retry
                </button>
              )}
            </div>
          ) : state.status === 'success' && results.length === 0 ? (
            <div className={styles.message}>
              <SearchX size={18} aria-hidden="true" />
              <span>
                No places match “{searchedQuery}”. Check the spelling or try a nearby larger city.
              </span>
            </div>
          ) : (
            <ul id={listboxId} role="listbox" aria-label="Matching places" className={styles.list}>
              {results.map((place, index) => (
                <li
                  key={place.id}
                  id={optionId(index)}
                  role="option"
                  aria-selected={index === activeIndex}
                  className={styles.option}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setActiveIndex(index)}
                  onClick={() => choose(place)}
                >
                  <MapPin size={16} className={styles.optionIcon} aria-hidden="true" />
                  <span className={styles.optionText}>
                    <span className={styles.optionName}>{place.name}</span>
                    <span className={styles.optionMeta}>{formatPlaceSubtitle(place)}</span>
                  </span>
                  {place.countryCode && <span className={styles.countryCode}>{place.countryCode}</span>}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
