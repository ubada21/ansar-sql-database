import { useSetState } from 'minimal-shared/hooks';
import { useEffect, useMemo, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';

// ----------------------------------------------------------------------

/**
 * NOTE:
 * We only build demo at basic level.
 * Customer will need to do some extra handling yourself if you want to extend the logic and other features...
 */

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

const checkUserSession = useCallback(async () => {
  try {
    console.log('Starting auth check...');
    await axios.get(endpoints.auth.check_auth);
    console.log('Auth check successful, getting user data...');
    const res = await axios.get(endpoints.auth.me);
    console.log('User data received:', res.data);
    const { user } = res.data;
    setState({ user: { ...user }, loading: false });

  } catch (error) {
    if (error.response) {
      console.log('Server error:', error.response.status);
      setState({ user: null, loading: false });
    } else if (error.request) {
      console.log('Network error:', error.message);
      setState({ user: null, loading: false });
    } else {
      console.log('Error:', error.message);
      setState({ user: null, loading: false });
    }
  }
}, [setState]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  // ----------------------------------------------------------------------

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
