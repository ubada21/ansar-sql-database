import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function CourseTableFiltersResult({ filters, onResetFilters, results, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);

  const handleRemoveLocation = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);

  const handleRemoveStatus = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);

  return (
    <FiltersResult totalResults={results} onReset={onResetFilters} sx={sx}>
      <FiltersBlock label="Status:" isShow={filters.status !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.status}
          onDelete={handleRemoveStatus}
          sx={{ textTransform: 'capitalize' }}
        />
      </FiltersBlock>

      <FiltersBlock label="Location:" isShow={filters.location !== 'all'}>
        <Chip
          {...chipProps}
          label={filters.location}
          onDelete={handleRemoveLocation}
        />
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.name}>
        <Chip {...chipProps} label={filters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
} 