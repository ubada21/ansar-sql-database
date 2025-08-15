import { useCallback } from 'react';

import Chip from '@mui/material/Chip';

import { chipProps, FiltersBlock, FiltersResult } from 'src/components/filters-result';

// ----------------------------------------------------------------------

export function CourseTableFiltersResult({ filters, onResetFilters, onRemoveLocation, results, sx }) {
  const handleRemoveKeyword = useCallback(() => {
    onResetFilters();
  }, [onResetFilters]);

  const handleRemoveLocation = useCallback(
    (inputValue) => {
      onRemoveLocation(inputValue);
    },
    [onRemoveLocation]
  );

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

      <FiltersBlock label="Location:" isShow={!!filters.location.length && !filters.location.includes('all')}>
        {filters.location.filter((item) => item !== 'all').map((item) => (
          <Chip {...chipProps} key={item} label={item} onDelete={() => handleRemoveLocation(item)} />
        ))}
      </FiltersBlock>

      <FiltersBlock label="Keyword:" isShow={!!filters.name}>
        <Chip {...chipProps} label={filters.name} onDelete={handleRemoveKeyword} />
      </FiltersBlock>
    </FiltersResult>
  );
} 