# Clerk + Supabase Setup Guide

This guide explains how to integrate Clerk authentication with the Supabase database for the Hometown Pharmacy platform.

## Why Clerk + Supabase?

- **Clerk**: Modern authentication UI, social logins, user management
- **Supabase**: Powerful Postgres database with real-time capabilities
- **Best of Both**: Clerk handles auth UI/UX, Supabase handles business data

## Architecture

```
User Sign In (Clerk) 
  ↓
Clerk provides userId + email
  ↓
Match email with staff_roles table (Supabase)
  ↓
Grant/Deny dashboard access based on role
```

## Setup Steps

### 1. Create Clerk Application

1. Go to [dashboard.clerk.com](https://dashboard.clerk.com)
2. Click "Add application"
3. Name it "Hometown Pharmacy"
4. Choose authentication options:
   - ✅ Email + Password
   - ✅ Google (optional)
   - ✅ Microsoft (optional for healthcare orgs)
5. Click "Create application"

### 2. Configure Clerk Settings

#### API Keys
1. In Clerk Dashboard → API Keys
2. Copy the values:
   ```
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
   CLERK_SECRET_KEY=sk_test_...
   ```
3. Add to your `.env.local` file

#### Paths
The middleware is already configured, but verify in Clerk Dashboard → Paths:
- Sign-in URL: `/sign-in`
- Sign-up URL: `/sign-up`
- After sign-in: `/dashboard`
- After sign-up: `/dashboard`

#### Appearance (Optional)
Customize the Clerk UI to match the medical theme:

1. Go to Clerk Dashboard → Customization → Appearance
2. Set primary color: `#2d9f8f` (teal green)
3. Upload pharmacy logo (optional)

### 3. Set Up Supabase Database

#### Run Schema
1. Go to Supabase Dashboard → SQL Editor
2. Copy contents of `/supabase/schema.sql`
3. Click "Run" to create all tables

#### Verify Tables
Check that these tables exist:
- medicines
- batches
- inventory
- order_requests
- memberships
- **staff_roles** ← Important for auth!

### 4. Grant Staff Access

To allow a user to access the dashboard:

#### Method 1: Manual SQL Insert
```sql
-- Add a staff member
INSERT INTO staff_roles (email, role, full_name)
VALUES ('john@pharmacy.com', 'admin', 'John Doe');

-- Add multiple staff
INSERT INTO staff_roles (email, role, full_name)
VALUES 
  ('jane@pharmacy.com', 'staff', 'Jane Smith'),
  ('admin@pharmacy.com', 'admin', 'Admin User');
```

#### Method 2: Via Supabase Dashboard
1. Go to Table Editor → staff_roles
2. Click "Insert row"
3. Fill in:
   - email: User's Clerk email
   - role: `admin` or `staff`
   - full_name: Display name
4. Save

### 5. User Registration Flow

#### For Staff Members:

1. **Admin creates staff record in Supabase**:
   ```sql
   INSERT INTO staff_roles (email, role, full_name)
   VALUES ('newstaff@pharmacy.com', 'staff', 'New Staff');
   ```

2. **Staff member signs up via Clerk**:
   - Visit `/sign-up`
   - Enter same email address
   - Complete Clerk registration

3. **Dashboard checks authorization**:
   - Clerk provides authenticated user email
   - System checks `staff_roles` table
   - If match found → Access granted
   - If no match → Shows unauthorized message

## Staff Roles Explained

### `admin` Role
- Full access to all dashboard features
- Can delete medicines, batches, orders
- Can manage other staff (future feature)
- Sees all analytics

### `staff` Role
- Can view inventory
- Can process orders
- Can manage memberships
- Cannot delete critical data

## Testing the Integration

### 1. Create Test Staff Account

```sql
-- In Supabase SQL Editor
INSERT INTO staff_roles (email, role, full_name)
VALUES ('test@example.com', 'admin', 'Test Admin');
```

### 2. Sign Up in Clerk

1. Run `npm run dev`
2. Go to `/sign-up`
3. Register with `test@example.com`
4. Complete the verification process

### 3. Access Dashboard

1. After signup, you'll be redirected to `/dashboard`
2. You should see the staff dashboard with all features
3. Try navigating different sections

### 4. Test Unauthorized Access

1. Sign up with a different email (not in `staff_roles`)
2. Try to access `/dashboard`
3. Should see "Unauthorized" message

## Common Issues & Solutions

### Issue: "Unauthorized" message even with correct email

**Solution**: 
1. Check Supabase staff_roles table:
   ```sql
   SELECT * FROM staff_roles WHERE email = 'your@email.com';
   ```
2. Ensure email matches exactly (case-sensitive)
3. Check Clerk dashboard for user's actual email

### Issue: Redirect loop on sign-in

**Solution**:
1. Verify `.env.local` has:
   ```
   NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
   ```
2. Clear browser cookies
3. Restart dev server

### Issue: Can't see Clerk sign-in component

**Solution**:
1. Run `npm install` to ensure `@clerk/nextjs` is installed
2. Check for JavaScript errors in console
3. Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` is set

### Issue: Database connection errors

**Solution**:
1. Verify Supabase keys in `.env.local`
2. Check Supabase project is not paused
3. Verify RLS policies are created (from schema.sql)

## Security Best Practices

### ✅ Do's
- Always add staff to `staff_roles` table before they sign up
- Use `admin` role sparingly (only for trusted users)
- Enable Clerk's email verification
- Use Row Level Security (RLS) in Supabase

### ❌ Don'ts
- Don't commit `.env.local` to git
- Don't share Clerk secret key
- Don't store sensitive data in public tables
- Don't give admin access to all staff

## Production Checklist

Before deploying to production:

- [ ] Enable Clerk production instance
- [ ] Set up custom domain in Clerk
- [ ] Configure Clerk email templates with pharmacy branding
- [ ] Set up Supabase production project
- [ ] Run schema.sql in production database
- [ ] Add all staff emails to production staff_roles
- [ ] Test sign-up and dashboard access
- [ ] Configure Clerk session duration
- [ ] Set up Clerk webhooks (optional, for user sync)
- [ ] Enable Clerk MFA for admin accounts

## Advanced: Clerk Webhooks (Optional)

Auto-sync Clerk users to Supabase:

### 1. Create Webhook Endpoint

```typescript
// app/api/webhooks/clerk/route.ts
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;
  
  if (!WEBHOOK_SECRET) {
    throw new Error('Missing CLERK_WEBHOOK_SECRET');
  }

  const headerPayload = headers();
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: Missing headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  const evt = wh.verify(body, {
    'svix-id': svix_id,
    'svix-timestamp': svix_timestamp,
    'svix-signature': svix_signature,
  });

  const { type, data } = evt;

  if (type === 'user.created') {
    const email = data.email_addresses[0]?.email_address;
    
    // Check if email exists in staff_roles
    const supabase = await createClient();
    const { data: staffRole } = await supabase
      .from('staff_roles')
      .select('*')
      .eq('email', email)
      .single();

    // Optionally update staff_roles with Clerk user ID
    if (staffRole) {
      await supabase
        .from('staff_roles')
        .update({ clerk_user_id: data.id })
        .eq('email', email);
    }
  }

  return new Response('OK', { status: 200 });
}
```

### 2. Configure in Clerk

1. Clerk Dashboard → Webhooks
2. Add endpoint: `https://your-domain.com/api/webhooks/clerk`
3. Subscribe to `user.created` event
4. Copy webhook secret to `.env.local`:
   ```
   CLERK_WEBHOOK_SECRET=whsec_...
   ```

## Need Help?

- **Clerk Docs**: [clerk.com/docs](https://clerk.com/docs)
- **Supabase Docs**: [supabase.com/docs](https://supabase.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)

---

Happy coding! 🚀
