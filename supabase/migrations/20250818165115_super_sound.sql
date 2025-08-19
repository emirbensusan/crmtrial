/*
  # Enhanced CRM Schema - Sales Metrics & Financial Performance

  ## Overview
  This migration adds comprehensive sales conversion metrics, financial performance tracking,
  and relationship management features to the existing CRM schema.

  ## 1. New Tables
  
  ### Sales Performance Tracking
  - `deal_conversions` - Track conversion metrics and sales cycle data
  - `customer_financial_performance` - Multi-year revenue tracking
  - `follow_up_schedules` - Next actions and relationship management
  
  ### Enhanced Reference Tables
  - `relationship_statuses` - Active, dormant, churned, etc.
  - `follow_up_action_types` - Call, email, meeting, proposal, etc.

  ## 2. Enhanced Existing Tables
  - Add conversion tracking fields to deals
  - Add financial performance fields to customers
  - Add follow-up management to leads and customers

  ## 3. Auto-calculated Fields
  - Sales cycle length
  - Total lifetime value
  - Yearly balance calculations
  - Engagement duration

  ## 4. Dashboard Summary Views
  - Total leads and conversion rates
  - Average sales cycle metrics
  - Revenue performance summaries
*/

-- Enhanced relationship status reference table
CREATE TABLE IF NOT EXISTS relationship_statuses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  color text DEFAULT 'gray',
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Follow-up action types
CREATE TABLE IF NOT EXISTS follow_up_action_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  icon text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Sales conversion metrics table
CREATE TABLE IF NOT EXISTS deal_conversions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  deal_id uuid REFERENCES deals(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  customer_id uuid REFERENCES customers(id),
  
  -- Conversion Tracking
  first_contact_date date,
  conversion_date date,
  sales_cycle_length_days integer, -- Auto-calculated
  number_of_visits integer DEFAULT 0,
  
  -- Deal Details
  deal_value decimal(15,2),
  currency_id uuid REFERENCES currencies(id),
  payment_terms_id uuid REFERENCES payment_terms(id),
  
  -- Pipeline Status
  close_probability text DEFAULT 'medium' CHECK (close_probability IN ('low', 'medium', 'high')),
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(deal_id)
);

-- Customer financial performance tracking
CREATE TABLE IF NOT EXISTS customer_financial_performance (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  
  -- Multi-year Revenue Tracking
  year_1_revenue decimal(15,2) DEFAULT 0,
  year_2_revenue decimal(15,2) DEFAULT 0,
  year_3_revenue decimal(15,2) DEFAULT 0,
  year_4_revenue decimal(15,2) DEFAULT 0,
  year_5_revenue decimal(15,2) DEFAULT 0,
  
  -- Auto-calculated fields
  total_lifetime_value decimal(15,2) DEFAULT 0, -- Sum of all yearly revenues
  yearly_balance decimal(15,2) DEFAULT 0, -- This year - last year
  
  -- Currency
  currency_id uuid REFERENCES currencies(id),
  
  -- Performance Period
  performance_start_date date DEFAULT CURRENT_DATE,
  last_updated timestamptz DEFAULT now(),
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(customer_id)
);

-- Follow-up and relationship management
CREATE TABLE IF NOT EXISTS follow_up_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  customer_id uuid REFERENCES customers(id),
  
  -- Follow-up Details
  next_action_date date,
  follow_up_action_type_id uuid REFERENCES follow_up_action_types(id),
  action_description text,
  
  -- Relationship Management
  relationship_status_id uuid REFERENCES relationship_statuses(id),
  
  -- Assignment
  assigned_user_id uuid REFERENCES users(id),
  
  -- Status
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'overdue', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Completion Tracking
  completed_date date,
  completion_notes text,
  
  -- Special Requirements
  special_requirements text,
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- Add enhanced fields to existing leads table
DO $$
BEGIN
  -- Sales Conversion Fields
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'first_contact_date') THEN
    ALTER TABLE leads ADD COLUMN first_contact_date date DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'number_of_visits') THEN
    ALTER TABLE leads ADD COLUMN number_of_visits integer DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'engagement_duration_days') THEN
    ALTER TABLE leads ADD COLUMN engagement_duration_days integer DEFAULT 0;
  END IF;
  
  -- Relationship Management
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'relationship_status_id') THEN
    ALTER TABLE leads ADD COLUMN relationship_status_id uuid REFERENCES relationship_statuses(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'next_follow_up_date') THEN
    ALTER TABLE leads ADD COLUMN next_follow_up_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'leads' AND column_name = 'special_requirements') THEN
    ALTER TABLE leads ADD COLUMN special_requirements text;
  END IF;
END $$;

