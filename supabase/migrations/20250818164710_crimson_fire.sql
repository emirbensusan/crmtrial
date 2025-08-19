/*
  # Seed Initial CRM Data

  ## Overview
  This migration seeds the database with initial reference data and sample records
  for testing and development purposes.

  ## 1. Reference Data
  - Default currencies (USD, EUR, TRY, etc.)
  - Common lead sources
  - Standard payment terms
  - Sales funnel stages
  - Activity types
  - Request types
  - Action owners

  ## 2. Sample Organization
  - Demo organization for testing
  - Sample users with different roles
  - Sample leads and customers
*/

-- Insert default currencies
INSERT INTO currencies (code, name, symbol) VALUES
  ('USD', 'US Dollar', '$'),
  ('EUR', 'Euro', '€'),
  ('TRY', 'Turkish Lira', '₺'),
  ('GBP', 'British Pound', '£'),
  ('JPY', 'Japanese Yen', '¥'),
  ('CAD', 'Canadian Dollar', 'C$'),
  ('AUD', 'Australian Dollar', 'A$')
ON CONFLICT (code) DO NOTHING;

-- Create a demo organization
INSERT INTO organizations (id, name, domain, settings) VALUES
  ('550e8400-e29b-41d4-a716-446655440000', 'MDJS Demo Company', 'mdjs-demo.com', '{"timezone": "UTC", "currency": "USD"}')
ON CONFLICT (id) DO NOTHING;

-- Get the demo organization ID for reference
DO $$
DECLARE
  demo_org_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN

-- Insert lead sources
INSERT INTO lead_sources (organization_id, name, description) VALUES
  (demo_org_id, 'Website', 'Leads from company website contact forms'),
  (demo_org_id, 'LinkedIn', 'Leads from LinkedIn outreach and connections'),
  (demo_org_id, 'Referral', 'Leads from existing customer referrals'),
  (demo_org_id, 'Trade Show', 'Leads from industry trade shows and events'),
  (demo_org_id, 'Cold Email', 'Leads from cold email campaigns'),
  (demo_org_id, 'Phone Call', 'Leads from cold calling efforts'),
  (demo_org_id, 'Social Media', 'Leads from social media platforms'),
  (demo_org_id, 'Partner', 'Leads from business partners');

-- Insert product lines
INSERT INTO product_lines (organization_id, name, description) VALUES
  (demo_org_id, 'Enterprise Software', 'Large-scale enterprise software solutions'),
  (demo_org_id, 'SaaS Platform', 'Cloud-based software as a service'),
  (demo_org_id, 'Consulting Services', 'Professional consulting and implementation'),
  (demo_org_id, 'Support & Maintenance', 'Ongoing support and maintenance services'),
  (demo_org_id, 'Training & Education', 'User training and educational services');

-- Insert sales funnel stages
INSERT INTO sales_funnel_stages (organization_id, name, order_index, probability_range) VALUES
  (demo_org_id, 'Lead', 1, 'low'),
  (demo_org_id, 'Qualified', 2, 'low'),
  (demo_org_id, 'Proposal', 3, 'medium'),
  (demo_org_id, 'Negotiation', 4, 'high'),
  (demo_org_id, 'Closed Won', 5, 'high'),
  (demo_org_id, 'Closed Lost', 6, 'low');

-- Insert customer types
INSERT INTO customer_types (organization_id, name, description) VALUES
  (demo_org_id, 'New Customer', 'Recently acquired customers'),
  (demo_org_id, 'Existing Customer', 'Long-term established customers'),
  (demo_org_id, 'VIP Customer', 'High-value strategic customers'),
  (demo_org_id, 'Prospect', 'Potential customers in evaluation'),
  (demo_org_id, 'Partner', 'Business partners and resellers');

-- Insert payment terms
INSERT INTO payment_terms (organization_id, name, days, description) VALUES
  (demo_org_id, 'Net 15', 15, 'Payment due within 15 days'),
  (demo_org_id, 'Net 30', 30, 'Payment due within 30 days'),
  (demo_org_id, 'Net 45', 45, 'Payment due within 45 days'),
  (demo_org_id, 'Net 60', 60, 'Payment due within 60 days'),
  (demo_org_id, 'Net 90', 90, 'Payment due within 90 days'),
  (demo_org_id, 'Immediate', 0, 'Payment due immediately'),
  (demo_org_id, '2/10 Net 30', 30, '2% discount if paid within 10 days, otherwise net 30');

-- Insert activity types
INSERT INTO activity_types (organization_id, name, icon, color) VALUES
  (demo_org_id, 'Phone Call', 'phone', 'blue'),
  (demo_org_id, 'Email', 'mail', 'green'),
  (demo_org_id, 'Meeting', 'calendar', 'purple'),
  (demo_org_id, 'Demo', 'presentation', 'orange'),
  (demo_org_id, 'Proposal', 'file-text', 'indigo'),
  (demo_org_id, 'Follow-up', 'clock', 'yellow'),
  (demo_org_id, 'Site Visit', 'map-pin', 'red'),
  (demo_org_id, 'Contract Review', 'file-check', 'teal');

-- Insert request types
INSERT INTO request_types (organization_id, name, description) VALUES
  (demo_org_id, 'New Payment Terms', 'Customer requesting different payment terms'),
  (demo_org_id, 'Currency Change', 'Customer requesting different currency'),
  (demo_org_id, 'Due Date Extension', 'Customer requesting extended due dates'),
  (demo_org_id, 'Direct Import', 'Customer requesting direct import services'),
  (demo_org_id, 'Product Demo', 'Customer requesting product demonstration'),
  (demo_org_id, 'Unresponsive Follow-up', 'Customer has become unresponsive'),
  (demo_org_id, 'Catalogue Request', 'Customer requesting product catalogue'),
  (demo_org_id, 'Technical Support', 'Customer requesting technical assistance'),
  (demo_org_id, 'Contract Renewal', 'Customer requesting contract renewal'),
  (demo_org_id, 'Pricing Inquiry', 'Customer requesting pricing information');

-- Insert action owners
INSERT INTO action_owners (organization_id, name, type, email) VALUES
  (demo_org_id, 'Leadership Team', 'department', 'leadership@mdjs-demo.com'),
  (demo_org_id, 'Sales Department', 'department', 'sales@mdjs-demo.com'),
  (demo_org_id, 'Finance Department', 'department', 'finance@mdjs-demo.com'),
  (demo_org_id, 'Customer Success', 'department', 'success@mdjs-demo.com'),
  (demo_org_id, 'Technical Support', 'department', 'support@mdjs-demo.com'),
  (demo_org_id, 'John Smith', 'person', 'john.smith@mdjs-demo.com'),
  (demo_org_id, 'Sarah Johnson', 'person', 'sarah.johnson@mdjs-demo.com'),
  (demo_org_id, 'Mike Davis', 'person', 'mike.davis@mdjs-demo.com');

END $$;