-- Migration: Inventory Management & Membership Management
-- Date: December 7, 2025
-- Description: Adds inventory tracking, product scanning, OCR data, and enhanced membership features

-- =====================================================
-- 1. CREATE PRODUCTS TABLE (Inventory Items)
-- =====================================================

CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_code VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  manufacturer VARCHAR(255),
  
  -- OCR Extracted Data
  ocr_text TEXT,
  scanned_image_url TEXT,
  
  -- Pricing
  unit_price DECIMAL(10, 2),
  
  -- Stock Management
  current_stock INTEGER DEFAULT 0 NOT NULL,
  minimum_stock INTEGER DEFAULT 10,
  reorder_level INTEGER DEFAULT 20,
  
  -- Additional Info
  dosage VARCHAR(100),
  strength VARCHAR(50),
  form VARCHAR(50), -- tablet, capsule, syrup, etc.
  
  -- Metadata
  created_by UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_product_code ON products(product_code);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_current_stock ON products(current_stock);

-- =====================================================
-- 2. CREATE PRODUCT BATCHES TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS product_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_number VARCHAR(100) NOT NULL,
  quantity INTEGER NOT NULL,
  expiry_date DATE,
  manufacture_date DATE,
  supplier VARCHAR(255),
  cost_price DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(product_id, batch_number)
);

CREATE INDEX IF NOT EXISTS idx_product_batches_product_id ON product_batches(product_id);
CREATE INDEX IF NOT EXISTS idx_product_batches_expiry_date ON product_batches(expiry_date);

-- =====================================================
-- 3. CREATE STOCK MOVEMENTS TABLE (Track all changes)
-- =====================================================

CREATE TABLE IF NOT EXISTS stock_movements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
  
  movement_type VARCHAR(20) NOT NULL, -- 'IN', 'OUT', 'ADJUSTMENT', 'EXPIRED'
  quantity INTEGER NOT NULL,
  
  -- Reference to order if this is for an order
  order_id UUID REFERENCES order_requests(id) ON DELETE SET NULL,
  
  notes TEXT,
  performed_by UUID,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_stock_movements_product_id ON stock_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_stock_movements_movement_type ON stock_movements(movement_type);
CREATE INDEX IF NOT EXISTS idx_stock_movements_order_id ON stock_movements(order_id);

-- =====================================================
-- 4. CREATE ORDER ITEMS TABLE (Link orders to products)
-- =====================================================

CREATE TABLE IF NOT EXISTS order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES order_requests(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  batch_id UUID REFERENCES product_batches(id) ON DELETE SET NULL,
  
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2),
  total_price DECIMAL(10, 2),
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_order_items_product_id ON order_items(product_id);

-- =====================================================
-- 5. ENHANCE MEMBERSHIPS TABLE
-- =====================================================

-- Add more fields to memberships if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'points_earned'
  ) THEN
    ALTER TABLE memberships ADD COLUMN points_earned INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'points_redeemed'
  ) THEN
    ALTER TABLE memberships ADD COLUMN points_redeemed INTEGER DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE memberships ADD COLUMN total_spent DECIMAL(10, 2) DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'memberships' AND column_name = 'benefits'
  ) THEN
    ALTER TABLE memberships ADD COLUMN benefits JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- =====================================================
-- 6. CREATE MEMBERSHIP TIERS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS membership_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tier_name VARCHAR(50) UNIQUE NOT NULL,
  discount_percentage INTEGER NOT NULL,
  points_multiplier DECIMAL(3, 2) DEFAULT 1.0,
  minimum_spend DECIMAL(10, 2) DEFAULT 0,
  benefits JSONB DEFAULT '[]'::jsonb,
  color_code VARCHAR(7), -- Hex color for UI
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Insert default tiers
INSERT INTO membership_tiers (tier_name, discount_percentage, points_multiplier, minimum_spend, color_code, benefits)
VALUES 
  ('Bronze', 5, 1.0, 0, '#CD7F32', '["5% discount", "Birthday bonus"]'::jsonb),
  ('Silver', 10, 1.5, 500, '#C0C0C0', '["10% discount", "Priority support", "Birthday bonus"]'::jsonb),
  ('Gold', 15, 2.0, 1500, '#FFD700', '["15% discount", "Priority support", "Free delivery", "Birthday bonus"]'::jsonb),
  ('Platinum', 20, 3.0, 5000, '#E5E4E2', '["20% discount", "VIP support", "Free delivery", "Exclusive offers", "Birthday bonus"]'::jsonb)
