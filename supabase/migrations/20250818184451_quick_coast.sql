/*
  # Fix Users RLS Policy Infinite Recursion

  1. Problem
    - Current RLS policy on users table creates infinite recursion
    - Policy queries users table from within users table policy
    - Causes "infinite recursion detected in policy for relation users" error

  2. Solution
    - Drop existing problematic policy
    - Create new policy using auth.jwt() directly
    - Avoids querying users table from within users policy
    - Uses JWT token organization_id claim instead

  3. Security
    - Maintains same security level
    - Users can only see users from their organization
    - Uses authenticated user's JWT metadata
*/

-- Drop the existing problematic policy
DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;

-- Create new policy using auth.jwt() to avoid recursion
CREATE POLICY "Users can only see their organization's users" 
ON users FOR ALL 
TO authenticated 
USING (organization_id = (auth.jwt() ->> 'organization_id')::uuid);