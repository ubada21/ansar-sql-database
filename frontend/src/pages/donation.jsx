import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import {
  Box,
  Card,
  Stack,
  Alert,
  Button,
  Select,
  Dialog,
  Divider,
  MenuItem,
  Backdrop,
  TextField,
  Typography,
  InputLabel,
  IconButton,
  FormControl,
  DialogTitle,
  DialogContent,
  InputAdornment,
  CircularProgress,
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { CustomBreadcrumbs } from 'src/components/custom-breadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

// ----------------------------------------------------------------------

const metadata = { title: `Donate | ${CONFIG.appName}` };

const donationSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  amount: z.number().min(1, 'Amount must be at least $1'),
  method: z.string().min(1, 'Please select a payment method'),
  address: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postalCode: z.string().optional(),
  notes: z.string().optional(),
});

const provinces = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

const paymentMethods = [
  'Credit Card',
  'Debit Card',
  'Bank Transfer',
  'PayPal',
  'Cash',
  'Check'
];

export default function DonationPage() {
  const router = useRouter();
  const { authenticated, user } = useAuthContext();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(donationSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      amount: '',
      method: '',
      address: '',
      city: '',
      province: '',
      postalCode: '',
      notes: '',
    },
  });

  const watchedProvince = watch('province');

  // Pre-fill form with user data if logged in
  useEffect(() => {
    if (authenticated && user) {
      setValue('email', user.EMAIL || '');
      setValue('firstName', user.FIRSTNAME || '');
      setValue('lastName', user.LASTNAME || '');
      setValue('address', user.ADDRESS || '');
      setValue('city', user.CITY || '');
      setValue('province', user.PROVINCE || '');
      setValue('postalCode', user.POSTALCODE || '');
    }
  }, [authenticated, user, setValue]);

  const onSubmit = async (data) => {
    setLoading(true);
    setError('');
    
    try {
      // Generate a unique receipt number
      const receiptNumber = `RCP-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure we have the required data, especially for logged-in users
      const donationData = {
        EMAIL: data.email || user?.EMAIL,
        FIRSTNAME: data.firstName || user?.FIRSTNAME,
        LASTNAME: data.lastName || user?.LASTNAME,
        AMOUNT: data.amount,
        METHOD: data.method,
        ADDRESS: data.address || user?.ADDRESS || null,
        CITY: data.city || user?.CITY || null,
        PROVINCE: data.province || user?.PROVINCE || null,
        POSTALCODE: data.postalCode || user?.POSTALCODE || null,
        NOTES: data.notes || null,
        RECEIPT_NUMBER: receiptNumber,
        DONOR_ID: authenticated && user ? user.UID : null,
      };

      await axios.post(endpoints.transactions.create, donationData);
      
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      console.error('Error submitting donation:', err);
      setError('There was an error processing your donation. Please try again.');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (authenticated) {
      router.push(paths.dashboard.root);
    } else {
      router.push('/');
    }
  };

  const handleMakeAnotherDonation = () => {
    setSuccess(false);
    setValue('amount', '');
    setValue('method', '');
    setValue('notes', '');
  };

  // If user is authenticated, show with dashboard layout
  if (authenticated) {
    return (
      <>
        <title>{metadata.title}</title>
        <DashboardContent maxWidth="lg">
          <CustomBreadcrumbs
            heading="Support Our Mission"
            links={[
              { name: 'Dashboard', href: paths.dashboard.root },
              { name: 'Donate' },
            ]}
            action={
              <Button
                variant="outlined"
                onClick={handleClose}
                startIcon={<Iconify icon="eva:arrow-back-fill" />}
              >
                Back to Dashboard
              </Button>
            }
            sx={{ mb: { xs: 3, md: 5 } }}
          />

          {success ? (
            <Box sx={{ py: 4 }}>
              <Card sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h4" color="success.main" gutterBottom>
                  Thank You for Your Donation!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your generous contribution will help support our educational programs and community initiatives.
                </Typography>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your donation has been successfully processed. You will receive a confirmation email shortly.
                </Alert>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleMakeAnotherDonation}
                  >
                    Make Another Donation
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                    startIcon={<Iconify icon="eva:arrow-back-fill" />}
                  >
                    Back to Dashboard
                  </Button>
                </Stack>
              </Card>
            </Box>
          ) : (
            <DonationForm 
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              errors={errors}
              loading={loading}
              isSubmitting={isSubmitting}
              error={error}
              authenticated={authenticated}
              router={router}
              provinces={provinces}
              paymentMethods={paymentMethods}
              watchedProvince={watchedProvince}
            />
          )}
        </DashboardContent>
      </>
    );
  }

  // If user is not authenticated, show as modal overlay
  return (
    <>
      <title>{metadata.title}</title>
      <Backdrop
        sx={{ 
          color: '#fff', 
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: 'rgba(0, 0, 0, 0.8)'
        }}
        open
      >
        <Dialog
          open
          maxWidth="md"
          fullWidth
          PaperProps={{
            sx: {
              borderRadius: 2,
              maxHeight: '90vh',
              overflow: 'auto'
            }
          }}
        >
          <DialogTitle sx={{ pb: 1 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="h5" component="div">
                Support Our Mission
              </Typography>
              <IconButton
                onClick={handleClose}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify icon="eva:close-fill" />
              </IconButton>
            </Box>
          </DialogTitle>

          <DialogContent sx={{ pt: 2 }}>
            {success ? (
              <Box sx={{ py: 2, textAlign: 'center' }}>
                <Typography variant="h5" color="success.main" gutterBottom>
                  Thank You for Your Donation!
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                  Your generous contribution will help support our educational programs and community initiatives.
                </Typography>
                <Alert severity="success" sx={{ mb: 3 }}>
                  Your donation has been successfully processed. You will receive a confirmation email shortly.
                </Alert>
                <Stack direction="row" spacing={2} justifyContent="center">
                  <Button
                    variant="contained"
                    onClick={handleMakeAnotherDonation}
                  >
                    Make Another Donation
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={handleClose}
                  >
                    Close
                  </Button>
                </Stack>
              </Box>
            ) : (
              <DonationForm 
                register={register}
                handleSubmit={handleSubmit}
                onSubmit={onSubmit}
                errors={errors}
                loading={loading}
                isSubmitting={isSubmitting}
                error={error}
                authenticated={authenticated}
                router={router}
                provinces={provinces}
                paymentMethods={paymentMethods}
                watchedProvince={watchedProvince}
              />
            )}
          </DialogContent>
        </Dialog>
      </Backdrop>
    </>
  );
}

// Separate component for the donation form to avoid code duplication
function DonationForm({
  register,
  handleSubmit,
  onSubmit,
  errors,
  loading,
  isSubmitting,
  error,
  authenticated,
  router,
  provinces: provincesList,
  paymentMethods: paymentMethodsList,
  watchedProvince
}) {
  return (
    <Box>
      <Typography variant="h6" textAlign="center" color="text.secondary" sx={{ mb: 4 }}>
        Your donation helps us provide quality Islamic education and community services
      </Typography>

      <Card sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom>
          Make a Donation
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          {authenticated 
            ? 'Thank you for being a registered user. Your information has been pre-filled for your convenience.'
            : 'Please provide your information below. You can also create an account to save your details for future donations.'
          }
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack spacing={3}>
            {/* Personal Information */}
            <Typography variant="h6" gutterBottom>
              Personal Information
            </Typography>
            
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="First Name"
                {...register('firstName')}
                error={!!errors.firstName}
                helperText={errors.firstName?.message}
                InputProps={{
                  readOnly: authenticated,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-readOnly': {
                    backgroundColor: authenticated ? 'action.hover' : 'transparent',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Last Name"
                {...register('lastName')}
                error={!!errors.lastName}
                helperText={errors.lastName?.message}
                InputProps={{
                  readOnly: authenticated,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-readOnly': {
                    backgroundColor: authenticated ? 'action.hover' : 'transparent',
                  },
                }}
              />
            </Stack>

            <TextField
              fullWidth
              label="Email Address"
              type="email"
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              InputProps={{
                readOnly: authenticated,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: authenticated ? 'action.hover' : 'transparent',
                },
              }}
            />

            {/* Donation Details */}
            <Divider />
            <Typography variant="h6" gutterBottom>
              Donation Details
            </Typography>

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="Amount"
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                {...register('amount', { valueAsNumber: true })}
                error={!!errors.amount}
                helperText={errors.amount?.message}
              />
              <FormControl fullWidth error={!!errors.method}>
                <InputLabel>Payment Method</InputLabel>
                <Select
                  label="Payment Method"
                  {...register('method')}
                  error={!!errors.method}
                >
                  {paymentMethodsList.map((method) => (
                    <MenuItem key={method} value={method}>
                      {method}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              fullWidth
              label="Notes (Optional)"
              multiline
              rows={3}
              placeholder="Any additional comments or special instructions..."
              {...register('notes')}
              error={!!errors.notes}
              helperText={errors.notes?.message}
            />

            {/* Address Information */}
            <Divider />
            <Typography variant="h6" gutterBottom>
              Address Information (Optional)
            </Typography>

            <TextField
              fullWidth
              label="Address"
              {...register('address')}
              error={!!errors.address}
              helperText={errors.address?.message}
              InputProps={{
                readOnly: authenticated,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: authenticated ? 'action.hover' : 'transparent',
                },
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                fullWidth
                label="City"
                {...register('city')}
                error={!!errors.city}
                helperText={errors.city?.message}
                InputProps={{
                  readOnly: authenticated,
                }}
                sx={{
                  '& .MuiInputBase-input.Mui-readOnly': {
                    backgroundColor: authenticated ? 'action.hover' : 'transparent',
                  },
                }}
              />
              <FormControl fullWidth error={!!errors.province}>
                <InputLabel>Province</InputLabel>
                <Select
                  label="Province"
                  {...register('province')}
                  error={!!errors.province}
                  disabled={authenticated}
                  value={watchedProvince || ''}
                >
                  {provincesList.map((province) => (
                    <MenuItem key={province} value={province}>
                      {province}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Stack>

            <TextField
              fullWidth
              label="Postal Code"
              {...register('postalCode')}
              error={!!errors.postalCode}
              helperText={errors.postalCode?.message}
              InputProps={{
                readOnly: authenticated,
              }}
              sx={{
                '& .MuiInputBase-input.Mui-readOnly': {
                  backgroundColor: authenticated ? 'action.hover' : 'transparent',
                },
              }}
            />

            {/* Submit Button */}
            <Divider />
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              {!authenticated && (
                <Button
                  variant="outlined"
                  onClick={() => router.push('/login')}
                >
                  Sign In
                </Button>
              )}
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading || isSubmitting}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? 'Processing...' : 'Complete Donation'}
              </Button>
            </Stack>
          </Stack>
        </form>
      </Card>

      {/* Additional Information */}
      <Card sx={{ p: 4, mt: 4 }}>
        <Typography variant="h6" gutterBottom>
          About Your Donation
        </Typography>
        <Stack spacing={2}>
          <Typography variant="body2" color="text.secondary">
            • All donations are tax-deductible and you will receive a receipt for your records
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • Your information is kept secure and will only be used for donation processing
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • For questions about your donation, please contact us at donations@example.com
          </Typography>
        </Stack>
      </Card>
    </Box>
  );
}
