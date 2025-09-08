import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Table, Button, TableRow, Checkbox, TableBody, TableCell, TableContainer } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ReportGenerator } from 'src/components/report-generator';
import { ReceiptGenerator } from 'src/components/receipt-generator';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { useTable, TableHeadCustom, TableSelectedAction } from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

import { TransactionTableToolbar } from '../../sections/transaction/transaction-table-toolbar';
import { TransactionTableFiltersResult } from '../../sections/transaction/transaction-table-filters-result';

const metadata = { title: `Transactions | Dashboard - ${CONFIG.appName}` };

const TABLE_HEAD = [
  { id: 'RECEIPT_NUMBER', label: 'Receipt Number', alignRight: false },
  { id: 'donor_name', label: 'Donor Name', alignRight: false },
  { id: 'EMAIL', label: 'Email', alignRight: false },
  { id: 'AMOUNT', label: 'Amount', alignRight: false },
  { id: 'METHOD', label: 'Payment Method', alignRight: false },
  { id: 'TRANSACTION_DATE', label: 'Date', alignRight: false },
  { id: '', label: 'Actions', alignRight: true },
];

export default function TransactionsPage() {
  const router = useRouter();
  const { authenticated } = useAuthContext();
  const table = useTable();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [receiptDialogOpen, setReceiptDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [reportDialogOpen, setReportDialogOpen] = useState(false);

  const [filters, setFilters] = useState({
    name: '',
    method: ['all'],
  });

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    filters,
    order: table.order,
    orderBy: table.orderBy,
  });

  const dataInPage = dataFiltered.slice(0, dataFiltered.length);

  const canReset = filters.name !== '' || (filters.method.length > 0 && !filters.method.includes('all'));

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    []
  );

  const handleResetFilters = useCallback(() => {
    setFilters({
      name: '',
      method: ['all'],
    });
  }, []);

  const handleRemoveMethod = useCallback(
    (inputValue) => {
      const newValue = filters.method.filter((item) => item !== inputValue);
      handleFilters('method', newValue);
    },
    [filters.method, handleFilters]
  );

  const handleRemoveName = useCallback(() => {
    handleFilters('name', '');
  }, [handleFilters]);


  const handleGenerateReceipt = useCallback(
    (transaction) => {
      setSelectedTransaction(transaction);
      setReceiptDialogOpen(true);
    },
    []
  );

  const handleCloseReceiptDialog = useCallback(() => {
    setReceiptDialogOpen(false);
    setSelectedTransaction(null);
  }, []);

  const handleOpenReportDialog = useCallback(() => {
    setReportDialogOpen(true);
  }, []);

  const handleCloseReportDialog = useCallback(() => {
    setReportDialogOpen(false);
  }, []);

  const handleGenerateSelectedReport = useCallback(() => {
    if (table.selected.length === 0) {
      toast.error('Please select at least one transaction');
      return;
    }
    setReportDialogOpen(true);
  }, [table.selected]);


  const fetchTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.get('/transactions');
      const transactions = response.data?.transactions || [];
      setTableData(Array.isArray(transactions) ? transactions : []);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError(err.message);
      toast.error('Failed to fetch transactions');
      setTableData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchTransactions();
    }
  }, [authenticated, fetchTransactions]);

  if (!authenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading transactions...</div>
        </DashboardContent>
      </>
    );
  }

  if (error) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Error loading transactions: {error}</div>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>

      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Transactions"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Transactions' },
          ]}
          action={
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button
                variant="outlined"
                startIcon={<Iconify icon="eva:file-text-fill" />}
                onClick={handleOpenReportDialog}
              >
                Generate Report
              </Button>
              <Button
                component={RouterLink}
                href={paths.dashboard.transactions}
                variant="contained"
                startIcon={<Iconify icon="mingcute:add-line" />}
              >
                New Transaction
              </Button>
            </Box>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        <Card>
          <TransactionTableToolbar
            filters={filters}
            onFilters={handleFilters}
            onResetFilters={handleResetFilters}
            methodOptions={[
              { value: 'all', label: 'All Methods' },
              { value: 'credit_card', label: 'Credit Card' },
              { value: 'paypal', label: 'PayPal' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
            ]}
          />

          {tableData && Array.isArray(tableData) && tableData.length > 0 ? (
            <Box sx={{ position: 'relative' }}>
              <TableSelectedAction
                dense={table.dense}
                numSelected={table.selected.length}
                rowCount={dataFiltered.length}
                onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.TRANSACTION_ID)
                  )
                }
                action={
                  <Button
                    variant="contained"
                    startIcon={<Iconify icon="eva:file-text-fill" />}
                    onClick={handleGenerateSelectedReport}
                    sx={{ mr: 1 }}
                  >
                    Generate Report ({table.selected.length})
                  </Button>
                }
              />

              <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
                <Scrollbar>
                  <Table size={table.dense ? 'small' : 'medium'} sx={{ minWidth: 960 }}>
                    <TableHeadCustom
                      order={table.order}
                      orderBy={table.orderBy}
                      headCells={TABLE_HEAD}
                      rowCount={dataFiltered.length}
                      numSelected={table.selected.length}
                      onSort={table.onSort}
                      onSelectAllRows={(checked) =>
                        table.onSelectAllRows(
                          checked,
                          dataFiltered.map((row) => row.TRANSACTION_ID)
                        )
                      }
                    />
                    <TableBody>
                      {dataInPage.map((row) => (
                        <TransactionTableRow
                          key={row.TRANSACTION_ID}
                          row={row}
                          selected={table.selected.includes(row.TRANSACTION_ID)}
                          onSelectRow={() => table.onSelectRow(row.TRANSACTION_ID)}
                          onGenerateReceipt={() => handleGenerateReceipt(row)}
                        />
                      ))}
                    </TableBody>
                  </Table>
                </Scrollbar>
              </TableContainer>
            </Box>
          ) : (
            <div style={{ padding: '20px', textAlign: 'center' }}>
              {notFound ? 'No transactions found' : 'No transaction data available'}
            </div>
          )}
        </Card>

        <TransactionTableFiltersResult
          filters={filters}
          onFilters={handleFilters}
          onResetFilters={handleResetFilters}
          onRemoveMethod={handleRemoveMethod}
          onRemoveName={handleRemoveName}
          results={dataFiltered.length}
          sx={{ p: 2.5, pt: 0 }}
        />

        <ReceiptGenerator
          open={receiptDialogOpen}
          onClose={handleCloseReceiptDialog}
          transaction={selectedTransaction}
        />

        <ReportGenerator
          open={reportDialogOpen}
          onClose={handleCloseReportDialog}
          selectedTransactionIds={table.selected}
        />
      </DashboardContent>
    </>
  );
}

