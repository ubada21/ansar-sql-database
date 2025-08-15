import { useCallback } from 'react';

import { Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { Iconify } from 'src/components/iconify';

export function TransactionTableRow({ row, selected, onSelectRow, onViewRow }) {
  const { RECEIPT_NUMBER, EMAIL, AMOUNT, METHOD, TRANSACTION_DATE, FIRSTNAME, LASTNAME } = row;

  const donorName = FIRSTNAME && LASTNAME ? `${FIRSTNAME} ${LASTNAME}` : 'N/A';

  const handleViewRow = useCallback(() => {
    onViewRow();
  }, [onViewRow]);

  return (
    <TableRow hover selected={selected}>
      <TableCell>{RECEIPT_NUMBER}</TableCell>
      <TableCell>{donorName}</TableCell>
      <TableCell>{EMAIL}</TableCell>
      <TableCell>${AMOUNT}</TableCell>
      <TableCell>{METHOD}</TableCell>
      <TableCell>{new Date(TRANSACTION_DATE).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Tooltip title="View Details" placement="top" arrow>
          <IconButton color="primary" onClick={handleViewRow}>
            <Iconify icon="solar:eye-bold" />
          </IconButton>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
