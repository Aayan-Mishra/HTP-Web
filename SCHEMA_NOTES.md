# Database Schema Notes

## ✅ Final Schema Updates Complete

The SQL schema has been finalized with the following key updates:

### 1. **Clerk Authentication Integration**
- ✅ Removed all `auth.users` foreign key references
- ✅ `staff_roles.user_id` replaced with `clerk_user_id` (VARCHAR, nullable)
- ✅ Email-based staff matching (Clerk email → staff_roles.email)
- ✅ RLS policies simplified (enforcement moved to application layer)

### 2. **Membership Tiers Added**
- ✅ New ENUM: `membership_tier` with values: `bronze`, `silver`, `gold`
- ✅ `memberships` table now includes `tier` column
- ✅ Default tier: `bronze`
- ✅ Sample data includes all three tiers:
  - Bronze: 10% discount
  - Silver: 15% discount  
  - Gold: 20% discount

### 3. **Medicines Table Structure**
- ✅ Changed from `name` + `generic_name` to `generic_name` + `brand_name`
- ✅ Removed `unit_price` (pricing now per-batch in `batches.selling_price`)
- ✅ Updated search function to return `latest_batch_price`

### 4. **Batches Table Enhancement**
- ✅ Added `selling_price` column (alongside `cost_price`)
- ✅ Allows different pricing per batch
- ✅ Supports price changes over time

### 5. **Views Updated**
- ✅ `low_stock_view`: Returns both `generic_name` and `brand_name`
- ✅ `expiry_alerts`: Returns both `generic_name` and `brand_name`
- ✅ Both views use `COALESCE(brand_name, generic_name)` for display

### 6. **Functions Updated**
- ✅ `search_medicines()`: Returns `generic_name`, `brand_name`, `latest_batch_price`
- ✅ `process_order_approval()`: Uses `staff_clerk_id` (VARCHAR) instead of UUID

## Database Structure

### Tables (6 total)
1. **medicines** - Medicine catalog
2. **batches** - Batch tracking with pricing
3. **inventory** - Stock levels
4. **order_requests** - Customer orders
5. **memberships** - Customer memberships with tiers
6. **staff_roles** - Staff access control (Clerk-based)

### ENUMS (4 total)
- `order_status`: pending, approved, rejected, ready, completed
- `membership_status`: active, expired, cancelled
- `membership_tier`: bronze, silver, gold ⭐ NEW
- `staff_role`: staff, admin

### Views (2 total)
- `low_stock_view` - Auto-detect low inventory
- `expiry_alerts` - Medicines expiring within 90 days

### Functions (2 total)
- `search_medicines(search_term)` - Full-text medicine search
- `process_order_approval(...)` - Order approval with stock decrement

## Migration Path

### If you already have a database:

```sql
-- Add membership tier enum
CREATE TYPE membership_tier AS ENUM ('bronze', 'silver', 'gold');

-- Add tier column to memberships
ALTER TABLE memberships 
ADD COLUMN tier membership_tier DEFAULT 'bronze';

-- Update staff_roles for Clerk
ALTER TABLE staff_roles 
DROP CONSTRAINT staff_roles_user_id_fkey,
DROP COLUMN user_id,
ADD COLUMN clerk_user_id VARCHAR(255) UNIQUE;

-- Update medicines table structure
ALTER TABLE medicines 
RENAME COLUMN name TO brand_name;
ALTER TABLE medicines 
RENAME COLUMN generic_name TO temp_generic;
ALTER TABLE medicines 
ADD COLUMN generic_name VARCHAR(255) NOT NULL DEFAULT '';
UPDATE medicines SET generic_name = COALESCE(temp_generic, brand_name);
ALTER TABLE medicines DROP COLUMN temp_generic;
ALTER TABLE medicines DROP COLUMN unit_price;

-- Add selling_price to batches
ALTER TABLE batches 
ADD COLUMN selling_price DECIMAL(10, 2) CHECK (selling_price >= 0);

-- Update order_requests processed_by
ALTER TABLE order_requests 
DROP CONSTRAINT order_requests_processed_by_fkey,
ALTER COLUMN processed_by TYPE VARCHAR(255);
```

### For fresh database:

Just run `schema.sql` followed by `sample-data.sql`

## Membership Tier Pricing Strategy

Recommended discount structure:

| Tier   | Discount | Annual Fee | Best For |
|--------|----------|-----------|----------|
| Bronze | 10%      | ₹500      | Regular customers |
| Silver | 15%      | ₹1,000    | Frequent buyers |
| Gold   | 20%      | ₹2,000    | Premium members |

## Security Notes

### Row Level Security (RLS)
- ✅ Enabled on all tables
- ✅ Public can read: medicines, batches, inventory, memberships
- ✅ Public can create: orders, memberships (requests)
- ✅ Staff operations: Enforced in Next.js app layer via Clerk auth
- ⚠️ **Important**: Clerk authentication is checked in middleware + dashboard layout
- ⚠️ **Important**: Supabase service role key required for staff operations

### Authentication Flow
1. User signs in via Clerk → Gets email + user_id
2. App checks `staff_roles` table for matching email
3. If found → Grant dashboard access
4. Dashboard operations use Supabase service role (bypasses RLS)

## TypeScript Types

All types are in `/lib/supabase/supabaseTypes.ts`:

```typescript
export type MembershipTier = 'bronze' | 'silver' | 'gold';

// Medicines now have:
Row: {
  generic_name: string;
  brand_name: string | null;
  // ... no unit_price
}

// Batches now have:
Row: {
  cost_price: number | null;
  selling_price: number | null; // ⭐ NEW
}

// Memberships now have:
Row: {
  tier: MembershipTier; // ⭐ NEW
  status: MembershipStatus;
  discount_percentage: number;
}
```

## Next Steps

1. ✅ Run `schema.sql` in Supabase SQL Editor
2. ✅ Run `sample-data.sql` for test data
3. ✅ Add your email to `staff_roles` table
4. ✅ Set up Clerk authentication
5. ✅ Update `.env.local` with credentials
6. ✅ Run `npm install && npm run dev`

---

**Schema is now production-ready! 🚀**
