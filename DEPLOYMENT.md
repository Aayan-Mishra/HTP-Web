# Production Deployment Checklist

## Pre-Deployment Setup

### 1. Clerk Production Setup
- [ ] Create production Clerk application (not test mode)
- [ ] Configure custom domain (e.g., `accounts.hometownpharmacy.com`)
- [ ] Customize email templates with pharmacy branding
- [ ] Set up social login providers (Google, Microsoft if needed)
- [ ] Enable two-factor authentication for admin accounts
- [ ] Configure session duration (recommended: 7 days)
- [ ] Set up Clerk webhooks (optional, for user sync)
- [ ] Copy production API keys

### 2. Supabase Production Setup
- [ ] Create production Supabase project
- [ ] Choose appropriate region (closest to users)
- [ ] Upgrade to Pro plan (recommended for production)
- [ ] Run `schema.sql` in production SQL editor
- [ ] Optionally run `sample-data.sql` for initial data
- [ ] Set up automated backups (daily recommended)
- [ ] Configure database connection pooling
- [ ] Review and test RLS policies
- [ ] Copy production API keys

### 3. Environment Variables
Create production `.env.local` (or configure in Vercel):

```env
# Clerk Production
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_xxxxx
CLERK_SECRET_KEY=sk_live_xxxxx

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard

# Supabase Production
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=xxxxx
SUPABASE_SERVICE_ROLE_KEY=xxxxx

# Application
NEXT_PUBLIC_APP_NAME="Hometown Pharmacy"
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Optional: SMS Provider (when ready)
# SMS_PROVIDER_API_KEY=
# SMS_PROVIDER_SENDER_ID=

# Optional: Email Provider (when ready)
# EMAIL_PROVIDER_API_KEY=
```

## Deployment to Vercel

### Method 1: Via GitHub (Recommended)

1. **Push to GitHub**
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Hometown Pharmacy Platform"
   git branch -M main
   git remote add origin https://github.com/yourusername/hometown-pharmacy.git
   git push -u origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables**
   - In Vercel dashboard → Settings → Environment Variables
   - Add all variables from your `.env.local`
   - Important: Use production Clerk and Supabase keys!

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Vercel will provide your production URL

### Method 2: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod

