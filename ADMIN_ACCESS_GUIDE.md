# Admin Access Configuration Guide

## Overview
All authenticated users have access to their personal profile dashboard. Only specific users with hardcoded Clerk User IDs can access the staff/admin dashboard at `/dashboard`.

## How to Configure Admin Access

### 1. Get Clerk User ID

After a user signs up, you need to get their Clerk User ID:

**Option A: From Clerk Dashboard**
1. Go to your Clerk Dashboard: https://dashboard.clerk.com
2. Navigate to "Users" section
3. Click on the user you want to make an admin
4. Copy their User ID (starts with `user_`)

**Option B: From Your App**
1. Have the user sign in to your app
2. Temporarily add this to any page to display their ID:
   ```tsx
   import { auth } from "@clerk/nextjs/server";
   
   const { userId } = await auth();
   console.log("User ID:", userId); // Check server logs
   ```

### 2. Add User ID to Admin Config

Open `/lib/admin-config.ts` and add the user's Clerk ID to the `ADMIN_USER_IDS` array:

```typescript
export const ADMIN_USER_IDS = [
  'user_2abc123xyz',      // John Doe - Pharmacist
  'user_3def456uvw',      // Jane Smith - Manager
  // Add more admin user IDs here
];
```

### 3. Test Access

1. Sign in as the admin user
2. Navigate to `/dashboard`
3. You should see the staff portal instead of the access restricted message

## User Access Levels

### Regular Users (Default)
- ✅ Can create account and sign in
- ✅ Can access `/profile` (personal dashboard)
- ✅ Can place orders at `/order`
- ✅ Can search medicines at `/search`
- ✅ Can link memberships
- ❌ **Cannot** access `/dashboard` (staff portal)

### Admin/Staff Users (Configured)
- ✅ All regular user permissions
- ✅ Can access `/dashboard` (staff portal)
- ✅ Can view all orders at `/dashboard/orders`
- ✅ Can verify pickup codes at `/dashboard/verify`
- ✅ Can manage inventory (future)
- ✅ Can manage memberships (future)

## Security Notes

- Admin access is controlled server-side, not client-side
- User IDs are checked on every dashboard page load
- Non-admin users see a friendly "Access Restricted" message
- Removing a user ID from the array immediately revokes their admin access

## Example Configuration

Here's a complete example of configuring multiple admins:

```typescript
// /lib/admin-config.ts

export const ADMIN_USER_IDS = [
  // Main Pharmacist
  'user_2NNEqL2nrYPKPfXsm8RhQtw4',
  
  // Manager
  'user_2NNEqL2nrYPKPfXsm8RhQtw5',
  
  // Assistant Pharmacist
  'user_2NNEqL2nrYPKPfXsm8RhQtw6',
];
```

## Future Enhancements

You can extend this system to support role-based permissions:

```typescript
export const ADMIN_ROLES = {
  'user_123': 'pharmacist',    // Full access
  'user_456': 'manager',       // Orders + Inventory
  'user_789': 'assistant',     // Orders only
};

export function getUserRole(userId: string): string | null {
  return ADMIN_ROLES[userId] || null;
}
```

Then update dashboard pages to check specific roles:
```typescript
const userRole = getUserRole(userId);
if (userRole !== 'pharmacist' && userRole !== 'manager') {
  // Restrict access to certain features
}
```

## Troubleshooting

**Problem**: User still can't access dashboard after adding ID
- **Solution**: Make sure you copied the complete User ID including `user_` prefix
- **Solution**: Restart your Next.js dev server after modifying the config file
- **Solution**: Check for typos in the User ID

**Problem**: How do I remove admin access?
- **Solution**: Simply delete their User ID from the `ADMIN_USER_IDS` array

**Problem**: Can I add admins without redeploying?
- **Solution**: Not with the current hardcoded approach. For dynamic role management, you'd need to create a database table for admin roles

## Production Deployment

When deploying to production:

1. Update `/lib/admin-config.ts` with production admin User IDs
2. Commit and push changes
3. Redeploy your application
4. Verify admin access works in production

**Important**: Never commit test/development User IDs to production!
