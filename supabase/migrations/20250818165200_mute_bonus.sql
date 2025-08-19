/*
  # Seed Enhanced Reference Data

  ## Overview
  This migration seeds the enhanced CRM system with reference data for
  relationship statuses, follow-up action types, and sample financial data.
*/

-- Get the demo organization ID for reference
DO $$
DECLARE
  demo_org_id uuid := '550e8400-e29b-41d4-a716-446655440000';
BEGIN

-- Insert relationship statuses
INSERT INTO relationship_statuses (organization_id, name, description, color) VALUES
  (demo_org_id, 'Active', 'Actively engaged customer or lead', 'green'),
  (demo_org_id, 'Dormant', 'Previously active but currently inactive', 'yellow'),
  (demo_org_id, 'Churned', 'Lost customer or failed lead', 'red'),
  (demo_org_id, 'Prospect', 'Potential customer being evaluated', 'blue'),
  (demo_org_id, 'Nurturing', 'Lead being nurtured for future opportunity', 'purple'),
  (demo_org_id, 'Hot Lead', 'High-priority lead ready to close', 'orange'),
  (demo_org_id, 'Cold Lead', 'Low-priority or unresponsive lead', 'gray');

-- Insert follow-up action types
INSERT INTO follow_up_action_types (organization_id, name, description, icon) VALUES
  (demo_org_id, 'Phone Call', 'Schedule or make a phone call', 'phone'),
  (demo_org_id, 'Email Follow-up', 'Send follow-up email', 'mail'),
  (demo_org_id, 'Meeting', 'Schedule in-person or virtual meeting', 'calendar'),
  (demo_org_id, 'Send Proposal', 'Prepare and send business proposal', 'file-text'),
  (demo_org_id, 'Product Demo', 'Schedule product demonstration', 'presentation'),
  (demo_org_id, 'Contract Review', 'Review contract terms and conditions', 'file-check'),
  (demo_org_id, 'Payment Follow-up', 'Follow up on payment or invoice', 'dollar-sign'),
  (demo_org_id, 'Relationship Check-in', 'General relationship maintenance call', 'heart'),
  (demo_org_id, 'Technical Support', 'Provide technical assistance', 'tool'),
  (demo_org_id, 'Renewal Discussion', 'Discuss contract or service renewal', 'refresh-cw');

END $$;