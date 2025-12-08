-- Migration: Clinic Management System
-- Date: December 8, 2025
-- Description: Adds doctor accounts, patient management, and prescription system

-- =====================================================
-- 1. CREATE DOCTORS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS doctors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clerk_user_id VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  
  -- Professional Details
  specialization VARCHAR(255),
  license_number VARCHAR(100) UNIQUE,
  qualification TEXT,
  years_of_experience INTEGER,
  
  -- Contact & Address
  clinic_address TEXT,
  consultation_fee DECIMAL(10, 2),
  
  -- Availability
  available_days JSONB DEFAULT '[]'::jsonb, -- ["Monday", "Tuesday", etc.]
  consultation_hours VARCHAR(100), -- e.g., "9 AM - 5 PM"
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive, suspended
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_clerk_user_id ON doctors(clerk_user_id);
CREATE INDEX IF NOT EXISTS idx_doctors_email ON doctors(email);
CREATE INDEX IF NOT EXISTS idx_doctors_license_number ON doctors(license_number);
CREATE INDEX IF NOT EXISTS idx_doctors_status ON doctors(status);

-- =====================================================
-- 2. CREATE PATIENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS patients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_code VARCHAR(20) UNIQUE NOT NULL,
  
  -- Personal Information
  full_name VARCHAR(255) NOT NULL,
  date_of_birth DATE,
  gender VARCHAR(20),
  phone VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  
  -- Emergency Contact
  emergency_contact_name VARCHAR(255),
  emergency_contact_phone VARCHAR(20),
  
  -- Medical Information
  blood_type VARCHAR(10),
  allergies TEXT,
  chronic_conditions TEXT,
  current_medications TEXT,
  
  -- Assignment
  assigned_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
  
  -- Link to customer profile (if they have one)
  customer_profile_id UUID REFERENCES customer_profiles(id) ON DELETE SET NULL,
  
  -- Status
  status VARCHAR(20) DEFAULT 'active', -- active, inactive
  
  -- Metadata
  created_by UUID, -- Admin who created
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_patients_patient_code ON patients(patient_code);
CREATE INDEX IF NOT EXISTS idx_patients_assigned_doctor_id ON patients(assigned_doctor_id);
CREATE INDEX IF NOT EXISTS idx_patients_customer_profile_id ON patients(customer_profile_id);
CREATE INDEX IF NOT EXISTS idx_patients_full_name ON patients(full_name);

-- =====================================================
-- 3. CREATE PRESCRIPTIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prescription_number VARCHAR(30) UNIQUE NOT NULL,
  
  -- References
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  
  -- Prescription Details
  diagnosis TEXT,
  symptoms TEXT,
  notes TEXT,
  
  -- Prescription Items (medications with dosage, frequency, duration)
  medications JSONB NOT NULL DEFAULT '[]'::jsonb,
  -- Example: [{"name": "Paracetamol", "dosage": "500mg", "frequency": "3 times daily", "duration": "5 days", "instructions": "After meals"}]
  
  -- Follow-up
  follow_up_date DATE,
  follow_up_notes TEXT,
  
  -- PDF Generation
  pdf_url TEXT,
  pdf_generated_at TIMESTAMP WITH TIME ZONE,
  
  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, sent_to_pharmacy, fulfilled, cancelled
  sent_to_pharmacy_at TIMESTAMP WITH TIME ZONE,
  fulfilled_at TIMESTAMP WITH TIME ZONE,
  
  -- Link to pharmacy order (when fulfilled)
  order_id UUID REFERENCES order_requests(id) ON DELETE SET NULL,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_prescriptions_prescription_number ON prescriptions(prescription_number);
CREATE INDEX IF NOT EXISTS idx_prescriptions_patient_id ON prescriptions(patient_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_doctor_id ON prescriptions(doctor_id);
CREATE INDEX IF NOT EXISTS idx_prescriptions_status ON prescriptions(status);
CREATE INDEX IF NOT EXISTS idx_prescriptions_order_id ON prescriptions(order_id);

-- =====================================================
-- 4. CREATE MEDICAL APPOINTMENTS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- References
  patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
  
  -- Appointment Details
  appointment_date DATE NOT NULL,
  appointment_time TIME NOT NULL,
  duration_minutes INTEGER DEFAULT 30,
  
  -- Purpose
  appointment_type VARCHAR(50), -- consultation, follow-up, emergency
  reason TEXT,
  
  -- Status
  status VARCHAR(20) DEFAULT 'scheduled', -- scheduled, completed, cancelled, no_show
  
  -- Notes
  doctor_notes TEXT,
  
  -- Metadata
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointments_patient_id ON appointments(patient_id);
CREATE INDEX IF NOT EXISTS idx_appointments_doctor_id ON appointments(doctor_id);
CREATE INDEX IF NOT EXISTS idx_appointments_date ON appointments(appointment_date);
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);

-- =====================================================
-- 5. PATIENT CODE GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_patient_code()
RETURNS TRIGGER AS $$
DECLARE
  new_code VARCHAR(20);
  code_exists BOOLEAN;
  random_digits VARCHAR(6);
