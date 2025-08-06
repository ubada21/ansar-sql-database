import { Card, Stack, Button, MenuItem, TextField, InputAdornment } from '@mui/material';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function CourseTableToolbar({
  filters,
  onFilters,
  locationOptions,
  onResetFilters,
  onDeleteRows,
  selected,
}) {

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={2.5} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-end', md: 'center' }}>
        <TextField
          fullWidth
          value={filters.name}
          onChange={(event) => onFilters('name', event.target.value)}
          placeholder="Search course..."
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          }}
        />

        <TextField
          fullWidth
          select
          label="Location"
          value={filters.location}
          onChange={(event) => onFilters('location', event.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        >
          <MenuItem value="all">All Locations</MenuItem>
          {locationOptions.map((location) => (
            <MenuItem key={location} value={location}>
              {location}
            </MenuItem>
          ))}
        </TextField>

        <TextField
          fullWidth
          select
          label="Status"
          value={filters.status}
          onChange={(event) => onFilters('status', event.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        >
          <MenuItem value="all">All Status</MenuItem>
          <MenuItem value="upcoming">Upcoming</MenuItem>
          <MenuItem value="ongoing">Ongoing</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </TextField>

        <Button
          color="error"
          size="small"
          onClick={onDeleteRows}
          startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
          disabled={!selected.length}
        >
          Delete ({selected.length})
        </Button>
      </Stack>
    </Card>
  );
} 