-- Add enhanced fields to existing customers table
DO $$
BEGIN
  -- Relationship Management
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'relationship_status_id') THEN
    ALTER TABLE customers ADD COLUMN relationship_status_id uuid REFERENCES relationship_statuses(id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'next_follow_up_date') THEN
    ALTER TABLE customers ADD COLUMN next_follow_up_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'special_requirements') THEN
    ALTER TABLE customers ADD COLUMN special_requirements text;
  END IF;
  
  -- Conversion Tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'conversion_date') THEN
    ALTER TABLE customers ADD COLUMN conversion_date date;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'first_deal_value') THEN
    ALTER TABLE customers ADD COLUMN first_deal_value decimal(15,2);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'sales_cycle_length_days') THEN
    ALTER TABLE customers ADD COLUMN sales_cycle_length_days integer;
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE relationship_statuses ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_action_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_conversions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_financial_performance ENABLE ROW LEVEL SECURITY;
ALTER TABLE follow_up_schedules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for new tables
CREATE POLICY "Organization data isolation" ON relationship_statuses
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON follow_up_action_types
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON deal_conversions
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON customer_financial_performance
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON follow_up_schedules
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_deal_conversions_deal_id ON deal_conversions(deal_id);
CREATE INDEX IF NOT EXISTS idx_deal_conversions_organization_id ON deal_conversions(organization_id);
CREATE INDEX IF NOT EXISTS idx_customer_financial_performance_customer_id ON customer_financial_performance(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedules_next_action_date ON follow_up_schedules(next_action_date);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedules_status ON follow_up_schedules(status);
CREATE INDEX IF NOT EXISTS idx_follow_up_schedules_assigned_user_id ON follow_up_schedules(assigned_user_id);

-- Functions for auto-calculations

-- Function to calculate sales cycle length
CREATE OR REPLACE FUNCTION calculate_sales_cycle_length()
RETURNS trigger AS $$
BEGIN
  -- Calculate sales cycle length when conversion date is set
  IF NEW.conversion_date IS NOT NULL AND NEW.first_contact_date IS NOT NULL THEN
    NEW.sales_cycle_length_days := NEW.conversion_date - NEW.first_contact_date;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate total lifetime value
CREATE OR REPLACE FUNCTION calculate_lifetime_value()
RETURNS trigger AS $$
BEGIN
  -- Calculate total lifetime value as sum of all yearly revenues
  NEW.total_lifetime_value := COALESCE(NEW.year_1_revenue, 0) + 
                             COALESCE(NEW.year_2_revenue, 0) + 
                             COALESCE(NEW.year_3_revenue, 0) + 
                             COALESCE(NEW.year_4_revenue, 0) + 
                             COALESCE(NEW.year_5_revenue, 0);
  
  -- Calculate yearly balance (this year - last year)
  -- Assuming year_1 is current year, year_2 is previous year
  NEW.yearly_balance := COALESCE(NEW.year_1_revenue, 0) - COALESCE(NEW.year_2_revenue, 0);
  
  NEW.last_updated := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update follow-up status based on dates
CREATE OR REPLACE FUNCTION update_follow_up_status()
RETURNS trigger AS $$
BEGIN
  -- Mark as overdue if next_action_date is in the past and status is still pending
  IF NEW.next_action_date < CURRENT_DATE AND NEW.status = 'pending' THEN
    NEW.status := 'overdue';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-calculations
CREATE TRIGGER trigger_calculate_sales_cycle_length
  BEFORE INSERT OR UPDATE ON deal_conversions
  FOR EACH ROW
  EXECUTE FUNCTION calculate_sales_cycle_length();

CREATE TRIGGER trigger_calculate_lifetime_value
  BEFORE INSERT OR UPDATE ON customer_financial_performance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_lifetime_value();

CREATE TRIGGER trigger_update_follow_up_status
  BEFORE INSERT OR UPDATE ON follow_up_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_follow_up_status();

-- Create triggers for updated_at timestamps
CREATE TRIGGER trigger_deal_conversions_updated_at
  BEFORE UPDATE ON deal_conversions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customer_financial_performance_updated_at
  BEFORE UPDATE ON customer_financial_performance
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_follow_up_schedules_updated_at
  BEFORE UPDATE ON follow_up_schedules
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Create views for dashboard summaries

-- Summary view for leads and conversions
CREATE OR REPLACE VIEW dashboard_lead_summary AS
SELECT 
  l.organization_id,
  COUNT(*) as total_leads,
  COUNT(CASE WHEN l.status = 'closed-won' THEN 1 END) as won_deals,
  ROUND(
    (COUNT(CASE WHEN l.status = 'closed-won' THEN 1 END)::decimal / COUNT(*)) * 100, 2
  ) as conversion_rate_percent,
  AVG(CASE WHEN dc.sales_cycle_length_days IS NOT NULL THEN dc.sales_cycle_length_days END) as avg_sales_cycle_days,
  SUM(CASE WHEN l.status = 'closed-won' THEN l.estimated_value ELSE 0 END) as total_won_revenue
FROM leads l
LEFT JOIN deal_conversions dc ON l.id = dc.lead_id
GROUP BY l.organization_id;

-- Summary view for customer financial performance
CREATE OR REPLACE VIEW dashboard_customer_financial_summary AS
SELECT 
  cfp.organization_id,
  COUNT(*) as total_customers,
  SUM(cfp.total_lifetime_value) as total_lifetime_value,
  AVG(cfp.total_lifetime_value) as avg_customer_value,
  SUM(cfp.year_1_revenue) as current_year_revenue,
  SUM(cfp.yearly_balance) as total_yearly_growth
FROM customer_financial_performance cfp
JOIN customers c ON cfp.customer_id = c.id
WHERE c.status = 'active'
GROUP BY cfp.organization_id;

-- Summary view for overdue follow-ups
CREATE OR REPLACE VIEW dashboard_overdue_followups AS
SELECT 
  fs.organization_id,
  COUNT(*) as overdue_count,
  COUNT(CASE WHEN fs.priority = 'high' OR fs.priority = 'urgent' THEN 1 END) as high_priority_overdue
FROM follow_up_schedules fs
WHERE fs.status = 'overdue'
GROUP BY fs.organization_id;