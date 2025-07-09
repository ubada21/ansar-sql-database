
const rolePermissions = {
  Admin: ['modify_role', 'modify_course', 'modify_user', 'view_roles', 'assign_instructor'],
  Instructor: ['view_student_progress'],
  Student: ['enroll_course'],
  Donor: ['make_donation'],
  Parent: ['view_student_progress']
};

module.exports = { rolePermissions }

