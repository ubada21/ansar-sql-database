const ROOTS = {
  AUTH: '/auth',
  DASHBOARD: '/dashboard',
  PROFILE: '/account'
};

export const paths = {
  faqs: '/faqs',
  minimalStore: 'https://mui.com/store/items/minimal-dashboard/',
  login: '/login',
  register: '/register',
  auth: {
    jwt: {
      signIn: `${ROOTS.AUTH}/jwt/sign-in`,
      signUp: `${ROOTS.AUTH}/jwt/sign-up`,
    },
    auth0: {
      signIn: `${ROOTS.AUTH}/auth0/sign-in`,
    },
    amplify: {
      signIn: `${ROOTS.AUTH}/amplify/sign-in`,
      verify: `${ROOTS.AUTH}/amplify/verify`,
      signUp: `${ROOTS.AUTH}/amplify/sign-up`,
      updatePassword: `${ROOTS.AUTH}/amplify/update-password`,
      resetPassword: `${ROOTS.AUTH}/amplify/reset-password`,
    },
    firebase: {
      signIn: `${ROOTS.AUTH}/firebase/sign-in`,
      verify: `${ROOTS.AUTH}/firebase/verify`,
      signUp: `${ROOTS.AUTH}/firebase/sign-up`,
      resetPassword: `${ROOTS.AUTH}/firebase/reset-password`,
    },
    supabase: {
      signIn: `${ROOTS.AUTH}/supabase/sign-in`,
      verify: `${ROOTS.AUTH}/supabase/verify`,
      signUp: `${ROOTS.AUTH}/supabase/sign-up`,
      updatePassword: `${ROOTS.AUTH}/supabase/update-password`,
      resetPassword: `${ROOTS.AUTH}/supabase/reset-password`,
    },
  },
  dashboard: {
    root: ROOTS.DASHBOARD,
    users: `${ROOTS.DASHBOARD}/users`,
    roles: `${ROOTS.DASHBOARD}/roles`,
    courses: `${ROOTS.DASHBOARD}/courses`,
    transactions: `${ROOTS.DASHBOARD}/transactions`,
    user: {
      root: `${ROOTS.DASHBOARD}/user`,
      list: `${ROOTS.DASHBOARD}/user/list`,
      new: `${ROOTS.DASHBOARD}/user/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/user/${id}/edit`,
    },
    course: {
      root: `${ROOTS.DASHBOARD}/course`,
      list: `${ROOTS.DASHBOARD}/course/list`,
      new: `${ROOTS.DASHBOARD}/course/new`,
      edit: (id) => `${ROOTS.DASHBOARD}/course/${id}/edit`,
    },
    student: {
      courses: `${ROOTS.DASHBOARD}/student/courses`,
      schedule: `${ROOTS.DASHBOARD}/student/schedule`,
      grades: `${ROOTS.DASHBOARD}/student/grades`,
      profile: `${ROOTS.DASHBOARD}/student/profile`,
    },
    instructor: {
      courses: `${ROOTS.DASHBOARD}/instructor/courses`,
      students: `${ROOTS.DASHBOARD}/instructor/students`,
      grades: `${ROOTS.DASHBOARD}/instructor/grades`,
      schedule: `${ROOTS.DASHBOARD}/instructor/schedule`,
    },
    parent: {
      children: `${ROOTS.DASHBOARD}/parent/children`,
      progress: `${ROOTS.DASHBOARD}/parent/progress`,
      payments: `${ROOTS.DASHBOARD}/parent/payments`,
    },
    donor: {
      donations: `${ROOTS.DASHBOARD}/donor/donations`,
      impact: `${ROOTS.DASHBOARD}/donor/impact`,
      profile: `${ROOTS.DASHBOARD}/donor/profile`,
    },
    group: {
      root: `${ROOTS.DASHBOARD}/group`,
      five: `${ROOTS.DASHBOARD}/group/five`,
      six: `${ROOTS.DASHBOARD}/group/six`,
    },
  },
  account: {
    root: ROOTS.PROFILE,
  },
};
