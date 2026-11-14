import { useEffect, useState } from 'react';
import { loadFilter, saveFilter } from '../lib/storage';
import type { Filter } from '../model/types';

export function useFilter(): [Filter, (filter: Filter) => void] {
  const [filter, setFilter] = useState<Filter>(loadFilter);

  useEffect(() => {
    saveFilter(filter);
  }, [filter]);

  return [filter, setFilter];
}
