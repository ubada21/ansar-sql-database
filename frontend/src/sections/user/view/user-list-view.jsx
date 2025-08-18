import { varAlpha } from 'minimal-shared/utils';
import { useState, useEffect, useCallback } from 'react';
import { useBoolean, useSetState } from 'minimal-shared/hooks';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Tabs from '@mui/material/Tabs';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableBody from '@mui/material/TableBody';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import axios from 'src/lib/axios';
import { USER_STATUS_OPTIONS } from 'src/_mock';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { ConfirmDialog } from 'src/components/custom-dialog';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { 
  useTable, 
  emptyRows, 
  rowInPage, 
  TableNoData, 
  getComparator, 
  TableEmptyRows, 
  TableHeadCustom, 
  TableSelectedAction, 
  TablePaginationCustom 
} from 'src/components/table';

import { UserTableRow } from '../user-table-row';
import { UserCreateForm } from '../user-create-form';
import { UserTableToolbar } from '../user-table-toolbar';
import { UserTableFiltersResult } from '../user-table-filters-result';

// ----------------------------------------------------------------------

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...USER_STATUS_OPTIONS];

const TABLE_HEAD = [
  { id: 'name', label: 'Name' },
  { id: 'email', label: 'Email', width: 220 },
  { id: 'phoneNumber', label: 'Phone number', width: 180 },
  { id: 'roles', label: 'Roles', width: 200 },
  { id: 'status', label: 'Status', width: 100 },
  { id: '', width: 88 },
];

// ----------------------------------------------------------------------

