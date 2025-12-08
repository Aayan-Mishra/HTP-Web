-- =============================================
-- SAMPLE DATA FOR TESTING
-- =============================================
-- Run this after running schema.sql to populate
-- the database with test data
-- =============================================

-- Sample Medicines
INSERT INTO medicines (generic_name, brand_name, category, requires_prescription, manufacturer, description) VALUES
('Paracetamol', 'Crocin', 'Analgesic', false, 'GSK', 'Pain relief and fever reducer'),
('Ibuprofen', 'Brufen', 'Analgesic', false, 'Abbott', 'Anti-inflammatory pain reliever'),
('Amoxicillin', 'Amoxil', 'Antibiotic', true, 'GSK', 'Broad-spectrum antibiotic'),
('Metformin', 'Glucophage', 'Antidiabetic', true, 'Merck', 'Type 2 diabetes medication'),
('Atorvastatin', 'Lipitor', 'Statin', true, 'Pfizer', 'Cholesterol-lowering medication'),
('Omeprazole', 'Prilosec', 'Antacid', false, 'AstraZeneca', 'Proton pump inhibitor for acid reflux'),
('Cetirizine', 'Zyrtec', 'Antihistamine', false, 'UCB', 'Allergy relief medication'),
('Aspirin', 'Disprin', 'Analgesic', false, 'Bayer', 'Pain relief and blood thinner'),
('Losartan', 'Cozaar', 'Antihypertensive', true, 'Merck', 'Blood pressure medication'),
('Levothyroxine', 'Synthroid', 'Thyroid', true, 'AbbVie', 'Thyroid hormone replacement');

-- Get medicine IDs for reference
DO $$
DECLARE
    med1_id UUID;
    med2_id UUID;
    med3_id UUID;
    med4_id UUID;
    med5_id UUID;
    med6_id UUID;
    med7_id UUID;
    med8_id UUID;
    med9_id UUID;
    med10_id UUID;
