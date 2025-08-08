import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

export function ProfileHome({ user, sx, ...other }) {

  const renderUserInfo = () => (
    <Card sx={{ py: 3, textAlign: 'center', typography: 'h4' }}>
      <Stack
        divider={<Divider orientation="vertical" flexItem sx={{ borderStyle: 'dashed' }} />}
        sx={{ flexDirection: 'row' }}
      >
        <Stack sx={{ width: 1 }}>
          <Typography variant="h4">{user?.UID || 'N/A'}</Typography>
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            User ID
          </Box>
        </Stack>

        <Stack sx={{ width: 1 }}>
          <Typography variant="h4">{user?.EMAIL ? 'Active' : 'Inactive'}</Typography>
          <Box component="span" sx={{ color: 'text.secondary', typography: 'body2' }}>
            Status
          </Box>
        </Stack>
      </Stack>
    </Card>
  );

  const renderAbout = () => (
    <Card>
      <CardHeader title="About" />

      <Box
        sx={{
          p: 3,
          gap: 2,
          display: 'flex',
          typography: 'body2',
          flexDirection: 'column',
        }}
      >
        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:user-id-bold" />
          <span>
            <strong>Name:</strong> {user?.FIRSTNAME} {user?.LASTNAME}
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:letter-bold" />
          <span>
            <strong>Email:</strong> {user?.EMAIL || 'N/A'}
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:phone-bold" />
          <span>
            <strong>Phone:</strong> {user?.PHONENUMBER || 'N/A'}
          </span>
        </Box>

        <Box sx={{ gap: 2, display: 'flex', lineHeight: '24px' }}>
          <Iconify width={24} icon="solar:calendar-bold" />
          <span>
            <strong>Created:</strong> {user?.CREATED_AT ? new Date(user.CREATED_AT).toLocaleDateString() : 'N/A'}
          </span>
        </Box>
      </Box>
    </Card>
  );

  const renderUserData = () => (
    <Card>
      <CardHeader title="User Data" />

      <Box sx={{ p: 3 }}>
        <Typography variant="body2" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
          {JSON.stringify(user, null, 2)}
        </Typography>
      </Box>
    </Card>
  );

  return (
    <Grid container spacing={3} sx={sx} {...other}>
      <Grid size={{ xs: 12, md: 4 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {renderUserInfo()}
        {renderAbout()}
      </Grid>

      <Grid size={{ xs: 12, md: 8 }} sx={{ gap: 3, display: 'flex', flexDirection: 'column' }}>
        {renderUserData()}
      </Grid>
    </Grid>
  );
} 