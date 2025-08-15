import { Card, Stack, Button, Select, MenuItem, TextField, InputLabel, FormControl, InputAdornment } from '@mui/material';

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
  const handleFilterLocation = (event) => {
    const newValue = typeof event.target.value === 'string' ? event.target.value.split(',') : event.target.value;
    
    if (newValue.length === 1 && newValue.includes('all')) {
      onFilters('location', ['all']);
      return;
    }
    
    if (newValue.includes('all') && newValue.length > 1) {
      const filteredValue = newValue.filter(item => item !== 'all');
      onFilters('location', filteredValue);
      return;
    }
    
    if (newValue.length === 0) {
      onFilters('location', ['all']);
      return;
    }
    
    onFilters('location', newValue);
  };

  return (
    <Card sx={{ p: 2.5 }}>
      <Stack spacing={2.5} direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }}>
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

        <FormControl sx={{ flexShrink: 0, width: { xs: 1, md: 200 } }}>
          <InputLabel htmlFor="filter-location-select">Location</InputLabel>
                     <Select
             multiple
             label="Location"
             value={filters.location}
                           onChange={handleFilterLocation}
             renderValue={(selectedValues) => selectedValues.map((value) => value).join(', ')}
             inputProps={{ id: 'filter-location-select' }}
             MenuProps={{ PaperProps: { sx: { maxHeight: 240 } } }}
           >
                         <MenuItem value="all">
               All Locations
             </MenuItem>
             {locationOptions.map((location) => (
               <MenuItem key={location} value={location}>
                 {location}
               </MenuItem>
             ))}
          </Select>
        </FormControl>

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