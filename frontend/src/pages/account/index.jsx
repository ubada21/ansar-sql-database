import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';

import { UserProfileView } from 'src/sections/user/view';

import { useAuthContext } from 'src/auth/hooks';

import config from '../../config.js'

const API_URL = config.API_URL

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
      const response = await fetch(API_URL + '/profile', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include'
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
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
