# Quick Start Commands

## Initial Setup

```bash
# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Edit .env.local with your Clerk and Supabase keys
nano .env.local  # or use your preferred editor
```

## Development

```bash
# Run development server
npm run dev

# Open in browser
# → http://localhost:3000
```

## First-Time Setup Checklist

### 1. Clerk Setup
- [ ] Create account at clerk.com
- [ ] Create new application
- [ ] Copy API keys to .env.local
- [ ] Verify paths: /sign-in, /sign-up

### 2. Supabase Setup
- [ ] Create account at supabase.com
- [ ] Create new project
- [ ] Copy URL and keys to .env.local
- [ ] Run schema.sql in SQL Editor

### 3. Grant Staff Access
```sql
-- In Supabase SQL Editor, add your admin account:
INSERT INTO staff_roles (email, role, full_name)
VALUES ('your-email@example.com', 'admin', 'Your Name');
```

### 4. Test the Platform

1. **Public Pages** (no auth required):
   - Homepage: http://localhost:3000
   - Search: http://localhost:3000/search
   - Order: http://localhost:3000/order
   - Membership: http://localhost:3000/membership

2. **Staff Registration**:
   - Sign up: http://localhost:3000/sign-up
   - Use the email you added to staff_roles

3. **Staff Dashboard** (requires auth):
   - Dashboard: http://localhost:3000/dashboard
   - Should redirect to sign-in if not logged in

## Common Commands

```bash
# Install new package
npm install <package-name>

# Type checking
npm run build

# Lint code
npm run lint

# Format with Prettier (if configured)
npm run format
```

## Environment Variables Required

```env
# Clerk (get from dashboard.clerk.com)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Supabase (get from supabase.com dashboard)
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# URLs (already configured)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Troubleshooting

### Error: Missing environment variables
```bash
# Make sure .env.local exists
ls -la .env.local

# Make sure it has all required variables
cat .env.local
```

### Error: Module not found
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Database connection errors
1. Check Supabase project is active (not paused)
2. Verify keys in .env.local are correct
3. Make sure schema.sql was run successfully

### Clerk auth not working
1. Verify publishable key starts with `pk_test_`
2. Check Clerk dashboard for application status
3. Clear browser cookies and try again

## Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables in Vercel dashboard
# → Settings → Environment Variables
```

## Project URLs (Development)

- Homepage: http://localhost:3000
- Medicine Search: http://localhost:3000/search
- Place Order: http://localhost:3000/order
- Membership: http://localhost:3000/membership
- Staff Sign In: http://localhost:3000/sign-in
- Staff Sign Up: http://localhost:3000/sign-up
- Staff Dashboard: http://localhost:3000/dashboard

## Getting Help

- Read [README.md](./README.md) for full documentation
- Read [CLERK_SETUP.md](./CLERK_SETUP.md) for auth setup
- Check database schema in [supabase/schema.sql](./supabase/schema.sql)
- Review example environment in [.env.example](./.env.example)

---

**Need help?** Check the documentation files or review the code comments!
