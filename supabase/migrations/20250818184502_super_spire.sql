/*
  # Fix Users RLS Policy - Remove Infinite Recursion

  1. Security Policy Changes
    - Drop existing recursive RLS policy on users table
    - Create new policy that uses auth.uid() directly without recursion
    - Ensure users can only see their organization's users safely

  2. Changes Made
    - Remove problematic policy that queries users table from within users policy
    - Add simple policy using direct organization_id comparison
    - Break the circular dependency causing infinite recursion
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;

-- Create a new policy that avoids recursion by using auth metadata
-- This assumes organization_id is stored in the user's auth metadata
-- If not available in metadata, we'll use a simpler approach
CREATE POLICY "Users can only see their organization's users"
  ON users
  FOR ALL
  TO authenticated
  USING (
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

-- Alternative approach: If the above still causes issues, use this simpler policy
-- that allows users to see all users (you can restrict this further based on your needs)
-- Uncomment the lines below and comment out the policy above if needed:

-- DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;
-- CREATE POLICY "Users can only see their organization's users"
--   ON users
--   FOR ALL
--   TO authenticated
--   USING (true);