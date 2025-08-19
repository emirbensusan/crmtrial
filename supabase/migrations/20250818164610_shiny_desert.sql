/*
  # Comprehensive CRM Database Schema

  ## Overview
  This migration creates a complete CRM system with multi-tenant support, comprehensive lead/customer tracking, 
  sales funnel management, and detailed business relationship data.

  ## 1. New Tables
  
  ### Core Business Entities
  - `organizations` - Multi-tenant organization support
  - `users` - User management with roles and AI preferences
  - `leads` - Potential customers with complete business details
  - `customers` - Active customers with relationship management
  - `contacts` - People within companies (leads/customers)
  - `deals` - Sales opportunities with funnel tracking
  - `activities` - All interactions (calls, meetings, emails, etc.)
  - `customer_requests` - Track specific customer requests and actions needed
  
  ### Reference/Lookup Tables
  - `lead_sources` - Website, referral, LinkedIn, etc.
  - `product_lines` - Your company's product offerings
  - `sales_funnel_stages` - Customizable sales pipeline stages
  - `customer_types` - New, existing, VIP, etc.
  - `payment_terms` - Standard payment term options
  - `currencies` - Supported currencies
  - `activity_types` - Call, meeting, email, demo, etc.
  - `request_types` - New terms, currency change, demo, etc.
  - `action_owners` - Leadership, sales, finance, specific people

  ## 2. Security
  - Enable RLS on all tables
  - Multi-tenant isolation by organization
  - Role-based access policies
  - Comprehensive audit logging

  ## 3. Key Features
  - Unique code generation for leads/customers
  - Complete address and contact information
  - Sales funnel probability tracking
  - Payment terms management (requested vs offered vs effective)
  - Multi-currency support
  - Comprehensive activity tracking
  - Customer request management system
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Organizations table (multi-tenant support)
CREATE TABLE IF NOT EXISTS organizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  domain text UNIQUE,
  settings jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Users table with roles and AI toggle
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'manager', 'sales', 'user')),
  use_ai boolean DEFAULT true,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Reference Tables
CREATE TABLE IF NOT EXISTS lead_sources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS product_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS sales_funnel_stages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  order_index integer NOT NULL,
  probability_range text CHECK (probability_range IN ('low', 'medium', 'high')),
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS customer_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS payment_terms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  days integer NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS currencies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text UNIQUE NOT NULL,
  name text NOT NULL,
  symbol text NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activity_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  icon text,
  color text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS request_types (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS action_owners (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text CHECK (type IN ('department', 'person')),
  email text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Leads table with comprehensive business details
CREATE TABLE IF NOT EXISTS leads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  unique_code text NOT NULL,
  
  -- Company Information
  company_name text NOT NULL,
  company_country text NOT NULL,
  company_address text,
  
  -- Contact Information
  poc_name text NOT NULL,
  poc_title text,
  poc_email text,
  poc_phone text,
  
  -- Business Details
  lead_source_id uuid REFERENCES lead_sources(id),
  product_line_id uuid REFERENCES product_lines(id),
  sales_funnel_stage_id uuid REFERENCES sales_funnel_stages(id),
  
  -- Assignment and Status
  owner_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'closed-won', 'closed-lost')),
  
  -- Scoring and Probability
  lead_score integer DEFAULT 0 CHECK (lead_score >= 0 AND lead_score <= 100),
  close_probability text DEFAULT 'low' CHECK (close_probability IN ('low', 'medium', 'high')),
  
  -- Payment Information
  payment_terms_requested_id uuid REFERENCES payment_terms(id),
  payment_terms_offered_id uuid REFERENCES payment_terms(id),
  payment_currency_id uuid REFERENCES currencies(id),
  
  -- Estimated Value
  estimated_value decimal(15,2),
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, unique_code)
);

-- Customers table (converted leads or direct customers)
CREATE TABLE IF NOT EXISTS customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id), -- Reference to original lead if converted
  unique_code text NOT NULL,
  
  -- Company Information
  company_name text NOT NULL,
  company_country text NOT NULL,
  company_address text,
  
  -- Contact Information
  poc_name text NOT NULL,
  poc_title text,
  poc_email text,
  poc_phone text,
  
  -- Business Classification
  customer_type_id uuid REFERENCES customer_types(id),
  product_line_id uuid REFERENCES product_lines(id),
  
  -- Assignment and Status
  owner_id uuid REFERENCES users(id),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'churned', 'prospect')),
  
  -- Payment Information
  payment_terms_effective_id uuid REFERENCES payment_terms(id),
  payment_currency_id uuid REFERENCES currencies(id),
  
  -- Business Metrics
  lifetime_value decimal(15,2) DEFAULT 0,
  annual_value decimal(15,2) DEFAULT 0,
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  UNIQUE(organization_id, unique_code)
);

-- Contacts table (people within companies)
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  customer_id uuid REFERENCES customers(id),
  
  -- Personal Information
  full_name text NOT NULL,
  title text,
  email text,
  phone text,
  
  -- Contact Details
  is_primary boolean DEFAULT false,
  is_decision_maker boolean DEFAULT false,
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- Deals table (sales opportunities)
CREATE TABLE IF NOT EXISTS deals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  customer_id uuid REFERENCES customers(id),
  
  -- Deal Information
  name text NOT NULL,
  description text,
  value decimal(15,2) NOT NULL,
  currency_id uuid REFERENCES currencies(id),
  
  -- Sales Process
  sales_funnel_stage_id uuid REFERENCES sales_funnel_stages(id),
  close_probability text DEFAULT 'low' CHECK (close_probability IN ('low', 'medium', 'high')),
  expected_close_date date,
  
  -- Assignment
  owner_id uuid REFERENCES users(id),
  
  -- Status
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost', 'on-hold')),
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  
  CHECK (lead_id IS NOT NULL OR customer_id IS NOT NULL)
);

-- Activities table (all interactions)
CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  customer_id uuid REFERENCES customers(id),
  deal_id uuid REFERENCES deals(id),
  contact_id uuid REFERENCES contacts(id),
  
  -- Activity Details
  activity_type_id uuid REFERENCES activity_types(id),
  subject text NOT NULL,
  description text,
  
  -- Scheduling
  scheduled_at timestamptz,
  completed_at timestamptz,
  duration_minutes integer,
  
  -- Assignment
  owner_id uuid REFERENCES users(id),
  
  -- Status and Priority
  status text NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no-show')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- AI Integration
  ai_summary text,
  ai_action_items jsonb DEFAULT '[]',
  
  -- Metadata
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Customer Requests table
CREATE TABLE IF NOT EXISTS customer_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  customer_id uuid REFERENCES customers(id) ON DELETE CASCADE,
  lead_id uuid REFERENCES leads(id),
  
  -- Request Details
  request_type_id uuid REFERENCES request_types(id),
  title text NOT NULL,
  description text,
  
  -- Assignment and Action
  action_owner_id uuid REFERENCES action_owners(id),
  assigned_user_id uuid REFERENCES users(id),
  
  -- Status and Priority
  status text NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'completed', 'cancelled')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  
  -- Dates
  requested_date date DEFAULT CURRENT_DATE,
  due_date date,
  completed_date date,
  
  -- Metadata
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Audit Logs table
CREATE TABLE IF NOT EXISTS audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid REFERENCES organizations(id) ON DELETE CASCADE,
  user_id uuid REFERENCES users(id),
  
  -- Audit Details
  table_name text NOT NULL,
  record_id uuid NOT NULL,
  action text NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
  old_values jsonb,
  new_values jsonb,
  
  -- Metadata
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_funnel_stages ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_terms ENABLE ROW LEVEL SECURITY;
ALTER TABLE currencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE action_owners ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS Policies (Multi-tenant isolation)
CREATE POLICY "Organizations can only see their own data" ON organizations
  FOR ALL TO authenticated
  USING (id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Users can only see their organization's users" ON users
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON leads
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON customers
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON contacts
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON deals
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON activities
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON customer_requests
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Apply same pattern to all reference tables
CREATE POLICY "Organization data isolation" ON lead_sources
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON product_lines
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON sales_funnel_stages
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON customer_types
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON payment_terms
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON activity_types
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON request_types
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON action_owners
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

CREATE POLICY "Organization data isolation" ON audit_logs
  FOR ALL TO authenticated
  USING (organization_id IN (
    SELECT organization_id FROM users WHERE id = auth.uid()
  ));

-- Currencies are global (no organization_id)
CREATE POLICY "Currencies are readable by all authenticated users" ON currencies
  FOR SELECT TO authenticated
  USING (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_leads_organization_id ON leads(organization_id);
CREATE INDEX IF NOT EXISTS idx_leads_unique_code ON leads(organization_id, unique_code);
CREATE INDEX IF NOT EXISTS idx_leads_owner_id ON leads(owner_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_customers_organization_id ON customers(organization_id);
CREATE INDEX IF NOT EXISTS idx_customers_unique_code ON customers(organization_id, unique_code);
CREATE INDEX IF NOT EXISTS idx_customers_owner_id ON customers(owner_id);
CREATE INDEX IF NOT EXISTS idx_contacts_lead_id ON contacts(lead_id);
CREATE INDEX IF NOT EXISTS idx_contacts_customer_id ON contacts(customer_id);
CREATE INDEX IF NOT EXISTS idx_deals_lead_id ON deals(lead_id);
CREATE INDEX IF NOT EXISTS idx_deals_customer_id ON deals(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_lead_id ON activities(lead_id);
CREATE INDEX IF NOT EXISTS idx_activities_customer_id ON activities(customer_id);
CREATE INDEX IF NOT EXISTS idx_activities_owner_id ON activities(owner_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_table_record ON audit_logs(table_name, record_id);

-- Functions for automatic unique code generation
CREATE OR REPLACE FUNCTION generate_unique_code(prefix text, organization_uuid uuid)
RETURNS text AS $$
DECLARE
  counter integer;
  new_code text;
BEGIN
  -- Get the next counter value for this organization and prefix
  SELECT COALESCE(MAX(CAST(SUBSTRING(unique_code FROM LENGTH(prefix) + 2) AS integer)), 0) + 1
  INTO counter
  FROM (
    SELECT unique_code FROM leads WHERE organization_id = organization_uuid AND unique_code LIKE prefix || '-%'
    UNION ALL
    SELECT unique_code FROM customers WHERE organization_id = organization_uuid AND unique_code LIKE prefix || '-%'
  ) combined_codes;
  
  new_code := prefix || '-' || LPAD(counter::text, 6, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger function to auto-generate unique codes
CREATE OR REPLACE FUNCTION auto_generate_unique_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.unique_code IS NULL OR NEW.unique_code = '' THEN
    IF TG_TABLE_NAME = 'leads' THEN
      NEW.unique_code := generate_unique_code('LEAD', NEW.organization_id);
    ELSIF TG_TABLE_NAME = 'customers' THEN
      NEW.unique_code := generate_unique_code('CUST', NEW.organization_id);
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for auto-generating unique codes
CREATE TRIGGER trigger_leads_unique_code
  BEFORE INSERT ON leads
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_unique_code();

CREATE TRIGGER trigger_customers_unique_code
  BEFORE INSERT ON customers
  FOR EACH ROW
  EXECUTE FUNCTION auto_generate_unique_code();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER trigger_organizations_updated_at
  BEFORE UPDATE ON organizations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_leads_updated_at
  BEFORE UPDATE ON leads
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_deals_updated_at
  BEFORE UPDATE ON deals
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_activities_updated_at
  BEFORE UPDATE ON activities
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customer_requests_updated_at
  BEFORE UPDATE ON customer_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();