-- Hometown Pharmacy Database Schema
-- This file should be executed in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM types
CREATE TYPE order_status AS ENUM ('pending', 'approved', 'rejected', 'ready', 'completed');
CREATE TYPE membership_status AS ENUM ('active', 'expired', 'cancelled');
CREATE TYPE membership_tier AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE staff_role AS ENUM ('staff', 'admin');

-- =============================================
-- TABLES
-- =============================================

-- Customer Profiles Table (linked to Clerk authentication)
CREATE TABLE customer_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    membership_id UUID REFERENCES memberships(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_customer_profiles_clerk_user_id ON customer_profiles(clerk_user_id);
CREATE INDEX idx_customer_profiles_email ON customer_profiles(email);
CREATE INDEX idx_customer_profiles_membership_id ON customer_profiles(membership_id);

-- Medicines Table
CREATE TABLE medicines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    generic_name VARCHAR(255) NOT NULL,
    brand_name VARCHAR(255),
    category VARCHAR(100) NOT NULL,
    manufacturer VARCHAR(255),
    description TEXT,
    requires_prescription BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medicines_generic_name ON medicines(generic_name);
CREATE INDEX idx_medicines_brand_name ON medicines(brand_name);
CREATE INDEX idx_medicines_category ON medicines(category);

-- Batches Table
CREATE TABLE batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL REFERENCES medicines(id) ON DELETE CASCADE,
    batch_number VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity >= 0),
    expiry_date DATE NOT NULL,
    supplier VARCHAR(255),
    cost_price DECIMAL(10, 2) CHECK (cost_price >= 0),
    selling_price DECIMAL(10, 2) CHECK (selling_price >= 0),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(medicine_id, batch_number)
);

CREATE INDEX idx_batches_medicine_id ON batches(medicine_id);
CREATE INDEX idx_batches_expiry_date ON batches(expiry_date);

-- Inventory Table
CREATE TABLE inventory (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    medicine_id UUID NOT NULL UNIQUE REFERENCES medicines(id) ON DELETE CASCADE,
    total_quantity INTEGER DEFAULT 0 CHECK (total_quantity >= 0),
    low_stock_threshold INTEGER DEFAULT 10,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_inventory_medicine_id ON inventory(medicine_id);

-- Order Requests Table
CREATE TABLE order_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE CASCADE,
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    medicine_name VARCHAR(255) NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    prescription_url TEXT,
    status order_status DEFAULT 'pending',
    notes TEXT,
    staff_notes TEXT,
    processed_by VARCHAR(255), -- Clerk user ID
    pickup_code VARCHAR(10) UNIQUE NOT NULL, -- 6-digit unique code for pickup verification
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_order_requests_customer_profile_id ON order_requests(customer_profile_id);
CREATE INDEX idx_order_requests_status ON order_requests(status);
CREATE INDEX idx_order_requests_created_at ON order_requests(created_at DESC);
CREATE INDEX idx_order_requests_pickup_code ON order_requests(pickup_code);

-- Memberships Table
CREATE TABLE memberships (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_email VARCHAR(255),
    membership_number VARCHAR(50) NOT NULL UNIQUE,
    tier membership_tier DEFAULT 'bronze',
    status membership_status DEFAULT 'active',
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    discount_percentage DECIMAL(5, 2) DEFAULT 10.00 CHECK (discount_percentage BETWEEN 0 AND 100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_memberships_number ON memberships(membership_number);
CREATE INDEX idx_memberships_phone ON memberships(customer_phone);
CREATE INDEX idx_memberships_status ON memberships(status);
CREATE INDEX idx_memberships_tier ON memberships(tier);

-- Staff Roles Table (Clerk Auth - no foreign key to auth.users)
CREATE TABLE staff_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) NOT NULL UNIQUE,
    clerk_user_id VARCHAR(255) UNIQUE,
    role staff_role DEFAULT 'staff',
    full_name VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_staff_roles_email ON staff_roles(email);
CREATE INDEX idx_staff_roles_clerk_user_id ON staff_roles(clerk_user_id);
CREATE INDEX idx_staff_roles_role ON staff_roles(role);

-- =============================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_medicines_updated_at BEFORE UPDATE ON medicines
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_batches_updated_at BEFORE UPDATE ON batches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_profiles_updated_at BEFORE UPDATE ON customer_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_order_requests_updated_at BEFORE UPDATE ON order_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON memberships
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staff_roles_updated_at BEFORE UPDATE ON staff_roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- TRIGGER TO AUTO-GENERATE PICKUP CODES
-- =============================================

CREATE OR REPLACE FUNCTION generate_pickup_code()
RETURNS TRIGGER AS $$
DECLARE
    new_code VARCHAR(10);
    code_exists BOOLEAN;
BEGIN
    -- Generate a unique 6-digit alphanumeric code
    LOOP
        new_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 6));
        
        -- Check if code already exists
        SELECT EXISTS(SELECT 1 FROM order_requests WHERE pickup_code = new_code) INTO code_exists;
        
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    NEW.pickup_code := new_code;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_generate_pickup_code
BEFORE INSERT ON order_requests
FOR EACH ROW
WHEN (NEW.pickup_code IS NULL)
EXECUTE FUNCTION generate_pickup_code();

