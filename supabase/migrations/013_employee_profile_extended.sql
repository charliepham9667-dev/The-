-- =============================================
-- Migration 013: Employee Profile Extended
-- Adds personal info fields, pay, banking,
-- benefits, notes, and employment history tables
-- =============================================

-- =============================================
-- 1. EXTEND PROFILES (personal info fields)
-- =============================================
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS date_of_birth DATE,
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact TEXT,
  ADD COLUMN IF NOT EXISTS emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS nationality TEXT,
  ADD COLUMN IF NOT EXISTS id_number TEXT;

-- =============================================
-- 2. PAY DETAILS (owner-only)
-- Drop and recreate if it was partially created
-- =============================================
DROP TABLE IF EXISTS employee_pay CASCADE;
CREATE TABLE employee_pay (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  pay_type TEXT NOT NULL DEFAULT 'monthly' CHECK (pay_type IN ('monthly', 'hourly', 'daily')),
  base_salary NUMERIC(15,2),
  hourly_rate NUMERIC(10,2),
  pay_currency TEXT DEFAULT 'VND',
  pay_frequency TEXT DEFAULT 'monthly' CHECK (pay_frequency IN ('weekly', 'biweekly', 'monthly')),
  next_review_date DATE,
  last_increase_date DATE,
  last_increase_amount NUMERIC(15,2),
  next_bonus_date DATE,
  bonus_notes TEXT,
  service_charge_eligible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_pay_staff ON employee_pay(staff_id);

ALTER TABLE employee_pay ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage pay details"
  ON employee_pay FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- =============================================
-- 3. BANKING DETAILS (owner-only, sensitive)
-- =============================================
DROP TABLE IF EXISTS employee_banking CASCADE;
CREATE TABLE employee_banking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  bank_name TEXT,
  account_name TEXT,
  account_number TEXT,
  branch TEXT,
  swift_code TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_banking_staff ON employee_banking(staff_id);

ALTER TABLE employee_banking ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners can manage banking details"
  ON employee_banking FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- =============================================
-- 4. EMPLOYMENT BENEFITS
-- =============================================
DROP TABLE IF EXISTS employee_benefits CASCADE;
CREATE TABLE employee_benefits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  health_insurance BOOLEAN DEFAULT false,
  social_insurance BOOLEAN DEFAULT false,
  probation_end_date DATE,
  contract_type TEXT DEFAULT 'indefinite' CHECK (contract_type IN ('probation', 'fixed_term', 'indefinite')),
  contract_start_date DATE,
  contract_end_date DATE,
  meal_allowance BOOLEAN DEFAULT false,
  transport_allowance BOOLEAN DEFAULT false,
  other_benefits TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_benefits_staff ON employee_benefits(staff_id);

ALTER TABLE employee_benefits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can read benefits"
  ON employee_benefits FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Owners can manage benefits"
  ON employee_benefits FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "Owners can update benefits"
  ON employee_benefits FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- =============================================
-- 5. MANAGEMENT NOTES (private)
-- =============================================
DROP TABLE IF EXISTS employee_notes CASCADE;
CREATE TABLE employee_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  note TEXT NOT NULL,
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employee_notes_staff ON employee_notes(staff_id);
CREATE INDEX idx_employee_notes_created ON employee_notes(created_at DESC);

ALTER TABLE employee_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can read notes"
  ON employee_notes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Owners and managers can add notes"
  ON employee_notes FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
    AND auth.uid() = author_id
  );

CREATE POLICY "Authors can update their own notes"
  ON employee_notes FOR UPDATE
  USING (auth.uid() = author_id);

-- =============================================
-- 6. EMPLOYMENT HISTORY
-- =============================================
DROP TABLE IF EXISTS employment_history CASCADE;
CREATE TABLE employment_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'hired', 'promotion', 'role_change', 'salary_change',
    'contract_renewal', 'warning', 'termination', 'other'
  )),
  description TEXT NOT NULL,
  effective_date DATE NOT NULL,
  recorded_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_employment_history_staff ON employment_history(staff_id);
CREATE INDEX idx_employment_history_date ON employment_history(effective_date DESC);

ALTER TABLE employment_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Owners and managers can read history"
  ON employment_history FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('owner', 'manager')
    )
  );

CREATE POLICY "Owners can manage history"
  ON employment_history FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

CREATE POLICY "Owners can update history"
  ON employment_history FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'owner'
    )
  );

-- =============================================
-- 7. PROFILES RLS: Staff can update own personal fields
-- =============================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE tablename = 'profiles'
    AND policyname = 'Users can update own personal info'
  ) THEN
    CREATE POLICY "Users can update own personal info"
      ON profiles FOR UPDATE
      USING (auth.uid() = id)
      WITH CHECK (auth.uid() = id);
  END IF;
END $$;
