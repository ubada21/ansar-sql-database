import { useSetState } from 'minimal-shared/hooks';
import { useMemo, useEffect, useCallback } from 'react';

import axios, { endpoints } from 'src/lib/axios';

import { AuthContext } from '../auth-context';

export function AuthProvider({ children }) {
  const { state, setState } = useSetState({ user: null, loading: true });

const checkUserSession = useCallback(async () => {
  try {
    await axios.get(endpoints.auth.check_auth);
    const res = await axios.get(endpoints.auth.me);
    const { user } = res.data;
    setState({ user: { ...user }, loading: false });

  } catch (error) {
    if (error.response) {
      setState({ user: null, loading: false });
    } else if (error.request) {
      setState({ user: null, loading: false });
    } else {
      setState({ user: null, loading: false });
    }
  }
}, [setState]);

  useEffect(() => {
    checkUserSession();
  }, [checkUserSession]);

  const checkAuthenticated = state.user ? 'authenticated' : 'unauthenticated';

  const status = state.loading ? 'loading' : checkAuthenticated;

  const memoizedValue = useMemo(
    () => ({
      user: state.user ? { ...state.user, role: state.user?.role ?? 'Admin' } : null,
      checkUserSession,
      loading: status === 'loading',
      authenticated: status === 'authenticated',
      unauthenticated: status === 'unauthenticated',
    }),
    [checkUserSession, state.user, status]
  );

  return <AuthContext value={memoizedValue}>{children}</AuthContext>;
}
