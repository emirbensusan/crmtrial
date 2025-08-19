import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Organization {
  id: string
  name: string
  domain?: string
  settings?: any
  created_at?: string
  updated_at?: string
}

export interface User {
  id: string
  organization_id?: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'sales' | 'user'
  use_ai?: boolean
  is_active?: boolean
  created_at?: string
  updated_at?: string
}

export interface Lead {
  id: string
  organization_id?: string
  unique_code: string
  company_name: string
  company_country: string
  company_address?: string
  poc_name: string
  poc_title?: string
  poc_email?: string
  poc_phone?: string
  lead_source_id?: string
  product_line_id?: string
  sales_funnel_stage_id?: string
  owner_id?: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'closed-won' | 'closed-lost'
  lead_score?: number
  close_probability?: 'low' | 'medium' | 'high'
  estimated_value?: number
  notes?: string
  created_at?: string
  updated_at?: string
  first_contact_date?: string
  next_follow_up_date?: string
  special_requirements?: string
}

export interface Customer {
  id: string
  organization_id?: string
  lead_id?: string
  unique_code: string
  company_name: string
  company_country: string
  company_address?: string
  poc_name: string
  poc_title?: string
  poc_email?: string
  poc_phone?: string
  customer_type_id?: string
  product_line_id?: string
  owner_id?: string
  status: 'active' | 'inactive' | 'churned' | 'prospect'
  lifetime_value?: number
  annual_value?: number
  notes?: string
  created_at?: string
  updated_at?: string
  conversion_date?: string
  first_deal_value?: number
  sales_cycle_length_days?: number
}

export interface Deal {
  id: string
  organization_id?: string
  lead_id?: string
  customer_id?: string
  name: string
  description?: string
  value: number
  currency_id?: string
  sales_funnel_stage_id?: string
  close_probability?: 'low' | 'medium' | 'high'
  expected_close_date?: string
  owner_id?: string
  status: 'open' | 'won' | 'lost' | 'on-hold'
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface Activity {
  id: string
  organization_id?: string
  lead_id?: string
  customer_id?: string
  deal_id?: string
  contact_id?: string
  activity_type_id?: string
  subject: string
  description?: string
  scheduled_at?: string
  completed_at?: string
  duration_minutes?: number
  owner_id?: string
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show'
  priority?: 'low' | 'medium' | 'high' | 'urgent'
  ai_summary?: string
  ai_action_items?: any[]
  created_at?: string
  updated_at?: string
}