BEGIN
  -- Generate a unique patient code in format PAT-XXXXXX
  LOOP
    random_digits := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_code := 'PAT-' || random_digits;
    SELECT EXISTS(SELECT 1 FROM patients WHERE patient_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.patient_code := new_code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_patient_code ON patients;

CREATE TRIGGER trigger_generate_patient_code
  BEFORE INSERT ON patients
  FOR EACH ROW
  WHEN (NEW.patient_code IS NULL OR NEW.patient_code = '')
  EXECUTE FUNCTION generate_patient_code();

-- =====================================================
-- 6. PRESCRIPTION NUMBER GENERATION FUNCTION
-- =====================================================

CREATE OR REPLACE FUNCTION generate_prescription_number()
RETURNS TRIGGER AS $$
DECLARE
  new_number VARCHAR(30);
  code_exists BOOLEAN;
  date_prefix VARCHAR(8);
  random_suffix VARCHAR(6);
BEGIN
  -- Generate a unique prescription number in format RX-YYYYMMDD-XXXXXX
  date_prefix := TO_CHAR(CURRENT_DATE, 'YYYYMMDD');
  
  LOOP
    random_suffix := LPAD(FLOOR(RANDOM() * 1000000)::TEXT, 6, '0');
    new_number := 'RX-' || date_prefix || '-' || random_suffix;
    SELECT EXISTS(SELECT 1 FROM prescriptions WHERE prescription_number = new_number) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  
  NEW.prescription_number := new_number;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
DROP TRIGGER IF EXISTS trigger_generate_prescription_number ON prescriptions;

CREATE TRIGGER trigger_generate_prescription_number
  BEFORE INSERT ON prescriptions
  FOR EACH ROW
  WHEN (NEW.prescription_number IS NULL OR NEW.prescription_number = '')
  EXECUTE FUNCTION generate_prescription_number();

-- =====================================================
-- 7. VIEWS FOR QUICK ACCESS
-- =====================================================

-- Active Patients per Doctor
CREATE OR REPLACE VIEW doctor_patients_summary AS
SELECT 
  d.id as doctor_id,
  d.full_name as doctor_name,
  d.specialization,
  COUNT(p.id) as total_patients,
  COUNT(CASE WHEN p.status = 'active' THEN 1 END) as active_patients
FROM doctors d
LEFT JOIN patients p ON d.id = p.assigned_doctor_id
GROUP BY d.id, d.full_name, d.specialization;

-- Pending Prescriptions
CREATE OR REPLACE VIEW pending_prescriptions AS
SELECT 
  pr.id,
  pr.prescription_number,
  pr.created_at,
  p.patient_code,
  p.full_name as patient_name,
  d.full_name as doctor_name,
  d.license_number,
  pr.diagnosis,
  pr.medications,
  pr.status
FROM prescriptions pr
JOIN patients p ON pr.patient_id = p.id
JOIN doctors d ON pr.doctor_id = d.id
WHERE pr.status = 'pending' OR pr.status = 'sent_to_pharmacy'
ORDER BY pr.created_at DESC;

-- =====================================================
-- 8. ADD FOREIGN KEY TO MEMBERSHIP_TRANSACTIONS
-- =====================================================

-- Add foreign key constraint with ON DELETE CASCADE
ALTER TABLE membership_transactions
DROP CONSTRAINT IF EXISTS fk_membership_transactions_membership_id;

ALTER TABLE membership_transactions
ADD CONSTRAINT fk_membership_transactions_membership_id
FOREIGN KEY (membership_id)
REFERENCES customer_memberships(id)
ON DELETE CASCADE;

-- =====================================================
-- 9. ENABLE RLS ON NEW TABLES
-- =====================================================

ALTER TABLE doctors ENABLE ROW LEVEL SECURITY;
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read access to doctors" ON doctors;
DROP POLICY IF EXISTS "Allow read access to patients" ON patients;
DROP POLICY IF EXISTS "Allow read access to prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Allow read access to appointments" ON appointments;
DROP POLICY IF EXISTS "Allow staff to manage doctors" ON doctors;
DROP POLICY IF EXISTS "Allow staff to manage patients" ON patients;
DROP POLICY IF EXISTS "Allow staff to manage prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Allow staff to manage appointments" ON appointments;
DROP POLICY IF EXISTS "Doctors can read their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can update their own data" ON doctors;
DROP POLICY IF EXISTS "Doctors can read their patients" ON patients;
DROP POLICY IF EXISTS "Doctors can read their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can manage their prescriptions" ON prescriptions;
DROP POLICY IF EXISTS "Doctors can read their appointments" ON appointments;

-- Allow authenticated users to read doctors (for selection)
CREATE POLICY "Allow read access to doctors" ON doctors FOR SELECT USING (true);

-- Allow authenticated users to read patients
CREATE POLICY "Allow read access to patients" ON patients FOR SELECT USING (true);

-- Allow authenticated users to read prescriptions
CREATE POLICY "Allow read access to prescriptions" ON prescriptions FOR SELECT USING (true);

-- Allow authenticated users to read appointments
CREATE POLICY "Allow read access to appointments" ON appointments FOR SELECT USING (true);

-- Allow staff/admin to manage all (adjust based on your auth logic)
CREATE POLICY "Allow staff to manage doctors" ON doctors FOR ALL USING (true);
CREATE POLICY "Allow staff to manage patients" ON patients FOR ALL USING (true);
CREATE POLICY "Allow staff to manage prescriptions" ON prescriptions FOR ALL USING (true);
CREATE POLICY "Allow staff to manage appointments" ON appointments FOR ALL USING (true);

-- =====================================================
-- MIGRATION COMPLETE
-- =====================================================