-- =============================================
-- TRIGGER TO AUTO-UPDATE INVENTORY
-- =============================================

CREATE OR REPLACE FUNCTION update_inventory_quantity()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        INSERT INTO inventory (medicine_id, total_quantity)
        VALUES (NEW.medicine_id, NEW.quantity)
        ON CONFLICT (medicine_id) 
        DO UPDATE SET total_quantity = inventory.total_quantity + NEW.quantity;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE inventory 
        SET total_quantity = total_quantity - OLD.quantity + NEW.quantity
        WHERE medicine_id = NEW.medicine_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE inventory 
        SET total_quantity = total_quantity - OLD.quantity
        WHERE medicine_id = OLD.medicine_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_quantity
AFTER INSERT OR UPDATE OR DELETE ON batches
FOR EACH ROW EXECUTE FUNCTION update_inventory_quantity();

-- =============================================
-- VIEWS
-- =============================================

-- Low Stock View
CREATE OR REPLACE VIEW low_stock_view AS
SELECT 
    m.id as medicine_id,
    COALESCE(m.brand_name, m.generic_name) as medicine_name,
    m.generic_name,
    m.brand_name,
    i.total_quantity,
    i.low_stock_threshold
FROM medicines m
JOIN inventory i ON m.id = i.medicine_id
WHERE i.total_quantity <= i.low_stock_threshold;

-- Expiry Alerts View (medicines expiring within 90 days)
CREATE OR REPLACE VIEW expiry_alerts AS
SELECT 
    b.id as batch_id,
    b.medicine_id,
    COALESCE(m.brand_name, m.generic_name) as medicine_name,
    m.generic_name,
    m.brand_name,
    b.batch_number,
    b.quantity,
    b.expiry_date,
    (b.expiry_date - CURRENT_DATE) as days_until_expiry
FROM batches b
JOIN medicines m ON b.medicine_id = m.id
WHERE b.expiry_date <= CURRENT_DATE + INTERVAL '90 days'
    AND b.quantity > 0
