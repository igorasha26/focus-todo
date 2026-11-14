import { useEffect, useState } from 'react';
import { FILTER_STORAGE_KEY, loadFilter, saveFilter, subscribeToStorage } from '../lib/storage';
import type { Filter } from '../model/types';

export function useFilter(): [Filter, (filter: Filter) => void] {
  const [filter, setFilter] = useState<Filter>(loadFilter);

  useEffect(() => {
    saveFilter(filter);
  }, [filter]);

  useEffect(() => subscribeToStorage(FILTER_STORAGE_KEY, () => setFilter(loadFilter())), []);

  return [filter, setFilter];
}