BEGIN
    -- Fetch medicine IDs
    SELECT id INTO med1_id FROM medicines WHERE generic_name = 'Paracetamol' LIMIT 1;
    SELECT id INTO med2_id FROM medicines WHERE generic_name = 'Ibuprofen' LIMIT 1;
    SELECT id INTO med3_id FROM medicines WHERE generic_name = 'Amoxicillin' LIMIT 1;
    SELECT id INTO med4_id FROM medicines WHERE generic_name = 'Metformin' LIMIT 1;
    SELECT id INTO med5_id FROM medicines WHERE generic_name = 'Atorvastatin' LIMIT 1;
    SELECT id INTO med6_id FROM medicines WHERE generic_name = 'Omeprazole' LIMIT 1;
    SELECT id INTO med7_id FROM medicines WHERE generic_name = 'Cetirizine' LIMIT 1;
    SELECT id INTO med8_id FROM medicines WHERE generic_name = 'Aspirin' LIMIT 1;
    SELECT id INTO med9_id FROM medicines WHERE generic_name = 'Losartan' LIMIT 1;
    SELECT id INTO med10_id FROM medicines WHERE generic_name = 'Levothyroxine' LIMIT 1;

    -- Sample Batches (with varying expiry dates)
    INSERT INTO batches (medicine_id, batch_number, quantity, expiry_date, cost_price, selling_price, supplier) VALUES
    (med1_id, 'PCM001', 500, CURRENT_DATE + INTERVAL '180 days', 2.50, 5.00, 'PharmaCorp'),
    (med1_id, 'PCM002', 300, CURRENT_DATE + INTERVAL '20 days', 2.50, 5.00, 'PharmaCorp'), -- Expiring soon
    (med2_id, 'IBU001', 400, CURRENT_DATE + INTERVAL '270 days', 3.00, 6.50, 'MediSupply'),
    (med3_id, 'AMX001', 150, CURRENT_DATE + INTERVAL '120 days', 8.00, 15.00, 'AntibioSource'),
    (med4_id, 'MET001', 600, CURRENT_DATE + INTERVAL '365 days', 1.50, 3.50, 'DiabetesCare'),
    (med5_id, 'ATO001', 200, CURRENT_DATE + INTERVAL '200 days', 12.00, 25.00, 'CardioMeds'),
    (med6_id, 'OME001', 350, CURRENT_DATE + INTERVAL '150 days', 4.00, 8.00, 'GastroSupply'),
    (med7_id, 'CET001', 450, CURRENT_DATE + INTERVAL '300 days', 2.00, 4.50, 'AllergyMeds'),
    (med8_id, 'ASP001', 800, CURRENT_DATE + INTERVAL '400 days', 1.00, 2.50, 'BasicMeds'),
    (med9_id, 'LOS001', 100, CURRENT_DATE + INTERVAL '90 days', 6.00, 12.00, 'CardioMeds'),
    (med10_id, 'LEV001', 250, CURRENT_DATE + INTERVAL '250 days', 5.00, 10.00, 'EndocrineSupply');

    -- Inventory (automatically created by trigger, but we'll update totals)
    -- The trigger should have created inventory entries, let's update them
    UPDATE inventory SET total_quantity = 800, low_stock_threshold = 50 WHERE medicine_id = med1_id;
    UPDATE inventory SET total_quantity = 400, low_stock_threshold = 50 WHERE medicine_id = med2_id;
    UPDATE inventory SET total_quantity = 150, low_stock_threshold = 100 WHERE medicine_id = med3_id;
    UPDATE inventory SET total_quantity = 600, low_stock_threshold = 100 WHERE medicine_id = med4_id;
    UPDATE inventory SET total_quantity = 200, low_stock_threshold = 50 WHERE medicine_id = med5_id;
    UPDATE inventory SET total_quantity = 350, low_stock_threshold = 75 WHERE medicine_id = med6_id;
    UPDATE inventory SET total_quantity = 450, low_stock_threshold = 100 WHERE medicine_id = med7_id;
    UPDATE inventory SET total_quantity = 800, low_stock_threshold = 150 WHERE medicine_id = med8_id;
    UPDATE inventory SET total_quantity = 100, low_stock_threshold = 150 WHERE medicine_id = med9_id; -- Low stock!
    UPDATE inventory SET total_quantity = 250, low_stock_threshold = 100 WHERE medicine_id = med10_id;
END $$;

-- Sample Order Requests
INSERT INTO order_requests (customer_name, customer_phone, customer_email, medicine_name, quantity, status, notes) VALUES
('John Smith', '+91-9876543210', 'john@example.com', 'Paracetamol 500mg', 2, 'pending', 'Need urgently for fever'),
('Jane Doe', '+91-9876543211', 'jane@example.com', 'Amoxicillin 250mg', 1, 'pending', 'Prescription available'),
('Robert Wilson', '+91-9876543212', 'robert@example.com', 'Metformin 500mg', 3, 'approved', 'Regular refill'),
('Emily Davis', '+91-9876543213', 'emily@example.com', 'Atorvastatin 10mg', 1, 'ready', 'Monthly supply'),
('Michael Brown', '+91-9876543214', 'michael@example.com', 'Cetirizine 10mg', 2, 'pending', 'Allergy season'),
('Sarah Johnson', '+91-9876543215', 'sarah@example.com', 'Ibuprofen 400mg', 1, 'rejected', 'Out of stock'),
('David Lee', '+91-9876543216', 'david@example.com', 'Omeprazole 20mg', 2, 'completed', 'Picked up yesterday');

-- Sample Memberships
INSERT INTO memberships (customer_name, customer_phone, customer_email, membership_number, tier, status, start_date, end_date, discount_percentage) VALUES
('John Smith', '+91-9876543210', 'john@example.com', 'MEM001', 'bronze', 'active', CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE + INTERVAL '335 days', 10.00),
('Jane Doe', '+91-9876543211', 'jane@example.com', 'MEM002', 'silver', 'active', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE + INTERVAL '305 days', 15.00),
('Robert Wilson', '+91-9876543212', 'robert@example.com', 'MEM003', 'bronze', 'expired', CURRENT_DATE - INTERVAL '400 days', CURRENT_DATE - INTERVAL '35 days', 10.00),
('Emily Davis', '+91-9876543213', 'emily@example.com', 'MEM004', 'gold', 'active', CURRENT_DATE - INTERVAL '10 days', CURRENT_DATE + INTERVAL '355 days', 20.00),
('Sarah Johnson', '+91-9876543215', 'sarah@example.com', 'MEM005', 'silver', 'active', CURRENT_DATE - INTERVAL '340 days', CURRENT_DATE + INTERVAL '25 days', 15.00);

-- Staff Roles (UPDATE WITH YOUR ACTUAL EMAIL)
-- Note: Replace 'your-email@example.com' with the email you'll use to sign up in Clerk
INSERT INTO staff_roles (email, role, full_name) VALUES
('admin@hometownpharmacy.com', 'admin', 'Admin User'),
('staff@hometownpharmacy.com', 'staff', 'Staff User');

-- IMPORTANT: Add your own email for testing
-- INSERT INTO staff_roles (email, role, full_name) VALUES
-- ('your-email@example.com', 'admin', 'Your Name');

-- =============================================
-- Verification Queries
-- =============================================

-- Check medicines count
SELECT COUNT(*) as total_medicines FROM medicines;

-- Check inventory levels
SELECT 
    m.generic_name,
    i.total_quantity,
    CASE 
        WHEN i.total_quantity <= i.low_stock_threshold THEN 'LOW STOCK'
        ELSE 'OK'
    END as stock_status
FROM medicines m
JOIN inventory i ON m.id = i.medicine_id
ORDER BY i.total_quantity ASC;

-- Check expiring medicines
SELECT * FROM expiry_alerts;

-- Check low stock items
SELECT * FROM low_stock_view;

-- Check pending orders
SELECT 
    customer_name,
    medicine_name,
    quantity,
    status,
    created_at
FROM order_requests
WHERE status = 'pending'
ORDER BY created_at DESC;

-- Check active memberships
SELECT 
    customer_name,
    membership_number,
    status,
    end_date
FROM memberships
WHERE status = 'active'
ORDER BY end_date ASC;

-- =============================================
-- SUCCESS MESSAGE
-- =============================================
DO $$
BEGIN
    RAISE NOTICE '✓ Sample data inserted successfully!';
    RAISE NOTICE '✓ Created 10 medicines with batches';
    RAISE NOTICE '✓ Created 7 sample order requests';
    RAISE NOTICE '✓ Created 5 sample memberships';
    RAISE NOTICE '✓ Created 2 sample staff roles';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Update staff_roles with your email address!';
    RAISE NOTICE 'Run: INSERT INTO staff_roles (email, role, full_name) VALUES (''your@email.com'', ''admin'', ''Your Name'');';
END $$;
