'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';

import { LoadingButton } from '@mui/lab';
import { Alert, Stack, Typography } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import axios, { endpoints } from 'src/lib/axios';

import { Form, RHFTextField } from 'src/components/hook-form';

import { useAuthContext } from 'src/auth/hooks';

export default function JwtSignInView() {
  const router = useRouter();

  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const methods = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    reset,
  } = methods;





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
      </Form>
    </>
  );
}

