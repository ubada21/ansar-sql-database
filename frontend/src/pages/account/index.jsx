import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import axios from 'src/lib/axios';
import { CONFIG } from 'src/global-config';

import { UserProfileView } from 'src/sections/user/view';

import { useAuthContext } from 'src/auth/hooks';

const metadata = { title: `Profile | Account - ${CONFIG.appName}` };

export default function ProfilePage() {
  const router = useRouter()
  const { authenticated } = useAuthContext()
  const [user, setUser] = useState({})

  if (!authenticated) {
    router.push('/login');
  }

  const getProfileData = useCallback(async() => {
    try {
      const response = await axios.get('/profile');

      if (response.status === 200) {
        setUser(response.data.user)
      }
    } catch(err) {
      console.error('Error fetching profile data:', err);
    }
  }, []);

  const checkAuth = useCallback(async() => {
    try {
      if (authenticated) {
        await getProfileData()
      } else {
        router.push('/login')
      }
    } catch(err) {
      console.error('Error checking auth:', err);
    }
  }, [authenticated, router, getProfileData]);

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  return (
    <>
      <title>{metadata.title}</title>

      <UserProfileView user={user} />
    </>
  );
}
