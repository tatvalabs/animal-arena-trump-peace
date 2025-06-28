/*
  # Add fight_accepted activity type

  1. Changes
    - Update the check constraint on fight_activities table to include 'fight_accepted' as a valid activity_type
    - This allows the application to record when opponents accept fight invitations

  2. Security
    - No changes to RLS policies needed
    - Maintains existing security model
*/

-- Update the check constraint to include 'fight_accepted'
ALTER TABLE fight_activities 
DROP CONSTRAINT fight_activities_activity_type_check;

ALTER TABLE fight_activities 
ADD CONSTRAINT fight_activities_activity_type_check 
CHECK (activity_type = ANY (ARRAY[
  'created'::text, 
  'mediation_request'::text, 
  'mediation_approved'::text, 
  'mediation_rejected'::text, 
  'resolved'::text, 
  'comment'::text,
  'fight_accepted'::text
]));