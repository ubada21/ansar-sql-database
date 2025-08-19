import axios, { endpoints } from 'src/lib/axios';

import { setSession } from './utils';
import { COOKIE_STORAGE_KEY } from './constant';

// ----------------------------------------------------------------------

/** **************************************
 * Sign in
 *************************************** */
export const signInWithPassword = async ({ email, password }) => {
  try {
    const params = { email, password };

    await axios.post(endpoints.auth.signIn, params);

  } catch (error) {
    console.error('Error during sign in:', error);
    throw error;
  }
};

/** **************************************
 * Sign up
 *************************************** */
export const signUp = async ({ email, password, firstName, lastName }) => {
  const params = {
    email,
    password,
    firstName,
    lastName,
  };

  try {
    const res = await axios.post(endpoints.auth.signUp, params);

    const { accessToken } = res.data;

    if (!accessToken) {
      throw new Error('Access token not found in response');
    }

    sessionStorage.setItem(COOKIE_STORAGE_KEY, accessToken);
  } catch (error) {
    console.error('Error during sign up:', error);
    throw error;
  }
};

/** **************************************
 * Sign out
 *************************************** */
export const signOut = async () => {
  try {
    // Call the logout API endpoint to clear the server-side cookie
    await axios.post(endpoints.auth.signOut);
    
    // Clear any local session data
    await setSession(null);
  } catch (error) {
    console.error('Error during sign out:', error);
    // Even if the API call fails, clear local session
    await setSession(null);
    throw error;
  }
};
