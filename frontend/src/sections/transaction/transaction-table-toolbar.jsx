import { useCallback } from 'react';

import { Stack, Button, Select, MenuItem, TextField, InputLabel, FormControl, InputAdornment } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function TransactionTableToolbar({ filters, onFilters, onResetFilters, methodOptions }) {
  const handleFilterName = useCallback(
    (event) => {
      onFilters('name', event.target.value);
    },
    [onFilters]
  );

  const handleFilterMethod = useCallback(
    (event) => {
      const newValue = event.target.value;
      if (newValue.includes('all')) {
        onFilters('method', ['all']);
      } else {
        onFilters('method', newValue);
      }
    },
    [onFilters]
  );

  return (
    <Stack
      spacing={2}
      alignItems={{ xs: 'flex-end', md: 'center' }}
      direction={{
        xs: 'column',
        md: 'row',
      }}
      sx={{
        p: 2.5,
        pr: { xs: 2.5, md: 1 },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} flexGrow={1} sx={{ width: 1 }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={handleFilterName}
          placeholder="Search..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Payment Method</InputLabel>
          <Select
            multiple
            value={filters.method}
            onChange={handleFilterMethod}
            input={<InputLabel>Payment Method</InputLabel>}
            renderValue={(selected) => {
              if (selected.includes('all')) {
                return 'All Methods';
              }
              return selected.join(', ');
            }}
          >
            {methodOptions.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Button
        color="error"
        onClick={onResetFilters}
        startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
      >
        Clear
      </Button>
    </Stack>
  );
}
