import axios from 'axios';

import { CONFIG } from 'src/global-config';

// create axios instance
const axiosInstance = axios.create({
  baseURL: CONFIG.API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // send cookies with requests
});


// catches all API errors and provides consistent response.
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

export const endpoints = {
  chat: '/chat',
  kanban: '/kanban',
  calendar: '/calendar',
  auth: {
    me: '/profile',
    signIn: '/login',
    signUp: '/register',
    check_auth: '/check-auth',
    signOut: '/logout',
    requestOtp: '/request-otp',
    verifyOtp: '/verify-otp',
  },
  courses: {
    list: '/courses',
    details: (id) => `/courses/${id}`,
    instructors: (id) => `/courses/${id}/instructors`,
    students: (id) => `/courses/${id}/students`,
    schedule: (id) => `/courses/${id}/schedule`,
    enroll: (courseId, userId) => `/courses/${courseId}/students/${userId}`,
    removeStudent: (courseId, userId) => `/courses/${courseId}/students/${userId}`,
    updateEnrollment: (courseId, userId) => `/courses/${courseId}/students/${userId}`,
  },
  users: {
    list: '/users',
    details: (id) => `/users/${id}`,
    roles: (id) => `/users/${id}/roles`
  },
  roles: {
    list: '/roles',
    details: (id) => `/roles/${id}`,
    byName: (name) => `/roles/name/${name}`,
  },
  transactions: {
    list: '/transactions',
    details: (id) => `/transactions/${id}`,
    create: '/transactions',
  },
  mail: {
    list: '/mail/list',
    details: '/mail/details',
    labels: '/mail/labels',
  },
  post: {
    list: '/post/list',
    details: '/post/details',
    latest: '/post/latest',
    search: '/post/search',
  },
  product: {
    list: '/product/list',
    details: '/product/details',
    search: '/product/search',
  },
};
