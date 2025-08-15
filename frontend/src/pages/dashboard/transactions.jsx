import { useState, useEffect, useCallback } from 'react';

import { Box, Card, Table, Button, TableRow, TableBody, TableHead, TableCell, TableContainer, TableSortLabel } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import axios from 'src/lib/axios';
import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

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

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [order, setOrder] = useState('asc');
  const [orderBy, setOrderBy] = useState('TRANSACTION_DATE');

  const [filters, setFilters] = useState({
    name: '',
    method: ['all'],
  });

  const dataFiltered = applyFilter({
    inputData: tableData || [],
    filters,
    order,
    orderBy,
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

  const handleViewRow = useCallback(
    (transactionId) => {
      router.push(paths.dashboard.transactions + `/${transactionId}`);
    },
    [router]
  );

  const handleRequestSort = useCallback(
    (event, id) => {
      const isAsc = orderBy === id && order === 'asc';
      if (id !== '') {
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(id);
      }
    },
    [order, orderBy]
  );

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
            <Button
              component={RouterLink}
              href={paths.dashboard.transactions}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Transaction
            </Button>
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
            <TableContainer sx={{ position: 'relative', overflow: 'unset' }}>
              <Scrollbar>
                <Table size="medium" sx={{ minWidth: 960 }}>
                  <TableHead>
                    <TableRow>
                      {TABLE_HEAD.map((headCell) => (
                        <TableCell
                          key={headCell.id}
                          align={headCell.alignRight ? 'right' : 'left'}
                          sortDirection={orderBy === headCell.id ? order : false}
                        >
                          {headCell.id === '' ? (
                            headCell.label
                          ) : (
                            <TableSortLabel
                              hideSortIcon
                              active={orderBy === headCell.id}
                              direction={orderBy === headCell.id ? order : 'asc'}
                              onClick={(event) => handleRequestSort(event, headCell.id)}
                            >
                              {headCell.label}
                              {orderBy === headCell.id ? (
                                <Box sx={{ ...visuallyHidden }}>
                                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                              ) : null}
                            </TableSortLabel>
                          )}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dataInPage.map((row) => (
                      <TransactionTableRow
                        key={row.TRANSACTION_ID}
                        row={row}
                        onViewRow={() => handleViewRow(row.TRANSACTION_ID)}
                      />
                    ))}
                  </TableBody>
                </Table>
              </Scrollbar>
            </TableContainer>
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
      </DashboardContent>
    </>
  );
}

function TransactionTableRow({ row, onViewRow }) {
  const { RECEIPT_NUMBER, EMAIL, AMOUNT, METHOD, TRANSACTION_DATE, FIRSTNAME, LASTNAME } = row;

  const donorName = FIRSTNAME && LASTNAME ? `${FIRSTNAME} ${LASTNAME}` : 'N/A';

  return (
    <TableRow hover>
      <TableCell>{RECEIPT_NUMBER}</TableCell>
      <TableCell>{donorName}</TableCell>
      <TableCell>{EMAIL}</TableCell>
      <TableCell>${AMOUNT}</TableCell>
      <TableCell>{METHOD}</TableCell>
      <TableCell>{new Date(TRANSACTION_DATE).toLocaleDateString()}</TableCell>
      <TableCell align="right">
        <Iconify 
          icon="solar:eye-bold" 
          sx={{ cursor: 'pointer', color: 'primary.main' }}
          onClick={onViewRow}
        />
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

const visuallyHidden = {
  border: 0,
  margin: -1,
  padding: 0,
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  position: 'absolute',
  whiteSpace: 'nowrap',
  clip: 'rect(0 0 0 0)',
};
