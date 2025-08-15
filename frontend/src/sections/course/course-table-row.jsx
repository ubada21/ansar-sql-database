import { useState, useCallback } from 'react';

import { Box, Link, Tooltip, TableRow, TableCell, IconButton } from '@mui/material';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { CourseQuickEditForm } from './course-quick-edit-form';

// ----------------------------------------------------------------------

export function CourseTableRow({
  row,
  selected,
  onSelectRow,
  onDeleteRow,
  onEditRow,
  onViewRow,
  onQuickEdit,
  editHref,
  onViewDetails,
  onManageEnrollment,
}) {
  const [quickEditOpen, setQuickEditOpen] = useState(false);
  const { COURSEID, TITLE, LOCATION, STARTDATE, ENDDATE } = row;

  const handleConfirmDelete = useCallback(() => {
    onDeleteRow();
  }, [onDeleteRow]);

  // Calculate course status based on dates
  const getCourseStatus = () => {
    const now = new Date();
    const startDate = new Date(STARTDATE);
    const endDate = new Date(ENDDATE);
    
    if (startDate > now) {
      return { label: 'Upcoming', color: 'info' };
    } else if (startDate <= now && endDate >= now) {
      return { label: 'Ongoing', color: 'success' };
    } else {
      return { label: 'Completed', color: 'default' };
    }
  };

  const status = getCourseStatus();

  return (
    <>
      <TableRow hover selected={selected}>
        <TableCell padding="checkbox">
          <IconButton
            color={selected ? 'primary' : 'default'}
            onClick={() => onSelectRow(COURSEID)}
          >
            <Iconify icon={selected ? 'eva:checkmark-circle-2-fill' : 'eva:radio-button-off-fill'} />
          </IconButton>
        </TableCell>

        <TableCell>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                <Link
                  component="button"
                  variant="body1"
                  onClick={() => onViewDetails(COURSEID)}
                  sx={{
                    color: 'primary.main',
                    textDecoration: 'none',
                    '&:hover': {
                      textDecoration: 'underline',
                    },
                    cursor: 'pointer',
                    border: 'none',
                    background: 'none',
                    padding: 0,
                    font: 'inherit',
                  }}
                >
                  {TITLE}
                </Link>
              </div>
              <div style={{ fontSize: '12px', color: '#666' }}>
                ID: {COURSEID}
              </div>
            </div>
          </div>
        </TableCell>

        <TableCell>
          <div style={{ fontSize: '14px' }}>
            {LOCATION}
          </div>
        </TableCell>

        <TableCell>
          <div style={{ fontSize: '14px' }}>
            {new Date(STARTDATE).toLocaleDateString()}
          </div>
        </TableCell>

        <TableCell>
          <div style={{ fontSize: '14px' }}>
            {new Date(ENDDATE).toLocaleDateString()}
          </div>
        </TableCell>

        <TableCell>
          <Label variant="soft" color={status.color}>
            {status.label}
          </Label>
        </TableCell>

        <TableCell align="right">
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Manage Enrollments" placement="top" arrow>
              <IconButton
                color="primary"
                onClick={() => onManageEnrollment(row)}
              >
                <Iconify icon="mdi:account-group" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Quick edit" placement="top" arrow>
              <IconButton
                color={quickEditOpen ? 'inherit' : 'default'}
                onClick={() => setQuickEditOpen(true)}
              >
                <Iconify icon="solar:pen-bold" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Delete course">
              <IconButton 
                color="error"
                onClick={handleConfirmDelete}
              >
                <Iconify icon="solar:trash-bin-trash-bold" />
              </IconButton>
            </Tooltip>
          </Box>
        </TableCell>
      </TableRow>

      <CourseQuickEditForm
        currentCourse={row}
        open={quickEditOpen}
        onClose={() => setQuickEditOpen(false)}
      />
    </>
  );
} 