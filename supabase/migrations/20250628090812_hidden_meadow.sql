/*
  # Fix RLS policies for fight acceptance

  1. Security Updates
    - Remove duplicate and conflicting UPDATE policies on fights table
    - Add comprehensive policy allowing opponents to accept fights
    - Ensure proper permissions for fight creators and mediators

  2. Changes
    - Drop existing conflicting UPDATE policies
    - Create new consolidated UPDATE policy for fight acceptance
    - Maintain security while allowing proper fight acceptance flow
*/

-- Drop existing conflicting UPDATE policies
DROP POLICY IF EXISTS "Creators can update their fights" ON fights;
DROP POLICY IF EXISTS "Fight creators can update their fights" ON fights;
DROP POLICY IF EXISTS "Invited opponents can accept fights" ON fights;
DROP POLICY IF EXISTS "Mediators can update fights they're resolving" ON fights;
DROP POLICY IF EXISTS "Mediators can update their fights" ON fights;

-- Create comprehensive UPDATE policy for fights
CREATE POLICY "Users can update fights they're involved in"
  ON fights
  FOR UPDATE
  TO authenticated
  USING (
    -- Fight creators can always update their fights
    (auth.uid() = creator_id) OR
    -- Invited opponents can accept fights (using their authenticated email)
    (auth.email() = opponent_email AND opponent_accepted IS NOT TRUE) OR
    -- Mediators can update fights they're assigned to
    (auth.uid() = mediator_id)
  )
  WITH CHECK (
    -- Same conditions for the updated data
    (auth.uid() = creator_id) OR
    (auth.email() = opponent_email) OR
    (auth.uid() = mediator_id)
  );