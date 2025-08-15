import { useState, useEffect, useCallback } from 'react';

import { Box, Tab, Card, Tabs, Table, Button, TableBody, IconButton } from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { toast } from 'src/components/snackbar';
import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';
import { ConfirmDialog, CourseDetailsDialog } from 'src/components/custom-dialog';
import {
  useTable,
  emptyRows,
  TableNoData,
  getComparator,
  TableEmptyRows,
  TableHeadCustom,
  TableSelectedAction,
  TablePaginationCustom,
} from 'src/components/table';

import { useAuthContext } from 'src/auth/hooks';

import { CourseTableRow } from '../course-table-row';
import { CourseTableToolbar } from '../course-table-toolbar';
import { CourseEnrollmentDialog } from '../course-enrollment-dialog';
import { CourseTableFiltersResult } from '../course-table-filters-result';

const metadata = { title: `Courses | Dashboard - ${CONFIG.appName}` };

const COURSE_STATUS_OPTIONS = [
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'ongoing', label: 'Ongoing' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_OPTIONS = [{ value: 'all', label: 'All' }, ...COURSE_STATUS_OPTIONS];

export default function CourseListView() {
  const router = useRouter();
  const { authenticated } = useAuthContext();

  const table = useTable();

  const [tableData, setTableData] = useState([]);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    name: '',
    location: ['all'],
    status: 'all',
  });

  const [openConfirm, setOpenConfirm] = useState(false);

  const [openDetails, setOpenDetails] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  const [openEnrollment, setOpenEnrollment] = useState(false);
  const [selectedCourseForEnrollment, setSelectedCourseForEnrollment] = useState(null);

  const dataFiltered = applyFilter({
    inputData: tableData,
    comparator: getComparator(table.order, table.orderBy),
    filters,
  });

  const canReset = filters.name !== '' || (filters.location.length > 0 && !filters.location.includes('all')) || filters.status !== 'all';

  const notFound = (!dataFiltered.length && canReset) || !dataFiltered.length;

  const handleFilters = useCallback(
    (name, value) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    },
    [table]
  );

  const handleResetFilters = useCallback(() => {
    table.onResetPage();
    setFilters({
      name: '',
      location: ['all'],
      status: 'all',
    });
  }, [table]);

  const handleRemoveLocation = useCallback(
    (locationToRemove) => {
      table.onResetPage();
      const newLocations = filters.location.filter((item) => item !== locationToRemove);
      
      if (newLocations.length === 0) {
        setFilters((prevState) => ({
          ...prevState,
          location: ['all'],
        }));
      } else {
        setFilters((prevState) => ({
          ...prevState,
          location: newLocations,
        }));
      }
    },
    [table, filters.location]
  );

  const handleFilterStatus = useCallback(
    (event, newValue) => {
      table.onResetPage();
      setFilters((prevState) => ({
        ...prevState,
        status: newValue,
      }));
    },
    [table]
  );

  const handleOpenConfirm = useCallback(() => {
    setOpenConfirm(true);
  }, []);

  const handleCloseConfirm = useCallback(() => {
    setOpenConfirm(false);
  }, []);

  const handleViewDetails = useCallback((courseId) => {
    setSelectedCourseId(courseId);
    setOpenDetails(true);
  }, []);

  const handleCloseDetails = useCallback(() => {
    setSelectedCourseId(null);
    setOpenDetails(false);
  }, []);

  const handleOpenEnrollment = useCallback((course) => {
    setSelectedCourseForEnrollment(course);
    setOpenEnrollment(true);
  }, []);

  const handleCloseEnrollment = useCallback(() => {
    setSelectedCourseForEnrollment(null);
    setOpenEnrollment(false);
  }, []);

  const handleDeleteRow = useCallback(
    async (courseId) => {
      try {
        await axios.delete(endpoints.courses.details(courseId));
        
        const deleteRow = tableData.filter((row) => row.COURSEID !== courseId);
        
        setTableData(deleteRow);

        table.onUpdatePageDeleteRow(dataFiltered.length);

        toast.success('Delete success!');
      } catch (error) {
        console.error('Error deleting course:', error);
        toast.error('Delete failed!');
      }
    },
    [tableData, dataFiltered.length, table]
  );

  const handleDeleteRows = useCallback(async () => {
    try {
      const deleteRows = tableData.filter((row) => !table.selected.includes(row.COURSEID));
      
      for (const courseId of table.selected) {
        await axios.delete(endpoints.courses.details(courseId));
      }
      
      setTableData(deleteRows);

      table.onUpdatePageDeleteRows(dataFiltered.length, dataFiltered.length);

      handleCloseConfirm();

      toast.success('Delete success!');
    } catch (error) {
      console.error('Error deleting courses:', error);
      toast.error('Delete failed!');
    }
  }, [tableData, dataFiltered.length, table, handleCloseConfirm]);

  const handleEditRow = useCallback(
    (courseId) => {
      router.push(paths.dashboard.courses + `/${courseId}/edit`);
    },
    [router]
  );

  const handleViewRow = useCallback(
    (courseId) => {
      router.push(paths.dashboard.courses + `/${courseId}`);
    },
    [router]
  );

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const response = await axios.get(endpoints.courses.list);
      setTableData(response.data.courses || []);
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      fetchCourses();
    }
  }, [authenticated, fetchCourses]);

  if (!authenticated) {
    router.push('/login');
    return null;
  }

  if (loading) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="xl">
          <div>Loading courses...</div>
        </DashboardContent>
      </>
    );
  }

  return (
    <>
      <title>{metadata.title}</title>

      <DashboardContent maxWidth="xl">
        <CustomBreadcrumbs
          heading="Courses List"
          links={[
            { name: 'Dashboard', href: paths.dashboard.root },
            { name: 'Courses', href: paths.dashboard.courses },
            { name: 'List' },
          ]}
          action={
            <Button
              component={RouterLink}
              href={paths.dashboard.course.new}
              variant="contained"
              startIcon={<Iconify icon="mingcute:add-line" />}
            >
              New Course
            </Button>
          }
          sx={{
            mb: { xs: 3, md: 5 },
          }}
        />

        <Card>
          <Tabs
            value={filters.status}
            onChange={handleFilterStatus}
            sx={[
              (theme) => ({
                px: { md: 2.5 },
                boxShadow: `inset 0 -2px 0 0 ${theme.vars.palette.divider}`,
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
                      ((tab.value === 'all' || tab.value === filters.status) && 'filled') ||
                      'soft'
                    }
                    color={
                      (tab.value === 'upcoming' && 'primary') ||
                      (tab.value === 'ongoing' && 'success') ||
                      (tab.value === 'completed' && 'warning') ||
                      'default'
                    }
                  >
                    {tab.value === 'all' ? tableData.length : 
                     tableData.filter((course) => {
                       const now = new Date();
                       const startDate = new Date(course.STARTDATE);
                       const endDate = new Date(course.ENDDATE);
                       
                       if (tab.value === 'upcoming') return startDate > now;
                       if (tab.value === 'ongoing') return startDate <= now && endDate >= now;
                       if (tab.value === 'completed') return endDate < now;
                       return false;
                     }).length}
                  </Label>
                }
              />
            ))}
          </Tabs>

          <CourseTableToolbar
            filters={filters}
            onFilters={handleFilters}
            locationOptions={[...new Set(tableData.map((course) => course.LOCATION))]}
            onResetFilters={handleResetFilters}
            onDeleteRows={handleOpenConfirm}
            selected={table.selected}
          />

          {canReset && (
            <CourseTableFiltersResult
              filters={filters}
              onResetFilters={handleResetFilters}
              onRemoveLocation={handleRemoveLocation}
              results={dataFiltered.length}
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
                  dataFiltered.map((row) => row.COURSEID)
                )
              }
              action={
                <IconButton color="primary" onClick={handleOpenConfirm}>
                  <Iconify icon="solar:trash-bin-trash-bold" />
                </IconButton>
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
                      dataFiltered.map((row) => row.COURSEID)
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
                      <CourseTableRow
                        key={row.COURSEID}
                        row={row}
                        selected={table.selected.includes(row.COURSEID)}
                        onSelectRow={() => table.onSelectRow(row.COURSEID)}
                        onDeleteRow={() => handleDeleteRow(row.COURSEID)}
                        onEditRow={() => handleEditRow(row.COURSEID)}
                        onViewRow={() => handleViewRow(row.COURSEID)}
                        onViewDetails={handleViewDetails}
                        onManageEnrollment={() => handleOpenEnrollment(row)}
                        onQuickEdit={() => {}}
                        editHref={paths.dashboard.courses}
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

      <ConfirmDialog
        open={openConfirm}
        onClose={handleCloseConfirm}
        title="Delete"
        content={
          <>
            Are you sure want to delete <strong>{table.selected.length}</strong> items?
          </>
        }
        action={
          <Button variant="contained" color="error" onClick={handleDeleteRows}>
            Delete
          </Button>
        }
      />

      <CourseDetailsDialog
        open={openDetails}
        onClose={handleCloseDetails}
        courseId={selectedCourseId}
      />

      <CourseEnrollmentDialog
        open={openEnrollment}
        onClose={handleCloseEnrollment}
        course={selectedCourseForEnrollment}
      />
    </>
  );
}

