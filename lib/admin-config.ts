/**
 * Admin Configuration
 * 
 * Hardcoded Clerk User IDs with admin/staff dashboard access.
 * All authenticated users have access to personal profile dashboard.
 * Only users listed here can access the admin/staff dashboard at /dashboard.
 */

export const ADMIN_USER_IDS = [
  // Add Clerk User IDs here for admin access
  // Example: 'user_2abc123xyz',
  
  // Your admin accounts:
  'user_36WUYYKdHBYeu5aIqfz6ljPbJWB',
  'user_36dLN2Vy4RNAbOzLUVnkU5hvwb1', // Staff Member
];

/**
 * Doctor User IDs - these will be checked against the doctors table in the database
 * This is just for quick role identification
 */
export const DOCTOR_USER_IDS: string[] = [
  // Doctor Clerk User IDs will be dynamically loaded from database
  // This array is for static/cached IDs if needed
];

/**
 * Check if a user has admin access
 * @param userId - Clerk User ID
 * @returns boolean - true if user is an admin
 */
export function isAdmin(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return ADMIN_USER_IDS.includes(userId);
}

/**
 * Check if a user is a doctor (should also check database)
 * @param userId - Clerk User ID
 * @returns boolean - true if user is a doctor
 */
export function isDoctor(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return DOCTOR_USER_IDS.includes(userId);
  // Note: In real implementation, this should also query the doctors table
}

/**
 * Check if user is admin or doctor
 */
export function isAdminOrDoctor(userId: string | null | undefined): boolean {
  return isAdmin(userId) || isDoctor(userId);
}

/**
 * Get admin role name (optional - for display purposes)
 * You can expand this to include role-based permissions
 */
export function getAdminRole(userId: string | null | undefined): string | null {
  if (!isAdmin(userId)) return null;
  
  // You can add role mapping here if needed
  // For now, all admins are "Staff"
  return "Staff";
}