ON CONFLICT (tier_name) DO NOTHING;

-- =====================================================
-- 7. CREATE MEMBERSHIP TRANSACTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS membership_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  membership_id UUID NOT NULL,
  transaction_type VARCHAR(20) NOT NULL, -- 'EARNED', 'REDEEMED', 'EXPIRED', 'PURCHASE'
  points INTEGER DEFAULT 0,
  amount DECIMAL(10, 2),
  description TEXT,
  order_id UUID REFERENCES order_requests(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_membership_transactions_membership_id ON membership_transactions(membership_id);
CREATE INDEX IF NOT EXISTS idx_membership_transactions_order_id ON membership_transactions(order_id);

-- =====================================================
-- 8. PRODUCT CODE GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_product_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(50);
  code_exists BOOLEAN;
  prefix VARCHAR(3);
BEGIN
  -- Generate prefix based on category
  prefix := CASE 
    WHEN NEW.category = 'Antibiotics' THEN 'ANT'
    WHEN NEW.category = 'Pain Relief' THEN 'PAI'
    WHEN NEW.category = 'Vitamins' THEN 'VIT'
    WHEN NEW.category = 'First Aid' THEN 'AID'
    ELSE 'MED'
  END;
  
  -- Generate a unique product code
  LOOP
    new_code := prefix || '-' || UPPER(SUBSTRING(MD5(gen_random_uuid()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM products WHERE product_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.product_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_product_code ON products;

CREATE TRIGGER trigger_generate_product_code
  BEFORE INSERT ON products
  FOR EACH ROW
  WHEN (NEW.product_code IS NULL OR NEW.product_code = '')
  EXECUTE FUNCTION generate_product_code();

-- =====================================================
-- 9. UPDATE STOCK ON MOVEMENT FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION update_product_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.movement_type = 'IN' THEN
    UPDATE products 
    SET current_stock = current_stock + NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
  ELSIF NEW.movement_type IN ('OUT', 'EXPIRED', 'ADJUSTMENT') THEN
    UPDATE products 
    SET current_stock = current_stock - NEW.quantity,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.product_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_product_stock ON stock_movements;

CREATE TRIGGER trigger_update_product_stock
  AFTER INSERT ON stock_movements
  FOR EACH ROW
  EXECUTE FUNCTION update_product_stock();

-- =====================================================
-- 10. LOW STOCK VIEW
-- =====================================================

CREATE OR REPLACE VIEW low_stock_products AS
SELECT 
  p.id,
  p.product_code,
  p.name,
  p.category,
  p.current_stock,
  p.minimum_stock,
  p.reorder_level,
  CASE 
    WHEN p.current_stock = 0 THEN 'OUT_OF_STOCK'
    WHEN p.current_stock <= p.minimum_stock THEN 'CRITICAL'
    WHEN p.current_stock <= p.reorder_level THEN 'LOW'
    ELSE 'OK'
  END as stock_status
FROM products p
WHERE p.current_stock <= p.reorder_level
ORDER BY p.current_stock ASC;

-- =====================================================
-- 11. EXPIRING PRODUCTS VIEW
-- =====================================================

CREATE OR REPLACE VIEW expiring_products AS
SELECT 
  pb.id as batch_id,
  p.id as product_id,
  p.product_code,
  p.name,
  pb.batch_number,
  pb.quantity,
  pb.expiry_date,
  pb.expiry_date - CURRENT_DATE as days_until_expiry
FROM product_batches pb
JOIN products p ON pb.product_id = p.id
WHERE pb.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
  AND pb.quantity > 0
ORDER BY pb.expiry_date ASC;

-- =====================================================
-- 12. CREATE CUSTOMER MEMBERSHIPS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS customer_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customer_profiles(id) ON DELETE CASCADE,
  tier_id UUID NOT NULL REFERENCES membership_tiers(id) ON DELETE RESTRICT,
  membership_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Points tracking
  points_balance INTEGER DEFAULT 0,
  total_points_earned INTEGER DEFAULT 0,
  total_points_redeemed INTEGER DEFAULT 0,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, suspended, expired
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(customer_id) -- One membership per customer
);

CREATE INDEX IF NOT EXISTS idx_customer_memberships_customer_id ON customer_memberships(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_tier_id ON customer_memberships(tier_id);
CREATE INDEX IF NOT EXISTS idx_customer_memberships_code ON customer_memberships(membership_code);

-- =====================================================
-- 13. MEMBERSHIP CODE GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_membership_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
  random_digits VARCHAR(6);
BEGIN
  -- Generate a unique membership code in format HTP-XXXXXX
  LOOP
    random_digits := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_code := 'HTP-' || random_digits;
    SELECT EXISTS(SELECT 1 FROM customer_memberships WHERE membership_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.membership_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_membership_code ON customer_memberships;

CREATE TRIGGER trigger_generate_membership_code
  BEFORE INSERT ON customer_memberships
  FOR EACH ROW
  WHEN (NEW.membership_code IS NULL OR NEW.membership_code = '')
  EXECUTE FUNCTION generate_membership_code();

-- =====================================================
-- 14. UPDATE MEMBERSHIP TIERS TABLE STRUCTURE
-- =====================================================

-- Add missing columns if they don't exist
DO $$ 
BEGIN
  -- Rename tier_name to name if needed
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_tiers' AND column_name = 'tier_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_tiers' AND column_name = 'name'
  ) THEN
    ALTER TABLE membership_tiers RENAME COLUMN tier_name TO name;
  END IF;

  -- Add tier_level
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_tiers' AND column_name = 'tier_level'
  ) THEN
    ALTER TABLE membership_tiers ADD COLUMN tier_level INTEGER;
    UPDATE membership_tiers SET tier_level = CASE name
      WHEN 'Bronze' THEN 1
      WHEN 'Silver' THEN 2
      WHEN 'Gold' THEN 3
      WHEN 'Platinum' THEN 4
      ELSE 1
    END;
  END IF;

  -- Add points_threshold
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'membership_tiers' AND column_name = 'points_threshold'
  ) THEN
    ALTER TABLE membership_tiers ADD COLUMN points_threshold INTEGER DEFAULT 0;
    UPDATE membership_tiers SET points_threshold = CASE name
      WHEN 'Bronze' THEN 0
      WHEN 'Silver' THEN 1000
      WHEN 'Gold' THEN 5000
      WHEN 'Platinum' THEN 15000
      ELSE 0
    END;
  END IF;
END $$;

-- =====================================================
-- 15. ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_tiers ENABLE ROW LEVEL SECURITY;
ALTER TABLE membership_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_memberships ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to products" ON products;
DROP POLICY IF EXISTS "Allow read access to batches" ON product_batches;
DROP POLICY IF EXISTS "Allow read access to stock movements" ON stock_movements;
DROP POLICY IF EXISTS "Allow read access to order items" ON order_items;
DROP POLICY IF EXISTS "Allow read access to membership tiers" ON membership_tiers;
DROP POLICY IF EXISTS "Allow read access to membership transactions" ON membership_transactions;
DROP POLICY IF EXISTS "Allow read access to customer memberships" ON customer_memberships;
DROP POLICY IF EXISTS "Allow staff to manage products" ON products;
DROP POLICY IF EXISTS "Allow staff to manage batches" ON product_batches;
DROP POLICY IF EXISTS "Allow staff to manage stock" ON stock_movements;
DROP POLICY IF EXISTS "Allow staff to manage order items" ON order_items;
DROP POLICY IF EXISTS "Allow staff to manage membership transactions" ON membership_transactions;
DROP POLICY IF EXISTS "Allow staff to manage customer memberships" ON customer_memberships;

-- Allow read access to all authenticated users
CREATE POLICY "Allow read access to products" ON products FOR SELECT USING (true);
CREATE POLICY "Allow read access to batches" ON product_batches FOR SELECT USING (true);
CREATE POLICY "Allow read access to stock movements" ON stock_movements FOR SELECT USING (true);
CREATE POLICY "Allow read access to order items" ON order_items FOR SELECT USING (true);
CREATE POLICY "Allow read access to membership tiers" ON membership_tiers FOR SELECT USING (true);
CREATE POLICY "Allow read access to membership transactions" ON membership_transactions FOR SELECT USING (true);
CREATE POLICY "Allow read access to customer memberships" ON customer_memberships FOR SELECT USING (true);

-- Allow staff to insert/update (adjust based on your auth)
CREATE POLICY "Allow staff to manage products" ON products FOR ALL USING (true);
CREATE POLICY "Allow staff to manage batches" ON product_batches FOR ALL USING (true);
CREATE POLICY "Allow staff to manage stock" ON stock_movements FOR ALL USING (true);
CREATE POLICY "Allow staff to manage order items" ON order_items FOR ALL USING (true);
CREATE POLICY "Allow staff to manage membership transactions" ON membership_transactions FOR ALL USING (true);
CREATE POLICY "Allow staff to manage customer memberships" ON customer_memberships FOR ALL USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================

