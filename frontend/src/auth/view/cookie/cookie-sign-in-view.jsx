'use client';

import * as z from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { 
  Box, 
  Step, 
  Alert, 
  Stack, 
  Button, 
  Dialog, 
  Stepper, 
  StepLabel,
  Typography,
  DialogTitle,
  DialogContent
} from '@mui/material';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';

import { Form, RHFTextField } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

export default function CookieSignInView() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [resetStep, setResetStep] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const emailSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
  });

  const resetPasswordSchema = z.object({
    email: z.string().email('Please enter a valid email address'),
    otp: z.string().min(6, 'OTP must be 6 digits').max(6, 'OTP must be 6 digits'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

  const emailMethods = useForm({
    resolver: zodResolver(emailSchema),
    defaultValues: {
      email: '',
    },
  });

  const resetMethods = useForm({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      email: '',
      otp: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const {
    handleSubmit,
    reset,
  } = methods;

  const {
    handleSubmit: handleEmailSubmit,
    reset: resetEmailForm,
  } = emailMethods;

  const {
    handleSubmit: handleResetSubmit,
    reset: resetResetForm,
    formState: { errors: resetErrors },
  } = resetMethods;

  const checkAuth = useCallback(async () => {
    try {
      const response = await axios.get(endpoints.auth.check_auth);

      if (response.status === 200) {
        router.push('/dashboard');
      }
    } catch (err) {
      console.error('Auth check failed', err);
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const { checkUserSession } = useAuthContext();

  const onSubmit = handleSubmit(async (formData) => {
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(endpoints.auth.signIn, {
        email: formData.email,
        password: formData.password
      });

      reset();
      if (response.status === 200) {
        await checkUserSession();
        router.push('/dashboard');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  });

  const handleOpenResetDialog = () => {
    setResetDialogOpen(true);
    setResetStep(0);
    resetEmailForm();
    resetResetForm();
  };

  const handleCloseResetDialog = () => {
    setResetDialogOpen(false);
    setResetStep(0);
    resetEmailForm();
    resetResetForm();
  };

  const handleRequestOtp = handleEmailSubmit(async (data) => {
    setOtpLoading(true);
    try {
      const response = await axios.post(endpoints.auth.requestOtp, {
        email: data.email
      });

             if (response.status === 200) {
         setResetEmail(data.email);
         setResetStep(1);
         console.log('OTP sent successfully. Check console for OTP code.');
       }
     } catch (error) {
       console.error('OTP request error:', error);
       // Don't show error message to prevent email enumeration
       // Just show success message regardless
       setResetEmail(data.email);
       setResetStep(1);
       console.log('OTP sent successfully. Check console for OTP code.');
     } finally {
      setOtpLoading(false);
    }
  });

  const handleVerifyOtp = handleResetSubmit(async (data) => {
    setVerifyLoading(true);
    try {
      const response = await axios.post(endpoints.auth.verifyOtp, {
        email: resetEmail,
        otp: data.otp,
        newPassword: data.newPassword
      });

             if (response.status === 200) {
         setResetStep(2);
       }
    } catch (error) {
      console.error('OTP verification error:', error);
      // Show error message
      setErrorMessage(error.response?.data?.message || 'Invalid OTP or password reset failed');
    } finally {
      setVerifyLoading(false);
    }
  });

  const steps = ['Enter Email', 'Verify OTP', 'Success'];

  return (
    <>
      <Typography variant="h4" gutterBottom>
        Sign in to {CONFIG.appName}
      </Typography>

      <Alert severity="info" sx={{ mb: 3 }}>
        Use your registered email and password to sign in.
      </Alert>

      {errorMessage && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {errorMessage}
        </Alert>
      )}

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <RHFTextField name="email" label="Email address" />
          <RHFTextField name="password" label="Password" type="password" />
        </Stack>

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          variant="contained"
          loading={isLoading}
          sx={{ mt: 3 }}
        >
          Sign in
        </LoadingButton>

        <Button
          fullWidth
          variant="text"
          onClick={handleOpenResetDialog}
          sx={{ mt: 1 }}
        >
          Forgot Password?
        </Button>

        <Button
          fullWidth
          variant="text"
          component={RouterLink}
          href={paths.auth.cookie.signUp}
          sx={{ mt: 1 }}
        >
          Don&apos;t have an account? Sign up
        </Button>
      </Form>

      {/* Reset Password Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={handleCloseResetDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Reset Password
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Stepper activeStep={resetStep} sx={{ mb: 3 }}>
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>

            {resetStep === 0 && (
              <Form methods={emailMethods} onSubmit={handleRequestOtp}>
                <Stack spacing={3}>
                  <Typography variant="body2" color="text.secondary">
                    Enter your email address to receive a one-time password (OTP).
                  </Typography>
                  <RHFTextField 
                    name="email" 
                    label="Email address" 
                    type="email"
                    required
                  />
                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    loading={otpLoading}
                  >
                    Send OTP
                  </LoadingButton>
                </Stack>
              </Form>
            )}

            {resetStep === 1 && (
              <Form methods={resetMethods} onSubmit={handleVerifyOtp}>
                <Stack spacing={3}>
                  <Typography variant="body2" color="text.secondary">
                    Enter the OTP sent to {resetEmail} and your new password.
                  </Typography>
                  <Alert severity="info">
                    Check the console for the OTP code (for development purposes).
                  </Alert>
                  <RHFTextField 
                    name="otp" 
                    label="OTP Code" 
                    required
                    inputProps={{ maxLength: 6 }}
                  />
                  <RHFTextField 
                    name="newPassword" 
                    label="New Password" 
                    type="password"
                    required
                  />
                  <RHFTextField 
                    name="confirmPassword" 
                    label="Confirm New Password" 
                    type="password"
                    required
                  />
                  {resetErrors.confirmPassword && (
                    <Alert severity="error">
                      Passwords do not match
                    </Alert>
                  )}
                  <LoadingButton
                    fullWidth
                    type="submit"
                    variant="contained"
                    loading={verifyLoading}
                  >
                    Reset Password
                  </LoadingButton>
                </Stack>
              </Form>
            )}

            {resetStep === 2 && (
              <Box sx={{ textAlign: 'center', py: 2 }}>
                <Alert severity="success" sx={{ mb: 2 }}>
                  Password reset successful! You can now sign in with your new password.
                </Alert>
                <Button
                  variant="contained"
                  onClick={handleCloseResetDialog}
                >
                  Close
                </Button>
              </Box>
            )}
          </Box>
        </DialogContent>
      </Dialog>
    </>
  );
}

