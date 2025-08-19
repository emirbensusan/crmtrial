/*
  # Seed Initial Reference Data

  This migration populates the reference tables with common business data
  that organizations can use as starting points and customize as needed.
*/

-- Insert common currencies
INSERT INTO currencies (code, name, symbol) VALUES
('USD', 'US Dollar', '$'),
('EUR', 'Euro', '€'),
('GBP', 'British Pound', '£'),
('CAD', 'Canadian Dollar', 'C$'),
('AUD', 'Australian Dollar', 'A$'),
('JPY', 'Japanese Yen', '¥'),
('CHF', 'Swiss Franc', 'CHF'),
('CNY', 'Chinese Yuan', '¥'),
('INR', 'Indian Rupee', '₹'),
('TRY', 'Turkish Lira', '₺')
ON CONFLICT (code) DO NOTHING;

-- Note: Organization-specific reference data will be seeded when organizations are created
-- This includes: lead_sources, product_lines, sales_funnel_stages, customer_types, 
-- payment_terms, activity_types, request_types, action_owners, relationship_statuses, 
-- and follow_up_action_types

-- These will be populated via the application when the first user signs up for each organization