ORDER BY b.expiry_date ASC;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Search Medicines Function
CREATE OR REPLACE FUNCTION search_medicines(search_term TEXT)
RETURNS TABLE (
    id UUID,
    generic_name VARCHAR,
    brand_name VARCHAR,
    category VARCHAR,
    manufacturer VARCHAR,
    total_quantity INTEGER,
    requires_prescription BOOLEAN,
    latest_batch_price DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        m.id,
        m.generic_name,
        m.brand_name,
        m.category,
        m.manufacturer,
        COALESCE(i.total_quantity, 0) as total_quantity,
        m.requires_prescription,
        (
            SELECT b.selling_price 
            FROM batches b 
            WHERE b.medicine_id = m.id 
            ORDER BY b.created_at DESC 
            LIMIT 1
        ) as latest_batch_price
    FROM medicines m
    LEFT JOIN inventory i ON m.id = i.medicine_id
    WHERE 
        m.generic_name ILIKE '%' || search_term || '%'
        OR m.brand_name ILIKE '%' || search_term || '%'
        OR m.category ILIKE '%' || search_term || '%'
        OR m.manufacturer ILIKE '%' || search_term || '%'
    ORDER BY m.generic_name;
END;
$$ LANGUAGE plpgsql;

-- Process Order Approval Function
CREATE OR REPLACE FUNCTION process_order_approval(
    order_id UUID,
    medicine_id UUID,
    quantity INTEGER,
    staff_clerk_id VARCHAR
)
RETURNS BOOLEAN AS $$
DECLARE
    current_stock INTEGER;
BEGIN
    -- Get current stock
    SELECT total_quantity INTO current_stock
    FROM inventory
    WHERE inventory.medicine_id = process_order_approval.medicine_id;

    -- Check if enough stock
    IF current_stock < quantity THEN
        RETURN FALSE;
    END IF;

    -- Update order status
    UPDATE order_requests
    SET status = 'approved',
        processed_by = staff_clerk_id,
        updated_at = NOW()
    WHERE id = order_id;

    -- Decrement stock
    UPDATE inventory
    SET total_quantity = total_quantity - quantity,
        updated_at = NOW()
    WHERE inventory.medicine_id = process_order_approval.medicine_id;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff_roles ENABLE ROW LEVEL SECURITY;

-- Customer Profiles Policies
-- Note: Auth enforcement handled in application layer with Clerk
CREATE POLICY "Users can view own profile" ON customer_profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can create own profile" ON customer_profiles
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update own profile" ON customer_profiles
    FOR UPDATE USING (true);

CREATE POLICY "Staff can manage customer profiles" ON customer_profiles
    FOR ALL USING (true);

-- Medicines Policies
-- Public: Can read all medicines
CREATE POLICY "Public can view medicines" ON medicines
    FOR SELECT USING (true);

-- Staff: Can manage all medicines (using email from Clerk)
-- Note: In production, sync Clerk user_id to staff_roles.clerk_user_id
CREATE POLICY "Staff can manage medicines" ON medicines
    FOR ALL USING (true); -- Temporarily allow all; enforce in application layer with Clerk

-- Batches Policies
-- Public: Can read batches to check expiry
CREATE POLICY "Public can view batches" ON batches
    FOR SELECT USING (true);

-- Staff: Can manage batches
CREATE POLICY "Staff can manage batches" ON batches
    FOR ALL USING (true); -- Enforce in application layer with Clerk

-- Inventory Policies
-- Public: Can read inventory for stock info
CREATE POLICY "Public can view inventory" ON inventory
    FOR SELECT USING (true);

-- Staff: Can manage inventory
CREATE POLICY "Staff can manage inventory" ON inventory
    FOR ALL USING (true); -- Enforce in application layer with Clerk

-- Order Requests Policies
-- Authenticated users: Can create their own orders
CREATE POLICY "Authenticated users can create orders" ON order_requests
    FOR INSERT WITH CHECK (customer_profile_id IS NOT NULL);

-- Users: Can view their own orders
CREATE POLICY "Users can view own orders" ON order_requests
    FOR SELECT USING (true);

-- Staff: Can manage all orders
CREATE POLICY "Staff can manage orders" ON order_requests
    FOR ALL USING (true); -- Enforce in application layer with Clerk

-- Memberships Policies
-- Public: Can view memberships (for lookup)
CREATE POLICY "Public can view memberships" ON memberships
    FOR SELECT USING (true);

-- Public: Can create membership requests (will be handled via Edge Function)
CREATE POLICY "Public can create memberships" ON memberships
    FOR INSERT WITH CHECK (true);

-- Staff: Can manage all memberships
CREATE POLICY "Staff can manage memberships" ON memberships
    FOR ALL USING (true); -- Enforce in application layer with Clerk

-- Staff Roles Policies
-- Staff: Can view all staff
CREATE POLICY "Staff can view staff" ON staff_roles
    FOR SELECT USING (true); -- Enforce in application layer with Clerk

-- Admin: Can manage staff
CREATE POLICY "Admin can manage staff" ON staff_roles
    FOR ALL USING (true); -- Enforce in application layer with Clerk
