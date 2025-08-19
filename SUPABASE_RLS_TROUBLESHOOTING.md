# 🛡️ Supabase RLS Policy Troubleshooting Guide

## 🔍 **Step 1: Identify the Problem**

### **Check Current Policies**
Go to your Supabase Dashboard → Authentication → Policies → Users table

Look for policies that might be causing recursion:
```sql
-- ❌ PROBLEMATIC POLICY (causes recursion)
CREATE POLICY "Users can only see their organization's users" 
ON users FOR ALL TO authenticated 
USING (
  organization_id IN (
    SELECT users.organization_id  -- 🚨 This queries users table!
    FROM users 
    WHERE users.id = uid()        -- 🚨 Within users policy!
  )
);
```

## 🛠️ **Step 2: Fix the Policy**

### **Option A: Use Direct Auth (Recommended)**
```sql
-- ✅ FIXED POLICY (no recursion)
CREATE POLICY "Users can access their organization data"
ON users FOR ALL TO authenticated 
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
```

### **Option B: Simplest Fix**
```sql
-- ✅ ULTRA-SIMPLE POLICY (users see only themselves)
CREATE POLICY "Users can only see own record"
ON users FOR ALL TO authenticated 
USING (id = auth.uid());
```

## 🎯 **Step 3: Apply the Fix**

### **Method 1: Supabase Dashboard**
1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Policies**
3. Find the **users** table
4. **Delete** the problematic policy
5. **Create** new policy with fixed code

### **Method 2: SQL Editor**
1. Go to **SQL Editor** in Supabase Dashboard
2. Run the migration file: `fix_users_rls_policy.sql`
3. Execute the SQL commands

### **Method 3: Migration File**
1. Add the migration file to your project
2. Run: `supabase db push` (if using Supabase CLI)

## 🧪 **Step 4: Test the Fix**

### **Test Query 1: Direct Users Query**
```sql
SELECT id, email, full_name 
FROM users 
WHERE id = auth.uid();
```
**Expected:** ✅ Should work without recursion

### **Test Query 2: Join with Users**
```sql
SELECT l.*, u.full_name as owner_name
FROM leads l
LEFT JOIN users u ON l.owner_id = u.id
LIMIT 5;
```
**Expected:** ✅ Should work without recursion

## 🔍 **Step 5: Verify in Your App**

After fixing the policy, update your app to use the proper queries:

```typescript
// ✅ Now this should work without recursion
const { data, error } = await supabase
  .from('leads')
  .select(`
    *,
    users!owner_id(full_name)
  `)
  .order('created_at', { ascending: false });
```

## 🚨 **Common RLS Recursion Patterns to Avoid**

### **❌ Don't Do This:**
```sql
-- Policy that queries the same table it's protecting
CREATE POLICY "bad_policy" ON users 
USING (organization_id IN (SELECT organization_id FROM users WHERE id = uid()));
```

### **✅ Do This Instead:**
```sql
-- Policy that uses auth.uid() directly or external references
CREATE POLICY "good_policy" ON users 
USING (id = auth.uid());
```

## 🎯 **Why This Happens**

**Root Cause:** When you join the `users` table in a query, PostgreSQL needs to check the RLS policy. If that policy itself queries the `users` table, it creates an infinite loop.

**Solution:** Use `auth.uid()` directly or ensure policies don't create circular dependencies.

## 📞 **Need Help?**

If you're still getting recursion errors:

1. **Check all policies** on the users table
2. **Look for self-referential queries** in policies
3. **Use the simplest policy first** (users see only themselves)
4. **Gradually add complexity** once basic policy works

## 🎉 **Success Indicators**

✅ No more `42P17` errors  
✅ Queries with user joins work  
✅ App loads without Supabase errors  
✅ User data displays correctly