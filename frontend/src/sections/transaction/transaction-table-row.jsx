import { TableRow, TableCell } from '@mui/material';

export function TransactionTableRow({ row, selected, onSelectRow }) {
  const { RECEIPT_NUMBER, EMAIL, AMOUNT, METHOD, TRANSACTION_DATE, FIRSTNAME, LASTNAME } = row;

  const donorName = FIRSTNAME && LASTNAME ? `${FIRSTNAME} ${LASTNAME}` : 'N/A';

  return (
    <TableRow hover selected={selected}>
      <TableCell>{RECEIPT_NUMBER}</TableCell>
      <TableCell>{donorName}</TableCell>
      <TableCell>{EMAIL}</TableCell>
      <TableCell>${AMOUNT}</TableCell>
      <TableCell>{METHOD}</TableCell>
      <TableCell>{new Date(TRANSACTION_DATE).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        {/* Eye icon removed */}
      </TableCell>
    </TableRow>
  );
}
