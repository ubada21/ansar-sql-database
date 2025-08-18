import { paths } from 'src/routes/paths';

import { CONFIG } from 'src/global-config';

import { Label } from 'src/components/label';
import { SvgColor } from 'src/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name) => <SvgColor src={`${CONFIG.assetsDir}/assets/icons/navbar/${name}.svg`} />;

const ICONS = {
  job: icon('ic-job'),
  blog: icon('ic-blog'),
  chat: icon('ic-chat'),
  mail: icon('ic-mail'),
  user: icon('ic-user'),
  file: icon('ic-file'),
  lock: icon('ic-lock'),
  tour: icon('ic-tour'),
  order: icon('ic-order'),
  label: icon('ic-label'),
  blank: icon('ic-blank'),
  kanban: icon('ic-kanban'),
  folder: icon('ic-folder'),
  course: icon('ic-course'),
  params: icon('ic-params'),
  banking: icon('ic-banking'),
  booking: icon('ic-booking'),
  invoice: icon('ic-invoice'),
  product: icon('ic-product'),
  calendar: icon('ic-calendar'),
  disabled: icon('ic-disabled'),
  external: icon('ic-external'),
  subpaths: icon('ic-subpaths'),
  menuItem: icon('ic-menu-item'),
  ecommerce: icon('ic-ecommerce'),
  analytics: icon('ic-analytics'),
  dashboard: icon('ic-dashboard'),
};

// ----------------------------------------------------------------------

// Admin Navigation
const adminNavData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
  {
    subheader: 'Support',
    items: [
      {
        title: 'Donate',
        path: '/donate',
        icon: ICONS.banking,
        externalLink: true,
      },
    ],
  },
  {
    subheader: 'Management',
    items: [
      {
        title: 'Users',
        path: paths.dashboard.users,
        icon: ICONS.user,
      },
      {
        title: 'Roles',
        path: paths.dashboard.roles,
        icon: ICONS.lock,
      },
      {
        title: 'Courses',
        path: paths.dashboard.courses,
        icon: ICONS.course,
      },
      {
        title: 'Transactions',
        path: paths.dashboard.transactions,
        icon: ICONS.banking,
      },
    ],
  },
];

// Student Navigation
const studentNavData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
  {
    subheader: 'Support',
    items: [
      {
        title: 'Donate',
        path: '/donate',
        icon: ICONS.banking,
        externalLink: true,
      },
    ],
  },
  {
    subheader: 'My Learning',
    items: [
      {
        title: 'My Courses',
        path: paths.dashboard.student.courses,
        icon: ICONS.course,
      },
      {
        title: 'Schedule',
        path: paths.dashboard.student.schedule,
        icon: ICONS.calendar,
      },
      {
        title: 'Grades',
        path: paths.dashboard.student.grades,
        icon: ICONS.file,
      },
      {
        title: 'Profile',
        path: paths.dashboard.student.profile,
        icon: ICONS.user,
      },
    ],
  },
];

// Instructor Navigation
const instructorNavData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
  {
    subheader: 'Support',
    items: [
      {
        title: 'Donate',
        path: '/donate',
        icon: ICONS.banking,
        externalLink: true,
      },
    ],
  },
  {
    subheader: 'Teaching',
    items: [
      {
        title: 'My Courses',
        path: paths.dashboard.instructor.courses,
        icon: ICONS.course,
      },
      {
        title: 'Students',
        path: paths.dashboard.instructor.students,
        icon: ICONS.user,
      },
      {
        title: 'Grades',
        path: paths.dashboard.instructor.grades,
        icon: ICONS.file,
      },
    ],
  },
];

// Parent Navigation
const parentNavData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
  {
    subheader: 'Support',
    items: [
      {
        title: 'Donate',
        path: '/donate',
        icon: ICONS.banking,
        externalLink: true,
      },
    ],
  },
  {
    subheader: 'Children',
    items: [
      {
        title: 'My Children',
        path: paths.dashboard.parent.children,
        icon: ICONS.user,
      },
      {
        title: 'Progress',
        path: paths.dashboard.parent.progress,
        icon: ICONS.analytics,
      },
      {
        title: 'Payments',
        path: paths.dashboard.parent.payments,
        icon: ICONS.banking,
      },
    ],
  },
];

// Donor Navigation
const donorNavData = [
  {
    subheader: 'Overview',
    items: [
      {
        title: 'Dashboard',
        path: paths.dashboard.root,
        icon: ICONS.dashboard,
        info: <Label>v{CONFIG.appVersion}</Label>,
      },
    ],
  },
  {
    subheader: 'Support',
    items: [
      {
        title: 'Donate',
        path: '/donate',
        icon: ICONS.banking,
        externalLink: true,
      },
    ],
  },
  {
    subheader: 'Donations',
    items: [
      {
        title: 'My Donations',
        path: paths.dashboard.donor.donations,
        icon: ICONS.banking,
      },
      {
        title: 'Impact',
        path: paths.dashboard.donor.impact,
        icon: ICONS.analytics,
      },
      {
        title: 'Profile',
        path: paths.dashboard.donor.profile,
        icon: ICONS.user,
      },
    ],
  },
];

// Function to get navigation data based on user role
export const getNavDataByRole = (userRole) => {
  switch (userRole) {
    case 'Student':
      return studentNavData;
    case 'Instructor':
      return instructorNavData;
    case 'Parent':
      return parentNavData;
    case 'Donor':
      return donorNavData;
    case 'Admin':
    default:
      return adminNavData;
  }
};

// Default export for backward compatibility
export const navData = adminNavData;