function applyFilter({ inputData, comparator, filters }) {
  const { name, location, status } = filters;

  const stabilizedThis = inputData.map((el, index) => [el, index]);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (name) {
    inputData = inputData.filter(
      (course) => course.TITLE.toLowerCase().indexOf(name.toLowerCase()) !== -1
    );
  }

  if (location.length && !location.includes('all')) {
    inputData = inputData.filter((course) => {
      const matches = location.includes(course.LOCATION);
      return matches;
    });
  }

  if (status !== 'all') {
    const now = new Date();
    inputData = inputData.filter((course) => {
      const startDate = new Date(course.STARTDATE);
      const endDate = new Date(course.ENDDATE);
      
      let matches = false;
      if (status === 'upcoming') {
        matches = startDate > now;
      } else if (status === 'ongoing') {
        matches = startDate <= now && endDate >= now;
      } else if (status === 'completed') {
        matches = endDate < now;
      }
      
      return matches;
    });
  }

  return inputData;
}

const TABLE_HEAD = [
  { id: 'TITLE', label: 'Course Title' },
  { id: 'LOCATION', label: 'Location' },
  { id: 'STARTDATE', label: 'Start Date' },
  { id: 'ENDDATE', label: 'End Date' },
  { id: 'STATUS', label: 'Status' },
  { id: '', width: 88 },
]; 