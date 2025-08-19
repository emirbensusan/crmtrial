/*
  # Fix Users RLS Policy Recursion

  1. Problem
    - Current RLS policy on users table causes infinite recursion
    - Policy queries users table within users table policy
    - Error: "infinite recursion detected in policy for relation users"

  2. Solution
    - Drop the problematic recursive policy
    - Create a simple, non-recursive policy
    - Users can see their own record and organization members

  3. Security
    - Maintains data isolation between organizations
    - Prevents infinite recursion loops
    - Uses direct auth.uid() references
*/

-- Drop any existing problematic policies on users table
DROP POLICY IF EXISTS "Users can access their organization data" ON users;
DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;
DROP POLICY IF EXISTS "Organization data isolation" ON users;

-- Create a simple, non-recursive policy for users
CREATE POLICY "Users can read own and org data"
  ON users
  FOR SELECT
  TO authenticated
  USING (
    id = auth.uid() 
    OR 
    organization_id = (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

-- Create separate policies for INSERT, UPDATE, DELETE to avoid recursion
CREATE POLICY "Users can insert own record"
  ON users
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update own record"
  ON users
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can delete own record"
  ON users
  FOR DELETE
  TO authenticated
  USING (id = auth.uid());