function TransactionTableRow({ row, selected, onSelectRow, onGenerateReceipt }) {
  const { RECEIPT_NUMBER, EMAIL, AMOUNT, METHOD, TRANSACTION_DATE, FIRSTNAME, LASTNAME } = row;

  const donorName = FIRSTNAME && LASTNAME ? `${FIRSTNAME} ${LASTNAME}` : 'N/A';

  return (
    <TableRow hover selected={selected} aria-checked={selected} tabIndex={-1}>
      <TableCell padding="checkbox">
        <Checkbox
          checked={selected}
          onClick={onSelectRow}
          slotProps={{
            input: {
              id: `${row.TRANSACTION_ID}-checkbox`,
              'aria-label': `${row.TRANSACTION_ID} checkbox`,
            },
          }}
        />
      </TableCell>
      <TableCell>{RECEIPT_NUMBER}</TableCell>
      <TableCell>{donorName}</TableCell>
      <TableCell>{EMAIL}</TableCell>
      <TableCell>${AMOUNT}</TableCell>
      <TableCell>{METHOD}</TableCell>
      <TableCell>{new Date(TRANSACTION_DATE).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
          <Iconify 
            icon="solar:printer-bold" 
            sx={{ cursor: 'pointer', color: 'success.main' }}
            onClick={onGenerateReceipt}
            title="Generate Receipt"
          />
          {/* Eye icon removed */}
        </Box>
      </TableCell>
    </TableRow>
  );
}

function applyFilter({ inputData, filters, order, orderBy }) {
  const { name, method } = filters;

  if (!inputData || !Array.isArray(inputData)) {
    return [];
  }

  let filteredData = [...inputData];

  if (name) {
    filteredData = filteredData.filter(
      (transaction) =>
        transaction.RECEIPT_NUMBER.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        transaction.EMAIL.toLowerCase().indexOf(name.toLowerCase()) !== -1 ||
        `${transaction.FIRSTNAME || ''} ${transaction.LASTNAME || ''}`.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (method.length > 0 && !method.includes('all')) {
    filteredData = filteredData.filter((transaction) => method.includes(transaction.METHOD));
  }

  // Sorting logic
  if (orderBy === 'RECEIPT_NUMBER') {
    filteredData.sort((a, b) => {
      const aValue = a.RECEIPT_NUMBER;
      const bValue = b.RECEIPT_NUMBER;
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  } else if (orderBy === 'donor_name') {
    filteredData.sort((a, b) => {
      const aValue = `${a.FIRSTNAME || ''} ${a.LASTNAME || ''}`.toLowerCase();
      const bValue = `${b.FIRSTNAME || ''} ${b.LASTNAME || ''}`.toLowerCase();
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  } else if (orderBy === 'EMAIL') {
    filteredData.sort((a, b) => {
      const aValue = a.EMAIL.toLowerCase();
      const bValue = b.EMAIL.toLowerCase();
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  } else if (orderBy === 'AMOUNT') {
    filteredData.sort((a, b) => {
      const aValue = parseFloat(a.AMOUNT);
      const bValue = parseFloat(b.AMOUNT);
      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  } else if (orderBy === 'METHOD') {
    filteredData.sort((a, b) => {
      const aValue = a.METHOD.toLowerCase();
      const bValue = b.METHOD.toLowerCase();
      if (order === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  } else if (orderBy === 'TRANSACTION_DATE') {
    filteredData.sort((a, b) => {
      const aValue = new Date(a.TRANSACTION_DATE).getTime();
      const bValue = new Date(b.TRANSACTION_DATE).getTime();
      if (order === 'asc') {
        return aValue - bValue;
      } else {
        return bValue - aValue;
      }
    });
  }

  return filteredData;
}

