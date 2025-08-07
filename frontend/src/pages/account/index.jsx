import { useState, useEffect, useCallback } from 'react';

import { useRouter } from 'src/routes/hooks';

import { CONFIG } from 'src/global-config';
import { DashboardContent } from 'src/layouts/dashboard';

import { useAuthContext } from 'src/auth/hooks';

import config from '../../config.js'

const API_URL = config.API_URL
// ----------------------------------------------------------------------

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
        credentials: 'include' // need this so the server knows who to look for, if a user is logged in, it will send the uid along with the profile request
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user) //set User state to the data returned by the api call,m which should be the user
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

      <DashboardContent maxWidth="xl">

        <h1>Profile Page</h1>
      <p>{JSON.stringify(user)}</p>

      </DashboardContent>
    </>
  );
}
