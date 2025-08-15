import { Box, Chip, Stack, Button } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function TransactionTableFiltersResult({
  filters,
  onFilters,
  onResetFilters,
  onRemoveMethod,
  onRemoveName,
  results,
  sx,
  ...other
}) {
  const handleRemoveMethod = (inputValue) => {
    onRemoveMethod(inputValue);
  };

  const handleRemoveName = () => {
    onRemoveName();
  };

  const hasFilter = filters.name !== '' || (filters.method.length > 0 && !filters.method.includes('all'));

  return (
    <Stack spacing={1.5} {...other} sx={{ ...sx }}>
      <Box sx={{ typography: 'body2' }}>
        <strong>{results}</strong>
        <Box component="span" sx={{ color: 'text.secondary', ml: 0.25 }}>
          results found
        </Box>
      </Box>

      {hasFilter && (
        <Stack flexGrow={1} spacing={1} direction="row" flexWrap="wrap" alignItems="center">
          {filters.name !== '' && (
            <Block label="Name:">
              <Chip size="small" label={filters.name} onDelete={handleRemoveName} />
            </Block>
          )}

          {filters.method.length > 0 && !filters.method.includes('all') && (
            <Block label="Payment Method:">
              {filters.method.map((item) => (
                <Chip key={item} label={item} size="small" onDelete={() => handleRemoveMethod(item)} />
              ))}
            </Block>
          )}

          <Button color="error" onClick={onResetFilters} startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}>
            Clear
          </Button>
        </Stack>
      )}
    </Stack>
  );
}

function Block({ label, children, sx, ...other }) {
  return (
    <Stack
      component={Box}
      direction="row"
      alignItems="center"
      sx={{
        typography: 'body2',
        '& .MuiChip-root': {
          ml: 1,
        },
        ...sx,
      }}
      {...other}
    >
      {label}

      {children}
    </Stack>
  );
}