# Add environment variables
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
vercel env add CLERK_SECRET_KEY
# ... add all other variables
```

## Post-Deployment Configuration

### 1. Update Clerk Settings
- [ ] Add production domain to Clerk allowed origins
- [ ] Update redirect URLs to production domain
- [ ] Test sign-in/sign-up on production

### 2. Add Staff Accounts
Connect to production Supabase and run:

```sql
-- Add your pharmacy staff
INSERT INTO staff_roles (email, role, full_name) VALUES
('owner@pharmacy.com', 'admin', 'Pharmacy Owner'),
('manager@pharmacy.com', 'admin', 'Pharmacy Manager'),
('staff1@pharmacy.com', 'staff', 'Staff Member 1'),
('staff2@pharmacy.com', 'staff', 'Staff Member 2');
```

### 3. Configure Custom Domain (Optional)

In Vercel:
- Settings → Domains → Add Domain
- Add your custom domain (e.g., `hometownpharmacy.com`)
- Update DNS records as instructed
- Enable HTTPS (automatic)

In Clerk:
- Update allowed origins with custom domain
- Update `NEXT_PUBLIC_APP_URL` in environment variables

### 4. Performance Optimization

- [ ] Enable Vercel Analytics
- [ ] Enable Vercel Speed Insights
- [ ] Configure caching headers
- [ ] Optimize images (already using Next.js Image)
- [ ] Set up monitoring and error tracking

## Security Checklist

### Critical Security Items
- [ ] All environment variables are secret (not committed to git)
- [ ] Clerk secret key is never exposed to client
- [ ] Supabase service role key is never exposed to client
- [ ] RLS policies are enabled on all tables
- [ ] CORS is properly configured in Supabase
- [ ] Clerk email verification is enabled
- [ ] Rate limiting is configured (Vercel Pro feature)

### Recommended Security Enhancements
- [ ] Enable Clerk MFA for admin accounts
- [ ] Set up IP allowlisting in Supabase (optional)
- [ ] Configure Content Security Policy (CSP)
- [ ] Enable Vercel firewall rules (Enterprise)
- [ ] Set up security headers

## Testing Checklist

Test all critical flows on production:

### Public Routes
- [ ] Homepage loads correctly with medical theme
- [ ] Medicine search works
- [ ] Order form submits successfully
- [ ] Membership lookup works

### Authentication
- [ ] Sign-up flow works
- [ ] Sign-in flow works
- [ ] Sign-out works
- [ ] Email verification works (if enabled)
- [ ] Unauthorized users can't access dashboard

### Dashboard (Staff)
- [ ] Dashboard loads for authorized users
- [ ] Inventory management works
- [ ] Order processing works
- [ ] Membership management works
- [ ] Stats display correctly

## Monitoring & Maintenance

### Set Up Monitoring

1. **Vercel Analytics**
   - Enable in Vercel dashboard
   - Monitor page views, performance

2. **Supabase Monitoring**
   - Monitor database CPU/Memory
   - Track API request count
   - Review slow queries

3. **Clerk Analytics**
   - Monitor sign-ups and sign-ins
   - Track authentication errors

### Regular Maintenance Tasks

**Daily:**
- [ ] Check for failed orders
- [ ] Monitor low stock alerts
- [ ] Review expiry alerts

**Weekly:**
- [ ] Review user sign-ups
- [ ] Check database backups
- [ ] Monitor error logs

**Monthly:**
- [ ] Review staff access
- [ ] Update medicine inventory
- [ ] Check expired memberships

## Rollback Plan

If deployment fails or issues arise:

1. **Revert in Vercel**
   - Go to Deployments
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Database Rollback**
   - Supabase automatically creates backups
   - Go to Settings → Database → Backups
   - Restore from backup if needed

3. **Emergency Contacts**
   - Vercel Support: support@vercel.com
   - Supabase Support: support@supabase.com
   - Clerk Support: support@clerk.com

## Cost Estimation

### Vercel
- Hobby (Free): Good for testing, limited bandwidth
- Pro ($20/month): Recommended for small pharmacy
- Features: Custom domain, analytics, more bandwidth

### Supabase
- Free tier: Good for testing, limited to 500MB database
- Pro ($25/month): Recommended for production
- Features: Automated backups, more resources, support

### Clerk
- Free tier: Up to 10,000 MAUs (Monthly Active Users)
- Pro ($25/month): More MAUs, advanced features
- Usually free tier is sufficient for single pharmacy

**Estimated Monthly Cost: $45-70** (Vercel Pro + Supabase Pro + Clerk Free)

## Launch Checklist

Final checks before announcing:

- [ ] All features tested on production
- [ ] Staff trained on dashboard usage
- [ ] Customer-facing pages reviewed
- [ ] Contact information updated
- [ ] Privacy policy added (if collecting customer data)
- [ ] Terms of service added (if needed)
- [ ] Pharmacy license/certification displayed
- [ ] Social media links added (optional)
- [ ] Google Analytics configured (optional)
- [ ] SEO metadata optimized

## Post-Launch

### Week 1
- [ ] Monitor error logs daily
- [ ] Gather user feedback
- [ ] Fix critical bugs immediately
- [ ] Document common issues

### Month 1
- [ ] Review analytics
- [ ] Optimize slow pages
- [ ] Add requested features
- [ ] Improve documentation

### Ongoing
- [ ] Regular security updates
- [ ] Database optimization
- [ ] Feature enhancements based on feedback
- [ ] Staff training updates

---

## Need Help During Deployment?

- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs
- **Clerk Docs**: https://clerk.com/docs
- **Next.js Docs**: https://nextjs.org/docs

---

**Good luck with your deployment! 🚀**
