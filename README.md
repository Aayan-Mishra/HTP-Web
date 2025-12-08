# Hometown Pharmacy Platform 🏥

A modern, full-stack pharmacy management platform built with Next.js 15, Clerk Auth, Supabase, and TailwindCSS.

## Features

### Public Customer Portal (Unauthenticated)
- 🔍 **Medicine Search** - Search medicines with real-time stock availability
- 📦 **Order Requests** - Place medicine orders for pickup
- 👥 **Membership Management** - Check membership status and renew
- 💊 **Stock Availability** - Real-time inventory checking

### Internal Staff Dashboard (Authenticated)
- 📊 **Inventory Management** - CRUD operations for medicines and batches
- 📋 **Order Processing** - Approve/reject customer orders with automatic stock updates
- 👥 **Membership Management** - Manage customer memberships
- ⚠️ **Alerts** - Low stock and expiry date warnings
- 📈 **Analytics** - Quick stats and insights

## Tech Stack

- **Framework**: Next.js 15 (App Router, Server Components)
- **Authentication**: Clerk (replacing Supabase Auth)
- **Database**: Supabase Postgres with Row Level Security
- **Styling**: TailwindCSS with custom medical theme
- **UI Components**: shadcn/ui + Radix UI
- **Fonts**: Inter (body), Poppins (headings)
- **Type Safety**: TypeScript throughout

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Clerk Authentication

1. Create a Clerk account at [clerk.com](https://clerk.com)
2. Create a new application
3. Copy your API keys from the Clerk dashboard
4. Create a `.env.local` file:

```bash
cp .env.example .env.local
```

5. Update `.env.local` with your Clerk keys:

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx
```

### 3. Set Up Supabase Database

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Copy your project URL and keys
4. Update `.env.local` with Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

5. Run the database schema:
   - Go to Supabase SQL Editor
   - Copy and paste the contents of `/supabase/schema.sql`
   - Execute the SQL to create all tables, views, and functions

### 4. Configure Staff Access

To grant dashboard access to a user:

1. The user must sign up via Clerk at `/sign-up`
2. Add their email to the `staff_roles` table in Supabase:

```sql
INSERT INTO staff_roles (email, role, full_name)
VALUES ('user@example.com', 'admin', 'John Doe');
```

Available roles:
- `admin` - Full access to all features
- `staff` - Limited access (can't delete or modify critical data)

### 5. Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Project Structure

```
HTP-Web/
├── app/
│   ├── (public routes)
│   │   ├── page.tsx              # Homepage
│   │   ├── search/               # Medicine search
│   │   ├── order/                # Order requests
│   │   └── membership/           # Membership portal
│   ├── (auth routes)
│   │   ├── sign-in/              # Clerk sign-in
│   │   └── sign-up/              # Clerk sign-up
│   ├── dashboard/                # Staff dashboard (protected)
│   ├── layout.tsx                # Root layout with ClerkProvider
│   └── globals.css               # Global styles + medical theme
├── components/
│   └── ui/                       # shadcn/ui components
├── lib/
│   ├── supabase/                 # Supabase clients & types
│   ├── services/                 # SMS/Email services (mock)
│   └── utils.ts                  # Utility functions
├── supabase/
│   ├── schema.sql                # Complete database schema
│   └── functions/                # Edge Functions (stubs)
├── middleware.ts                 # Clerk route protection
└── tailwind.config.ts            # Tailwind + theme config
```

## Database Schema

### Core Tables

- **medicines** - Medicine catalog with generic/brand names
- **batches** - Batch tracking with expiry dates
- **inventory** - Real-time stock levels with low-stock alerts
- **order_requests** - Customer order submissions
- **memberships** - Customer membership records
- **staff_roles** - Staff authentication & role mapping

### Views & Functions

- `low_stock_view` - Automated low stock alerts
- `expiry_alerts` - Medicines expiring within 30 days
- `search_medicines()` - Full-text search RPC
- `process_order_approval()` - Automatic stock decrement on order approval

## Authentication Flow

1. **Public Access** - Anyone can search medicines, place orders, check membership
2. **Staff Login** - Staff use Clerk authentication at `/sign-in`
3. **Authorization** - Dashboard checks Clerk user email against `staff_roles` table
4. **Role-Based Access** - Admin vs. Staff permissions enforced in UI and API

## Edge Functions (Stubs)

Ready for future API integration:

- `send-sms-notification` - SMS alerts (Twilio/MSG91)
- `send-membership-renewal-receipt` - Email/SMS receipts
- `send-order-ready-message` - Order pickup notifications
- `sync-supplier-data` - Supplier inventory sync

Replace mock implementations in `/lib/services/` with real API clients.

## Development Notes

### Color Theme

Medical-focused green palette:
- Primary: `hsl(168, 76%, 36%)` - Teal Green
- Accent: `hsl(168, 76%, 42%)` - Lighter Teal
- Border Radius: `0.75rem` - Soft, approachable

### Fonts

- **Poppins** - Headings (300-700 weights)
- **Inter** - Body text

### TypeScript

All database types are in `/lib/supabase/supabaseTypes.ts` - manually synced with schema.

## Deployment

### Vercel (Recommended)

1. Push to GitHub
2. Import project in Vercel
3. Add environment variables from `.env.local`
4. Deploy

### Environment Variables Checklist

- ✅ Clerk keys
- ✅ Supabase URL + keys
- ✅ (Optional) SMS provider keys
- ✅ (Optional) Email provider keys

## Support

For issues or questions:
- Check Supabase logs for database errors
- Check Clerk dashboard for auth issues
- Review browser console for client-side errors

## License

MIT License - feel free to use for your pharmacy business!

---

Built with ❤️ for hometown pharmacies everywhere
