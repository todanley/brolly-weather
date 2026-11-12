import { describe, expect, it } from 'vitest';
import type { Place } from '../types/weather';
import { addRecent, MAX_RECENT_SEARCHES } from './useRecentSearches';

const place = (id: string): Place => ({ id, name: `Place ${id}`, latitude: 0, longitude: 0 });

describe('addRecent', () => {
  it('puts the newest place first and de-duplicates', () => {
    const list = addRecent([place('a'), place('b')], place('b'));
    expect(list.map((p) => p.id)).toEqual(['b', 'a']);
  });

  it(`caps the list at ${MAX_RECENT_SEARCHES}`, () => {
    let list: Place[] = [];
    for (const id of ['1', '2', '3', '4', '5', '6', '7']) list = addRecent(list, place(id));
    expect(list.map((p) => p.id)).toEqual(['7', '6', '5', '4', '3']);
  });
});
