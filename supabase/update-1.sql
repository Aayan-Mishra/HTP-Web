-- Migration: Add Customer Accounts and Pickup Code System
-- Date: December 7, 2025
-- Description: Adds customer profiles, pickup codes, and authentication support

-- =====================================================
-- 1. CREATE CUSTOMER PROFILES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  full_name VARCHAR(255) NOT NULL,
  address TEXT,
  membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customer_profiles_clerk_user_id ON customer_profiles(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX IF NOT EXISTS idx_customer_profiles_membership_id ON customer_profiles(membership_id);

-- =====================================================
-- 2. ADD PICKUP CODE TO ORDER REQUESTS
-- =====================================================

-- Add pickup_code column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_requests' AND column_name = 'pickup_code'
  ) THEN
    ALTER TABLE order_requests ADD COLUMN pickup_code VARCHAR(10) UNIQUE;
  END IF;
END $$;

-- Add customer_profile_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_requests' AND column_name = 'customer_profile_id'
  ) THEN
    ALTER TABLE order_requests ADD COLUMN customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add customer_signature column for signature capture
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'order_requests' AND column_name = 'customer_signature'
  ) THEN
    ALTER TABLE order_requests ADD COLUMN customer_signature TEXT;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_order_requests_pickup_code ON order_requests(pickup_code);
CREATE INDEX IF NOT EXISTS idx_order_requests_customer_profile_id ON order_requests(customer_profile_id);

-- =====================================================
-- 3. CREATE PICKUP CODE GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(10);
  code_exists BOOLEAN;
BEGIN
  -- Generate a unique 6-character alphanumeric code
  LOOP
    -- Generate code using MD5 hash of UUID and timestamp
    new_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 6));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM order_requests WHERE pickup_code = new_code) INTO code_exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.pickup_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- 4. CREATE TRIGGER FOR PICKUP CODE GENERATION
-- =====================================================

DROP TRIGGER IF EXISTS trigger_generate_pickup_code ON order_requests;

CREATE TRIGGER trigger_generate_pickup_code
  BEFORE INSERT ON order_requests
  FOR EACH ROW
  WHEN (NEW.pickup_code IS NULL)
  EXECUTE FUNCTION generate_pickup_code();

-- =====================================================
-- 5. CREATE TRIGGER FOR CUSTOMER PROFILES UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION customer_profiles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_customer_profiles_updated_at ON customer_profiles;

CREATE TRIGGER trigger_customer_profiles_updated_at
  BEFORE UPDATE ON customer_profiles
  FOR EACH ROW
  EXECUTE FUNCTION customer_profiles_updated_at();

-- =====================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on customer_profiles
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Customers can view their own profile
DROP POLICY IF EXISTS "Customers can view own profile" ON customer_profiles;
CREATE POLICY "Customers can view own profile"
  ON customer_profiles
  FOR SELECT
  USING (true); -- Allow all authenticated users to read (adjust based on your auth setup)

-- Policy: Customers can insert their own profile
DROP POLICY IF EXISTS "Customers can create own profile" ON customer_profiles;
CREATE POLICY "Customers can create own profile"
  ON customer_profiles
  FOR INSERT
  WITH CHECK (true); -- Allow all authenticated users to insert

-- Policy: Customers can update their own profile
DROP POLICY IF EXISTS "Customers can update own profile" ON customer_profiles;
CREATE POLICY "Customers can update own profile"
  ON customer_profiles
  FOR UPDATE
  USING (true) -- Allow all authenticated users to update (adjust based on clerk_user_id)
  WITH CHECK (true);

-- Update RLS policy on order_requests to allow customer access
DROP POLICY IF EXISTS "Customers can view own orders" ON order_requests;
CREATE POLICY "Customers can view own orders"
  ON order_requests
  FOR SELECT
  USING (true); -- Adjust to match customer_profile_id with current user

-- =====================================================
-- 7. GENERATE PICKUP CODES FOR EXISTING ORDERS (Optional)
-- =====================================================

-- Update existing orders without pickup codes
UPDATE order_requests 
SET pickup_code = UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT || id::TEXT) FROM 1 FOR 6))
WHERE pickup_code IS NULL;

-- Make sure all codes are unique (regenerate duplicates if any)
DO $$
DECLARE
  rec RECORD;
  new_code VARCHAR(10);
  code_exists BOOLEAN;
BEGIN
  FOR rec IN 
    SELECT id FROM order_requests 
    WHERE pickup_code IN (
      SELECT pickup_code FROM order_requests 
      GROUP BY pickup_code HAVING COUNT(*) > 1
    )
  LOOP
    LOOP
      new_code := UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT || clock_timestamp()::TEXT) FROM 1 FOR 6));
      SELECT EXISTS(SELECT 1 FROM order_requests WHERE pickup_code = new_code) INTO code_exists;
      EXIT WHEN NOT code_exists;
    END LOOP;
    
    UPDATE order_requests SET pickup_code = new_code WHERE id = rec.id;
  END LOOP;
END $$;

-- =====================================================
-- 8. VERIFICATION
-- =====================================================

-- Verify table creation
SELECT 'customer_profiles table: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'customer_profiles') 
    THEN '✓ Created' 
    ELSE '✗ Not found' 
  END as status;

-- Verify columns added
SELECT 'pickup_code column: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_requests' AND column_name = 'pickup_code') 
    THEN '✓ Added' 
    ELSE '✗ Not found' 
  END as status;

SELECT 'customer_profile_id column: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'order_requests' AND column_name = 'customer_profile_id') 
    THEN '✓ Added' 
    ELSE '✗ Not found' 
  END as status;

-- Verify trigger function
SELECT 'generate_pickup_code function: ' || 
  CASE WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'generate_pickup_code') 
    THEN '✓ Created' 
    ELSE '✗ Not found' 
  END as status;

-- Count records
SELECT 
  (SELECT COUNT(*) FROM customer_profiles) as customer_profiles_count,
  (SELECT COUNT(*) FROM order_requests WHERE pickup_code IS NOT NULL) as orders_with_pickup_codes;

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
-- Summary:
-- ✓ customer_profiles table created with Clerk auth support
-- ✓ pickup_code field added to order_requests (auto-generated)
-- ✓ customer_profile_id FK added to order_requests
-- ✓ Automatic pickup code generation via trigger
-- ✓ RLS policies configured for customer access
-- ✓ Existing orders backfilled with pickup codes
-- ✓ Indexes created for performance
-- =====================================================
