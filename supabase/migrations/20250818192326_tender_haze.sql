/*
  # Fix Users RLS Policy Recursion

  1. Problem
    - Current RLS policy on users table causes infinite recursion
    - Queries that join with users table fail with error 42P17
    - Affects deals and customers queries that need user information

  2. Solution
    - Drop all existing problematic policies on users table
    - Create simple, non-recursive policies
    - Use auth.uid() directly to avoid circular references

  3. Security
    - Users can only see their own record
    - This prevents recursion while maintaining security
    - Can be expanded later once basic functionality works
*/

-- Drop all existing policies on users table that might cause recursion
DROP POLICY IF EXISTS "Users can read own and org data" ON users;
DROP POLICY IF EXISTS "Users can insert own record" ON users;
DROP POLICY IF EXISTS "Users can update own record" ON users;
DROP POLICY IF EXISTS "Users can delete own record" ON users;
DROP POLICY IF EXISTS "Organization data isolation" ON users;
DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;
DROP POLICY IF EXISTS "Users can access their organization data" ON users;

-- Create simple, non-recursive policy for users table
CREATE POLICY "Users can only access own record"
ON users FOR ALL TO authenticated 
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

-- Ensure RLS is enabled on users table
ALTER TABLE users ENABLE ROW LEVEL SECURITY;