export function UserListView() {
  const table = useTable();

  const confirmDialog = useBoolean();
  const createUserDialog = useBoolean();

  const [tableData, setTableData] = useState([]);
  const [userRoles, setUserRoles] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [roles, setRoles] = useState([]);

  const filters = useSetState({ name: '', role: [], status: 'all' });
  const { state: currentFilters, setState: updateFilters } = filters;

  // Fetch users and roles data
  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get('/users');
      const data = response.data;

      if (response.status === 200) {
        const usersList = data.users || [];
        setTableData(usersList);

        // Fetch roles for each user
        const rolesData = {};
        for (const user of usersList) {
          try {
            const rolesResponse = await axios.get(`/users/${user.UID}/roles`);
            if (rolesResponse.status === 200) {
              const responseData = rolesResponse.data;
              rolesData[user.UID] = responseData.roles || [];
            } else {
              rolesData[user.UID] = [];
            }
          } catch (err) {
            console.error(`Error fetching roles for user ${user.UID}:`, err);
            rolesData[user.UID] = [];
          }
        }
        setUserRoles(rolesData);
      } else {
        setError(data.message || 'Failed to fetch users');
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch all roles for filter options
  const fetchRoles = useCallback(async () => {
    try {
      const response = await axios.get('/roles');
      if (response.status === 200) {
        const data = response.data;
        setRoles(data.roles || []);
      }
    } catch (err) {
      console.error('Error fetching roles:', err);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, [fetchUsers, fetchRoles]);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters: currentFilters,
    userRoles,
  });

  const dataInPage = rowInPage(dataFiltered, table.page, table.rowsPerPage);

  const canReset =
    !!currentFilters.name || currentFilters.role.length > 0 || currentFilters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleDeleteRow = useCallback(
    async (id) => {
      try {
        const response = await axios.delete(`/users/${id}`);

        if (response.status === 200) {
          const deleteRow = tableData.filter((row) => row.UID !== id);
          setTableData(deleteRow);
          
          const newUserRoles = { ...userRoles };
          delete newUserRoles[id];
          setUserRoles(newUserRoles);

          toast.success('Delete success!');
          table.onUpdatePageDeleteRow(dataInPage.length);
        } else {
          const data = response.data;
          toast.error(data.message || 'Failed to delete user');
        }
      } catch (err) {
        console.error('Error deleting user:', err);
        toast.error('Failed to delete user');
      }
    },
    [dataInPage.length, table, tableData, userRoles]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      for (const id of table.selected) {
        await handleDeleteRow(id);
      }
      toast.success(`${table.selected.length} users deleted successfully!`);
    } catch (err) {
      console.error('Error deleting selected users:', err);
      toast.error('Failed to delete some users');
    }
  }, [table.selected, handleDeleteRow]);

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      updateFilters({ status: newValue });
    },
    [updateFilters, table]
  );

  const renderConfirmDialog = () => (
    <ConfirmDialog
      open={confirmDialog.value}
      onClose={confirmDialog.onFalse}
      title="Delete"
      content={
        <>
          Are you sure want to delete <strong> {table.selected.length} </strong> items?
        </>
      }
      action={
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            handleDeleteRows();
            confirmDialog.onFalse();
          }}
        >
          Delete
        </Button>
      }
    />
  );

  if (loading) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Box>Loading users...</Box>
        </Box>
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
          <Box sx={{ color: 'error.main' }}>{error}</Box>
        </Box>
      </DashboardContent>
    );
  }

  return (
    <>
      <DashboardContent>
        <CustomBreadcrumbs
          heading="Users List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Users', href: paths.dashboard.users },
            { name: 'List' },
          ]}
          action={
            <Button
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
              onClick={createUserDialog.onTrue}
            >
              Add user
            </Button>
          }
          sx={{ mb: { xs: 3, md: 5 } }}
        />

        {/* User Statistics */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="primary.main" gutterBottom>
                {tableData.length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Total Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                All registered users
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="success.main" gutterBottom>
                {tableData.filter(user => user.status === 'active').length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Active Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Currently active
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="warning.main" gutterBottom>
                {tableData.filter(user => user.status === 'pending').length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Pending Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Awaiting approval
              </Typography>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <Typography variant="h4" color="error.main" gutterBottom>
                {tableData.filter(user => user.status === 'banned').length}
              </Typography>
              <Typography variant="h6" gutterBottom>
                Banned Users
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Suspended accounts
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Card>
          <Tabs
            value={currentFilters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${varAlpha(theme.vars.palette.grey['500Channel'], 0.08)}`,
              }),
            ]}
          >
            {STATUS_OPTIONS.map((tab) => (
              <Tab
                key={tab.value}
                iconPosition="end"
                value={tab.value}
                label={tab.label}
                icon={
                  <Label
                    variant={
                      ((tab.value === 'all' || tab.value === currentFilters.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'active' && 'success') ||
                      (tab.value === 'pending' && 'warning') ||
                      (tab.value === 'banned' && 'error') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' ? tableData.length : 
                     tableData.filter((user) => user.status === tab.value).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <UserTableToolbar
            filters={filters}
            onResetPage={table.onResetPage}
            options={{ roles: roles.map(role => role.ROLENAME) }}
          />

          {canReset && (
            <UserTableFiltersResult
              filters={filters}
              totalResults={dataFiltered.length}
              onResetPage={table.onResetPage}
              sx={{ p: 2.5, pt: 0 }}
            />
          )}

          <Box sx={{ position: 'relative' }}>
            <TableSelectedAction
              dense={table.dense}
              numSelected={table.selected.length}
              rowCount={dataFiltered.length}
                              onSelectAllRows={(checked) =>
                  table.onSelectAllRows(
                    checked,
                    dataFiltered.map((row) => row.UID)
                  )
                }
              action={
                <Tooltip title="Delete">
                  <IconButton color="primary" onClick={confirmDialog.onTrue}>
                    <Iconify icon="solar:trash-bin-trash-bold" />
                  </IconButton>
                </Tooltip>
              }
            />

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
                      dataFiltered.map((row) => row.UID)
                    )
                  }
                />

                <TableBody>
                  {dataFiltered
                    .slice(
                      table.page * table.rowsPerPage,
                      table.page * table.rowsPerPage + table.rowsPerPage
                    )
                    .map((row) => (
                      <UserTableRow
                        key={row.UID}
                        row={row}
                        userRoles={userRoles[row.UID] || []}
                        selected={table.selected.includes(row.UID)}
                        onSelectRow={() => table.onSelectRow(row.UID)}
                        onDeleteRow={() => handleDeleteRow(row.UID)}
                        editHref={paths.dashboard.users}
                      />
                    ))}

                  <TableEmptyRows
                    height={table.dense ? 56 : 56 + 20}
                    emptyRows={emptyRows(table.page, table.rowsPerPage, dataFiltered.length)}
                  />

                  <TableNoData notFound={notFound} />
                </TableBody>
              </Table>
            </Scrollbar>
          </Box>

          <TablePaginationCustom
            page={table.page}
            dense={table.dense}
            count={dataFiltered.length}
            rowsPerPage={table.rowsPerPage}
            onPageChange={table.onChangePage}
            onChangeDense={table.onChangeDense}
            onRowsPerPageChange={table.onChangeRowsPerPage}
          />
        </Card>
      </DashboardContent>

      {renderConfirmDialog()}
      
      <UserCreateForm
        open={createUserDialog.value}
        onClose={createUserDialog.onFalse}
        onSuccess={fetchUsers}
      />
    </>
  );
}

// ----------------------------------------------------------------------

function applyFilter({ inputData, comparator, filters, userRoles }) {
  const { name, status, role } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter((user) => 
      `${user.FIRSTNAME} ${user.LASTNAME}`.toLowerCase().includes(name.toLowerCase()) ||
      user.EMAIL.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (status !== 'all') {
    inputData = inputData.filter((user) => user.status === status);
  }

  if (role.length) {
    inputData = inputData.filter((user) => {
      const userRolesList = userRoles[user.UID] || [];
      return role.some(selectedRole => 
        userRolesList.some(userRole => userRole.ROLENAME === selectedRole)
      );
    });
  }

  return inputData;
} 