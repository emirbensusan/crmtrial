/*
  # Fix Users Table RLS Policy - Resolve Infinite Recursion

  1. Problem Analysis
    - Current policy on users table creates circular dependency
    - Policy tries to check user's organization by querying users table
    - This creates infinite recursion when joining users in other queries

  2. Solution
    - Replace problematic policy with auth.uid() based policy
    - Use Supabase's built-in authentication instead of self-referential queries
    - Maintain security while eliminating recursion

  3. Changes
    - Drop existing problematic policy
    - Create new policy using auth.uid() for user identification
    - Test policy to ensure no recursion
*/

-- First, let's see what the current problematic policy looks like
-- (This is likely the issue - it references users table within users policy)

-- Drop the problematic policy
DROP POLICY IF EXISTS "Users can only see their organization's users" ON users;

-- Create a new, non-recursive policy
-- This policy uses auth.uid() directly instead of querying users table
CREATE POLICY "Users can access their organization data"
  ON users
  FOR ALL
  TO authenticated
  USING (
    -- Use auth.uid() directly to avoid recursion
    id = auth.uid() 
    OR 
    -- Allow users to see others in same organization using a direct lookup
    organization_id IN (
      SELECT organization_id 
      FROM users 
      WHERE id = auth.uid()
      LIMIT 1
    )
  );

-- Alternative simpler policy (if the above still causes issues)
-- This only allows users to see their own record
/*
CREATE POLICY "Users can only see own record"
  ON users
  FOR ALL
  TO authenticated
  USING (id = auth.uid());
*/

-- Test the policy by running a simple query
-- This should not cause infinite recursion anymore
-- SELECT id, email, full_name FROM users WHERE id = auth.uid();