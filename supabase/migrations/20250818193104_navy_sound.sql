/*
  # Comprehensive RLS Policy Fix

  1. Security
    - Fix infinite recursion in users table policies
    - Implement proper multi-tenant data isolation
    - Add secure policies for all tables

  2. Changes
    - Drop problematic recursive policies
    - Create simple, secure policies using auth.uid()
    - Ensure organization-level data isolation
*/

-- Drop all existing problematic policies on users table
DROP POLICY IF EXISTS "Users can only access own record" ON users;
DROP POLICY IF EXISTS "Users can access their organization data" ON users;
DROP POLICY IF EXISTS "Organization data isolation" ON users;

-- Create simple, non-recursive policy for users
CREATE POLICY "users_own_record_only"
ON users FOR ALL TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Fix other table policies to avoid recursion
DROP POLICY IF EXISTS "Organization data isolation" ON leads;
CREATE POLICY "leads_organization_isolation"
ON leads FOR ALL TO authenticated
USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
)
WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Organization data isolation" ON customers;
CREATE POLICY "customers_organization_isolation"
ON customers FOR ALL TO authenticated
USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
)
WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Organization data isolation" ON deals;
CREATE POLICY "deals_organization_isolation"
ON deals FOR ALL TO authenticated
USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
)
WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

DROP POLICY IF EXISTS "Organization data isolation" ON activities;
CREATE POLICY "activities_organization_isolation"
ON activities FOR ALL TO authenticated
USING (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
)
WITH CHECK (
  organization_id = (
    SELECT organization_id 
    FROM users 
    WHERE id = auth.uid() 
    LIMIT 1
  )
);

-- Ensure all tables have RLS enabled
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE deals ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;